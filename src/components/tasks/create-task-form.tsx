"use client";

import { createTask } from "@/app/actions/tasks";
import { useRef, useState } from "react";
import { X } from "lucide-react";

interface Tag {
    id: string;
    name: string;
    color: string | null;
}

export function CreateTaskForm({ availableTags = [] }: { availableTags?: Tag[] }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    async function action(formData: FormData) {
        await createTask(formData);
        formRef.current?.reset();
        setSelectedTags([]);
    }

    const toggleTag = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(selectedTags.filter(id => id !== tagId));
        } else {
            setSelectedTags([...selectedTags, tagId]);
        }
    };

    return (
        <form ref={formRef} action={action} className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
            <input type="hidden" name="tags" value={JSON.stringify(selectedTags)} />

            <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground">
                    New Task
                </label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    className="mt-1 block w-full rounded-md border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border"
                    placeholder="What needs to be done?"
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground">
                    Description
                </label>
                <textarea
                    name="description"
                    id="description"
                    rows={2}
                    className="mt-1 block w-full rounded-md border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border"
                    placeholder="Optional details..."
                />
            </div>
            <div>
                <label htmlFor="priority" className="block text-sm font-medium text-foreground">
                    Priority
                </label>
                <select
                    name="priority"
                    id="priority"
                    defaultValue="medium"
                    className="mt-1 block w-full rounded-md border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border"
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>

            {/* Tag Selection */}
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Tags
                </label>
                <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => {
                        const isSelected = selectedTags.includes(tag.id);
                        return (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => toggleTag(tag.id)}
                                className={`text-xs px-2 py-1 rounded-full border transition-colors ${isSelected
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-secondary text-secondary-foreground border-transparent hover:border-border"
                                    }`}
                            >
                                {tag.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    className="inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    Add Task
                </button>
            </div>
        </form>
    );
}
