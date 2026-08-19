<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
Route::get('/history', fn () => Inertia::render('History'))->name('history.index');
Route::get('/hasil-claim', fn () => Inertia::render('HasilClaim'))->name('hasil-claim.index');
Route::get('/review', fn () => Inertia::render('ClaimApprove'))->name('review.index');
Route::get('/admin', fn () => Inertia::render('ClaimApprove'))->name('admin.index');
Route::get('/profile', fn () => Inertia::render('Profile/Edit'))->name('profile.edit');