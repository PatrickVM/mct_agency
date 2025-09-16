"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Search, MessageCircle, Calendar, Trash2 } from "lucide-react";

interface Note {
  id: string;
  body: string;
  createdAt: string;
  talentUserId: string;
  talentUser?: {
    profile?: {
      displayName: string;
      avatarUrl: string | null;
    };
  };
}

interface TalentOption {
  id: string;
  email: string;
  profile?: {
    displayName: string;
    avatarUrl: string | null;
  };
}

export default function NotesManager({ adminId }: { adminId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [talentOptions, setTalentOptions] = useState<TalentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState("");
  const [newNoteBody, setNewNoteBody] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchNotes();
    fetchTalentOptions();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/admin/notes");
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const fetchTalentOptions = async () => {
    try {
      const response = await fetch("/api/admin/talent");
      const data = await response.json();
      setTalentOptions(data.profiles?.map((p: any) => ({
        id: p.user.id || p.userId,
        email: p.user.email,
        profile: p
      })) || []);
    } catch (error) {
      console.error("Failed to load talent options");
    }
  };

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          talentUserId: selectedTalent,
          body: newNoteBody,
        }),
      });

      if (response.ok) {
        toast.success("Note added successfully!");
        setNewNoteBody("");
        setSelectedTalent("");
        setShowAddNote(false);
        fetchNotes();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to add note");
      }
    } catch (error) {
      toast.error("Failed to add note");
    } finally {
      setCreating(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`/api/admin/notes/${noteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Note deleted successfully!");
        setNotes(notes.filter(n => n.id !== noteId));
      } else {
        toast.error("Failed to delete note");
      }
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const filteredNotes = notes.filter(note => {
    const talentName = note.talentUser?.profile?.displayName || "";
    return talentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           note.body.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return <div className="text-center py-8">Loading notes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Private Notes
            </CardTitle>
            <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Note</DialogTitle>
                </DialogHeader>
                <form onSubmit={createNote} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Select Talent
                    </label>
                    <select
                      value={selectedTalent}
                      onChange={(e) => setSelectedTalent(e.target.value)}
                      required
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="">Choose talent...</option>
                      {talentOptions.map((talent) => (
                        <option key={talent.id} value={talent.id}>
                          {talent.profile?.displayName || talent.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Note
                    </label>
                    <Textarea
                      value={newNoteBody}
                      onChange={(e) => setNewNoteBody(e.target.value)}
                      placeholder="Add your private note about this talent..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={creating} className="flex-1">
                      {creating ? "Adding..." : "Add Note"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddNote(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes by talent name or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <Card className="border-2">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "No notes match your search" : "No private notes found"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setShowAddNote(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Note
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => {
            const profile = note.talentUser?.profile;
            const initials = profile?.displayName
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase() || "?";

            return (
              <Card key={note.id} className="border-2">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/20 flex-shrink-0">
                      <AvatarImage src={profile?.avatarUrl || undefined} alt={profile?.displayName} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {profile?.displayName || "Unknown Talent"}
                        </h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNote(note.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <p className="text-card-foreground mb-3 whitespace-pre-wrap">
                        {note.body}
                      </p>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(note.createdAt).toLocaleDateString()} at{" "}
                        {new Date(note.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}