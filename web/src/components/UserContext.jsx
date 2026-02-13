// src/context/UserContext.js
import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const protocol = location.protocol === "https:" ? "https" : "http";
      const url = `${protocol}://${location.host}/user/info`;

      const resp = await fetch(url, {
        credentials: "include", // send cookie
      });

      if (resp.status === 200) {
        const data = await resp.json();
        console.log("---user resp is --", data);
        setUser(data);
      } else {
        console.log("---user not signed in --");
      }
    } catch (err) {
      console.error("User fetch failed:", err);
    }
  };

  fetchUser();
}, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
