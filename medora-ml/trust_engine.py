HUBUNGAN_SUPPORT = "SUPPORT"
HUBUNGAN_CONTRADICT = "CONTRADICT"
HUBUNGAN_NEUTRAL = "NEUTRAL"
HUBUNGAN_INSUFFICIENT = "INSUFFICIENT"

BATAS_TERVERIFIKASI = 70.0
BATAS_MISINFORMASI = 30.0


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
    """Kekuatan agregat berbasis proporsi SUPPORT vs CONTRADICT + rata-rata confidence.

    Skor di rentang [-1, 1]. Relevansi TF-IDF lintas bahasa cenderung rendah,
    sehingga proporsi & confidence lebih dominan daripada relevansi mentah.
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
    else:
        conf_avg = 0.5

    # Evidence_strength = arah proporsi dikoreksi confidence
    strength = net * (0.6 + 0.4 * max(0.0, min(1.0, conf_avg)))
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
        "needs_review": trust_score < BATAS_TERVERIFIKASI,
    }