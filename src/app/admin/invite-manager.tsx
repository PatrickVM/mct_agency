"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";
import {
  Mail,
  QrCode,
  Copy,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface InviteToken {
  id: string;
  email: string;
  token: string;
  expiresAt: string;
  consumedAt: string | null;
  createdAt: string;
}

export default function InviteManager({ adminId }: { adminId: string }) {
  const [invites, setInvites] = useState<InviteToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [showQR, setShowQR] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const response = await fetch("/api/admin/invites");
      const data = await response.json();
      setInvites(data.invites || []);
    } catch (error) {
      toast.error("Failed to load invites");
    } finally {
      setLoading(false);
    }
  };

  const createInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Invite sent successfully!");
        setNewEmail("");
        fetchInvites();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send invite");
      }
    } catch (error) {
      toast.error("Failed to send invite");
    } finally {
      setCreating(false);
    }
  };

  const generateQR = async () => {
    setCreating(true);

    try {
      const response = await fetch("/api/admin/invites/qr", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setShowQR(data.token);
        setQrDataUrl(data.qrDataUrl);
        fetchInvites();
        toast.success("QR invite created!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to generate QR invite");
      }
    } catch (error) {
      toast.error("Failed to generate QR invite");
    } finally {
      setCreating(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/invite/accept?token=${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Invite link copied to clipboard!");
  };

  const getStatusBadge = (invite: InviteToken) => {
    if (invite.consumedAt) {
      return (
        <Badge variant="default">
          <CheckCircle className="h-3 w-3 mr-1" />
          Used
        </Badge>
      );
    }
    if (new Date(invite.expiresAt) < new Date()) {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading invites...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create Invite Section */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Invite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <form
              onSubmit={createInvite}
              className="flex flex-col gap-2 md:flex-row md:items-center"
            >
              <Input
                type="email"
                placeholder="email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full"
              />
              <Button
                type="submit"
                disabled={creating || !newEmail}
                className="w-full md:w-auto"
              >
                <Mail className="h-4 w-4 mr-2" />
                {creating ? "Sending..." : "Send Invite"}
              </Button>
            </form>
            <Button
              onClick={generateQR}
              disabled={creating}
              variant="outline"
              className="w-full md:w-auto"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR
            </Button>
          </div>
          {showQR && (
            <div className="space-y-4 rounded-lg border p-4 md:hidden">
              <div className="text-center space-y-3">
                <p className="font-medium">QR Code Invite</p>
                <div className="flex justify-center">
                  <Image
                    src={qrDataUrl}
                    alt="QR Code"
                    className="h-auto w-full max-w-[200px] rounded-lg border"
                    width={200}
                    height={200}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Scan this QR code to accept the invitation
                </p>
              </div>
              <Button onClick={() => copyInviteLink(showQR)} className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copy Invite Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invites List */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Recent Invites</CardTitle>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No invites created yet
            </p>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-col gap-3 p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium break-words flex-1 min-w-0">
                      {invite.email || "QR Code Invite"}
                    </span>
                    {getStatusBadge(invite)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      Created: {new Date(invite.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                    </div>
                    {invite.consumedAt && (
                      <div>
                        Used: {new Date(invite.consumedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyInviteLink(invite.token)}
                    className="w-full"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Link
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Dialog */}
      {showQR && (
        <div className="hidden md:block">
          <Dialog open={!!showQR} onOpenChange={() => setShowQR(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>QR Code Invite</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <Image
                    src={qrDataUrl}
                    alt="QR Code"
                    className="rounded-lg border"
                    width={200}
                    height={200}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Scan this QR code to accept the invitation
                </p>
                <Button
                  onClick={() => copyInviteLink(showQR)}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Invite Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
