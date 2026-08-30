HUBUNGAN_SUPPORT = "SUPPORT"
HUBUNGAN_CONTRADICT = "CONTRADICT"
HUBUNGAN_NEUTRAL = "NEUTRAL"
HUBUNGAN_INSUFFICIENT = "INSUFFICIENT"

BATAS_TERVERIFIKASI = 70.0
BATAS_MISINFORMASI = 30.0

# Safety net: klaim dengan bukti terlalu tipis tidak boleh langsung
# diverifikasi/dinyatakan misinformasi dengan penuh percaya diri.
MIN_EVIDENCE_KUAT = 3          # jumlah minimal evidence agar lolos tanpa flag review
BATAS_SKOR_BUKTI_TIPIS = 50.0  # trust_score dicap di zona abu-abu jika bukti tipis


def _map_ml2_label(label: str) -> str:
    """Petakan label dari model ML2 ke 4 kategori hubungan."""
    label = str(label or "").strip().lower()

    if label in ("support", "mendukung", "supports", "agree", "true", "benar", "faktual"):
        return HUBUNGAN_SUPPORT
    if label in ("contradict", "menentang", "menolak", "kontradiksi", "disagree", "false", "salah", "hoax", "menyesatkan"):
        return HUBUNGAN_CONTRADICT
    if label in ("neutral", "netral", "unrelated", "tidak berhubungan", "tidak terkait"):
        return HUBUNGAN_NEUTRAL
    return HUBUNGAN_INSUFFICIENT


def _kekuatan_single(ev: dict) -> float:
    """Kekuatan bukti per evidence: bobot hubungan x relevansi x confidence x tier."""
    hubungan = ev.get("relationship", HUBUNGAN_INSUFFICIENT)

    bobot = {
        HUBUNGAN_SUPPORT: 1.0,
        HUBUNGAN_CONTRADICT: -1.0,
        HUBUNGAN_NEUTRAL: 0.0,
        HUBUNGAN_INSUFFICIENT: 0.0,
    }.get(hubungan, 0.0)

    relevansi = float(ev.get("relevance_score") or 0.0)
    confidence = float(ev.get("confidence") or 50.0) / 100
    tier = float(ev.get("tier_score") or 0.5)

    return bobot * relevansi * confidence * tier


def _kekuatan_agregat(evidence_results: list[dict]) -> float:
    """Kekuatan agregat berbasis proporsi SUPPORT vs CONTRADICT + confidence + relevansi.

    Skor di rentang [-1, 1]. Relevansi rendah mengecilkan kekuatan agregat
    supaya evidence yang tidak benar-benar menjawab klaim tidak menggelembungkan
    trust_score (mencegah false positive dari retrieval yang kebetulan mirip topik).
    """
    total = len(evidence_results)
    if total == 0:
        return 0.0

    supporting = sum(1 for e in evidence_results if e["relationship"] == HUBUNGAN_SUPPORT)
    contradicting = sum(1 for e in evidence_results if e["relationship"] == HUBUNGAN_CONTRADICT)

    net = (supporting - contradicting) / total  # rentang [-1, 1]

    # Rata-rata confidence dari evidence yang mendukung/menentang
    relevan = [
        e for e in evidence_results
        if e["relationship"] in (HUBUNGAN_SUPPORT, HUBUNGAN_CONTRADICT)
    ]
    if relevan:
        conf_avg = sum(float(e.get("confidence") or 50.0) / 100 for e in relevan) / len(relevan)
        # Faktor relevansi: evidence SUPPORT/CONTRADICT dengan relevance_score
        # sangat rendah dianggap tidak menjawab klaim. TF-IDF lintas bahasa
        # (klaim Indonesia vs evidence Inggris) memang cenderung rendah,
        # sehingga baseline dinaikkan dan hanya penalti pada kasus ekstrem.
        rel_avg = sum(float(e.get("relevance_score") or 0.0) for e in relevan) / len(relevan)
        rel_factor = 0.6 + 0.4 * max(0.0, min(1.0, rel_avg))
    else:
        conf_avg = 0.5
        rel_factor = 1.0

    # Evidence_strength = arah proporsi dikoreksi confidence dan relevansi
    strength = net * (0.6 + 0.4 * max(0.0, min(1.0, conf_avg))) * rel_factor
    return round(max(-1.0, min(1.0, strength)), 4)


def hitung_assessment(
    analysis: dict,
    evidence_results: list[dict],
) -> dict:
    """Trust Engine: gabungkan hasil ML2 per evidence menjadi assessment final."""
    supporting = [e for e in evidence_results if e["relationship"] == HUBUNGAN_SUPPORT]
    contradicting = [e for e in evidence_results if e["relationship"] == HUBUNGAN_CONTRADICT]
    neutral = [e for e in evidence_results if e["relationship"] == HUBUNGAN_NEUTRAL]
    insufficient = [e for e in evidence_results if e["relationship"] == HUBUNGAN_INSUFFICIENT]

    evidence_strength = _kekuatan_agregat(evidence_results)

    # trust_score di tengah (50), digeser oleh kekuatan bukti
    trust_score = round(50 + (evidence_strength * 50), 2)
    trust_score = max(0.0, min(100.0, trust_score))

    # Safety net: evidence terlalu tipis -> cap skor di zona abu-abu
    # supaya klaim tidak bisa langsung Terverifikasi/Misinformasi
    # hanya dari 1-2 artikel (mencegah false positive/negative).
    bukti_tipis = len(evidence_results) < MIN_EVIDENCE_KUAT
    if bukti_tipis:
        trust_score = min(trust_score, BATAS_SKOR_BUKTI_TIPIS)

    if trust_score >= BATAS_TERVERIFIKASI:
        assessment = "Terverifikasi"
    elif trust_score < BATAS_MISINFORMASI:
        assessment = "Misinformasi"
    else:
        assessment = "Bukti tidak cukup"

    return {
        "claim_analysis": analysis,
        "evidence": {
            "total": len(evidence_results),
            "supporting_count": len(supporting),
            "contradicting_count": len(contradicting),
            "neutral_count": len(neutral),
            "insufficient_count": len(insufficient),
        },
        "evidence_strength": evidence_strength,
        "trust_score": trust_score,
        "assessment": assessment,
        "needs_review": bukti_tipis or trust_score < BATAS_TERVERIFIKASI,
    }