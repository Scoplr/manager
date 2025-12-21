import { getRooms } from "@/app/actions/rooms";
import { DoorOpen } from "lucide-react";
import Link from "next/link";
import { requireAnyRole } from "@/lib/role-guards";

export default async function OperationsRoomsPage() {
    await requireAnyRole(["hr", "admin"], "/operations");

    const rooms = await getRooms();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{rooms.length} rooms</p>
                <Link
                    href="/rooms/new"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    Add Room
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rooms.length === 0 ? (
                    <div className="col-span-full p-8 text-center border border-dashed rounded-lg text-muted-foreground">
                        No rooms configured yet.
                    </div>
                ) : (
                    rooms.map((room: any) => (
                        <Link
                            key={room.id}
                            href={`/rooms/${room.id}`}
                            className="p-4 bg-card border rounded-lg hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <DoorOpen className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-medium truncate">{room.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Capacity: {room.capacity || "N/A"}
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
