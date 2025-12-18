"use client";

import { useState } from "react";
import { createApprovalChain, deleteApprovalChain, ApprovalChain } from "@/app/actions/approval-chains";
import { Loader2, Plus, Trash2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function ApprovalChainManager({ chains }: { chains: ApprovalChain[] }) {
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("expense");
    const [minAmount, setMinAmount] = useState("");
    const [steps, setSteps] = useState([{ role: "manager" }]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    function addStep() {
        setSteps([...steps, { role: "finance_admin" }]);
    }

    function removeStep(index: number) {
        setSteps(steps.filter((_, i) => i !== index));
    }

    function updateStep(index: number, role: string) {
        const newSteps = [...steps];
        newSteps[index] = { role };
        setSteps(newSteps);
    }

    async function handleCreate() {
        if (!name) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("type", type);

            const formattedSteps = steps.map((s, i) => ({
                order: i,
                approverRole: s.role,
                requiredApprovals: 1
            }));
            formData.append("steps", JSON.stringify(formattedSteps));

            const conditions: any = {};
            if (minAmount) conditions.minAmount = Number(minAmount);
            formData.append("conditions", JSON.stringify(conditions));

            const result = await createApprovalChain(formData);
            if (result.success) {
                setIsCreating(false);
                setName("");
                setMinAmount("");
                setSteps([{ role: "manager" }]);
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this approval chain?")) return;
        await deleteApprovalChain(id);
        router.refresh();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Workflow Chains</h2>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                    >
                        <Plus className="h-4 w-4" /> New Chain
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                    <h3 className="font-medium">Define Workflow</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Chain Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. High Value Expenses"
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="expense">Expense</option>
                                <option value="leave">Leave Request</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Min Value Threshold (Optional)</label>
                        <input
                            type="number"
                            value={minAmount}
                            onChange={e => setMinAmount(e.target.value)}
                            placeholder="e.g. 1000"
                            className="w-full md:w-1/2 p-2 border rounded-md"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {type === 'expense' ? 'Amount in currency' : 'Days duration'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Approval Steps</label>
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-mono">
                                    Step {index + 1}
                                </span>
                                <select
                                    value={step.role}
                                    onChange={e => updateStep(index, e.target.value)}
                                    className="p-2 border rounded-md text-sm flex-1"
                                >
                                    <option value="manager">Direct Manager</option>
                                    <option value="hr">HR Admin</option>
                                    <option value="finance_admin">Finance Admin</option>
                                    <option value="admin">Super Admin</option>
                                </select>
                                <button
                                    onClick={() => removeStep(index)}
                                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                                    disabled={steps.length === 1}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={addStep}
                            className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mt-2"
                        >
                            <Plus className="h-3 w-3" /> Add Step
                        </button>
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
                            disabled={!name || loading}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                            Create Chain
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {chains.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg bg-card">
                        No approval chains defined.
                    </div>
                ) : (
                    chains.map(chain => (
                        <div key={chain.id} className="p-4 border rounded-lg bg-card shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold">{chain.name}</h3>
                                    <div className="text-sm text-muted-foreground flex gap-3 mt-1">
                                        <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">
                                            {chain.type}
                                        </span>
                                        {chain.conditions?.minAmount && (
                                            <span className="text-xs">
                                                Over {chain.conditions.minAmount}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                                        {chain.steps.sort((a, b) => a.order - b.order).map((step, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                {i > 0 && <ArrowRight className="h-3 w-3 text-gray-400" />}
                                                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-100 font-medium">
                                                    {step.approverRole?.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(chain.id)}
                                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
