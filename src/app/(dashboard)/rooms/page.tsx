import { PageHeader } from "@/components/ui/page-header";
import { getRooms } from "@/app/actions/rooms";
import Link from "next/link";
import { Plus, Users, MapPin, Wifi, DoorOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default async function RoomsPage() {
    const rooms = await getRooms();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageHeader
                    title="Meeting Rooms"
                    description="Book rooms for your team meetings"
                    icon="DoorOpen"
                    iconColor="text-orange-600"
                    iconBg="bg-orange-100"
                />
                <div className="flex gap-2">
                    <Link
                        href="/rooms/book"
                        className="inline-flex items-center justify-center rounded-md bg-white border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        My Bookings
                    </Link>
                    <Link
                        href="/rooms/new"
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Room
                    </Link>
                </div>
            </div>

            {rooms.length === 0 ? (
                <EmptyState
                    icon="DoorOpen"
                    title="No rooms found"
                    description="Add meeting rooms to start accepting bookings."
                    action={{ label: "Add Room", href: "/rooms/new" }}
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {rooms.map((room) => (
                        <div key={room.id} className="rounded-lg border bg-card p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-semibold text-lg">{room.name}</h3>
                                {room.capacity && (
                                    <div className="flex items-center text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
                                        <Users className="w-4 h-4 mr-1" />
                                        {room.capacity}
                                    </div>
                                )}
                            </div>

                            {room.location && (
                                <div className="flex items-center text-sm text-muted-foreground mb-4">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {room.location}
                                </div>
                            )}

                            {room.amenities && room.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {room.amenities.map(amenity => (
                                        <span key={amenity} className="inline-flex items-center text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                                            {amenity === 'wifi' && <Wifi className="w-3 h-3 mr-1" />}
                                            {amenity}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="mt-auto">
                                <Link
                                    href={`/rooms/book?roomId=${room.id}`}
                                    className="block w-full text-center rounded-md bg-primary/10 text-primary px-4 py-2 text-sm font-medium hover:bg-primary/20"
                                >
                                    Book Now
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
