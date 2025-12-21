import { redirect } from "next/navigation";

export default function RootPage() {
    // Root always goes to marketing home
    redirect("/home");
}
