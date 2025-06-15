import React from 'react';
import { useAppContext } from '../../context/AppContext';
import AuthForm from './AuthForm';
import EmailVerificationBanner from './EmailVerificationBanner';
import { AuthService } from '../../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireEmailVerification = false 
}: ProtectedRouteProps) {
  const { state } = useAppContext();
  const [showVerificationBanner, setShowVerificationBanner] = React.useState(true);

  // Show loading while checking auth state
  if (state.authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600 rounded-full mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">☕</span>
          </div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!state.user) {
    return <AuthForm />;
  }

  // Check email verification if required
  const isEmailVerified = AuthService.isEmailVerified();
  const shouldShowVerificationBanner = requireEmailVerification && 
                                      !isEmailVerified && 
                                      showVerificationBanner;

  return (
    <>
      {shouldShowVerificationBanner && (
        <EmailVerificationBanner 
          onDismiss={() => setShowVerificationBanner(false)} 
        />
      )}
      {children}
    </>
  );
}