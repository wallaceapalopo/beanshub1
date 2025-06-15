import { useState, useEffect } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { useAppContext } from '../context/AppContext';

export function useFirestoreCollection<T>(collectionName: string) {
  const { state } = useAppContext();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.user) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = FirestoreService.subscribeToCollection<T>(
      collectionName,
      (newData) => {
        setData(newData);
        setLoading(false);
      },
      state.user.id
    );

    return () => {
      unsubscribe();
    };
  }, [collectionName, state.user]);

  const create = async (data: Omit<T, 'id'>) => {
    if (!state.user) throw new Error('User not authenticated');
    return FirestoreService.create<T>(collectionName, data);
  };

  const update = async (id: string, data: Partial<T>) => {
    return FirestoreService.update<T>(collectionName, id, data);
  };

  const remove = async (id: string) => {
    return FirestoreService.delete(collectionName, id);
  };

  return {
    data,
    loading,
    error,
    create,
    update,
    remove
  };
}