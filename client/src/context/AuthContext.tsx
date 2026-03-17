import React, { createContext, useEffect, useState, useContext } from "react";
import type { IUser } from "../assets/assets";
import api from "../configs/api";
import { toast } from "react-hot-toast";

interface AuthContextProps {
    isLoggedIn: boolean;
    isLoading: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    user: IUser | null;
    setUser: (user: IUser | null) => void;
    credits: number | null;
    plan: string | null;
    planExpiresAt: Date | null;
    fetchCredits: () => Promise<void>;
    login: (user: { email: string, password: string }) => Promise<void>;
    signUp: (user: { name: string, email: string, password: string }) => Promise<void>;
    logout: () => Promise<void>;
}

const safeGetToken = (): string | null => {
    try { return localStorage.getItem('token'); } catch { return null; }
};
const safeSetToken = (token: string): void => {
    try { localStorage.setItem('token', token); } catch {}
};
const safeRemoveToken = (): void => {
    try { localStorage.removeItem('token'); } catch {}
};

const AuthContext = createContext<AuthContextProps>({
    isLoggedIn: false,
    isLoading: true,
    setIsLoggedIn: () => { },
    user: null,
    setUser: () => { },
    credits: null,
    plan: null,
    planExpiresAt: null,
    fetchCredits: async () => { },
    login: async () => { },
    signUp: async () => { },
    logout: async () => { },
})



export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user,setUser] = useState<IUser | null>(null);
    const [isLoggedIn,setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [credits, setCredits] = useState<number | null>(null);
    const [plan, setPlan] = useState<string | null>(null);
    const [planExpiresAt, setPlanExpiresAt] = useState<Date | null>(null);

    const fetchCredits = async () => {
        try {
            const { data } = await api.get('/api/billing/credits');
            setCredits(data.data.credits);
            setPlan(data.data.plan ?? null);
            setPlanExpiresAt(data.data.planExpiresAt ? new Date(data.data.planExpiresAt) : null);
        } catch {}
    };

    const signUp = async ({ name, email, password }: { name: string, email: string, password: string }) => {
        try {
            const { data } = await api.post('/api/auth/register', { name, email, password });
            if (data.token) {
                safeSetToken(data.token);
            }
            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
                await fetchCredits();
            }
            toast.success('Account created successfully!');
        } catch (error: any) {
            console.log(error);
            const errorMessage = error.response?.data?.message || 'Error al registrar. Por favor intenta de nuevo.';
            toast.error(errorMessage);
        }
    }

    const login = async ({ email, password }: { email: string, password: string }) => {
        try {
            const { data } = await api.post('/api/auth/login', { email, password });
            if (data.token) {
                safeSetToken(data.token);
            }
            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
                await fetchCredits();
            }
            toast.success('Logged in successfully!');
        } catch (error: any) {
            console.log(error);
            const errorMessage = error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
            toast.error(errorMessage);
        }
    }

    const logout = async () => {
        safeRemoveToken();
        setUser(null);
        setIsLoggedIn(false);
        setCredits(null);
        setPlan(null);
        setPlanExpiresAt(null);
        toast.success('Logged out successfully');
    }

    const fetchUser = async () => {
        const token = safeGetToken();

        if (!token) {
            setUser(null);
            setIsLoggedIn(false);
            setIsLoading(false);
            return;
        }

        try {
            const { data } = await api.get('/api/auth/verify');
            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
                fetchCredits();
            } else {
                safeRemoveToken();
                setUser(null);
                setIsLoggedIn(false);
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                safeRemoveToken();
                setUser(null);
                setIsLoggedIn(false);
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
       (async () => {
        await fetchUser();
       })();
       
       const handleAuthError = () => {
           setUser(null);
           setIsLoggedIn(false);
           toast.error('Your session has expired. Please log in again.');
       };
       
       window.addEventListener('auth-error', handleAuthError);
       
       return () => {
           window.removeEventListener('auth-error', handleAuthError);
       };
    }, [])

    const value = {
        user, setUser, isLoggedIn, setIsLoggedIn, isLoading, credits, plan, planExpiresAt, fetchCredits, login, signUp, logout
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);