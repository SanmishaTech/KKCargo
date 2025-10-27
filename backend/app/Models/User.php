<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
 use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google2fa_secret',
        'google2fa_enabled',
        'google2fa_enabled_at',
        'google2fa_enforce_globally',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'google2fa_secret',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'google2fa_enabled' => 'boolean',
            'google2fa_enabled_at' => 'datetime',
            'google2fa_enforce_globally' => 'boolean',
        ];
    }

    public function staff()
    {
        return $this->hasOne(Staff::class, 'user_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'to_id');
    }

    /**
     * Check if user has 2FA enabled
     */
    public function hasTwoFactorEnabled(): bool
    {
        return $this->google2fa_enabled && !empty($this->google2fa_secret);
    }

    /**
     * Enable 2FA for the user
     */
    public function enableTwoFactor(string $secret): void
    {
        $this->google2fa_secret = $secret;
        $this->google2fa_enabled = true;
        $this->google2fa_enabled_at = now();
        $this->save();
    }

    /**
     * Disable 2FA for the user
     */
    public function disableTwoFactor(): void
    {
        $this->google2fa_secret = null;
        $this->google2fa_enabled = false;
        $this->google2fa_enabled_at = null;
        $this->google2fa_enforce_globally = false;
        $this->save();
    }

    /**
     * Check if 2FA is enforced globally by any admin
     */
    public static function is2FAEnforcedGlobally(): bool
    {
        return self::whereHas('roles', function($query) {
            $query->where('name', 'admin');
        })->where('google2fa_enforce_globally', true)->exists();
    }
}
