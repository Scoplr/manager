"use client";

import { addDocumentTag, removeDocumentTag } from "@/app/actions/documents";
import { createTag } from "@/app/actions/tags";
import { useState } from "react";
import { X, Tag as TagIcon } from "lucide-react";

interface Tag {
    id: string;
    name: string;
    color: string | null;
}

interface DocTagsProps {
    documentId: string;
    currentTags: { tagId: string; tagName: string; tagColor: string | null }[];
    availableTags: Tag[];
}

export function DocumentTagsControl({ documentId, currentTags, availableTags }: DocTagsProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newTagName, setNewTagName] = useState("");

    const unassignedTags = availableTags.filter(
        t => !currentTags.some(ct => ct.tagId === t.id)
    );

    const handleAddExisting = async (tagId: string) => {
        await addDocumentTag(documentId, tagId);
        setIsAdding(false);
    };

    const handleCreateNew = async () => {
        if (!newTagName.trim()) return;
        const res = await createTag(newTagName.trim());
        if (res.tag) {
            await addDocumentTag(documentId, res.tag.id);
            setIsAdding(false);
            setNewTagName("");
        }
    };

    return (
        <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <TagIcon className="w-4 h-4" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
                {currentTags.map(tag => (
                    <span key={tag.tagId} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {tag.tagName}
                        <button onClick={() => removeDocumentTag(documentId, tag.tagId)} className="hover:text-destructive ml-1">
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-xs text-muted-foreground hover:text-primary border border-dashed rounded px-2 py-0.5"
                >
                    + Add Tag
                </button>
            </div>

            {isAdding && (
                <div className="bg-card p-2 border rounded-md max-w-xs space-y-2">
                    {unassignedTags.length > 0 && (
                        <select
                            className="text-xs p-1 rounded border w-full"
                            onChange={(e) => handleAddExisting(e.target.value)}
                            defaultValue=""
                        >
                            <option value="" disabled>Select existing...</option>
                            {unassignedTags.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    )}
                    <div className="flex gap-1">
                        <input
                            placeholder="New tag..."
                            className="text-xs p-1 border rounded flex-1"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateNew()}
                        />
                        <button onClick={handleCreateNew} className="text-xs bg-primary text-primary-foreground px-2 rounded">Add</button>
                    </div>
                </div>
            )}
        </div>
    );
}
