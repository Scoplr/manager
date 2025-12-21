import { getApiKeys } from "@/app/actions/api-keys";
import { getWebhooks } from "@/app/actions/webhooks";
import { ApiKeyManager } from "@/components/integrations/api-key-manager";
import { WebhookManager } from "@/components/integrations/webhook-manager";
import { PageHeader } from "@/components/ui/page-header";
import { Webhook } from "lucide-react";

export default async function IntegrationsPage() {
    const [keys, webhooks] = await Promise.all([
        getApiKeys(),
        getWebhooks()
    ]);

    return (
        <div className="space-y-8 max-w-5xl">
            <PageHeader
                title="Integrations & API"
                description="Manage API access and event subscriptions"
                icon="Plug"
                iconColor="text-pink-600"
                iconBg="bg-pink-100"
                tip="Use API Keys for private backend access. Use Webhooks to get real-time updates."
            />

            <div className="space-y-12">
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold tracking-tight">API Keys</h2>
                        <p className="text-sm text-muted-foreground">Manage keys for accessing the Public API.</p>
                    </div>
                    <ApiKeyManager initialKeys={keys} />
                </section>

                <hr className="border-t" />

                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold tracking-tight">Webhooks</h2>
                        <p className="text-sm text-muted-foreground">Receive real-time events at your HTTPS endpoints.</p>
                    </div>
                    <WebhookManager initialWebhooks={webhooks} />
                </section>
            </div>
        </div>
    );
}
