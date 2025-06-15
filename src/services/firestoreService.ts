import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { GreenBean, RoastingProfile, RoastingSession, Sale, User } from '../types';

export class FirestoreService {
  // Generic CRUD operations
  static async create<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  static async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    try {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  static async delete(collectionName: string, id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  static async getById<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docSnap = await getDoc(doc(db, collectionName, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  static async getAll<T>(collectionName: string, userId?: string): Promise<T[]> {
    try {
      let q = collection(db, collectionName);
      
      // Add user filter for user-specific collections
      if (userId && ['greenBeans', 'roastingProfiles', 'roastingSessions', 'sales'].includes(collectionName)) {
        q = query(collection(db, collectionName), where('userId', '==', userId));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  }

  // Real-time listeners
  static subscribeToCollection<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    userId?: string
  ): () => void {
    try {
      let q = collection(db, collectionName);
      
      if (userId && ['greenBeans', 'roastingProfiles', 'roastingSessions', 'sales'].includes(collectionName)) {
        q = query(collection(db, collectionName), where('userId', '==', userId));
      }

      return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        callback(data);
      });
    } catch (error) {
      console.error(`Error subscribing to ${collectionName}:`, error);
      return () => {};
    }
  }

  // Specific service methods
  static async createGreenBean(data: Omit<GreenBean, 'id'>, userId: string): Promise<string> {
    return this.create<GreenBean>('greenBeans', { ...data, userId } as any);
  }

  static async createRoastingProfile(data: Omit<RoastingProfile, 'id'>, userId: string): Promise<string> {
    return this.create<RoastingProfile>('roastingProfiles', { ...data, userId } as any);
  }

  static async createRoastingSession(data: Omit<RoastingSession, 'id'>, userId: string): Promise<string> {
    return this.create<RoastingSession>('roastingSessions', { ...data, userId } as any);
  }

  static async createSale(data: Omit<Sale, 'id'>, userId: string): Promise<string> {
    return this.create<Sale>('sales', { ...data, userId } as any);
  }

  // User management (admin only)
  static async getAllUsers(): Promise<User[]> {
    return this.getAll<User>('users');
  }

  static async updateUser(id: string, data: Partial<User>): Promise<void> {
    return this.update<User>('users', id, data);
  }

  static async deleteUser(id: string): Promise<void> {
    return this.delete('users', id);
  }

  // Analytics queries
  static async getSalesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Sale[]> {
    try {
      const q = query(
        collection(db, 'sales'),
        where('userId', '==', userId),
        where('saleDate', '>=', startDate),
        where('saleDate', '<=', endDate),
        orderBy('saleDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sale[];
    } catch (error) {
      console.error('Error getting sales by date range:', error);
      throw error;
    }
  }

  static async getRecentRoastingSessions(userId: string, limitCount: number = 10): Promise<RoastingSession[]> {
    try {
      const q = query(
        collection(db, 'roastingSessions'),
        where('userId', '==', userId),
        orderBy('roastDate', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RoastingSession[];
    } catch (error) {
      console.error('Error getting recent roasting sessions:', error);
      throw error;
    }
  }
}