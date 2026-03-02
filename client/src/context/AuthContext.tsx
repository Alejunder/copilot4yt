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

    /**
     * Verifies that the session cookie was accepted by the browser and is
     * being sent back to the server correctly.
     *
     * With the same-origin proxy architecture (Vercel rewrite /api/* → backend),
     * the session cookie is a first-party cookie on this origin. Safari's ITP
     * does not block first-party cookies, so a single request is sufficient —
     * no artificial retries or delays are needed.
     */
    const verifySession = async (): Promise<boolean> => {
        try {
            const { data } = await api.get('/api/auth/verify');
            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Session verification failed:', error);
            return false;
        }
    };

    const signUp = async ({ name, email, password }: { name: string, email: string, password: string }) => {
        try {
            const { data } = await api.post('/api/auth/register', { name, email, password });
            // Set user state directly from the registration response body.
            // The session cookie is set by the backend via the Vercel proxy rewrite
            // (same-origin, so SameSite=Lax and Safari ITP both accept it).
            // fetchUser() on the next page load will re-verify the session.
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
            // Set user state directly from the login response body.
            // The session cookie is handled by the Vercel proxy rewrite (same-origin),
            // so SameSite=Lax works and Safari ITP does not block it.
            // fetchUser() on the next page load will re-verify the session via the cookie.
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