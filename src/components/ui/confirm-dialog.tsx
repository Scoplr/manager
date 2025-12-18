"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    confirmVariant?: "default" | "destructive";
    isLoading?: boolean;
}

export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    confirmVariant = "default",
    isLoading = false,
}: ConfirmDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {confirmVariant === "destructive" && (
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                        )}
                        <h2 className="font-bold">{title}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-4">
                    <p className="text-muted-foreground">{description}</p>
                </div>

                <div className="p-4 border-t flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${confirmVariant === "destructive"
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-primary text-primary-foreground hover:opacity-90"
                            }`}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Wrapper hook for easier usage
export function useConfirmDialog() {
    const [state, setState] = useState<{
        open: boolean;
        title: string;
        description: string;
        confirmText: string;
        confirmVariant: "default" | "destructive";
        onConfirm: () => void;
    }>({
        open: false,
        title: "",
        description: "",
        confirmText: "Confirm",
        confirmVariant: "default",
        onConfirm: () => { },
    });

    const confirm = (options: {
        title: string;
        description: string;
        confirmText?: string;
        confirmVariant?: "default" | "destructive";
    }): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                open: true,
                title: options.title,
                description: options.description,
                confirmText: options.confirmText || "Confirm",
                confirmVariant: options.confirmVariant || "default",
                onConfirm: () => {
                    setState(s => ({ ...s, open: false }));
                    resolve(true);
                },
            });
        });
    };

    const Dialog = () => (
        <ConfirmDialog
            open={state.open}
            onClose={() => setState(s => ({ ...s, open: false }))}
            onConfirm={state.onConfirm}
            title={state.title}
            description={state.description}
            confirmText={state.confirmText}
            confirmVariant={state.confirmVariant}
        />
    );

    return { confirm, Dialog };
}
