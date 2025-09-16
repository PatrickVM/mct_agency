import { redirect } from "next/navigation";
import { requireAuth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  User,
  Settings,
  Eye,
  EyeOff,
  Edit,
  LogOut,
  ExternalLink,
  Mail,
  Calendar
} from "lucide-react";

export default async function UserDashboard() {
  const user = await requireAuth();

  if (!user.profile) {
    redirect("/onboarding");
  }

  const profile = user.profile;
  const initials = profile.displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  const socialLinks = profile.socialLinks as Record<string, string> || {};

  async function handleSignOut() {
    "use server";
    await signOut();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Murray Creative
            </Link>
            <Badge variant="outline">Dashboard</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/gallery">
                <ExternalLink className="h-4 w-4 mr-2" />
                Gallery
              </Link>
            </Button>
            <form action={handleSignOut}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-fit lg:grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="lg:col-span-2 border-2">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-4 border-primary/20">
                      <AvatarImage src={profile.avatarUrl || undefined} alt={profile.displayName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold text-card-foreground">
                        {profile.displayName}
                      </h2>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/app/edit">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.bio && (
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">Bio</h3>
                      <p className="text-card-foreground leading-relaxed">{profile.bio}</p>
                    </div>
                  )}

                  {profile.hobbies && profile.hobbies.length > 0 && (
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">
                        Skills & Hobbies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.hobbies.map((hobby: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {hobby}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(socialLinks).length > 0 && (
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">
                        Social Links
                      </h3>
                      <div className="space-y-2">
                        {socialLinks.website && (
                          <a
                            href={socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Website
                          </a>
                        )}
                        {socialLinks.instagram && (
                          <a
                            href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-3 w-3" />
                            @{socialLinks.instagram.replace('@', '')}
                          </a>
                        )}
                        {socialLinks.tiktok && (
                          <a
                            href={`https://tiktok.com/@${socialLinks.tiktok.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-3 w-3" />
                            @{socialLinks.tiktok.replace('@', '')}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Profile Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Public Visibility</span>
                    <Badge variant={profile.isPublic ? "default" : "secondary"}>
                      {profile.isPublic ? (
                        <Eye className="h-3 w-3 mr-1" />
                      ) : (
                        <EyeOff className="h-3 w-3 mr-1" />
                      )}
                      {profile.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                      Profile Status
                    </p>
                    <p className="text-sm text-card-foreground">
                      {profile.isPublic
                        ? "Your profile is visible in the public gallery"
                        : "Your profile is private and not visible in the gallery"}
                    </p>
                  </div>

                  <div className="pt-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      Last Updated
                    </p>
                    <p className="text-sm text-card-foreground">
                      {new Date(profile.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="max-w-2xl border-2">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Edit Profile</p>
                    <p className="text-sm text-muted-foreground">
                      Update your profile information and settings
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/app/edit">Edit Profile</Link>
                  </Button>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">Sign Out</p>
                      <p className="text-sm text-muted-foreground">
                        Sign out of your account
                      </p>
                    </div>
                    <form action={handleSignOut}>
                      <Button variant="outline" type="submit">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}