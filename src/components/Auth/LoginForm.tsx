import React, { useState } from 'react';
import { Coffee, User, Lock } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function LoginForm() {
  const { dispatch } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const mockUsers = [
    {
      id: '1',
      email: 'admin@beanshub.com',
      password: 'admin123',
      name: 'Admin BeansHub',
      role: 'Admin' as const,
    },
    {
      id: '2',
      email: 'roaster@beanshub.com',
      password: 'roaster123',
      name: 'Master Roaster',
      role: 'Roaster' as const,
    },
    {
      id: '3',
      email: 'staff@beanshub.com',
      password: 'staff123',
      name: 'Staff Penjualan',
      role: 'Staff' as const,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      dispatch({
        type: 'SET_USER',
        payload: {
          ...user,
          createdAt: new Date(),
        },
      });
    } else {
      alert('Email atau password salah');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-amber-600 rounded-full mb-4">
              <Coffee className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              BeansHub
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Sistem Manajemen Roastery Coffee House
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  placeholder="Masukkan email Anda"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  placeholder="Masukkan password Anda"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          {/* <div className="mt-6 sm:mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Demo Akun:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Admin:</strong> admin@beanshub.com / admin123</p>
              <p><strong>Roaster:</strong> roaster@beanshub.com / roaster123</p>
              <p><strong>Staff:</strong> staff@beanshub.com / staff123</p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
