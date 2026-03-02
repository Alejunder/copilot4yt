import React, { createContext, useEffect, useState, useContext } from "react";
import type { IUser } from "../assets/assets";
import api from "../configs/api";
import { toast } from "react-hot-toast";

interface AuthContextProps {
    isLoggedIn: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    user: IUser | null;
    setUser: (user: IUser | null) => void;
    login: (user: { email: string, password: string }) => Promise<void>;
    signUp: (user: { name: string, email: string, password: string }) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
    isLoggedIn: false,
    setIsLoggedIn: () => { },
    user: null,
    setUser: () => { },
    login: async () => { },
    signUp: async () => { },
    logout: async () => { },
})



export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user,setUser] = useState<IUser | null>(null);
    const [isLoggedIn,setIsLoggedIn] = useState<boolean>(false);

    const verifySession = async (): Promise<boolean> => {
        // Legacy helper — not called in current flows. fetchUser() handles session restoration.
        return false;
    };

    const signUp = async ({ name, email, password }: { name: string, email: string, password: string }) => {
        try {
            const { data } = await api.post('/api/auth/register', { name, email, password });
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
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
                localStorage.setItem('token', data.token);
            }
            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
            }
            toast.success('Logged in successfully!');
        } catch (error: any) {
            console.log(error);
            const errorMessage = error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
            toast.error(errorMessage);
        }
    }
    const logout = async () => {
        // JWT logout is client-side: remove the token from localStorage.
        // Optionally call the server to log the event, but it's not required.
        localStorage.removeItem('token');
        setUser(null);
        setIsLoggedIn(false);
        toast.success('Logged out successfully');
    }
    const fetchUser = async () => {
        // No token → not logged in. Skip the network call entirely.
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setIsLoggedIn(false);
            return;
        }
        try {
            const { data } = await api.get('/api/auth/verify');
            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
            } else {
                localStorage.removeItem('token');
                setUser(null);
                setIsLoggedIn(false);
            }
        } catch (error) {
            // Token is invalid or expired
            localStorage.removeItem('token');
            setUser(null);
            setIsLoggedIn(false);
        }
    }

    useEffect(() => {
       (async () => {
        await fetchUser();
       })();
       
       // Listen for authentication errors from API interceptor
       const handleAuthError = (event: any) => {
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
        user,setUser, isLoggedIn,setIsLoggedIn, login, signUp, logout
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);