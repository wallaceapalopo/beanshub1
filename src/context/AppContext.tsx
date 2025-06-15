import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, GreenBean, RoastingProfile, RoastingSession, Sale, Notification } from '../types';
import { AuthService } from '../services/authService';
import { FirestoreService } from '../services/firestoreService';

interface AppState {
  user: User | null;
  users: User[];
  greenBeans: GreenBean[];
  roastingProfiles: RoastingProfile[];
  roastingSessions: RoastingSession[];
  sales: Sale[];
  notifications: Notification[];
  loading: boolean;
  authLoading: boolean;
}

type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_GREEN_BEANS'; payload: GreenBean[] }
  | { type: 'ADD_GREEN_BEAN'; payload: GreenBean }
  | { type: 'UPDATE_GREEN_BEAN'; payload: GreenBean }
  | { type: 'DELETE_GREEN_BEAN'; payload: string }
  | { type: 'SET_ROASTING_PROFILES'; payload: RoastingProfile[] }
  | { type: 'ADD_ROASTING_PROFILE'; payload: RoastingProfile }
  | { type: 'UPDATE_ROASTING_PROFILE'; payload: RoastingProfile }
  | { type: 'DELETE_ROASTING_PROFILE'; payload: string }
  | { type: 'SET_ROASTING_SESSIONS'; payload: RoastingSession[] }
  | { type: 'ADD_ROASTING_SESSION'; payload: RoastingSession }
  | { type: 'SET_SALES'; payload: Sale[] }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string };

const initialState: AppState = {
  user: null,
  users: [],
  greenBeans: [],
  roastingProfiles: [],
  roastingSessions: [],
  sales: [],
  notifications: [],
  loading: false,
  authLoading: true
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
        user: state.user?.id === action.payload.id ? action.payload : state.user
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    case 'SET_GREEN_BEANS':
      return { ...state, greenBeans: action.payload };
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
    case 'SET_ROASTING_PROFILES':
      return { ...state, roastingProfiles: action.payload };
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
    case 'SET_ROASTING_SESSIONS':
      return { ...state, roastingSessions: action.payload };
    case 'ADD_ROASTING_SESSION':
      return { ...state, roastingSessions: [...state.roastingSessions, action.payload] };
    case 'SET_SALES':
      return { ...state, sales: action.payload };
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

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!state.user) {
      // Clear data when user logs out
      dispatch({ type: 'SET_GREEN_BEANS', payload: [] });
      dispatch({ type: 'SET_ROASTING_PROFILES', payload: [] });
      dispatch({ type: 'SET_ROASTING_SESSIONS', payload: [] });
      dispatch({ type: 'SET_SALES', payload: [] });
      return;
    }

    // Subscribe to user's data
    const unsubscribes: (() => void)[] = [];

    // Subscribe to green beans
    unsubscribes.push(
      FirestoreService.subscribeToCollection<GreenBean>(
        'greenBeans',
        (data) => dispatch({ type: 'SET_GREEN_BEANS', payload: data }),
        state.user.id
      )
    );

    // Subscribe to roasting profiles
    unsubscribes.push(
      FirestoreService.subscribeToCollection<RoastingProfile>(
        'roastingProfiles',
        (data) => dispatch({ type: 'SET_ROASTING_PROFILES', payload: data }),
        state.user.id
      )
    );

    // Subscribe to roasting sessions
    unsubscribes.push(
      FirestoreService.subscribeToCollection<RoastingSession>(
        'roastingSessions',
        (data) => dispatch({ type: 'SET_ROASTING_SESSIONS', payload: data }),
        state.user.id
      )
    );

    // Subscribe to sales
    unsubscribes.push(
      FirestoreService.subscribeToCollection<Sale>(
        'sales',
        (data) => dispatch({ type: 'SET_SALES', payload: data }),
        state.user.id
      )
    );

    // Subscribe to users (admin only)
    if (state.user.role === 'Admin') {
      unsubscribes.push(
        FirestoreService.subscribeToCollection<User>(
          'users',
          (data) => dispatch({ type: 'SET_USERS', payload: data })
        )
      );
    }

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [state.user]);

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