import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, GreenBean, RoastingProfile, RoastingSession, Sale, Notification } from '../types';

interface AppState {
  user: User | null;
  users: User[];
  greenBeans: GreenBean[];
  roastingProfiles: RoastingProfile[];
  roastingSessions: RoastingSession[];
  sales: Sale[];
  notifications: Notification[];
  loading: boolean;
}

type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_GREEN_BEAN'; payload: GreenBean }
  | { type: 'UPDATE_GREEN_BEAN'; payload: GreenBean }
  | { type: 'DELETE_GREEN_BEAN'; payload: string }
  | { type: 'ADD_ROASTING_PROFILE'; payload: RoastingProfile }
  | { type: 'UPDATE_ROASTING_PROFILE'; payload: RoastingProfile }
  | { type: 'DELETE_ROASTING_PROFILE'; payload: string }
  | { type: 'ADD_ROASTING_SESSION'; payload: RoastingSession }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string };

const initialState: AppState = {
  user: null,
  users: [
    {
      id: '1',
      email: 'admin@beanshub.com',
      name: 'Admin BeansHub',
      role: 'Admin',
      phone: '+62 812 4100 3047',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date()
    },
    {
      id: '2',
      email: 'roaster@beanshub.com',
      name: 'Master Roaster',
      role: 'Roaster',
      phone: '+62 821 5555 1234',
      isActive: true,
      createdAt: new Date('2024-01-05'),
      lastLogin: new Date('2024-01-28')
    },
    {
      id: '3',
      email: 'staff@beanshub.com',
      name: 'Staff Penjualan',
      role: 'Staff',
      phone: '+62 856 7777 9999',
      isActive: true,
      createdAt: new Date('2024-01-10'),
      lastLogin: new Date('2024-01-27')
    },
    {
      id: '4',
      email: 'inactive@beanshub.com',
      name: 'User Nonaktif',
      role: 'Staff',
      isActive: false,
      createdAt: new Date('2024-01-15'),
      lastLogin: null
    }
  ],
  greenBeans: [
    {
      id: '1',
      supplierName: 'Koperasi Kopi Gayo',
      variety: 'Arabica Gayo',
      origin: 'Aceh, Indonesia',
      quantity: 500,
      purchasePricePerKg: 85000,
      entryDate: new Date('2024-01-15'),
      batchNumber: 'GB-2024-001',
      lowStockThreshold: 50
    },
    {
      id: '2',
      supplierName: 'Petani Toraja',
      variety: 'Toraja Kalosi',
      origin: 'Sulawesi, Indonesia',
      quantity: 200,
      purchasePricePerKg: 95000,
      entryDate: new Date('2024-01-20'),
      batchNumber: 'GB-2024-002',
      lowStockThreshold: 30
    },
    {
      id: '3',
      supplierName: 'Koperasi Mandailing',
      variety: 'Mandailing',
      origin: 'Sumatera Utara, Indonesia',
      quantity: 25,
      purchasePricePerKg: 90000,
      entryDate: new Date('2024-01-25'),
      batchNumber: 'GB-2024-003',
      lowStockThreshold: 50
    }
  ],
  roastingProfiles: [
    {
      id: '1',
      name: 'Medium Roast - Arabica',
      temperatureCurve: 'Gradual rise to 200°C, hold 2min, rise to 220°C',
      targetDuration: 12,
      notes: 'Perfect for filter coffee',
      createdBy: '1',
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'Dark Roast - Robusta',
      temperatureCurve: 'Quick rise to 210°C, hold 1min, rise to 230°C',
      targetDuration: 15,
      notes: 'Great for espresso',
      createdBy: '1',
      createdAt: new Date()
    }
  ],
  roastingSessions: [
    {
      id: '1',
      greenBeanId: '1',
      greenBeanQuantity: 50,
      roastedQuantity: 40,
      profileId: '1',
      roastDate: new Date('2024-01-28'),
      roasterId: '2',
      notes: 'Perfect roast, good color development',
      batchNumber: 'RS-2024-001'
    }
  ],
  sales: [
    {
      id: '1',
      productType: 'roasted',
      productId: 'roasted-coffee',
      quantity: 5,
      pricePerKg: 150000,
      totalAmount: 750000,
      paymentMethod: 'Cash',
      customerName: 'Cafe Arabica',
      customerPhone: '081234567890',
      saleDate: new Date('2024-01-29'),
      staffId: '3'
    }
  ],
  notifications: [
    {
      id: '1',
      type: 'warning',
      title: 'Stok Rendah',
      message: 'Mandailing memiliki stok di bawah batas minimum (25kg)',
      timestamp: new Date(),
      read: false
    }
  ],
  loading: false
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        )
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    case 'ADD_GREEN_BEAN':
      return { ...state, greenBeans: [...state.greenBeans, action.payload] };
    case 'UPDATE_GREEN_BEAN':
      return {
        ...state,
        greenBeans: state.greenBeans.map(bean =>
          bean.id === action.payload.id ? action.payload : bean
        )
      };
    case 'DELETE_GREEN_BEAN':
      return {
        ...state,
        greenBeans: state.greenBeans.filter(bean => bean.id !== action.payload)
      };
    case 'ADD_ROASTING_PROFILE':
      return { ...state, roastingProfiles: [...state.roastingProfiles, action.payload] };
    case 'UPDATE_ROASTING_PROFILE':
      return {
        ...state,
        roastingProfiles: state.roastingProfiles.map(profile =>
          profile.id === action.payload.id ? action.payload : profile
        )
      };
    case 'DELETE_ROASTING_PROFILE':
      return {
        ...state,
        roastingProfiles: state.roastingProfiles.filter(profile => profile.id !== action.payload)
      };
    case 'ADD_ROASTING_SESSION':
      return { ...state, roastingSessions: [...state.roastingSessions, action.payload] };
    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.payload] };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, read: true } : notif
        )
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}