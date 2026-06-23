import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout, getUserRole } from '../lib/firebase';
import { UserRole } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = initAuth(
      async (u, token) => {
        setUser(u);
        const r = await getUserRole(u.uid);
        if (r) setRole(r);
        setLoading(false);
      },
      () => {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        const r = await getUserRole(res.user.uid);
        if (r) setRole(r);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { user, role, loading, login, logout };
}
