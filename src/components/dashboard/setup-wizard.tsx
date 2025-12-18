"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrganizationAction } from "@/app/actions/settings"; // Need to ensure this exists or create
import { bulkProvisionUsers } from "@/app/actions/admin";
import { Loader2, ArrowRight, Check } from "lucide-react";

interface SetupWizardProps {
    open: boolean;
    orgId: string;
    orgName: string;
}

export function SetupWizard({ open, orgId, orgName }: SetupWizardProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [timezone, setTimezone] = useState("UTC");
    const [invites, setInvites] = useState("");
    const [isOpen, setIsOpen] = useState(open);
    const router = useRouter();

    async function handleStep1() {
        setLoading(true);
        // Save timezone
        // await updateOrganizationAction({ timezone });
        // Simulating for now or need to create the action
        setLoading(false);
        setStep(2);
    }

    async function handleStep2() {
        setLoading(true);
        // Parse invites
        const emails = invites.split(/[\n,]+/).map(e => e.trim()).filter(e => e.includes("@"));
        if (emails.length > 0) {
            const usersList = emails.map(email => ({ email, name: email.split("@")[0], role: "member" }));
            await bulkProvisionUsers(orgId, usersList);
        }
        setLoading(false);
        setStep(3);
    }

    function handleFinish() {
        setIsOpen(false);
        router.refresh();
    }

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Welcome to {orgName}!</DialogTitle>
                    <DialogDescription>
                        Let's get your workspace ready in less than a minute.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="font-medium">Step 1: Set your Timezone</h3>
                            <div className="space-y-2">
                                <Label>Timezone</Label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                >
                                    <option value="UTC">UTC (Universal)</option>
                                    <option value="America/New_York">New York (EST)</option>
                                    <option value="Europe/London">London (GMT)</option>
                                    <option value="Asia/Dubai">Dubai (GST)</option>
                                    {/* Add more as needed */}
                                </select>
                                <p className="text-xs text-gray-500">This affects task deadlines and leave calculations.</p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="font-medium">Step 2: Invite your Team</h3>
                            <div className="space-y-2">
                                <Label>Email Addresses (Comma separated)</Label>
                                <textarea
                                    className="w-full p-2 border rounded-md min-h-[100px]"
                                    placeholder="alice@example.com, bob@example.com"
                                    value={invites}
                                    onChange={(e) => setInvites(e.target.value)}
                                />
                                <p className="text-xs text-gray-500">We'll send them a Magic Link to join instantly.</p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-4 py-4">
                            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <Check className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-medium">All Set!</h3>
                            <p className="text-gray-500">Your workspace is ready. You can find more settings in the sidebar.</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 1 && (
                        <Button onClick={handleStep1} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Next"}
                        </Button>
                    )}
                    {step === 2 && (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep(3)}>Skip</Button>
                            <Button onClick={handleStep2} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Send Invites"}
                            </Button>
                        </div>
                    )}
                    {step === 3 && (
                        <Button onClick={handleFinish}>
                            Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
