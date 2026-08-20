<?php

namespace App\Enums;

enum ClaimStatus: string
{
    case PENDING = 'PENDING';
    case ANALYZED = 'ANALYZED';
    case REVIEW_NEEDED = 'REVIEW_NEEDED';
    case REVIEWED = 'REVIEWED';
    case FAILED = 'FAILED';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Menunggu Analisis',
            self::ANALYZED => 'Telah Dianalisis',
            self::REVIEW_NEEDED => 'Menunggu Review Ahli',
            self::REVIEWED => 'Telah Direview',
            self::FAILED => 'Analisis Gagal',
        };
    }
}
