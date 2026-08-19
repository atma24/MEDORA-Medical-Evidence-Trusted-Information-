<?php

use App\Http\Controllers\Api\Admin\ReviewerApprovalController;
use App\Http\Controllers\Api\Admin\SpecialityController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClaimController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::get('auth/google', [AuthController::class, 'googleRedirect'])->name('google.login');
    Route::get('auth/google/callback', [AuthController::class, 'googleCallback'])->name('google.callback');
    Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:6,1');
    Route::post('auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');
    Route::get('auth/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/email/verification-notification', [AuthController::class, 'resendVerificationEmail'])
            ->middleware('throttle:6,1')
            ->name('verification.send');
        Route::post('auth/confirm-password', [AuthController::class, 'confirmPassword']);
        Route::put('auth/password', [AuthController::class, 'updatePassword']);

        Route::get('profile', [ProfileController::class, 'show']);
        Route::put('profile', [ProfileController::class, 'update']);
        Route::delete('profile', [ProfileController::class, 'destroy']);

        Route::get('claims', [ClaimController::class, 'index']);
        Route::post('claims', [ClaimController::class, 'store']);
        Route::get('claims/{claim}', [ClaimController::class, 'show']);
        Route::delete('claims/{claim}', [ClaimController::class, 'destroy']);

        Route::middleware('role:ADMIN')->group(function () {
            Route::get('admin/reviewers', [ReviewerApprovalController::class, 'index']);
            Route::post('admin/reviewers/{user}/approve', [ReviewerApprovalController::class, 'approve']);
            Route::post('admin/reviewers/{user}/reject', [ReviewerApprovalController::class, 'reject']);
            Route::get('admin/specialities', [SpecialityController::class, 'index']);
            Route::post('admin/specialities', [SpecialityController::class, 'store']);
            Route::put('admin/specialities/{speciality}', [SpecialityController::class, 'update']);
            Route::delete('admin/specialities/{speciality}', [SpecialityController::class, 'destroy']);
        });
    });
});
