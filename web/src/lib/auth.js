import jwtDecode from "jwt-decode";
import jwt from "jsonwebtoken";
import { saveToken, getUserFromToken, removeToken } from "@/utils/auth";

const TOKEN_KEY = "app_jwt_token";

export const saveToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

export const getUserFromToken = () => {
    const token = getToken();
    if (!token) return null;
    try {
        const user = jwtDecode(token);
        return user; // user info stored in payload
    } catch {
        return null;
    }
};

// Secret key for JWT (in real apps, use server-side!)
const SECRET_KEY = "mysecretkey";

// Sign-up function
export const signUp = ({ email, password, firstName, lastName }) => {
    const user = { email, firstName, lastName };
    // create token
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });
    saveToken(token);
    return user;
};

// Login function
export const login = ({ email, password }) => {
    // For demo: just check if email exists in localStorage
    const user = getUserFromToken();
    if (user && user.email === email) {
        const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });
        saveToken(token);
        return user;
    }
    throw new Error("User not found");
};

// Logout
export const logout = () => removeToken();
