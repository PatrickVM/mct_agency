import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // If user already has a profile, redirect to app
  if (user.profiles) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Welcome to Murray Creative!
            </h1>
            <p className="text-lg text-muted-foreground">
              Let&apos;s set up your talent profile to get started.
            </p>
          </div>

          {/* @ts-expect-error - Known type mismatch between Prisma JsonValue and expected interface */}
          <OnboardingForm user={user} />
        </div>
      </div>
    </div>
  );
}