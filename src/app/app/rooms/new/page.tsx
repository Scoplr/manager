import { RoomForm } from "@/components/rooms/room-form";
import { PageHeader } from "@/components/ui/page-header";
import { DoorOpen } from "lucide-react";

export default function NewRoomPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Add Meeting Room"
                description="Register a new room for booking"
                icon="DoorOpen"
                iconColor="text-orange-600"
                iconBg="bg-orange-100"
            />
            <RoomForm />
        </div>
    );
}
