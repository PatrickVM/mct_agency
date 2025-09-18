import { prisma } from "@/lib/prisma";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Suspense } from "react";
import { JsonValue } from "@prisma/client/runtime/library";

interface PublicProfile {
  id: string;
  displayName: string;
  bio: string | null;
  hobbies: string[];
  avatarUrl: string | null;
  socialLinks: JsonValue;
  users: {
    email: string;
  };
}

async function getPublicProfiles(searchTerm?: string) {
  const profiles = await prisma.profiles.findMany({
    where: {
      isPublic: true,
      ...(searchTerm && {
        OR: [
          { displayName: { contains: searchTerm, mode: "insensitive" } },
          { bio: { contains: searchTerm, mode: "insensitive" } },
          { hobbies: { hasSome: [searchTerm] } },
        ],
      }),
    },
    include: {
      users: {
        select: { email: true },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return profiles;
}

function ProfileCard({ profile }: { profile: PublicProfile }) {
  const initials = profile.displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={profile.avatarUrl || undefined} alt={profile.displayName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold text-card-foreground">
              {profile.displayName}
            </h3>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {profile.bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {profile.bio}
          </p>
        )}
        {profile.hobbies && profile.hobbies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.hobbies.slice(0, 3).map((hobby: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {hobby}
              </Badge>
            ))}
            {profile.hobbies.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{profile.hobbies.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TalentGrid({ profiles }: { profiles: PublicProfile[] }) {
  if (profiles.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          No talent profiles found in our directory yet.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Check back soon for amazing talent!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
}

export default async function TalentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const profiles = await getPublicProfiles(search);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-block text-2xl font-bold text-primary hover:text-primary/80 transition-colors mb-4"
          >
            Murray Creative
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Talent Directory
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover amazing talent from our community of creative professionals.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto">
            <form method="GET">
              <Input
                name="search"
                placeholder="Search by name, bio, or skills..."
                defaultValue={search}
                className="text-center"
              />
            </form>
          </div>
        </div>

        {/* Profiles Grid */}
        <Suspense
          fallback={
            <div className="text-center py-16">
              <p className="text-muted-foreground">Loading talent profiles...</p>
            </div>
          }
        >
          <TalentGrid profiles={profiles} />
        </Suspense>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Interested in joining our talent community?
          </p>
          <Link
            href="/auth/signin"
            className="text-primary hover:text-primary/80 underline"
          >
            Get started today
          </Link>
        </footer>
      </div>
    </div>
  );
}