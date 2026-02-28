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

    // Helper function to verify session is working (critical for iOS Safari)
    const verifySession = async (maxRetries = 3, delayMs = 300): Promise<boolean> => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                // Wait before retry to allow cookie to be set (iOS Safari needs this)
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
                
                const { data } = await api.get('/api/auth/verify');
                if (data.user) {
                    setUser(data.user as IUser);
                    setIsLoggedIn(true);
                    return true;
                }
            } catch (error) {
                console.log(`Session verification attempt ${i + 1} failed`);
            }
        }
        return false;
    };

    const signUp = async ({ name, email, password }: { name: string, email: string, password: string }) => {
        try {
            const{data} = await api.post('/api/auth/register', { name, email, password });
            
            // Critical fix: Verify session is actually working before setting state
            // This fixes iOS Safari cookie timing issues
            const sessionVerified = await verifySession();
            
            if (sessionVerified) {
                toast.success(data.message);
            } else {
                // Fallback: set user from response if verification fails
                if(data.user){
                    setUser(data.user as IUser);
                    setIsLoggedIn(true);
                }
                toast.success(data.message + " (If you have issues, please try logging out and back in)");
            }
        } catch (error: any) {
            console.log(error);
            const errorMessage = error.response?.data?.message || "Error al registrar. Por favor intenta de nuevo.";
            toast.error(errorMessage);
        }
    }
    const login = async ({ email, password }: { email: string, password: string }) => {
        try {
            const{data} = await api.post('/api/auth/login', { email, password });
            
            // Critical fix: Verify session is actually working before setting state
            // This fixes iOS Safari cookie timing issues
            const sessionVerified = await verifySession();
            
            if (sessionVerified) {
                toast.success(data.message);
            } else {
                // Fallback: set user from response if verification fails
                if(data.user){
                    setUser(data.user as IUser);
                    setIsLoggedIn(true);
                }
                toast.success(data.message + " (If you have issues, please try logging out and back in)");
            }
        } catch (error: any) {
            console.log(error);
            const errorMessage = error.response?.data?.message || "Error al iniciar sesión. Verifica tus credenciales.";
            toast.error(errorMessage);
        }
    }
    const logout = async () => {
        try {
            const{data} = await api.post('/api/auth/logout');
            setUser(null);
            setIsLoggedIn(false);
            toast.success(data.message);
        } catch (error: any) {
            console.log(error);
            const errorMessage = error.response?.data?.message || "Error al cerrar sesión.";
            toast.error(errorMessage);
        }
    }
    const fetchUser = async () => {
        try {
            const{data} = await api.get('/api/auth/verify');
            if(data.user){
                setUser(data.user as IUser);
                setIsLoggedIn(true);
            } else {
                setUser(null);
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.log(error);
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