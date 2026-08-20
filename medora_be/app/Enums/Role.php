<?php

namespace App\Enums;

enum Role: string
{
    case USER = 'USER';
    case REVIEWER = 'REVIEWER';
    case ADMIN = 'ADMIN';

    public function label(): string
    {
        return match ($this) {
            self::USER => 'User',
            self::REVIEWER => 'Reviewer',
            self::ADMIN => 'Admin',
        };
    }
}
