import { redirect } from "next/navigation";
import { headers } from "next/headers";

// Force dynamic rendering to check hostname
export const dynamic = 'force-dynamic';

export default async function RootPage() {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    // On app subdomain, redirect to dashboard
    if (host.startsWith("app.")) {
        redirect("/inbox");
    }

    // On main domain, redirect to marketing home
    redirect("/home");
}
