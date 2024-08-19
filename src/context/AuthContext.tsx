import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import {User} from "@/interfaces/GameTypes";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => void;
    logout: () => void;
    setHostStatus: (isHost: boolean) => void; // Function to set host status
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const setHostStatus = (isHost: boolean) => {
        if (user) {
            setUser(prevUser => ({ ...prevUser!, isHost })); // Update the user with host status
        }
    };

    const login = useGoogleLogin({
        onSuccess: async (response) => {
            try {
                const backendResponse = await axios.post('/api/Auth/register', null, {
                    headers: {
                        Authorization: `Bearer ${response.access_token}`
                    }
                });
                setUser(backendResponse.data);
            } catch (error) {
                console.error('Error registering user:', error);
            }
        },
        onError: (error) => console.error('Google Login Failed:', error),
    });

    const logout = async () => {
        try {
            await axios.post('/api/Auth/logout');
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            setUser(null);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/Auth/me');
                setUser(response.data);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setHostStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
