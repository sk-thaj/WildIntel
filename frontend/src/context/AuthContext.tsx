import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/services/api";

type User = {
    id: number;
    username: string;
    role: string;
};

type AuthContextType = {
    user: User | null;
    login: (userData: any) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Load user from local storage on mount
        const savedUser = localStorage.getItem("wildintel_user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = (userData: any) => {
        setUser(userData);
        localStorage.setItem("wildintel_user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("wildintel_user");
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === "admin";

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
