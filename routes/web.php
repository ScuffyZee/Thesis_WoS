<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PublicRequestController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WorkOrderController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

Route::get('/test-auth', function () {
    $user = User::where('username', 'zidane')->first();

    if (!$user) {
        return 'USER NOT FOUND';
    }

    $provider = Auth::getProvider();

    $retrieved = $provider->retrieveByCredentials([
        'email' => $user->email,
    ]);

    return [
        'user_found' => true,

        'email' => $user->email,

        'model_password' => $user->password,

        'hash_check' => Hash::check(
            '123456789',
            $user->password
        ),

        'provider_found_user' => $retrieved !== null,

        'provider_email' => $retrieved?->email,

        'provider_password' => $retrieved?->password,

        'provider_hash_check' => $retrieved
            ? Hash::check('123456789', $retrieved->password)
            : false,

        'auth_attempt' => Auth::attempt([
            'email' => $user->email,
            'password' => '123456789',
        ]),
    ];
});

// ── Public: Login ─────────────────────────────────────────────────────────────

Route::get('/', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// ── Public: Work Order Request Form (no login needed) ─────────────────────────

Route::prefix('request')->name('request.')->group(function () {
    Route::get('/', [PublicRequestController::class, 'create'])->name('create');
    Route::post('/', [PublicRequestController::class, 'store'])->name('store');
    Route::get('/success', [PublicRequestController::class, 'success'])->name('success');
});

// ── Protected: all app routes require auth ────────────────────────────────────

Route::middleware('auth')->group(function () {

    // Dashboard
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // Work Orders
    Route::prefix('work-orders')->name('work-orders.')->group(function () {
        Route::get('/',                          [WorkOrderController::class, 'index'])->name('index');
        Route::get('/create',                    [WorkOrderController::class, 'create'])->name('create');
        Route::post('/',                         [WorkOrderController::class, 'store'])->name('store');
        Route::get('/{workOrder}',               [WorkOrderController::class, 'show'])->name('show');
        Route::post('/{workOrder}/accept',       [WorkOrderController::class, 'accept'])->name('accept');
        Route::patch('/{workOrder}/status',      [WorkOrderController::class, 'updateStatus'])->name('status');
        Route::delete('/{workOrder}',            [WorkOrderController::class, 'destroy'])->name('destroy');
    });

    // User Accounts
    Route::prefix('user-accounts')->name('user-accounts.')->group(function () {
        Route::get('/',                [UserController::class, 'index'])->name('index');
        Route::post('/',               [UserController::class, 'store'])->name('store');
        Route::put('/{userAccount}',   [UserController::class, 'update'])->name('update');
        Route::delete('/{userAccount}',[UserController::class, 'destroy'])->name('destroy');
    });

    // My Profile
    Route::get('/my-profile',  [UserController::class, 'profile'])->name('profile.edit');
    Route::post('/my-profile', [UserController::class, 'updateProfile'])->name('profile.update');
    Route::put('/my-profile',  [UserController::class, 'updateProfile']);
});
