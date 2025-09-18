"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  LogOut,
  Mail,
  NotebookPen,
  Settings,
  Users,
  Camera,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import InviteManager from "./invite-manager";
import NotesManager from "./notes-manager";
import TalentManager from "./talent-manager";
import PhotoManager from "./photo-manager";

interface AdminStats {
  totalUsers: number;
  totalProfiles: number;
  publicProfiles: number;
  pendingInvites: number;
  totalNotes: number;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const fetchAdminData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();

      if (response.ok) {
        setAdmin(data.admin);
        setStats(data.stats);
      } else {
        router.push('/auth/signin');
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      router.push('/auth/signin');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10 flex items-center justify-center">
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!admin || !stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xl sm:text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Murray Creative
            </Link>
            <Badge variant="default" className="hidden sm:inline-flex">Admin Dashboard</Badge>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/gallery">
                <ExternalLink className="h-4 w-4 mr-2" />
                Gallery
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app">
                <Settings className="h-4 w-4 mr-2" />
                My Profile
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mb-6 p-4 bg-card border rounded-lg shadow-lg">
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild className="justify-start">
                <Link href="/gallery" onClick={() => setMobileMenuOpen(false)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Gallery
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="justify-start">
                <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
                  <Settings className="h-4 w-4 mr-2" />
                  My Profile
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-card p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-card-foreground">
              {stats.totalUsers}
            </div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div className="bg-card p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-card-foreground">
              {stats.totalProfiles}
            </div>
            <div className="text-sm text-muted-foreground">Profiles</div>
          </div>
          <div className="bg-card p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.publicProfiles}
            </div>
            <div className="text-sm text-muted-foreground">Public</div>
          </div>
          <div className="bg-card p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-accent-foreground">
              {stats.pendingInvites}
            </div>
            <div className="text-sm text-muted-foreground">Pending Invites</div>
          </div>
          <div className="bg-card p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-card-foreground">
              {stats.totalNotes}
            </div>
            <div className="text-sm text-muted-foreground">Notes</div>
          </div>
        </div>

        <Tabs defaultValue="invites" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="invites" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Invites
            </TabsTrigger>
            <TabsTrigger value="talent" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Talent
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <NotebookPen className="h-4 w-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invites">
            <InviteManager adminId={admin.id} />
          </TabsContent>

          <TabsContent value="talent">
            <TalentManager />
          </TabsContent>

          <TabsContent value="photos">
            <PhotoManager />
          </TabsContent>

          <TabsContent value="notes">
            <NotesManager adminId={admin.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
