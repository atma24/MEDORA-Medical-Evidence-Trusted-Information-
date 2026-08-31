<?php

use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClaimController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ReviewerApprovalController;
use App\Http\Controllers\Api\SpecialityController;
use Illuminate\Support\Facades\Route;

// ==============================
// Public / Auth Routes
// ==============================
Route::get('/', fn () => ['message' => 'MEDORA API is online']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::get('/auth/google', [AuthController::class, 'googleRedirect'])->name('google.login');
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback'])->name('google.callback');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');

// Public: daftar bidang keahlian (dibutuhkan di halaman register)
Route::get('/specialities', [SpecialityController::class, 'index']);

// ==============================
// Authenticated Routes
// ==============================
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail']);
    
    // --- ROUTE BARU: Update Profile ---
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    Route::put('/password', [AuthController::class, 'updatePassword']);
    Route::delete('/profile', [AuthController::class, 'destroyAccount']);

    // ==============================
    // USER Routes (klaim)
    // ==============================
    Route::middleware('role:USER')->group(function () {
        Route::get('/claims', [ClaimController::class, 'index']);
        Route::post('/claims', [ClaimController::class, 'store']);
        Route::delete('/claims/{claim}', [ClaimController::class, 'destroy']);
    });

    // ==============================
    // Detail Klaim (USER & REVIEWER)
    // USER (pemilik klaim) & REVIEWER (untuk halaman verifikasi).
    // Otorisasi final tetap di ClaimController@show (owner OR reviewer).
    // ==============================
    Route::middleware('role:USER,REVIEWER')->group(function () {
        Route::get('/claims/{claim}', [ClaimController::class, 'show']);
    });

    // ==============================
    // REVIEWER Routes
    // ==============================
    Route::middleware('role:REVIEWER')->group(function () {
        Route::get('/review/claims', [ReviewController::class, 'claims']);
        Route::get('/review/report', [ReviewController::class, 'report']);
        Route::post('/claims/{claim}/evidences/{claimEvidence}/review', [ClaimController::class, 'reviewEvidence']);
        Route::post('/claims/{claim}/review', [ClaimController::class, 'review']);
    });

    // ==============================
    // ADMIN Routes
    // ==============================
    Route::middleware('role:ADMIN')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminUserController::class, 'stats']);
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{user}', [AdminUserController::class, 'show']);
        Route::put('/users/{user}', [AdminUserController::class, 'update']);
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);

        Route::get('/reviewers', [ReviewerApprovalController::class, 'index']);
        Route::get('/reviewers/pending', [ReviewerApprovalController::class, 'pending']);
        Route::post('/reviewers/{user}/approve', [ReviewerApprovalController::class, 'approve']);
        Route::post('/reviewers/{user}/reject', [ReviewerApprovalController::class, 'reject']);

        Route::get('/specialities', [SpecialityController::class, 'index']);
        Route::post('/specialities', [SpecialityController::class, 'store']);
        Route::put('/specialities/{speciality}', [SpecialityController::class, 'update']);
        Route::delete('/specialities/{speciality}', [SpecialityController::class, 'destroy']);
    });
});