import { requireAuth } from "@/lib/auth";
import OnboardingForm from "@/app/onboarding/onboarding-form";
import { redirect } from "next/navigation";

export default async function EditProfilePage() {
  const user = await requireAuth();

  if (!user.profile) {
    redirect("/onboarding");
  }

  const profile = user.profile;
  const socialLinks: Record<string, string> | null = profile.socialLinks
    ? (profile.socialLinks as unknown as Record<string, string>)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-sm text-muted-foreground">
            Update your public profile information
          </p>
        </div>
        <OnboardingForm
          user={user}
          mode="edit"
          initialProfile={{
            displayName: profile.displayName,
            bio: profile.bio,
            hobbies: profile.hobbies || [],
            socialLinks,
            avatarUrl: profile.avatarUrl || null,
          }}
        />
      </div>
    </div>
  );
}
