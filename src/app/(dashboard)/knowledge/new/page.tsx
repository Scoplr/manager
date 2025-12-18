import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

// Knowledge new redirects to knowledge page for now
// TODO: Implement proper document creation page
export default function NewKnowledgePage() {
    redirect("/knowledge");
}
