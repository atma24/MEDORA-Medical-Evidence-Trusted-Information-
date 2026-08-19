<?php

namespace App\Models;

use App\Enums\ClaimStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'text', 'is_claim', 'category', 'subject', 'relation', 'object', 'ml_confidence', 'status', 'reviewed_by', 'review_note'])]
class Claim extends Model
{
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
}
