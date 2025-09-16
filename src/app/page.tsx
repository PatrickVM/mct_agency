import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Sparkles, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Murray Creative
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Where talent meets opportunity. Discover amazing artists and connect
            with creative professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/gallery">Explore Talent Gallery</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
            >
              <Link href="/auth/signin">Join Our Community</Link>
            </Button>
          </div>
        </header>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Discover Talent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Browse our curated gallery of talented individuals across
                various creative fields.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-accent/50 transition-colors">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-accent/10 rounded-full w-fit">
                <Sparkles className="h-8 w-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-xl">Showcase Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Create your profile and showcase your unique talents to connect
                with the right opportunities.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-secondary/50 transition-colors">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-secondary/10 rounded-full w-fit">
                <Heart className="h-8 w-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-xl">Build Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Foster meaningful relationships between talented individuals and
                industry professionals.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-card p-12 rounded-2xl border shadow-sm">
          <h2 className="text-3xl font-bold mb-4 text-card-foreground">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of creative professionals and discover your next
            opportunity or find the perfect talent for your project.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/gallery">View Public Gallery</Link>
          </Button>
        </section>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2024 Murray Creative. Connecting talent with opportunity.
          </p>
        </footer>
      </div>
    </div>
  );
}