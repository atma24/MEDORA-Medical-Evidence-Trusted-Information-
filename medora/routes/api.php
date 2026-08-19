<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClaimController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReviewerApprovalController;
use App\Http\Controllers\Api\SpecialityController;
use Illuminate\Support\Facades\Route;

// ==============================
// Auth Routes (Public)
// ==============================
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/register', [AuthController::class, 'register']);
Route::get('/auth/google', [AuthController::class, 'googleRedirect'])->name('google.login');
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback'])->name('google.callback');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:6,1');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');
Route::get('/auth/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

// ==============================
// Protected Routes
// ==============================
Route::middleware('auth:sanctum')->group(function () {
    // Auth Routes (Protected)
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/email/verification-notification', [AuthController::class, 'resendVerificationEmail'])
        ->middleware('throttle:6,1')
        ->name('verification.send');
    Route::post('/auth/confirm-password', [AuthController::class, 'confirmPassword']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);

    // ==============================
    // Reviewer Routes
    // ==============================
    Route::middleware('role:REVIEWER')->group(function () {
        // Claim Review Routes
        Route::get('/claims/review-queue', [ClaimController::class, 'reviewQueue']);
        Route::post('/claims/{claim}/review', [ClaimController::class, 'review']);
    });

    // Claims Routes
    Route::get('/claims', [ClaimController::class, 'index']);
    Route::post('/claims', [ClaimController::class, 'store']);
    Route::get('/claims/{claim}', [ClaimController::class, 'show']);
    Route::delete('/claims/{claim}', [ClaimController::class, 'destroy']);

    // ==============================
    // Admin Routes
    // ==============================
    Route::middleware('role:ADMIN')->group(function () {
        // Reviewer Approval Routes
        Route::get('/reviewers', [ReviewerApprovalController::class, 'index']);
        Route::post('/reviewers/{user}/approve', [ReviewerApprovalController::class, 'approve']);
        Route::post('/reviewers/{user}/reject', [ReviewerApprovalController::class, 'reject']);

        // Speciality Routes
        Route::get('/specialities', [SpecialityController::class, 'index']);
        Route::post('/specialities', [SpecialityController::class, 'store']);
        Route::put('/specialities/{speciality}', [SpecialityController::class, 'update']);
        Route::delete('/specialities/{speciality}', [SpecialityController::class, 'destroy']);
    });
});
