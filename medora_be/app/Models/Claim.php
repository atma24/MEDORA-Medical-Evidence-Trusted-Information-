<?php

namespace App\Models;

use App\Enums\ClaimStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'user_id',
    'text',
    'is_claim',
    'category',
    'subject',
    'relation',
    'object',
    'ml_confidence',
    'status',
    'reviewed_by',
    'review_note',
    'review_verdict',
])]
class Claim extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'is_claim' => 'boolean',
            'ml_confidence' => 'float',
            'status' => ClaimStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function claimEvidences(): HasMany
    {
        return $this->hasMany(ClaimEvidence::class);
    }

    public function evidences(): BelongsToMany
    {
        return $this->belongsToMany(Evidence::class, 'claim_evidences')
            ->withPivot(['relationship', 'relevance_score', 'confidence', 'review_status'])
            ->withTimestamps();
    }

    public function trustAssessment(): HasOne
    {
        return $this->hasOne(TrustAssessment::class);
    }
}
