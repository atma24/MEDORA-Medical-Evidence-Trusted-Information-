<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<style>
  @page { margin: 28px 24px 24px 24px; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1E293B; line-height: 1.5; }
  .header { border-bottom: 3px solid #1E3A8A; padding-bottom: 10px; margin-bottom: 16px; }
  .header h1 { margin:0; font-size:16px; color:#1E3A8A; letter-spacing: .5px; }
  .header small { color:#64748B; font-size:9px; }
  .badge { display:inline-block; padding:4px 10px; border-radius: 999px; font-weight:700; font-size:9px; }
  .badge-fact { background:#E6F4EA; color:#137333; border:1px solid #A7E0B6; }
  .badge-hoax { background:#FCE8E6; color:#C5221F; border:1px solid #F5A6A6; }
  .badge-pending { background:#FEF7E0; color:#B06000; border:1px solid #F5D67A; }
  .badge-auto { background:#EFF6FF; color:#1E40AF; border:1px solid #93C5FD; }
  .card { border:1px solid #E2E8F0; border-radius:10px; padding:14px 16px; margin-bottom:12px; background:#FFFFFF; }
  .card-muted { background:#F8FAFC; }
  .label { font-size:8px; font-weight:800; letter-spacing:.8px; color:#94A3B8; text-transform:uppercase; margin-bottom:6px; }
  h2 { font-size:13px; margin:0 0 6px 0; color:#0F172A; }
  h3 { font-size:11px; margin:0 0 8px 0; color:#1E3A8A; }
  .meta { font-size:9px; color:#64748B; }
  .quote { font-style:italic; font-size:12px; font-weight:700; color:#1E293B; }
  .grid2 { width:100%; border-collapse: collapse; }
  .grid2 td { width:50%; vertical-align:top; padding-right:10px; }
  .score-bar { height:6px; background:#E2E8F0; border-radius:999px; overflow:hidden; margin-top:4px; }
  .score-fill { height:100%; }
  .evidence-item { border-top:1px solid #F1F5F9; padding-top:8px; margin-top:8px; }
  .evidence-item:first-child { border-top:none; padding-top:0; margin-top:0; }
  .small { font-size:9px; color:#64748B; }
  .preline { white-space: pre-line; }
  .footer { margin-top:18px; padding-top:10px; border-top:1px solid #E2E8F0; font-size:8px; color:#94A3B8; text-align:center; }
  .kv { margin-bottom:6px; }
  .kv b { color:#334155; }
</style>
</head>
<body>
<div class="header">
  <table style="width:100%">
    <tr>
      <td>
        <h1>MEDORA — Medical Evidence & Trusted Information</h1>
        <small>Laporan Hasil Verifikasi Klaim Kesehatan &bull; Dicetak {{ $generatedAt }}</small>
      </td>
      <td style="text-align:right; vertical-align:top;">
        <div class="meta">ID Klaim #CLM-{{ $claim->id }}<br>Diajukan {{ $createdAt }}</div>
      </td>
    </tr>
  </table>
</div>

<table class="grid2" style="margin-bottom:12px;">
<tr>
<td>
  <div class="card card-muted">
    <div class="label">Kutipan Klaim</div>
    <div class="quote">"{{ $claim->text }}"</div>
    @if($claim->detail)
      <div class="small" style="margin-top:6px;"><b>Detail/Sumber pengguna:</b> {{ $claim->detail }}</div>
    @endif
    <div class="meta" style="margin-top:6px;">Kategori: {{ $claim->category ?? '-' }} &bull; Subjek: {{ $claim->subject ?? '-' }} &bull; Relasi: {{ $claim->relation ?? '-' }} &bull; Objek: {{ $claim->object ?? '-' }} @if(!is_null($claim->ml_confidence)) &bull; ML confidence: {{ number_format($claim->ml_confidence*100,1) }}% @endif</div>
  </div>
</td>
<td>
  <div class="card" style="
    @if($banner['type']=='fact') background:#E6F4EA; border-color:#A7E0B6;
    @elseif($banner['type']=='hoax') background:#FCE8E6; border-color:#F5A6A6;
    @else background:#FEF7E0; border-color:#F5D67A; @endif
  ">
    <div class="label">Status Verifikasi</div>
    <div>
      @if($banner['type']=='fact')
        <span class="badge badge-fact">{{ $banner['title'] }}</span>
      @elseif($banner['type']=='hoax')
        <span class="badge badge-hoax">{{ $banner['title'] }}</span>
      @elseif($banner['type']=='auto')
        <span class="badge badge-auto">{{ $banner['title'] }}</span>
      @else
        <span class="badge badge-pending">{{ $banner['title'] }}</span>
      @endif
    </div>
    <div class="small" style="margin-top:8px; color:#334155;">{{ $banner['desc'] }}</div>
    @if($trustAssessment)
      <div class="small" style="margin-top:8px;">
        Trust Score: <b>{{ number_format($trustAssessment->trust_score,0) }}%</b> &bull; Evidence strength: <b>{{ number_format($trustAssessment->evidence_strength,0) }}%</b>
      </div>
    @endif
  </div>
</td>
</tr>
</table>

@if($trustAssessment)
<div class="card">
  <div class="label">Penjelasan Sistem AI (ML)</div>
  <div>
    <b>Assessment ML:</b> {{ $trustAssessment->assessment ?? '-' }}
    <div class="small" style="margin-top:4px; color:#334155;">
      Sistem ML mengevaluasi klaim berdasarkan {{ $trustAssessment->supporting_count }} supporting, {{ $trustAssessment->contradicting_count }} contradicting, {{ $trustAssessment->neutral_count }} neutral, {{ $trustAssessment->insufficient_count }} insufficient evidences.
    </div>
  </div>
  <table style="width:100%; margin-top:10px; border-collapse:collapse;">
    <tr>
      <td style="width:33%; padding-right:8px;">
        <div class="small">Trust Score</div>
        <div class="score-bar"><div class="score-fill" style="width: {{ $trustAssessment->trust_score }}%; background:#1E3A8A;"></div></div>
        <div class="small"><b>{{ number_format($trustAssessment->trust_score,0) }}%</b></div>
      </td>
      <td style="width:33%; padding-right:8px;">
        <div class="small">Evidence Strength</div>
        <div class="score-bar"><div class="score-fill" style="width: {{ $trustAssessment->evidence_strength }}%; background:#059669;"></div></div>
        <div class="small"><b>{{ number_format($trustAssessment->evidence_strength,0) }}%</b></div>
      </td>
      <td style="width:34%;">
        <div class="small">Rincian Bukti</div>
        <div class="small">Supporting: <b>{{ $trustAssessment->supporting_count }}</b> &bull; Contradicting: <b>{{ $trustAssessment->contradicting_count }}</b> &bull; Neutral: <b>{{ $trustAssessment->neutral_count }}</b> &bull; Insufficient: <b>{{ $trustAssessment->insufficient_count }}</b></div>
      </td>
    </tr>
  </table>
  @if(!empty($trustAssessment->assessment))
    <div class="small" style="margin-top:8px;"><b>ML Algo:</b> {{ $claim->category ?? '-' }} | {{ $claim->subject ?? '-' }} {{ $claim->relation ?? '-' }} {{ $claim->object ?? '-' }}</div>
  @endif
</div>
@endif

@if($claim->review_note)
<div class="card">
  <div class="label">Penjelasan Lengkap Pakar Medis (Detail)</div>
  <div class="small preline" style="color:#334155;">{{ $claim->review_note }}</div>
</div>
@endif

@if($claim->relation || $claim->category)
<div class="card card-muted">
  <div class="label">Ekstraksi Entitas ML</div>
  <div class="small">
    @if($claim->category) <span class="kv"><b>Category:</b> {{ $claim->category }}</span><br> @endif
    @if($claim->subject) <span class="kv"><b>Subject:</b> {{ $claim->subject }}</span><br> @endif
    @if($claim->relation) <span class="kv"><b>Relation:</b> {{ $claim->relation }}</span><br> @endif
    @if($claim->object) <span class="kv"><b>Object:</b> {{ $claim->object }}</span> @endif
  </div>
</div>
@endif

<div class="card">
  <div class="label">Diverifikasi Oleh</div>
  @if($isAuto)
    <div><b>Sistem MEDORA (Validasi Otomatis)</b> — Trust Score {{ $trustAssessment?->trust_score ? number_format($trustAssessment->trust_score,0).'%' : '-' }}</div>
  @elseif($claim->reviewer)
    <div><b>{{ $claim->reviewer->name }}</b> &bull; {{ $claim->reviewer->speciality?->name ?? $claim->reviewer->speciality ?? 'Tim Pakar Medis' }}</div>
    <div class="small">Tgl Verifikasi: {{ $verifiedAt }} &bull; Verdict: {{ $claim->review_verdict }}</div>
  @else
    <div class="small" style="color:#94A3B8;"><i>Menunggu penugasan pakar medis.</i></div>
  @endif
</div>

<div class="card">
  <div class="label">Referensi & Jurnal Terkait ({{ count($claim->claimEvidences) }})</div>
  @forelse($claim->claimEvidences as $idx => $ce)
    <div class="evidence-item">
      <div style="font-weight:700; font-size:10px;">{{ $idx+1 }}. {{ $ce->evidence?->title ?? 'Jurnal Medis Terkait' }}</div>
      <div class="small">
        @if($ce->evidence?->authors) {{ Str::limit($ce->evidence->authors, 120) }} &bull; @endif
        @if($ce->evidence?->publication_year) {{ $ce->evidence->publication_year }} &bull; @endif
        {{ $ce->evidence?->source?->name ?? '' }}
        @if($ce->relationship) &bull; <b>{{ $ce->relationship }}</b> @endif
        @if(!is_null($ce->relevance_score)) &bull; Relevance {{ number_format($ce->relevance_score*100,0) }}% @endif
        @if(!is_null($ce->confidence)) &bull; Conf {{ number_format($ce->confidence,0) }}% @endif
      </div>
      @if($ce->evidence?->abstract)
        <div class="small" style="margin-top:4px;">{{ Str::limit(strip_tags($ce->evidence->abstract), 420) }}</div>
      @endif
      @if($ce->evidence?->url)
        <div class="small" style="margin-top:2px; color:#1D4ED8;">{{ $ce->evidence->url }}</div>
      @endif
    </div>
  @empty
    <div class="small" style="color:#94A3B8;"><i>Belum ada referensi jurnal terkait.</i></div>
  @endforelse
</div>

<div class="footer">
  Dokumen ini dihasilkan otomatis oleh MEDORA pada {{ $generatedAt }}. Informasi bersifat edukatif dan bukan pengganti konsultasi medis profesional. &bull; medorahealth.cloud
</div>
</body>
</html>
