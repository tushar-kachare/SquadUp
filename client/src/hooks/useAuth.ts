import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import type { User as FirebaseUser, UserCredential } from "firebase/auth";
import { syncUser } from "../api/users.api";
import { auth } from "../config/firebase";

type UseAuthResult = {
  user: FirebaseUser | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
};

const googleProvider = new GoogleAuthProvider();

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        syncUser({
          displayName: currentUser.displayName,
          email: currentUser.email,
        }).catch((error: unknown) => {
          console.error("Failed to sync Firebase user:", error);
        });
      }
    });

    return unsubscribe;
  }, []);

  return {
    user,
    loading,
    signUpWithEmail: (email, password) =>
      createUserWithEmailAndPassword(auth, email, password),
    signInWithEmail: (email, password) =>
      signInWithEmailAndPassword(auth, email, password),
    signInWithGoogle: () => signInWithPopup(auth, googleProvider),
    signOut: () => firebaseSignOut(auth),
  };
}

export type { FirebaseUser };
