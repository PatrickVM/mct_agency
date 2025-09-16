"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

export default function InviteAcceptPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const supabase = createClient();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error("Invalid invite link");
        router.push("/");
        return;
      }

      try {
        const response = await fetch(`/api/invites/${token}/validate`);
        const data = await response.json();

        if (data.valid) {
          setInviteValid(true);
          setInviteEmail(data.email);
          setEmail(data.email);
        } else {
          toast.error(data.error || "Invalid invite token");
          router.push("/");
        }
      } catch (error) {
        toast.error("Error validating invite");
        router.push("/");
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token, router]);

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, consume the invite token
      const consumeResponse = await fetch(`/api/invites/${token}/consume`, {
        method: "POST",
      });

      if (!consumeResponse.ok) {
        const error = await consumeResponse.json();
        toast.error(error.message || "Failed to accept invite");
        return;
      }

      // Then send magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email for the magic link to complete setup!");
        router.push("/auth/signin");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Validating invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!inviteValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Invalid or expired invitation</p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <CardTitle className="text-2xl">Welcome to Murray Creative!</CardTitle>
            <CardDescription>
              You&apos;ve been invited to join our talent community.
              Let&apos;s get you set up with a magic link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAcceptInvite} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-center"
                />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  Use the email address you were invited with: {inviteEmail}
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email || email !== inviteEmail}
              >
                {loading ? "Processing..." : "Accept Invitation"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                By joining, you agree to create your talent profile and
                connect with the Murray Creative community.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}