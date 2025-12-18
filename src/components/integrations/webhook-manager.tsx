"use client";

import { useState } from "react";
import { createWebhook, deleteWebhook, WebhookConfig } from "@/app/actions/webhooks";
import { WEBHOOK_EVENTS } from "@/lib/constants";
import { Loader2, Plus, Trash2, Power, PowerOff, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export function WebhookManager({ initialWebhooks }: { initialWebhooks: WebhookConfig[] }) {
    const [isCreating, setIsCreating] = useState(false);
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleCreate() {
        if (!url || selectedEvents.length === 0) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("url", url);
            formData.append("description", description);
            selectedEvents.forEach(e => formData.append("events", e));

            const result = await createWebhook(formData);
            if (result.success) {
                setIsCreating(false);
                setUrl("");
                setDescription("");
                setSelectedEvents([]);
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Remove this webhook?")) return;
        await deleteWebhook(id);
        router.refresh();
    }

    function toggleEvent(event: string) {
        if (selectedEvents.includes(event)) {
            setSelectedEvents(selectedEvents.filter(e => e !== event));
        } else {
            setSelectedEvents([...selectedEvents, event]);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Registered Webhooks</h2>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" /> Add Endpoint
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                    <h3 className="font-medium">New Webhook Endpoint</h3>
                    <div>
                        <label className="block text-sm font-medium mb-1">Payload URL</label>
                        <input
                            type="url"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://api.example.com/webhooks"
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="e.g. Sync user data to CRM"
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Events to Subscribe</label>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {WEBHOOK_EVENTS.map(event => (
                                <label key={event} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={selectedEvents.includes(event)}
                                        onChange={() => toggleEvent(event)}
                                        className="rounded border-gray-300"
                                    />
                                    {event}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="px-3 py-2 text-sm hover:underline"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!url || selectedEvents.length === 0 || loading}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                            Register
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {initialWebhooks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg bg-card">
                        No webhooks configured.
                    </div>
                ) : (
                    initialWebhooks.map(hook => (
                        <div key={hook.id} className="p-4 border rounded-lg bg-card shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${hook.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Globe className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold break-all">{hook.url}</h3>
                                            {!hook.isActive && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">Disabled</span>}
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {hook.events.map(e => (
                                                <span key={e} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded border border-blue-100">
                                                    {e}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDelete(hook.id)}
                                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
