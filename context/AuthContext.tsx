
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useRouter, useSegments } from 'expo-router';
import { getUserProfile } from '../services/userService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            // Don't set loading false yet if we need to check profile
            if (user) {
                // Check profile exists
                // We'll handle redirection in the other effect
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === 'auth';
        const inOnboarding = segments[0] === 'onboarding'; // Check if on onboarding page? 
        // Route is /onboarding, so segments[0] depends on folder structure. 
        // If file is app/onboarding.tsx, it's a top level route. segments might be ['onboarding'].

        const checkProfileAndRedirect = async () => {
            if (!user && !inAuthGroup) {
                router.replace('/auth/login');
            } else if (user) {
                if (inAuthGroup) {
                    router.replace('/');
                } else {
                    // Check if profile exists
                    const profile = await getUserProfile(user.uid);
                    if (!profile && segments[0] !== 'onboarding') {
                        router.replace('/onboarding');
                    } else if (profile && segments[0] === 'onboarding') {
                        // If profile exists but on onboarding, go home
                        router.replace('/');
                    }
                }
            }
        };

        checkProfileAndRedirect();

    }, [user, loading, segments]);

    const signOut = async () => {
        await firebaseSignOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
