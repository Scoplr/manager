"use client";

import { useState } from "react";
import { createLeavePolicy } from "@/app/actions/config";
import { Loader2, Sparkles, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { leavePolicyPresets, type LeavePolicyPreset } from "@/lib/presets/leave-policies";

export function LeavePolicyForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const router = useRouter();

    // Form values (can be set by preset or manually)
    const [formValues, setFormValues] = useState({
        name: "",
        annualAllowance: 20,
        sickAllowance: 10,
        carryOverLimit: 5,
        minDaysNotice: 3,
        halfDayEnabled: true,
        requiresMedicalProof: false,
        isDefault: false,
    });

    function applyPreset(preset: LeavePolicyPreset) {
        setSelectedPreset(preset.id);
        setFormValues({
            name: preset.policy.name,
            annualAllowance: preset.policy.privilegeLeave,
            sickAllowance: preset.policy.sickLeave,
            carryOverLimit: preset.policy.maxCarryOver,
            minDaysNotice: 3,
            halfDayEnabled: preset.policy.halfDayEnabled,
            requiresMedicalProof: false,
            isDefault: false,
        });
        setShowAdvanced(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        await createLeavePolicy(formData);
        e.currentTarget.reset();
        setSelectedPreset(null);
        setIsLoading(false);
        router.refresh();
    }

    return (
        <div className="space-y-4">
            {/* Preset Selection */}
            <div className="space-y-2">
                <p className="text-sm font-medium">Quick Start with a Preset</p>
                <div className="grid grid-cols-2 gap-2">
                    {leavePolicyPresets.slice(0, 4).map((preset) => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className={`p-2 text-left rounded-lg border text-xs transition-all ${selectedPreset === preset.id
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "hover:border-primary/50"
                                }`}
                        >
                            <div className="flex items-center gap-1">
                                {preset.recommended && <Sparkles className="w-3 h-3 text-primary" />}
                                <span className="font-medium">{preset.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Policy Details</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label htmlFor="policy-name" className="block text-xs text-muted-foreground mb-1">Policy Name</label>
                    <input
                        id="policy-name"
                        name="name"
                        placeholder="Policy name..."
                        className="w-full border rounded-md p-2 bg-background text-sm"
                        required
                        value={formValues.name}
                        onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-muted-foreground">Annual Days</label>
                        <input
                            name="annualAllowance"
                            type="number"
                            value={formValues.annualAllowance}
                            onChange={(e) => setFormValues({ ...formValues, annualAllowance: parseInt(e.target.value) || 0 })}
                            className="w-full border rounded-md p-2 bg-background text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">Sick Days</label>
                        <input
                            name="sickAllowance"
                            type="number"
                            value={formValues.sickAllowance}
                            onChange={(e) => setFormValues({ ...formValues, sickAllowance: parseInt(e.target.value) || 0 })}
                            className="w-full border rounded-md p-2 bg-background text-sm"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-muted-foreground">Carry Over Limit</label>
                        <input
                            name="carryOverLimit"
                            type="number"
                            value={formValues.carryOverLimit}
                            onChange={(e) => setFormValues({ ...formValues, carryOverLimit: parseInt(e.target.value) || 0 })}
                            className="w-full border rounded-md p-2 bg-background text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">Min Notice (days)</label>
                        <input
                            name="minDaysNotice"
                            type="number"
                            value={formValues.minDaysNotice}
                            onChange={(e) => setFormValues({ ...formValues, minDaysNotice: parseInt(e.target.value) || 0 })}
                            className="w-full border rounded-md p-2 bg-background text-sm"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            name="halfDayEnabled"
                            value="true"
                            checked={formValues.halfDayEnabled}
                            onChange={(e) => setFormValues({ ...formValues, halfDayEnabled: e.target.checked })}
                            className="rounded"
                        />
                        Allow half-days
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            name="requiresMedicalProof"
                            value="true"
                            checked={formValues.requiresMedicalProof}
                            onChange={(e) => setFormValues({ ...formValues, requiresMedicalProof: e.target.checked })}
                            className="rounded"
                        />
                        Require medical proof for sick leave
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            name="isDefault"
                            value="true"
                            checked={formValues.isDefault}
                            onChange={(e) => setFormValues({ ...formValues, isDefault: e.target.checked })}
                            className="rounded"
                        />
                        Set as default policy
                    </label>
                </div>

                {/* Hidden inputs for non-advanced mode */}
                {!showAdvanced && (
                    <>
                        <input type="hidden" name="annualAllowance" value={formValues.annualAllowance} />
                        <input type="hidden" name="sickAllowance" value={formValues.sickAllowance} />
                        <input type="hidden" name="carryOverLimit" value={formValues.carryOverLimit} />
                        <input type="hidden" name="minDaysNotice" value={formValues.minDaysNotice} />
                        {formValues.halfDayEnabled && <input type="hidden" name="halfDayEnabled" value="true" />}
                    </>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !formValues.name}
                    className="w-full bg-primary text-primary-foreground py-2 rounded-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Policy
                </button>
            </form>
        </div>
    );
}
