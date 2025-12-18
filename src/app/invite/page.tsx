import { verifyInviteToken } from "@/app/actions/auth";
import InviteForm from "./invite-form";

export default async function InvitePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
    const params = await searchParams;
    const token = params.token;

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow border text-center max-w-md">
                    <h1 className="text-xl font-bold text-red-600 mb-2">Invalid Invitation</h1>
                    <p className="text-gray-600">No invitation token was provided.</p>
                </div>
            </div>
        );
    }

    const { valid, email, name } = await verifyInviteToken(token);

    if (!valid || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow border text-center max-w-md">
                    <h1 className="text-xl font-bold text-red-600 mb-2">Link Expired or Invalid</h1>
                    <p className="text-gray-600">This invitation link is invalid or has already been used.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <InviteForm token={token} email={email} name={name} />
        </div>
    );
}
