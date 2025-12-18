"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { CalendarEvent } from "@/app/actions/calendar";

interface CalendarGridProps {
    events: CalendarEvent[];
    initialDate?: Date;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export function CalendarGrid({ events, initialDate = new Date() }: CalendarGridProps) {
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and total days
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Navigate months
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Get events for a specific date
    const getEventsForDate = (date: Date) => {
        return events.filter(event => {
            const eventStart = new Date(event.date);
            const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;

            return date >= new Date(eventStart.setHours(0, 0, 0, 0)) &&
                date <= new Date(eventEnd.setHours(23, 59, 59, 999));
        });
    };

    // Build calendar grid
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        days.push({
            date: new Date(year, month - 1, daysInPrevMonth - i),
            isCurrentMonth: false,
        });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({
            date: new Date(year, month, i),
            isCurrentMonth: true,
        });
    }

    // Next month days (to fill 6 rows)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
        days.push({
            date: new Date(year, month + 1, i),
            isCurrentMonth: false,
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

    return (
        <div className="bg-card border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">
                        {MONTHS[month]} {year}
                    </h2>
                    <button
                        onClick={goToToday}
                        className="text-xs px-2 py-1 rounded border hover:bg-muted transition-colors"
                    >
                        Today
                    </button>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7">
                {/* Day headers */}
                {DAYS.map(day => (
                    <div
                        key={day}
                        className="p-2 text-center text-xs font-medium text-muted-foreground border-b"
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {days.map(({ date, isCurrentMonth }, index) => {
                    const dayEvents = getEventsForDate(date);
                    const isToday = date.getTime() === today.getTime();
                    const isSelected = selectedDate?.getTime() === date.getTime();
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                    return (
                        <button
                            key={index}
                            onClick={() => setSelectedDate(date)}
                            className={`
                                min-h-[80px] p-1 border-b border-r text-left transition-colors
                                ${isCurrentMonth ? '' : 'bg-muted/30'}
                                ${isWeekend && isCurrentMonth ? 'bg-muted/20' : ''}
                                ${isSelected ? 'bg-primary/10 ring-2 ring-primary ring-inset' : 'hover:bg-muted/50'}
                            `}
                        >
                            <span className={`
                                inline-flex items-center justify-center w-6 h-6 text-sm rounded-full
                                ${isToday ? 'bg-primary text-primary-foreground font-bold' : ''}
                                ${!isCurrentMonth ? 'text-muted-foreground' : ''}
                            `}>
                                {date.getDate()}
                            </span>

                            {/* Event indicators */}
                            <div className="mt-1 space-y-0.5">
                                {dayEvents.slice(0, 3).map((event, i) => (
                                    <div
                                        key={event.id + i}
                                        className="text-[10px] px-1 py-0.5 rounded truncate"
                                        style={{ backgroundColor: event.color + '20', color: event.color }}
                                    >
                                        {event.title.split(' - ')[0]}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground px-1">
                                        +{dayEvents.length - 3} more
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Selected date details */}
            {selectedDate && (
                <div className="p-4 border-t bg-muted/20">
                    <h3 className="font-medium mb-2">
                        {selectedDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric"
                        })}
                    </h3>
                    {selectedDateEvents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No events</p>
                    ) : (
                        <div className="space-y-2">
                            {selectedDateEvents.map(event => (
                                <div
                                    key={event.id}
                                    className="flex items-center gap-2 p-2 rounded-md"
                                    style={{ backgroundColor: event.color + '15' }}
                                >
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: event.color }}
                                    />
                                    <span className="text-sm">{event.title}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
