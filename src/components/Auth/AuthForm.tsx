import React, { useState } from 'react';
import { Coffee, Mail, Lock, User, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthService } from '../../services/authService';
import { useAppContext } from '../../context/AppContext';

type AuthMode = 'login' | 'signup' | 'forgot-password';

export default function AuthForm() {
  const { state } = useAppContext();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    if (mode === 'signup') {
      if (!formData.name.trim()) {
        setError('Nama lengkap wajib diisi');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Password dan konfirmasi password tidak cocok');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password minimal 6 karakter');
        return false;
      }
    }
    
    if (!formData.email.trim()) {
      setError('Email wajib diisi');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Format email tidak valid');
      return false;
    }

    return true;
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthService.signInWithGoogle();
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError(error.message || 'Terjadi kesalahan saat login dengan Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      await AuthService.signInWithEmail(formData.email, formData.password);
    } catch (error: any) {
      console.error('Email sign in error:', error);
      setError(error.message || 'Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      await AuthService.signUpWithEmail(
        formData.email, 
        formData.password, 
        formData.name,
        formData.phone
      );
      setSuccess('Akun berhasil dibuat! Silakan cek email untuk verifikasi.');
    } catch (error: any) {
      console.error('Email sign up error:', error);
      setError(error.message || 'Terjadi kesalahan saat membuat akun');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      setError('Email wajib diisi');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await AuthService.resetPassword(formData.email);
      setSuccess('Link reset password telah dikirim ke email Anda');
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'Terjadi kesalahan saat mengirim email reset');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: ''
    });
    setError(null);
    setSuccess(null);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  if (state.authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600 rounded-full mb-4 animate-pulse">
            <Coffee className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Daftar Akun Baru';
      case 'forgot-password': return 'Reset Password';
      default: return 'Masuk ke BeansHub';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup': return 'Buat akun untuk mengakses sistem manajemen roastery';
      case 'forgot-password': return 'Masukkan email untuk reset password';
      default: return 'Sistem Manajemen Roastery Coffee House';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-amber-600 rounded-full mb-4">
              <Coffee className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {getTitle()}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {getSubtitle()}
            </p>
          </div>

          {/* Back button for non-login modes */}
          {mode !== 'login' && (
            <button
              onClick={() => switchMode('login')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke login</span>
            </button>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Berhasil</h4>
                <p className="text-sm text-green-700 mt-1">{success}</p>
              </div>
            </div>
          )}

          {/* Google Sign In (only for login and signup) */}
          {mode !== 'forgot-password' && (
            <>
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 mb-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>
                  {isLoading ? 'Memproses...' : 
                   mode === 'signup' ? 'Daftar dengan Google' : 'Masuk dengan Google'}
                </span>
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">atau</span>
                </div>
              </div>
            </>
          )}

          {/* Email Form */}
          <form onSubmit={
            mode === 'login' ? handleEmailSignIn :
            mode === 'signup' ? handleEmailSignUp :
            handleForgotPassword
          } className="space-y-4">
            
            {/* Name field (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Masukkan email Anda"
                  required
                />
              </div>
            </div>

            {/* Phone field (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            )}

            {/* Password field (not for forgot password) */}
            {mode !== 'forgot-password' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder={mode === 'signup' ? 'Minimal 6 karakter' : 'Masukkan password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password field (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Ulangi password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memproses...' : 
               mode === 'login' ? 'Masuk' :
               mode === 'signup' ? 'Daftar Akun' :
               'Kirim Link Reset'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => switchMode('forgot-password')}
                  className="text-sm text-amber-600 hover:text-amber-700 transition-colors"
                >
                  Lupa password?
                </button>
                <div className="text-sm text-gray-600">
                  Belum punya akun?{' '}
                  <button
                    onClick={() => switchMode('signup')}
                    className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                  >
                    Daftar di sini
                  </button>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <div className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  Masuk di sini
                </button>
              </div>
            )}
          </div>

          {/* Terms and Privacy (signup only) */}
          {mode === 'signup' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                Dengan mendaftar, Anda menyetujui{' '}
                <a href="#" className="text-amber-600 hover:text-amber-700">
                  Syarat dan Ketentuan
                </a>{' '}
                serta{' '}
                <a href="#" className="text-amber-600 hover:text-amber-700">
                  Kebijakan Privasi
                </a>{' '}
                BeansHub
              </p>
            </div>
          )}

          {/* Info Box */}
          {mode === 'login' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Informasi Login:</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <p>• Gunakan Google atau email untuk masuk</p>
                <p>• User baru otomatis terdaftar sebagai Staff</p>
                <p>• Hubungi admin untuk upgrade role</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}