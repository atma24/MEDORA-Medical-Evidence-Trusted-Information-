<?php

namespace Database\Seeders;

use App\Models\Source;
use Illuminate\Database\Seeder;

class SourceSeeder extends Seeder
{
    public function run(): void
    {
        Source::firstOrCreate(
            ['name' => 'PubMed'],
            [
                'type' => 'DATABASE',
                'tier' => 'Tier 1',
                'reliability_score' => 0.9,
                'url' => 'https://pubmed.ncbi.nlm.nih.gov/',
                'description' => 'Basis data literatur biomedis dari National Library of Medicine (NLM).',
            ]
        );
    }
}
