"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, Lock } from "lucide-react";

function SetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "okay" | "strong">("weak");

  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstTime = searchParams.get("firstTime") === "true";

  useEffect(() => {
    // Calculate password strength
    if (password.length === 0) {
      setPasswordStrength("weak");
    } else if (password.length < 8) {
      setPasswordStrength("weak");
    } else if (password.length < 12) {
      setPasswordStrength("okay");
    } else {
      setPasswordStrength("strong");
    }
  }, [password]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password set successfully!");
        router.push("/app");
      } else {
        toast.error(data.message || "Failed to set password");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "weak":
        return "bg-red-500";
      case "okay":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
    }
  };

  const getStrengthWidth = () => {
    switch (passwordStrength) {
      case "weak":
        return "w-1/3";
      case "okay":
        return "w-2/3";
      case "strong":
        return "w-full";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Murray Creative
          </Link>
        </div>

        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {isFirstTime ? "Set Your Password" : "Update Password"}
            </CardTitle>
            <CardDescription>
              {isFirstTime
                ? "Create a password to sign in faster next time"
                : "Choose a strong password to secure your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetPassword} className="space-y-4">
              {/* Password Input */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 8 characters
                </p>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}
                        />
                      </div>
                      <span className="text-xs font-medium capitalize text-muted-foreground">
                        {passwordStrength}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading ||
                  !password ||
                  !confirmPassword ||
                  password !== confirmPassword ||
                  password.length < 8
                }
              >
                {loading ? "Setting Password..." : "Set Password"}
              </Button>
            </form>

            {isFirstTime && (
              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  You can use this password to sign in quickly, or continue using magic links sent to your email.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  );
}
