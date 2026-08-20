<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'claim_id',
    'evidence_id',
    'relationship',
    'relevance_score',
    'confidence',
    'review_status',
    'reviewed_by',
    'reviewed_at',
])]
class ClaimEvidence extends Model
{
    use HasFactory;

    /**
     * Nama tabel harus eksplisit karena "Evidence" dianggap uncountable noun
     * oleh pluralizer Laravel (menjadi "claim_evidence", bukan "claim_evidences").
     */
    protected $table = 'claim_evidences';

    protected function casts(): array
    {
        return [
            'relevance_score' => 'float',
            'confidence' => 'float',
            'reviewed_at' => 'datetime',
        ];
    }

    public function claim(): BelongsTo
    {
        return $this->belongsTo(Claim::class);
    }

    public function evidence(): BelongsTo
    {
        return $this->belongsTo(Evidence::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
