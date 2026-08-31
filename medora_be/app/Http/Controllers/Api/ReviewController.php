<?php

namespace App\Http\Controllers\Api;

use App\Enums\ClaimStatus;
use App\Http\Controllers\Controller;
use App\Models\Claim;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Str;

class ReviewController extends Controller
{
    public function claims(Request $request): JsonResponse
    {
        return response()->json(
            Claim::where('status', ClaimStatus::REVIEW_NEEDED)
                ->with(['user', 'trustAssessment', 'claimEvidences.evidence'])
                ->orderByDesc('created_at')
                ->get()
        );
    }

    /**
     * Stats global untuk dashboard reviewer (hitung semua, bukan per reviewer).
     * - menunggu: total REVIEW_NEEDED
     * - terverifikasi: total REVIEWED + FACT (global)
     * - keliru: total REVIEWED + HOAX (global)
     */
    public function stats(Request $request): JsonResponse
    {
        $menunggu = Claim::where('status', ClaimStatus::REVIEW_NEEDED)->count();
        $terverifikasi = Claim::where('status', ClaimStatus::REVIEWED)
            ->where('review_verdict', 'FACT')->count();
        $keliru = Claim::where('status', ClaimStatus::REVIEWED)
            ->where('review_verdict', 'HOAX')->count();

        return response()->json([
            'menunggu' => $menunggu,
            'terverifikasi' => $terverifikasi,
            'keliru' => $keliru,
        ]);
    }

    /**
     * History klaim yang sudah direview oleh reviewer yang login (B1).
     * Tab Selesai harus menampilkan ini, Tab Semua = queue + history.
     */
    public function history(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        return response()->json(
            Claim::where('status', ClaimStatus::REVIEWED)
                ->where('reviewed_by', $userId)
                ->with(['user', 'trustAssessment', 'claimEvidences.evidence'])
                ->orderByDesc('updated_at')
                ->get()
        );
    }

    public function report(Request $request): JsonResponse
    {
        $period = $request->query('period', 'month'); // today|week|month|year
        
        // Tentukan rentang waktu untuk period ini dan periode sebelumnya
        $now = now();
        $start = match($period) {
            'today' => $now->copy()->startOfDay(),
            'week' => $now->copy()->startOfWeek(),
            'month' => $now->copy()->startOfMonth(),
            'year' => $now->copy()->startOfYear(),
            default => $now->copy()->startOfMonth(),
        };
        
        $end = $now;
        
        // Periode sebelumnya untuk comparison/growth
        $prevEnd = $start->copy()->subSecond();
        $prevStart = match($period) {
            'today' => $start->copy()->subDay()->startOfDay(),
            'week' => $start->copy()->subWeek()->startOfWeek(),
            'month' => $start->copy()->subMonth()->startOfMonth(),
            'year' => $start->copy()->subYear()->startOfYear(),
        };
        
        // --- Statistik Kartu ---
        // Total klaim masuk dalam periode ini
        $totalClaims = Claim::whereBetween('created_at', [$start, $end])->count();
        $prevTotalClaims = Claim::whereBetween('created_at', [$prevStart, $prevEnd])->count();
        
        // Klaim selesai (REVIEWED)
        $completedClaims = Claim::where('status', ClaimStatus::REVIEWED)
            ->whereBetween('created_at', [$start, $end])
            ->count();
        $prevCompletedClaims = Claim::where('status', ClaimStatus::REVIEWED)
            ->whereBetween('created_at', [$prevStart, $prevEnd])
            ->count();
        
        // Antrean aktif (REVIEW_NEEDED saat ini - tidak bergantung periode filter)
        $activeQueue = Claim::where('status', ClaimStatus::REVIEW_NEEDED)->count();
        
        // Rata-rata respon: rata-rata selisih updated_at - created_at untuk klaim REVIEWED dalam periode
        $reviewedClaims = Claim::where('status', ClaimStatus::REVIEWED)
            ->whereBetween('created_at', [$start, $end])
            ->get(['created_at', 'updated_at']);
        
        $avgResponseMinutes = null;
        if ($reviewedClaims->isNotEmpty()) {
            $totalMinutes = $reviewedClaims->reduce(function($carry, $claim) {
                // abs() untuk jaga-jaga bila updated_at lebih awal dari created_at
                return $carry + abs($claim->updated_at->diffInMinutes($claim->created_at));
            }, 0);
            $avgResponseMinutes = round($totalMinutes / $reviewedClaims->count(), 1);
        }
        
        // Growth % calculations
        $calcGrowth = function($nowVal, $prevVal) {
            if ($prevVal === 0 && $nowVal === 0) return null;
            if ($prevVal === 0) return 100.0; // new
            return round((($nowVal - $prevVal) / $prevVal) * 100, 1);
        };
        
        $totalGrowth = $calcGrowth($totalClaims, $prevTotalClaims);
        $completedGrowth = $calcGrowth($completedClaims, $prevCompletedClaims);
        $avgRespGrowth = null; // skip avg response growth for simplicity
        
        // --- Tren Harian (untuk chart) ---
        $trendLabels = [];
        $trendCounts = collect();
        
        switch ($period) {
            case 'today':
                $labels = [];
                for ($h = 0; $h <= $now->hour; $h++) {
                    $labels[] = $h . ':00';
                }
                $trendCounts = Claim::whereBetween('created_at', [$start, $end])
                    ->selectRaw('EXTRACT(HOUR FROM created_at) as hr, COUNT(*) as cnt')
                    ->groupByRaw('EXTRACT(HOUR FROM created_at)')
                    ->pluck('cnt', 'hr');
                
                $keyFn = fn($date) => (int)$date->format('H');
                break;
                
            case 'week':
                $labelMapping = ['Senin'=>'Mon','Selasa'=>'Tue','Rabu'=>'Wed','Kamis'=>'Thu','Jumat'=>'Fri','Sabtu'=>'Sat','Minggu'=>'Sun'];
                $currentDay = (int)$now->dayOfWeekIso; // 1=Mon..7=Sun
                $labels = [];
                for ($i = 1; $i <= $currentDay; $i++) {
                    $dayNames = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
                    $labels[] = $dayNames[$i-1];
                }
                $keyFn = fn($date) => (int)$date->dayOfWeekIso - 1;
                break;
                
            case 'month':
                $daysInMonth = $now->day;
                $labels = range(1, $daysInMonth);
                $keyFn = fn($date) => (int)$date->format('j');
                break;
                
            case 'year':
                $monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
                $currentMonth = (int)$now->format('n');
                $labels = array_slice($monthNames, 0, $currentMonth);
                $keyFn = fn($date) => (int)$date->format('n') - 1;
                break;
                
            default:
                throw new \Exception("Unknown period: {$period}");
        }
        
        $counts = array_fill(0, count($labels), 0);
        // Hitung SEMUA klaim masuk dalam periode (bukan hanya yang sudah direview)
        $claimsByPeriod = Claim::whereBetween('created_at', [$start, $end])
            ->get('created_at')->pluck('created_at');
        
        foreach ($claimsByPeriod as $createdAt) {
            $key = $keyFn($createdAt);
            if ($key >= 0 && $key < count($counts)) {
                $counts[$key]++;
            }
        }
        
        $trend = array_map(fn($l, $c) => ['label' => $l, 'value' => $c], $labels, $counts);
        
        // --- Distribusi Status ---
        $factCount = Claim::whereBetween('created_at', [$start, $end])
            ->where('status', ClaimStatus::REVIEWED)
            ->where('review_verdict', 'FACT')
            ->count();
            
        $hoaxCount = Claim::whereBetween('created_at', [$start, $end])
            ->where('status', ClaimStatus::REVIEWED)
            ->where('review_verdict', 'HOAX')
            ->count();
            
        $otherCount = max(0, $totalClaims - $factCount - $hoaxCount);
        
        // --- Topik Paling Sering Diajukan ---
        $topicsNow = Claim::whereBetween('created_at', [$start, $end])
            ->selectRaw('text, COUNT(*) as c')
            ->groupBy('text')
            ->orderByDesc('c')
            ->limit(5)
            ->get()
            ->pluck('c', 'text');
            
        $topicsPrev = Claim::whereBetween('created_at', [$prevStart, $prevEnd])
            ->selectRaw('text, COUNT(*) as c')
            ->groupBy('text')
            ->pluck('c', 'text');
            
        $topTopics = [];
        foreach ($topicsNow as $topicText => $countNow) {
            $countPrev = $topicsPrev->get($topicText, 0);
            $growth_pct = $countPrev > 0 ? (($countNow - $countPrev) / $countPrev) * 100 : ($countNow > 0 ? 100.0 : 0);
            $topTopics[] = [
                'topic' => $topicText,
                'count' => $countNow,
                'growth_pct' => round($growth_pct, 1)
            ];
        }
        
        // Calculate distribution percentages
        $totalDist = $totalClaims ?: 1;
        
        return response()->json([
            'period' => $period,
            'stats' => [
                'total_claims' => $totalClaims,
                'total_claims_growth' => $totalGrowth,
                'completed_claims' => $completedClaims,
                'completed_claims_growth' => $completedGrowth,
                'active_queue' => $activeQueue,
                'avg_response_minutes' => $avgResponseMinutes ?? 0,
                'avg_response_growth' => $avgRespGrowth,
            ],
            'trend' => $trend,
            'distribution' => [
                'total' => $totalDist,
                'fact' => $factCount,
                'fact_pct' => round(($factCount / $totalDist) * 100),
                'hoax' => $hoaxCount,
                'hoax_pct' => round(($hoaxCount / $totalDist) * 100),
                'other' => $otherCount,
                'other_pct' => round(($otherCount / $totalDist) * 100),
            ],
            'top_topics' => $topTopics,
        ]);
    }

    public function reportPdf(Request $request)
    {
        $period = $request->query('period', 'month');
        $periodLabelMap = ['today'=>'Hari Ini','week'=>'Minggu Ini','month'=>'Bulan Ini','year'=>'Tahun Ini'];
        $periodLabel = $periodLabelMap[$period] ?? 'Bulan Ini';

        // Reuse logic dari report() — duplikasi ringan untuk hindari refactor besar
        $now = now();
        $start = match($period) {
            'today' => $now->copy()->startOfDay(),
            'week' => $now->copy()->startOfWeek(),
            'month' => $now->copy()->startOfMonth(),
            'year' => $now->copy()->startOfYear(),
            default => $now->copy()->startOfMonth(),
        };
        $end = $now;
        $prevEnd = $start->copy()->subSecond();
        $prevStart = match($period) {
            'today' => $start->copy()->subDay()->startOfDay(),
            'week' => $start->copy()->subWeek()->startOfWeek(),
            'month' => $start->copy()->subMonth()->startOfMonth(),
            'year' => $start->copy()->subYear()->startOfYear(),
        };

        $totalClaims = Claim::whereBetween('created_at', [$start, $end])->count();
        $prevTotalClaims = Claim::whereBetween('created_at', [$prevStart, $prevEnd])->count();
        $completedClaims = Claim::where('status', ClaimStatus::REVIEWED)->whereBetween('created_at', [$start, $end])->count();
        $prevCompletedClaims = Claim::where('status', ClaimStatus::REVIEWED)->whereBetween('created_at', [$prevStart, $prevEnd])->count();
        $activeQueue = Claim::where('status', ClaimStatus::REVIEW_NEEDED)->count();
        $reviewedClaims = Claim::where('status', ClaimStatus::REVIEWED)->whereBetween('created_at', [$start, $end])->get(['created_at','updated_at']);
        $avgResponseMinutes = null;
        if ($reviewedClaims->isNotEmpty()) {
            $totalMinutes = $reviewedClaims->reduce(fn($c,$claim)=> $c + abs($claim->updated_at->diffInMinutes($claim->created_at)), 0);
            $avgResponseMinutes = round($totalMinutes / $reviewedClaims->count(), 1);
        }
        $calcGrowth = fn($a,$b)=> ($b===0 && $a===0) ? null : ($b===0 ? 100.0 : round((($a-$b)/$b)*100,1));
        $totalGrowth = $calcGrowth($totalClaims,$prevTotalClaims);
        $completedGrowth = $calcGrowth($completedClaims,$prevCompletedClaims);

        // Trend
        switch ($period) {
            case 'today':
                $labels = []; for($h=0;$h<=$now->hour;$h++) $labels[]=$h.':00';
                $keyFn = fn($d)=> (int)$d->format('H'); break;
            case 'week':
                $labels=[]; for($i=1;$i<=(int)$now->dayOfWeekIso;$i++){ $names=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu']; $labels[]=$names[$i-1]; }
                $keyFn = fn($d)=> (int)$d->dayOfWeekIso-1; break;
            case 'month':
                $labels=range(1,$now->day); $keyFn=fn($d)=>(int)$d->format('j'); break;
            case 'year':
                $monthNames=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']; $labels=array_slice($monthNames,0,(int)$now->format('n')); $keyFn=fn($d)=>(int)$d->format('n')-1; break;
            default: $labels=[]; $keyFn=fn($d)=>0;
        }
        $counts=array_fill(0,count($labels),0);
        $claimsByPeriod=Claim::whereBetween('created_at',[$start,$end])->get('created_at')->pluck('created_at');
        foreach($claimsByPeriod as $ca){ $k=$keyFn($ca); if($k>=0 && $k<count($counts)) $counts[$k]++; }
        $trend=array_map(fn($l,$c)=>['label'=>$l,'value'=>$c],$labels,$counts);
        $trendTitle = match($period){ 'today'=>'Per Jam','week'=>'Mingguan','year'=>'Bulanan', default=>'Harian' };

        $factCount=Claim::whereBetween('created_at',[$start,$end])->where('status',ClaimStatus::REVIEWED)->where('review_verdict','FACT')->count();
        $hoaxCount=Claim::whereBetween('created_at',[$start,$end])->where('status',ClaimStatus::REVIEWED)->where('review_verdict','HOAX')->count();
        $otherCount=max(0,$totalClaims-$factCount-$hoaxCount);
        $totalDist=$totalClaims?:1;

        $topicsNow=Claim::whereBetween('created_at',[$start,$end])->selectRaw('text, COUNT(*) as c')->groupBy('text')->orderByDesc('c')->limit(5)->get()->pluck('c','text');
        $topicsPrev=Claim::whereBetween('created_at',[$prevStart,$prevEnd])->selectRaw('text, COUNT(*) as c')->groupBy('text')->pluck('c','text');
        $topTopics=[];
        foreach($topicsNow as $t=>$cNow){ $cPrev=$topicsPrev->get($t,0); $growth=$cPrev>0?(($cNow-$cPrev)/$cPrev)*100:($cNow>0?100:0); $topTopics[]=['topic'=>$t,'count'=>$cNow,'growth_pct'=>round($growth,1)]; }

        $avgResp=null;
        if($avgResponseMinutes && $avgResponseMinutes>0){
            $avgResp = $avgResponseMinutes<60 ? ['value'=>(string)$avgResponseMinutes,'unit'=>'Menit'] : ['value'=>number_format($avgResponseMinutes/60,1,',','.'),'unit'=>'Jam'];
        }

        $data=[
            'period'=>$period,
            'periodLabel'=>$periodLabel,
            'generatedAt'=>now()->translatedFormat('d M Y H:i'),
            'stats'=>[
                'total_claims'=>$totalClaims,
                'total_claims_growth'=>$totalGrowth,
                'completed_claims'=>$completedClaims,
                'completed_claims_growth'=>$completedGrowth,
                'active_queue'=>$activeQueue,
                'avg_response_minutes'=>$avgResponseMinutes ?? 0,
            ],
            'trend'=>$trend,
            'trendTitle'=>$trendTitle,
            'distribution'=>[
                'total'=>$totalDist,
                'fact'=>$factCount,
                'fact_pct'=>round(($factCount/$totalDist)*100),
                'hoax'=>$hoaxCount,
                'hoax_pct'=>round(($hoaxCount/$totalDist)*100),
                'other'=>$otherCount,
                'other_pct'=>round(($otherCount/$totalDist)*100),
            ],
            'top_topics'=>$topTopics,
            'avgResp'=>$avgResp,
        ];

        $pdf = Pdf::loadView('reports.pdf', $data)->setPaper('a4','portrait');
        $filename = 'MEDORA-Laporan-'.Str::slug($periodLabel).'-'.now()->format('Ymd-His').'.pdf';
        return $pdf->download($filename);
    }
}
