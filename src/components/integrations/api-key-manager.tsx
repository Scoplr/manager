"use client";

import { useState } from "react";
import { createApiKey, deleteApiKey, ApiKey } from "@/app/actions/api-keys";
import { API_SCOPES } from "@/lib/constants";
import { Loader2, Plus, Trash2, Copy, Check, Key } from "lucide-react";
import { useRouter } from "next/navigation";

export function ApiKeyManager({ initialKeys }: { initialKeys: ApiKey[] }) {
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState("");
    const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
    const [newKey, setNewKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    async function handleCreate() {
        if (!name) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            if (selectedScopes.length > 0) {
                // Assuming createApiKey expects scopes as individual entries or comma separated?
                // Checking action logic: scopes: formData.getAll("scopes") as string[]
                selectedScopes.forEach(scope => formData.append("scopes", scope));
            }

            const result = await createApiKey(formData);
            if (result.success && result.rawKey) {
                setNewKey(result.rawKey);
                setIsCreating(false);
                setName("");
                setSelectedScopes([]);
                router.refresh(); // Refresh list to show new masked key entry
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleRevoke(id: string) {
        if (!confirm("Are you sure you want to revoke this API key? This cannot be undone.")) return;
        await deleteApiKey(id);
        router.refresh();
    }

    function toggleScope(scope: string) {
        if (selectedScopes.includes(scope)) {
            setSelectedScopes(selectedScopes.filter(s => s !== scope));
        } else {
            setSelectedScopes([...selectedScopes, scope]);
        }
    }

    function copyToClipboard() {
        if (newKey) {
            navigator.clipboard.writeText(newKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <div className="space-y-6">
            {newKey && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-green-800 font-medium mb-2">API Key Created Successfully</h3>
                    <p className="text-green-700 text-sm mb-3">Copy this key now. You won't be able to see it again!</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-white border border-green-200 rounded font-mono text-sm break-all">
                            {newKey}
                        </code>
                        <button
                            onClick={copyToClipboard}
                            className="p-2 text-green-700 hover:bg-green-100 rounded"
                            title="Copy to clipboard"
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                    </div>
                    <button
                        onClick={() => setNewKey(null)}
                        className="mt-3 text-sm text-green-700 underline"
                    >
                        Done
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Active API Keys</h2>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" /> Generate New Key
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                    <h3 className="font-medium">New API Key</h3>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. CI/CD Pipeline"
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Scopes</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {API_SCOPES.map(scope => (
                                <label key={scope} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={selectedScopes.includes(scope)}
                                        onChange={() => toggleScope(scope)}
                                        className="rounded border-gray-300"
                                    />
                                    {scope}
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
                            disabled={!name || isLoading}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                            Generate
                        </button>
                    </div>
                </div>
            )}

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Prefix</th>
                            <th className="px-4 py-3 font-medium">Scopes</th>
                            <th className="px-4 py-3 font-medium">Last Used</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {initialKeys.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                    No API keys found.
                                </td>
                            </tr>
                        ) : (
                            initialKeys.map(key => (
                                <tr key={key.id} className="bg-card">
                                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                                        <Key className="h-4 w-4 text-muted-foreground" />
                                        {key.name}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">{key.keyPrefix}••••</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {key.scopes && key.scopes.length > 0 ? (
                                                key.scopes.slice(0, 3).map(s => (
                                                    <span key={s} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                                                        {s}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 italic">All scopes</span>
                                            )}
                                            {key.scopes && key.scopes.length > 3 && (
                                                <span className="text-xs text-muted-foreground">+{key.scopes.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleRevoke(key.id)}
                                            className="text-red-600 hover:text-red-800 p-1"
                                            title="Revoke Key"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
