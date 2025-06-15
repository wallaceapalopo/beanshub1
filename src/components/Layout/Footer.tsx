import React from 'react';
import { Coffee, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-amber-900 text-amber-100 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-3 mb-4">
              <Coffee className="h-8 w-8 text-amber-300" />
              <h3 className="text-xl font-bold text-white">BeansHub</h3>
            </div>
            <p className="text-amber-200 text-sm text-center md:text-left">
              Sistem Manajemen Roastery Kopi yang komprehensif untuk bisnis kopi Anda
            </p>
          </div>

          {/* Features Section */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4">Fitur Utama</h4>
            <ul className="space-y-2 text-sm text-amber-200">
              <li>• Manajemen Inventori Biji Hijau</li>
              <li>• Operasi Roasting & Profil</li>
              <li>• Kalkulator Harga Otomatis</li>
              <li>• Laporan Keuangan Lengkap</li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4">Kontak</h4>
            <div className="space-y-2 text-sm text-amber-200">
              <p>Email: dev@sidepe.com</p>
              <p>Telepon: +62 812 4100 3047</p>
              <p>Website: www.beanshub.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-amber-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-amber-200">
              © 2024 BeansHub. All rights reserved.
            </div>
            <div className="flex items-center space-x-2 text-sm text-amber-200">
              <span>Create by</span>
              <Heart className="h-4 w-4 text-red-400" />
              <span className="font-semibold text-amber-100">Pandu Talenta Digital</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}