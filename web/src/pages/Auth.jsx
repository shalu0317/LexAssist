import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { UserContext } from "@/components/UserContext";
import { useWebSocket, WebSocketProvider } from "../components/WebSocketProvider";



const Auth = ({ open, onOpenChange = () => { } }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useContext(UserContext);
  const [showError, setShowError] = useState(false);
  const { createSocketConnection } = useWebSocket()

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        const googleToken = credentialResponse.access_token;
        console.log("Google Token:", googleToken);
        const protocol = location.protocol === "https:" ? "https" : "http";
        const url = `${protocol}://${location.host}/user/google-login`;
        console.log("--url is ---", url);

        const response = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: googleToken })
        });

        console.log("--response is ---", response);

        if (!response.ok) {
          throw new Error(`Error fetching presigned URL: ${response.statusText}`);
        }

        const data = await response.json();

        // const data = await response.json();
        console.log("--data iis ---", data)


        setLoading(true);
        console.log("Login Success:", response.data);

        setUser(data.user);

      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
        createSocketConnection()
        navigate("/")

        onOpenChange();
      }
      // You can also send the token to your backend for verification
    },
    onError: (error) => {
      console.log("Login Failed:", error);
    },
  });




  const login = () => {
    google.accounts.id.initialize({
      client_id: "YOUR_GOOGLE_CLIENT_ID",
      callback: handleCallback,
    });

    google.accounts.id.prompt();   // opens Google login popup
  };

  const handleCallback = (response) => {
    // response.credential = ID Token (JWT)
    fetch("http://localhost:8080/user/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: response.credential }),
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const protocol = location.protocol === "https:" ? "https" : "http";
      const url = `${protocol}://${location.host}/user/login`;

      console.log("--url is ---", url);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User Info:", data);
        localStorage.setItem("access_token", JSON.stringify(data.access_token));
        localStorage.setItem("user", JSON.stringify({ username: email }));
        setUser({ username: email });
        setShowError(false);
        onOpenChange();
      } else {
        setShowError(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      className="min-h-screen flex items-center justify-center gradient-glow p-4"
    >
      {/* <Card className="w-full max-w-md shadow-glow"> */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex items-center">
          <div className="flex items-center gap-2 mb-2">
            {/* <Scale className="h-8 w-8 text-primary" /> */}
            <span className="text-2xl font-bold">TaxSurfer</span>
          </div>
          <DialogTitle className="text-2xl">Welcome back</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* <div className="p-4 border-t border-sidebar-border relative z-10"> */}
            {showError && (
              <div
                variant="ghost"
                className="w-full flex justify-center text-destructive p-2 text-sm font-bold"
              >
                Invalid Username or Password
              </div>
            )}
            {/* </div> */}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>


          {/* <Button
                        variant="outline"
                        type="button"
                        className="w-full"
                        onClick={handleGoogleLogin}
                    >
                        <GoogleLogin style={{ "background": "none" }} onSuccess={handleSuccess} onError={handleError} />
                    </Button> */}

          {/* <div className="mt-4 text-center text-sm">
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="text-primary hover:underline transition-smooth"
                        >
                            Don't have an account? Sign up
                        </button>
                    </div> */}
        </div>
      </DialogContent>
      {/* </Card> */}
    </Dialog>
  );
};

export default Auth;
