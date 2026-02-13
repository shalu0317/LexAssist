import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Scale } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const Register = () => {
  const [step, setStep] = useState("details");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!mobileNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with country code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement backend OTP sending
      // Temporarily skip to OTP step for testing
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: "Check your phone for the verification code",
      });
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

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement backend OTP verification and user registration
      const protocol = location.protocol === "https:" ? "https" : "http";
      const url = `${protocol}://${location.host}/register`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          mobileNumber,
          address,
          otp,
        }),
      });

      if (!response.ok) {
        throw new Error("Registration failed. Please try again.");
      }

      const userData = {
        firstName,
        lastName,
        mobileNumber,
        address,
        email,
      };
      localStorage.setItem("userProfile", JSON.stringify(userData));

      toast({
        title: "Account created!",
        description: "You can now log in with your credentials.",
      });

      navigate("/auth");
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

  const handleGoogleSignup = async () => {
    try {
      // TODO: Implement Google OAuth signup
      toast({
        title: "Coming Soon",
        description:
          "Google signup will be available soon. Please use email registration.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-glow p-4">
      <Card className="w-full max-w-md shadow-glow">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">TaxSurfer</span>
          </div>
          <CardTitle className="text-2xl">
            {step === "details" ? "Create an account" : "Verify your phone"}
          </CardTitle>
          <CardDescription>
            {step === "details"
              ? "Enter your details to create your account"
              : "Enter the OTP sent to your phone"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "details" ? (
            <>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="mobile">
                    Mobile Number (with country code)
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="+1234567890"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>

              <div className="relative my-4">
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
                onClick={handleGoogleSignup}
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
                Sign up with Google
              </Button>

              <div className="mt-4 text-center text-sm">
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="text-primary hover:underline transition-smooth"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Enter the 6-digit code sent to {mobileNumber}
                </p>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("details")}
              >
                Back to details
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
