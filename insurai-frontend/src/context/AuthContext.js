import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("insurai_user");
        const storedToken = localStorage.getItem("insurai_token");
        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem("insurai_user");
                localStorage.removeItem("insurai_token");
            }
        }
        setLoading(false);
    }, []);

    const login = (data) => {
        // data = { user: {...}, token: "..." }
        setUser(data.user);
        localStorage.setItem("insurai_user", JSON.stringify(data.user));
        localStorage.setItem("insurai_token", data.token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("insurai_user");
        localStorage.removeItem("insurai_token");
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
