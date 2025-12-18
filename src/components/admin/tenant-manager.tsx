"use client";

import { useState } from "react";
import { createTenantAction, provisionUserAction, getTenantUsers, updateUserRole, toggleUserStatus, bulkProvisionUsers } from "@/app/actions/admin";
import { Loader2, Plus, Building2, Users, Search, ChevronDown, ChevronUp, UserPlus, Shield, UserCog, UserX, UserCheck, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export function TenantManager({ tenants }: { tenants: any[] }) {
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Expanded Org State
    const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
    const [orgUsers, setOrgUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Provision User State
    const [isProvisioningUser, setIsProvisioningUser] = useState(false);
    const [isBulkInviting, setIsBulkInviting] = useState(false);
    const [provisionLoading, setProvisionLoading] = useState(false);

    // Bulk Input
    const [bulkInput, setBulkInput] = useState("");

    const router = useRouter();

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.includes(searchTerm)
    );

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const result = await createTenantAction(formData);
            if (result.success) {
                setIsCreating(false);
                router.refresh();
            } else if (result.error) {
                alert(result.error);
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleProvisionUser(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!expandedOrg) return;

        setProvisionLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append("orgId", expandedOrg);

        try {
            const result = await provisionUserAction(formData);
            if (result.success) {
                setIsProvisioningUser(false);
                refreshUsers(expandedOrg);
            } else if (result.error) {
                alert(result.error);
            }
        } finally {
            setProvisionLoading(false);
        }
    }

    async function handleBulkInvite() {
        if (!expandedOrg || !bulkInput.trim()) return;
        setProvisionLoading(true);

        const lines = bulkInput.trim().split('\n');
        const usersList = lines.map(line => {
            // Format: email, name, role
            const [email, name, role] = line.split(',').map(s => s.trim());
            return { email, name: name || email.split('@')[0], role: role || 'member' };
        });

        const result = await bulkProvisionUsers(expandedOrg, usersList);
        if (result.success) {
            setIsBulkInviting(false);
            setBulkInput("");
            if (result.results) {
                const failed = result.results.filter((r: any) => r.status === 'failed');
                if (failed.length > 0) {
                    alert(`Some users failed to add:\n${failed.map((f: any) => `${f.email}: ${f.error}`).join('\n')}`);
                }
            }
            refreshUsers(expandedOrg);
        } else {
            alert(result.error);
        }
        setProvisionLoading(false);
    }

    async function refreshUsers(orgId: string) {
        setLoadingUsers(true);
        const users = await getTenantUsers(orgId);
        setOrgUsers(users);
        setLoadingUsers(false);
        router.refresh();
    }

    async function toggleExpand(orgId: string) {
        if (expandedOrg === orgId) {
            setExpandedOrg(null);
            setIsProvisioningUser(false);
            setIsBulkInviting(false);
        } else {
            setExpandedOrg(orgId);
            setIsProvisioningUser(false);
            setIsBulkInviting(false);
            refreshUsers(orgId);
        }
    }

    async function handleRoleChange(userId: string, newRole: string) {
        await updateUserRole(userId, newRole);
        if (expandedOrg) refreshUsers(expandedOrg);
    }

    async function handleStatusToggle(userId: string, currentStatus: string) {
        const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
        await toggleUserStatus(userId, newStatus);
        if (expandedOrg) refreshUsers(expandedOrg);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">Organizations</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tenants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border rounded-md text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 whitespace-nowrap"
                    >
                        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Tenant</span>
                    </button>
                </div>
            </div>

            {/* Create Tenant Modal */}
            {isCreating && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-medium mb-4">Provision New Organization</h3>
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                        {/* ... Existing Inputs ... */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Organization Name</label>
                            <input name="name" required className="w-full p-2 border rounded-md" placeholder="Acme Corp" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Initial Password</label>
                            <input name="password" type="text" defaultValue="password123" className="w-full p-2 border rounded-md" placeholder="password123" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Admin Name</label>
                                <input name="adminName" required className="w-full p-2 border rounded-md" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Admin Email</label>
                                <input name="adminEmail" type="email" required className="w-full p-2 border rounded-md" placeholder="john@acme.com" />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />} Provision
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {filteredTenants.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed text-gray-500">
                        No tenants found matching "{searchTerm}"
                    </div>
                )}

                {filteredTenants.map(t => (
                    <div key={t.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all">
                        {/* Card Header */}
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleExpand(t.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{t.name}</h3>
                                    <div className="text-sm text-gray-500 flex gap-3">
                                        <span>Created {new Date(t.createdAt).toLocaleDateString()}</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="font-mono text-xs text-gray-400">{t.id}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    {t.userCount} Users
                                </div>
                                {expandedOrg === t.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedOrg === t.id && (
                            <div className="border-t bg-gray-50/50 p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                                    <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Users</h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsBulkInviting(!isBulkInviting); setIsProvisioningUser(false); }}
                                            className="text-sm text-gray-600 font-medium hover:text-gray-900 flex items-center gap-1 border px-2 py-1 rounded bg-white"
                                        >
                                            <Upload className="h-3 w-3" /> Bulk Import
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsProvisioningUser(!isProvisioningUser); setIsBulkInviting(false); }}
                                            className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                                        >
                                            <UserPlus className="h-3 w-3" /> Add User
                                        </button>
                                    </div>
                                </div>

                                {/* Add User Form */}
                                {isProvisioningUser && (
                                    <div className="mb-6 p-4 bg-white border rounded-lg shadow-sm animate-in fade-in">
                                        <h5 className="font-medium text-sm mb-2">Add Single User</h5>
                                        <form onSubmit={handleProvisionUser} className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <input name="name" required placeholder="Full Name" className="p-2 border rounded text-sm" />
                                                <input name="email" required placeholder="Email Address" type="email" className="p-2 border rounded text-sm" />
                                                <input name="password" placeholder="Password (Empty to Invite)" className="p-2 border rounded text-sm" />
                                                <select name="role" className="p-2 border rounded text-sm">
                                                    <option value="member">Member</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button type="button" onClick={() => setIsProvisioningUser(false)} className="px-3 py-1 text-sm">Cancel</button>
                                                <button type="submit" disabled={provisionLoading} className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50">
                                                    {provisionLoading ? "Adding..." : "Add User"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Bulk Invite Form */}
                                {isBulkInviting && (
                                    <div className="mb-6 p-4 bg-white border rounded-lg shadow-sm animate-in fade-in">
                                        <h5 className="font-medium text-sm mb-2">Bulk Import Users</h5>
                                        <p className="text-xs text-muted-foreground mb-2">Format: email, name, role (one per line)</p>
                                        <textarea
                                            value={bulkInput}
                                            onChange={(e) => setBulkInput(e.target.value)}
                                            rows={5}
                                            className="w-full p-2 border rounded text-sm font-mono mb-2"
                                            placeholder={`alice@example.com, Alice Smith, manager\nbob@example.com, Bob Jones, member`}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button type="button" onClick={() => setIsBulkInviting(false)} className="px-3 py-1 text-sm">Cancel</button>
                                            <button
                                                onClick={handleBulkInvite}
                                                disabled={provisionLoading}
                                                className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {provisionLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                                                Import Users
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Users List */}
                                {loadingUsers ? (
                                    <div className="py-8 text-center text-gray-500 flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Loading users...
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-md border text-sm overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-4 py-2 font-medium">Name</th>
                                                    <th className="px-4 py-2 font-medium">Email</th>
                                                    <th className="px-4 py-2 font-medium">Role</th>
                                                    <th className="px-4 py-2 font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {orgUsers.length === 0 ? (
                                                    <tr><td colSpan={4} className="p-4 text-center text-gray-500">No users found.</td></tr>
                                                ) : orgUsers.map(u => (
                                                    <tr key={u.id} className={u.status === 'disabled' ? 'bg-gray-50 opacity-60' : ''}>
                                                        <td className="px-4 py-2">
                                                            <div className="font-medium">{u.name || "N/A"}</div>
                                                            {u.status === 'disabled' && <span className="text-xs text-red-500 font-bold">DISABLED</span>}
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-600">{u.email}</td>
                                                        <td className="px-4 py-2">
                                                            <select
                                                                value={u.role}
                                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                                className="border-none bg-transparent hover:bg-gray-100 rounded px-2 py-1 cursor-pointer focus:ring-2 focus:ring-blue-500"
                                                            >
                                                                <option value="member">Member</option>
                                                                <option value="manager">Manager</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <button
                                                                onClick={() => handleStatusToggle(u.id, u.status || 'active')}
                                                                className={`p-1 rounded hover:bg-gray-200 ${u.status === 'disabled' ? 'text-red-600' : 'text-green-600'}`}
                                                                title={u.status === 'disabled' ? 'Enable User' : 'Disable User'}
                                                            >
                                                                {u.status === 'disabled' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
