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
Route::get('/review', fn () => Inertia::render('Dashboard'))->name('review.index');
Route::get('/admin', fn () => Inertia::render('Dashboard'))->name('admin.index');
Route::get('/profile', fn () => Inertia::render('Profile/Edit'))->name('profile.edit');