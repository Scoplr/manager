import { redirect } from "next/navigation";

// Redirect to login with trial request flow
export default function RegisterPage() {
    redirect("/login?action=register");
}
