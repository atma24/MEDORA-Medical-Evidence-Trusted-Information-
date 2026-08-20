import requests
import xml.etree.ElementTree as ET
PUBMED_ESEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
PUBMED_EFETCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

PUBMED_BASE = "https://pubmed.ncbi.nlm.nih.gov"

HEADERS = {"User-Agent": "MEDORA-Research/1.0"}

# Klasifikasi sumber berdasarkan tipe jurnal/afiliasi (sederhana)
TIER_RULES = [
    ("natur", ("Nature", 0.95)),
    ("lancet", ("The Lancet", 0.93)),
    ("the new england journal of medicine", ("NEJM", 0.93)),
    ("jama", ("JAMA", 0.92)),
    ("bmj", ("BMJ", 0.90)),
    ("cell", ("Cell", 0.90)),
    ("science", ("Science", 0.90)),
    ("cochrane", ("Cochrane", 0.88)),
    ("wiley", ("Wiley", 0.78)),
    ("springer", ("Springer", 0.76)),
    ("elsevier", ("Elsevier", 0.76)),
    ("mdpi", ("MDPI", 0.65)),
    ("frontiers", ("Frontiers", 0.62)),
    ("biorxiv", ("bioRxiv", 0.58)),
    ("medrxiv", ("medRxiv", 0.58)),
]


def _kelas_tier(nama_jurnal: str) -> tuple[str, float]:
    nama = (nama_jurnal or "").lower()
    for fragmen, (label, skor) in TIER_RULES:
        if fragmen in nama:
            return label, skor
    return "Unknown", 0.50


def _sumber_pubmed() -> dict:
    return {
        "name": "PubMed",
        "type": "DATABASE",
        "tier": "Tier 1",
        "reliability_score": 0.90,
        "url": "https://pubmed.ncbi.nlm.nih.gov",
        "description": "PubMed: database bibliografi biomedis dari MEDLINE.",
    }


def cari_pmid(query: str, retmax: int = 10) -> list[str]:
    """Cari daftar PMID via PubMed E-utilities esearch."""
    params = {
        "db": "pubmed",
        "term": query,
        "retmode": "json",
        "retmax": retmax,
        "sort": "relevance",
        "tool": "medora",
        "email": "medora@example.com",
    }

    try:
        resp = requests.get(PUBMED_ESEARCH, params=params, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        id_list = resp.json().get("esearchresult", {}).get("idlist", [])
        return id_list
    except requests.RequestException as exc:
        raise RuntimeError(f"Gagal menghubungi PubMed esearch: {exc}") from exc


def _parse_pubmed_article(node: dict) -> dict | None:
    pmid_raw = node.get("MedlineCitation", {}).get("PMID", "")
    pmid = pmid_raw.get("#text") if isinstance(pmid_raw, dict) else pmid_raw
    article = node.get("MedlineCitation", {}).get("Article", {})

    if not pmid or not article:
        return None

    title_raw = article.get("ArticleTitle", "") or ""
    title = title_raw.get("#text") if isinstance(title_raw, dict) else title_raw

    abstract_parts = article.get("Abstract", {}).get("AbstractText", [])
    if isinstance(abstract_parts, str):
        abstract = abstract_parts
    else:
        teks_parts = []
        for part in abstract_parts:
            if isinstance(part, dict):
                teks_parts.append(part.get("#text", ""))
            else:
                teks_parts.append(str(part))
        abstract = " ".join(p for p in teks_parts if p)

    authors_list = article.get("AuthorList", {}).get("Author", [])
    if isinstance(authors_list, dict):
        authors_list = [authors_list]
    authors = []
    for auth in authors_list:
        kolektif = auth.get("CollectiveName")
        if kolektif:
            authors.append(str(kolektif))
            continue
        last = auth.get("LastName", "")
        fore = auth.get("ForeName", "")
        if last:
            authors.append(f"{fore} {last}".strip())

    year = None
    pub_date = article.get("Journal", {}).get("JournalIssue", {}).get("PubDate", {})
    year = pub_date.get("Year")
    if not year:
        medline = pub_date.get("MedlineDate", "")
        if medline:
            import re
            m = re.search(r"(\d{4})", medline)
            if m:
                year = m.group(1)

    journal_info = article.get("Journal", {})
    journal_name = journal_info.get("Title", "") or ""
    tier_label, tier_score = _kelas_tier(journal_name)

    doi = None
    elocation = article.get("ELocationID")
    items = elocation if isinstance(elocation, list) else [elocation]
    for id_item in items:
        if isinstance(id_item, dict) and id_item.get("EIdType") == "doi":
            doi = id_item.get("#text") or id_item.get("")
            break

    return {
        "pmid": str(pmid),
        "doi": doi,
        "title": title,
        "abstract": abstract,
        "authors": ", ".join(authors) if authors else None,
        "publication_year": int(year) if year else None,
        "journal": journal_name,
        "url": f"{PUBMED_BASE}/{pmid}/",
        "tier": tier_label,
        "tier_score": tier_score,
    }


def fetch_detail(pmids: list[str]) -> list[dict]:
    """Ambil detail (title, abstract, dll) dari PMID via PubMed efetch XML."""
    if not pmids:
        return []

    params = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "xml",
        "tool": "medora",
        "email": "medora@example.com",
    }

    try:
        resp = requests.get(PUBMED_EFETCH, params=params, headers=HEADERS, timeout=20)
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise RuntimeError(f"Gagal menghubungi PubMed efetch: {exc}") from exc

    import xml.etree.ElementTree as ET

    root = ET.fromstring(resp.text)
    hasil = []
    for node in root.findall(".//PubmedArticle"):
        node_dict = _konversi_xml(node)
        artikel = _parse_pubmed_article(node_dict)
        if artikel:
            hasil.append(artikel)
    return hasil


def _konversi_xml(elem: ET.Element) -> dict:
    """Konversi XML Element menjadi dict sederhana untuk parsing."""

    def parse(node: ET.Element):
        attrs = dict(node.attrib)

        if len(node) == 0 and not list(node):
            if attrs:
                return {"#text": node.text or "", **attrs}
            return node.text or ""

        tag = node.tag.split("}")[-1]
        anak = {}
        for child in node:
            kunci = child.tag.split("}")[-1]
            nilai = parse(child)
            if kunci in anak:
                if isinstance(anak[kunci], list):
                    anak[kunci].append(nilai)
                else:
                    anak[kunci] = [anak[kunci], nilai]
            else:
                anak[kunci] = nilai
        if attrs:
            anak["#attrs"] = attrs
        return anak

    return parse(elem)


def retrieve(query: str, max_results: int = 10) -> dict:
    """Pipeline retriever lengkap: cari PMID -> ambil detail -> kembalikan hasil."""
    pmids = cari_pmid(query, retmax=max_results)

    # Fallback: longgarkan query jika tidak ada hasil (kurangi jumlah term AND)
    if not pmids:
        terms = query.split(" AND ")
        while not pmids and len(terms) > 1:
            terms = terms[:-1]
            pmids = cari_pmid(" AND ".join(terms), retmax=max_results)

    articles = fetch_detail(pmids)

    # Buang evidence tanpa abstract/title relevan & terlalu tua (claim modern)
    tahun_min = 1990
    articles = [
        a for a in articles
        if (a.get("publication_year") or 0) >= tahun_min or (a.get("title") or "")
    ]

    sumber = _sumber_pubmed()

    return {
        "source": sumber,
        "total_found": len(pmids),
        "evidences": articles,
    }