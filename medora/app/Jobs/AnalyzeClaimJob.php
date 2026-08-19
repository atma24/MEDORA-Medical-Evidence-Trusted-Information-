<?php

namespace App\Jobs;

use App\Enums\ClaimStatus;
use App\Models\Claim;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;

class AnalyzeClaimJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public Claim $claim) {}

    public function handle(): void
    {
        try {
            $response = Http::timeout(15)->post(
                config('services.medora_ml.url').'/api/predict',
                ['teks_klaim' => $this->claim->text]
            );

            if ($response->failed()) {
                return;
            }

            $data = $response->json();

            $this->claim->update([
                'is_claim' => ($data['prediksi'] ?? 'false') === 'true',
                'ml_confidence' => isset($data['confidence']) ? (float) $data['confidence'] / 100 : null,
                'status' => ClaimStatus::ANALYZED,
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
