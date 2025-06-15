import React, { useState } from 'react';
import { Mail, X, RefreshCw } from 'lucide-react';
import { AuthService } from '../../services/authService';

interface EmailVerificationBannerProps {
  onDismiss: () => void;
}

export default function EmailVerificationBanner({ onDismiss }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResendVerification = async () => {
    setIsResending(true);
    setMessage(null);

    try {
      await AuthService.resendEmailVerification();
      setMessage('Email verifikasi telah dikirim ulang');
    } catch (error: any) {
      setMessage('Gagal mengirim email verifikasi');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Mail className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Verifikasi Email Diperlukan
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              Silakan cek email Anda dan klik link verifikasi untuk mengaktifkan akun.
            </p>
            {message && (
              <p className="mt-1 font-medium">{message}</p>
            )}
          </div>
          <div className="mt-3 flex space-x-3">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center space-x-1"
            >
              {isResending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              <span>{isResending ? 'Mengirim...' : 'Kirim Ulang'}</span>
            </button>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 text-blue-500 hover:bg-blue-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}