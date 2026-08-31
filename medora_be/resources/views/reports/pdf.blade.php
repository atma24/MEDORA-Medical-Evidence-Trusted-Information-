<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<style>
  @page { margin: 28px 24px 24px 24px; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 9.5px; color: #1E293B; line-height: 1.5; }
  .header { border-bottom: 3px solid #1E3A8A; padding-bottom: 10px; margin-bottom: 14px; }
  .header h1 { margin:0; font-size:16px; color:#1E3A8A; }
  .header small { color:#64748B; font-size:8.5px; }
  .badge { display:inline-block; padding:4px 8px; border-radius:999px; font-weight:700; font-size:8px; }
  .card { border:1px solid #E2E8F0; border-radius:10px; padding:12px 14px; margin-bottom:10px; background:#fff; }
  .card-muted { background:#F8FAFC; }
  .label { font-size:7.5px; font-weight:800; letter-spacing:.7px; color:#94A3B8; text-transform:uppercase; margin-bottom:6px; }
  .stat-grid { width:100%; border-collapse:collapse; }
  .stat-grid td { width:25%; vertical-align:top; padding:0 6px; }
  .stat-value { font-size:16px; font-weight:800; color:#0F172A; line-height:1; }
  .stat-label { font-size:8px; color:#64748B; font-weight:600; margin-bottom:4px; }
  .growth { font-size:7px; font-weight:700; padding:2px 5px; border-radius:6px; display:inline-block; margin-top:4px; }
  .growth-up { background:#EEF2FF; color:#1E3A8A; }
  .growth-down { background:#FEE2E2; color:#B91C1C; }
  .table { width:100%; border-collapse:collapse; font-size:9px; }
  .table th { text-align:left; font-size:7.5px; color:#64748B; letter-spacing:.6px; text-transform:uppercase; border-bottom:1px solid #E2E8F0; padding:6px 6px; }
  .table td { border-bottom:1px solid #F1F5F9; padding:7px 6px; vertical-align:top; }
  .footer { margin-top:16px; padding-top:8px; border-top:1px solid #E2E8F0; font-size:7.5px; color:#94A3B8; text-align:center; }
  .bar-bg { height:6px; background:#E2E8F0; border-radius:999px; overflow:hidden; margin-top:4px; }
  .bar-fill { height:100%; }
  .trend-table td { padding:3px 6px; font-size:8.5px; border-bottom:1px solid #F8FAFC; }
  .trend-table th { font-size:7.5px; }
</style>
</head>
<body>
<div class="header">
  <table style="width:100%">
    <tr>
      <td>
        <h1>MEDORA — Laporan & Analitik Reviewer</h1>
        <small>Periode: {{ $periodLabel }} &bull; Dicetak {{ $generatedAt }} &bull; medorahealth.cloud</small>
      </td>
      <td style="text-align:right;">
        <div style="font-size:9px; color:#64748B;">Laporan Reviewer<br><span style="font-weight:700; color:#0F172A;">{{ $periodLabel }}</span></div>
      </td>
    </tr>
  </table>
</div>

{{-- 4 Statistik Utama --}}
<table class="stat-grid">
<tr>
  <td>
    <div class="card" style="text-align:center;">
      <div class="stat-label">Total Klaim Masuk</div>
      <div class="stat-value">{{ number_format($stats['total_claims'],0,',','.') }}</div>
      @if(!is_null($stats['total_claims_growth']))
        <div class="growth {{ $stats['total_claims_growth']>=0 ? 'growth-up' : 'growth-down' }}">{{ $stats['total_claims_growth']>=0 ? '+' : '' }}{{ number_format($stats['total_claims_growth'],1,',','.') }}%</div>
      @endif
    </div>
  </td>
  <td>
    <div class="card" style="text-align:center;">
      <div class="stat-label">Klaim Selesai</div>
      <div class="stat-value">{{ number_format($stats['completed_claims'],0,',','.') }}</div>
      @if(!is_null($stats['completed_claims_growth']))
        <div class="growth {{ $stats['completed_claims_growth']>=0 ? 'growth-up' : 'growth-down' }}">{{ $stats['completed_claims_growth']>=0 ? '+' : '' }}{{ number_format($stats['completed_claims_growth'],1,',','.') }}%</div>
      @endif
    </div>
  </td>
  <td>
    <div class="card" style="text-align:center;">
      <div class="stat-label">Antrean Aktif</div>
      <div class="stat-value">{{ number_format($stats['active_queue'],0,',','.') }}</div>
      <div class="stat-label" style="margin-top:4px;">REVIEW_NEEDED</div>
    </div>
  </td>
  <td>
    <div class="card" style="text-align:center;">
      <div class="stat-label">Rata-rata Respon</div>
      <div class="stat-value">
        @if($avgResp) {{ $avgResp['value'] }} <span style="font-size:9px; color:#64748B;">{{ $avgResp['unit'] }}</span>
        @else — @endif
      </div>
      <div class="stat-label" style="margin-top:4px;">dari klaim REVIEWED</div>
    </div>
  </td>
</tr>
</table>

{{-- Distribusi & Tren --}}
<table style="width:100%; border-collapse:collapse;">
<tr>
  <td style="width:50%; vertical-align:top; padding-right:6px;">
    <div class="card">
      <div class="label">Distribusi Status ({{ $periodLabel }})</div>
      <table style="width:100%; font-size:8.5px; border-collapse:collapse;">
        <tr>
          <td style="padding:4px 0;"><span style="display:inline-block; width:8px; height:8px; background:#00236F; border-radius:99px; margin-right:6px;"></span>Tervalidasi (FACT)</td>
          <td style="text-align:right; font-weight:800;">{{ $distribution['fact'] }} ({{ $distribution['fact_pct'] }}%)</td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><span style="display:inline-block; width:8px; height:8px; background:#BFDBFE; border-radius:99px; margin-right:6px;"></span>Dalam Proses</td>
          <td style="text-align:right; font-weight:800;">{{ $distribution['other'] }} ({{ $distribution['other_pct'] }}%)</td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><span style="display:inline-block; width:8px; height:8px; background:#BA1A1A; border-radius:99px; margin-right:6px;"></span>Keliru (HOAX)</td>
          <td style="text-align:right; font-weight:800;">{{ $distribution['hoax'] }} ({{ $distribution['hoax_pct'] }}%)</td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top:6px; border-top:1px solid #F1F5F9; font-size:7.5px; color:#64748B;">Total: {{ $distribution['total'] }} klaim periode ini</td>
        </tr>
      </table>
    </div>
  </td>
  <td style="width:50%; vertical-align:top; padding-left:6px;">
    <div class="card">
      <div class="label">Tren Klaim ({{ $trendTitle }})</div>
      <table class="table trend-table">
        <thead>
          <tr><th>Periode</th><th style="text-align:right;">Jumlah</th></tr>
        </thead>
        <tbody>
          @forelse($trend as $t)
            <tr>
              <td>{{ $t['label'] }}</td>
              <td style="text-align:right; font-weight:700;">{{ $t['value'] }}</td>
            </tr>
          @empty
            <tr><td colspan="2" style="text-align:center; color:#94A3B8;">Tidak ada data</td></tr>
          @endforelse
        </tbody>
      </table>
    </div>
  </td>
</tr>
</table>

{{-- Topik --}}
<div class="card">
  <div class="label">Topik Paling Sering Diajukan — {{ $periodLabel }} (Top 5)</div>
  <table class="table">
    <thead>
      <tr><th style="width:60%;">Topik Klaim</th><th>Jumlah</th><th>Tren vs Periode Sebelumnya</th></tr>
    </thead>
    <tbody>
      @forelse($top_topics as $i => $tp)
        <tr>
          <td style="font-weight:700;">{{ $i+1 }}. {{ Str::limit($tp['topic'], 85) }}</td>
          <td>{{ $tp['count'] }} klaim</td>
          <td>
            <span class="growth {{ $tp['growth_pct']>=0 ? 'growth-down' : 'growth-up' }}" style="{{ $tp['growth_pct']>=0 ? 'background:#FEE2E2; color:#B91C1C;' : 'background:#EEF2FF; color:#1E3A8A;' }}">
              {{ $tp['growth_pct']>=0 ? '+' : '' }}{{ number_format($tp['growth_pct'],1,',','.') }}%
            </span>
          </td>
        </tr>
      @empty
        <tr><td colspan="3" style="text-align:center; color:#94A3B8;">Belum ada klaim pada periode ini.</td></tr>
      @endforelse
    </tbody>
  </table>
</div>

<div class="footer">
  Laporan dihasilkan otomatis oleh MEDORA Reviewer System pada {{ $generatedAt }}. Data bersifat ringkasan analitik &amp; bukan laporan medis resmi. &bull; Periode: {{ $periodLabel }}
</div>
</body>
</html>
