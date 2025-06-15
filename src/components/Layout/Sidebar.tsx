import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Coffee, 
  Package, 
  Flame, 
  Calculator, 
  ShoppingCart, 
  BarChart3, 
  Users, 
  Settings,
  Menu,
  X,
  FileText,
  TrendingUp,
  Star,
  Calendar,
  Activity
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const menuItems = [
  { path: '/dashboard', icon: BarChart3, label: 'Dashboard', roles: ['Admin', 'Roaster', 'Staff'] },
  { 
    path: '/inventory', 
    icon: Package, 
    label: 'Inventori', 
    roles: ['Admin', 'Roaster', 'Staff'],
    subItems: [
      { path: '/inventory', label: 'Manajemen Stok' },
      { path: '/inventory/tracking', label: 'Pelacakan Inventori' }
    ]
  },
  { 
    path: '/roasting', 
    icon: Flame, 
    label: 'Roasting', 
    roles: ['Admin', 'Roaster'],
    subItems: [
      { path: '/roasting', label: 'Operasi Roasting' },
      { path: '/roasting/profiles', label: 'Profil Roasting' }
    ]
  },
  { path: '/quality', icon: Star, label: 'Quality Control', roles: ['Admin', 'Roaster'] },
  { path: '/production', icon: Calendar, label: 'Perencanaan Produksi', roles: ['Admin', 'Roaster'] },
  { path: '/pricing', icon: Calculator, label: 'Kalkulator Harga', roles: ['Admin', 'Roaster'] },
  { path: '/sales', icon: ShoppingCart, label: 'Penjualan', roles: ['Admin', 'Staff'] },
  { path: '/reports', icon: FileText, label: 'Laporan Keuangan', roles: ['Admin'] },
  { path: '/analytics', icon: TrendingUp, label: 'Analytics', roles: ['Admin'] },
  { path: '/users', icon: Users, label: 'Manajemen User', roles: ['Admin'] },
  { path: '/settings', icon: Settings, label: 'Pengaturan', roles: ['Admin', 'Roaster', 'Staff'] }
];

export default function Sidebar() {
  const { state } = useAppContext();
  const { user } = state;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-amber-900 text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 bg-amber-900 text-white h-screen fixed left-0 top-0 overflow-y-auto z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <Coffee className="h-8 w-8 text-amber-300" />
            <h1 className="text-xl font-bold">BeansHub</h1>
          </div>
          
          <nav className="space-y-2">
            {filteredMenuItems.map((item) => (
              <div key={item.path}>
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.path)}
                      className="flex items-center justify-between w-full space-x-3 p-3 rounded-lg transition-colors text-amber-200 hover:bg-amber-800 hover:text-white"
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{item.label}</span>
                      </div>
                      <Activity 
                        className={`h-4 w-4 transform transition-transform ${
                          expandedItems.includes(item.path) ? 'rotate-90' : 'rotate-0'
                        }`} 
                      />
                    </button>
                    {expandedItems.includes(item.path) && (
                      <div className="ml-8 space-y-1">
                        {item.subItems.map((subItem) => (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                              `block p-2 rounded-lg transition-colors text-sm ${
                                isActive
                                  ? 'bg-amber-800 text-amber-100'
                                  : 'text-amber-200 hover:bg-amber-800 hover:text-white'
                              }`
                            }
                          >
                            {subItem.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-amber-800 text-amber-100'
                          : 'text-amber-200 hover:bg-amber-800 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  </NavLink>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}