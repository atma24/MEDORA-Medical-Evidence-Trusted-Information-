<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'source_id',
    'pmid',
    'doi',
    'title',
    'abstract',
    'authors',
    'publication_year',
    'url',
    'evidence_level',
])]
class Evidence extends Model
{
    use HasFactory;

    /**
     * "Evidence" adalah uncountable noun sehingga Laravel tidak bisa
     * mengpluralisasikannya otomatis (menjadi "evidence", bukan "evidences").
     */
    protected $table = 'evidences';

    public function source(): BelongsTo
    {
        return $this->belongsTo(Source::class);
    }

    public function claims(): BelongsToMany
    {
        return $this->belongsToMany(Claim::class, 'claim_evidences')
            ->withPivot(['relationship', 'relevance_score', 'confidence', 'review_status'])
            ->withTimestamps();
    }
}
