"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  StickyNote, 
  Plus, 
  Edit3, 
  Trash2, 
  Save,
  X,
  Clock
} from "lucide-react";

interface Note {
  id: string;
  content: string;
  timestamp: number;
  created_at: string;
}

interface ChapterNotesSectionProps {
  chapterId: string;
  notes: Note[];
  onAddNote: (content: string, timestamp: number) => void;
  onUpdateNote: (noteId: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
}

const ChapterNotesSection = React.memo<ChapterNotesSectionProps>(({ 
  chapterId, 
  notes, 
  onAddNote, 
  onUpdateNote, 
  onDeleteNote 
}) => {
  const [isAddingNote, setIsAddingNote] = React.useState(false);
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = React.useState("");
  const [newNoteTimestamp, setNewNoteTimestamp] = React.useState(0);
  const [editContent, setEditContent] = React.useState("");

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      onAddNote(newNoteContent.trim(), newNoteTimestamp);
      setNewNoteContent("");
      setNewNoteTimestamp(0);
      setIsAddingNote(false);
    }
  };

  const handleEditNote = (noteId: string, content: string) => {
    setEditingNoteId(noteId);
    setEditContent(content);
  };

  const handleSaveEdit = (noteId: string) => {
    if (editContent.trim()) {
      onUpdateNote(noteId, editContent.trim());
      setEditingNoteId(null);
      setEditContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent("");
  };

  const handleCancelAdd = () => {
    setIsAddingNote(false);
    setNewNoteContent("");
    setNewNoteTimestamp(0);
  };

  return (
    <div>
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <StickyNote className="w-6 h-6 text-primary" />
              Chapter Notes
            </CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {notes.length} notes
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Add Note Button */}
          {!isAddingNote && (
            <Button
              onClick={() => setIsAddingNote(true)}
              variant="outline"
              className="w-full border-dashed border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          )}

          {/* Add Note Form */}
          {isAddingNote && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Timestamp (seconds)"
                  value={newNoteTimestamp}
                  onChange={(e) => setNewNoteTimestamp(Number(e.target.value))}
                  className="w-32"
                  min="0"
                />
                <span className="text-sm text-muted-foreground">
                  {formatTime(newNoteTimestamp)}
                </span>
              </div>
              
              <Textarea
                placeholder="Write your note here..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="min-h-[100px] resize-none"
                autoFocus
              />
              
              <div className="flex items-center gap-2">
                <Button onClick={handleAddNote} size="sm" className="bg-primary hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Save Note
                </Button>
                <Button onClick={handleCancelAdd} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Notes List */}
          <div className="space-y-3">
            {notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No notes yet</p>
                <p className="text-xs">Add notes to remember important points from this chapter</p>
              </div>
            ) : (
              notes
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((note, index) => (
                  <div
                    key={note.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    {/* Note Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {formatTime(note.timestamp)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(note.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNote(note.id, note.content)}
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteNote(note.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Note Content */}
                    {editingNoteId === note.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[80px] resize-none"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={() => handleSaveEdit(note.id)} 
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                          <Button onClick={handleCancelEdit} variant="outline" size="sm">
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    )}
                  </div>
                ))
            )}
          </div>

          {/* Notes Tips */}
          {notes.length > 0 && (
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Click on a timestamp to jump to that point in the video, 
                or use the edit button to modify your notes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

ChapterNotesSection.displayName = "ChapterNotesSection";

export default ChapterNotesSection;
