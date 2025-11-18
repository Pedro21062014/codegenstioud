import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCFSSxM-_7cefMP9hFLB_nIhu4kGgDMDOM",
  authDomain: "codegenstudio-398fc.firebaseapp.com",
  databaseURL: "https://codegenstudio-398fc-default-rtdb.firebaseio.com",
  projectId: "codegenstudio-398fc",
  storageBucket: "codegenstudio-398fc.firebasestorage.app",
  messagingSenderId: "698246345398",
  appId: "1:698246345398:web:40c623ecd83132cfb5ec17",
  measurementId: "G-X4SYLSYFQL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Firebase Service para substituir Supabase
export const firebaseService = {
  // Autenticação
  auth: {
    getCurrentUser: (): Promise<User | null> => {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
      });
    },

    signIn: async (email: string, password: string) => {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: result.user };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    signOut: async () => {
      try {
        await signOut(auth);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    onAuthStateChanged: (callback: (user: User | null) => void) => {
      return onAuthStateChanged(auth, callback);
    }
  },

  // Firestore Database
  db: {
    // Profiles (equivalente à tabela profiles do Supabase)
    profiles: {
      get: async (userId: string) => {
        try {
          const docRef = doc(db, "profiles", userId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
          } else {
            return { success: false, error: "Profile not found" };
          }
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },

      set: async (userId: string, data: any) => {
        try {
          const docRef = doc(db, "profiles", userId);
          await setDoc(docRef, {
            ...data,
            updated_at: serverTimestamp()
          });
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },

      update: async (userId: string, data: any) => {
        try {
          const docRef = doc(db, "profiles", userId);
          await updateDoc(docRef, {
            ...data,
            updated_at: serverTimestamp()
          });
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      }
    },

    // Projects (equivalente à tabela projects do Supabase)
    projects: {
      get: async (projectId: string) => {
        try {
          const docRef = doc(db, "projects", projectId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { success: true, data: { id: docSnap.id, ...docSnap.data() } as any };
          } else {
            return { success: false, error: "Project not found" };
          }
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },

      getAll: async (userId: string) => {
        try {
          const q = query(collection(db, "projects"), where("user_id", "==", userId));
          const querySnapshot = await getDocs(q);
          const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          return { success: true, data: projects };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },

      create: async (projectData: any) => {
        try {
          const docRef = await addDoc(collection(db, "projects"), {
            ...projectData,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
          });
          return { success: true, data: { id: docRef.id } };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },

      update: async (projectId: string, data: any) => {
        try {
          const docRef = doc(db, "projects", projectId);
          await updateDoc(docRef, {
            ...data,
            updated_at: serverTimestamp()
          });
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },

      delete: async (projectId: string) => {
        try {
          const docRef = doc(db, "projects", projectId);
          await deleteDoc(docRef);
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      }
    }
  }
};

export { db, auth };
export default firebaseService;
