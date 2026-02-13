import React, { createContext, useCallback, useEffect, useState } from "react";

export const AuthContext = createContext({
    user: null,
    loading: true,
    signInWithGoogle: () => { },
    signOut: () => { },
    refreshMe: () => { },
});

const GOOGLE_CLIENT_ID =
    "743695190259-e9ednmmrqqus0419886khkemfqpbqhc5.apps.googleusercontent.com";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshMe = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:8000/api/auth/me", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshMe();
    }, [refreshMe]);

    // Load Google Identity script once
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const signInWithGoogle = useCallback(() => {
        if (!window.google) return;

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
                try {
                    const r = await fetch("http://localhost:8000/api/auth/google", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id_token: response.credential }),
                    });

                    if (!r.ok) throw new Error("Login failed");
                    await refreshMe();
                } catch (e) {
                    console.error(e);
                    alert("Login failed");
                }
            },
        });

        // Trigger Google's sign-in popup (One Tap)
        window.google.accounts.id.prompt();
    }, [refreshMe]);

    const signOut = useCallback(async () => {
        await fetch("http://localhost:8000/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, loading, signInWithGoogle, signOut, refreshMe }}
        >
            {children}
        </AuthContext.Provider>
    );
};
