<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'claim_id',
    'evidence_strength',
    'trust_score',
    'supporting_count',
    'contradicting_count',
    'neutral_count',
    'insufficient_count',
    'assessment',
])]
class TrustAssessment extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'evidence_strength' => 'float',
            'trust_score' => 'float',
        ];
    }

    public function claim(): BelongsTo
    {
        return $this->belongsTo(Claim::class);
    }
}
