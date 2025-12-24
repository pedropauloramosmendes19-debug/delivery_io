import axios from 'axios';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/Config';

interface AuthContextType {
    user: any;
    token: string | null;
    signIn: (username: string, pass: string) => Promise<void>;
    signOut: () => void;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    signIn: async () => { },
    signOut: () => { },
    loading: false,
    error: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const router = useRouter();
    const segments = useSegments();

    // Carregar estado inicial do storage
    useEffect(() => {
        const loadAuth = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('@auth_token');
                const storedUser = await AsyncStorage.getItem('@auth_user');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error("Failed to load auth state", e);
            } finally {
                setIsInitialized(true);
            }
        };
        loadAuth();
    }, []);

    const signIn = async (username: string, pass: string) => {
        setLoading(true);
        setError(null);
        try {
            console.log("Tentando login com:", username);
            const loginResponse = await axios.post(`${BASE_URL}/api/token/`, {
                username: username,
                password: pass
            });

            const accessToken = loginResponse.data.access;
            const userData = {
                username,
                id: loginResponse.data.id,
                building: loginResponse.data.building || 'Bloco A'
            };

            setToken(accessToken);
            setUser(userData);

            await AsyncStorage.setItem('@auth_token', accessToken);
            await AsyncStorage.setItem('@auth_user', JSON.stringify(userData));

            console.log("Login sucesso!");
        } catch (err: any) {
            console.error("Erro no login:", err);
            setError("Credenciais inválidas ou erro no servidor");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setToken(null);
        setUser(null);
        await AsyncStorage.removeItem('@auth_token');
        await AsyncStorage.removeItem('@auth_user');
    };

    // Proteção de rotas
    useEffect(() => {
        if (!isInitialized) return;
        if (loading) return;

        const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

        if (!token && !inAuthGroup) {
            router.replace('/login');
        } else if (token && inAuthGroup) {
            router.replace('/');
        }
    }, [token, segments, loading, isInitialized]);

    return (
        <AuthContext.Provider value={{ user, token, signIn, signOut, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
};
