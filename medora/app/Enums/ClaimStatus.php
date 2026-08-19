<?php

namespace App\Enums;

enum ClaimStatus: string
{
    case PENDING = 'PENDING';
    case ANALYZED = 'ANALYZED';
    case REVIEWED = 'REVIEWED';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Menunggu Analisis',
            self::ANALYZED => 'Telah Dianalisis',
            self::REVIEWED => 'Telah Direview',
        };
    }
}
