"use client";

import { useState, useTransition } from "react";
import { createHoliday } from "@/app/actions/config";
import { Globe, Download, Loader2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Complete list of countries supported by Nager.Date API
const COUNTRIES = [
    { code: "AD", name: "Andorra" },
    { code: "AL", name: "Albania" },
    { code: "AR", name: "Argentina" },
    { code: "AT", name: "Austria" },
    { code: "AU", name: "Australia" },
    { code: "AX", name: "Åland Islands" },
    { code: "BA", name: "Bosnia and Herzegovina" },
    { code: "BB", name: "Barbados" },
    { code: "BE", name: "Belgium" },
    { code: "BG", name: "Bulgaria" },
    { code: "BJ", name: "Benin" },
    { code: "BO", name: "Bolivia" },
    { code: "BR", name: "Brazil" },
    { code: "BS", name: "Bahamas" },
    { code: "BW", name: "Botswana" },
    { code: "BY", name: "Belarus" },
    { code: "BZ", name: "Belize" },
    { code: "CA", name: "Canada" },
    { code: "CH", name: "Switzerland" },
    { code: "CL", name: "Chile" },
    { code: "CN", name: "China" },
    { code: "CO", name: "Colombia" },
    { code: "CR", name: "Costa Rica" },
    { code: "CU", name: "Cuba" },
    { code: "CY", name: "Cyprus" },
    { code: "CZ", name: "Czechia" },
    { code: "DE", name: "Germany" },
    { code: "DK", name: "Denmark" },
    { code: "DO", name: "Dominican Republic" },
    { code: "EC", name: "Ecuador" },
    { code: "EE", name: "Estonia" },
    { code: "EG", name: "Egypt" },
    { code: "ES", name: "Spain" },
    { code: "FI", name: "Finland" },
    { code: "FO", name: "Faroe Islands" },
    { code: "FR", name: "France" },
    { code: "GA", name: "Gabon" },
    { code: "GB", name: "United Kingdom" },
    { code: "GD", name: "Grenada" },
    { code: "GI", name: "Gibraltar" },
    { code: "GL", name: "Greenland" },
    { code: "GM", name: "Gambia" },
    { code: "GR", name: "Greece" },
    { code: "GT", name: "Guatemala" },
    { code: "GY", name: "Guyana" },
    { code: "HK", name: "Hong Kong" },
    { code: "HN", name: "Honduras" },
    { code: "HR", name: "Croatia" },
    { code: "HT", name: "Haiti" },
    { code: "HU", name: "Hungary" },
    { code: "ID", name: "Indonesia" },
    { code: "IE", name: "Ireland" },
    { code: "IL", name: "Israel" },
    { code: "IM", name: "Isle of Man" },
    { code: "IN", name: "India" },
    { code: "IS", name: "Iceland" },
    { code: "IT", name: "Italy" },
    { code: "JE", name: "Jersey" },
    { code: "JM", name: "Jamaica" },
    { code: "JP", name: "Japan" },
    { code: "KE", name: "Kenya" },
    { code: "KR", name: "South Korea" },
    { code: "LI", name: "Liechtenstein" },
    { code: "LS", name: "Lesotho" },
    { code: "LT", name: "Lithuania" },
    { code: "LU", name: "Luxembourg" },
    { code: "LV", name: "Latvia" },
    { code: "MA", name: "Morocco" },
    { code: "MC", name: "Monaco" },
    { code: "MD", name: "Moldova" },
    { code: "ME", name: "Montenegro" },
    { code: "MG", name: "Madagascar" },
    { code: "MK", name: "North Macedonia" },
    { code: "MN", name: "Mongolia" },
    { code: "MT", name: "Malta" },
    { code: "MX", name: "Mexico" },
    { code: "MZ", name: "Mozambique" },
    { code: "NA", name: "Namibia" },
    { code: "NE", name: "Niger" },
    { code: "NG", name: "Nigeria" },
    { code: "NI", name: "Nicaragua" },
    { code: "NL", name: "Netherlands" },
    { code: "NO", name: "Norway" },
    { code: "NZ", name: "New Zealand" },
    { code: "PA", name: "Panama" },
    { code: "PE", name: "Peru" },
    { code: "PH", name: "Philippines" },
    { code: "PL", name: "Poland" },
    { code: "PR", name: "Puerto Rico" },
    { code: "PT", name: "Portugal" },
    { code: "PY", name: "Paraguay" },
    { code: "RO", name: "Romania" },
    { code: "RS", name: "Serbia" },
    { code: "RU", name: "Russia" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "SE", name: "Sweden" },
    { code: "SG", name: "Singapore" },
    { code: "SI", name: "Slovenia" },
    { code: "SJ", name: "Svalbard and Jan Mayen" },
    { code: "SK", name: "Slovakia" },
    { code: "SM", name: "San Marino" },
    { code: "SR", name: "Suriname" },
    { code: "SV", name: "El Salvador" },
    { code: "TN", name: "Tunisia" },
    { code: "TR", name: "Turkey" },
    { code: "UA", name: "Ukraine" },
    { code: "AE", name: "United Arab Emirates" },
    { code: "US", name: "United States" },
    { code: "UY", name: "Uruguay" },
    { code: "VA", name: "Vatican City" },
    { code: "VE", name: "Venezuela" },
    { code: "VN", name: "Vietnam" },
    { code: "ZA", name: "South Africa" },
    { code: "ZW", name: "Zimbabwe" },
].sort((a, b) => a.name.localeCompare(b.name));

interface NagerHoliday {
    date: string;
    localName: string;
    name: string;
    countryCode: string;
    fixed: boolean;
    global: boolean;
    types: string[];
}

export function HolidayImport() {
    const [country, setCountry] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    const [holidays, setHolidays] = useState<NagerHoliday[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [importing, startImport] = useTransition();
    const router = useRouter();

    async function fetchHolidays() {
        if (!country) {
            toast.error("Please select a country");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data: NagerHoliday[] = await res.json();
            setHolidays(data);
            // Pre-select all national/public holidays
            setSelected(new Set(data.filter(h => h.global).map(h => h.date)));
            toast.success(`Found ${data.length} holidays`);
        } catch (err) {
            toast.error("Failed to fetch holidays. Try again.");
            setHolidays([]);
        }
        setLoading(false);
    }

    function toggleHoliday(date: string) {
        const next = new Set(selected);
        if (next.has(date)) {
            next.delete(date);
        } else {
            next.add(date);
        }
        setSelected(next);
    }

    function selectAll() {
        setSelected(new Set(holidays.map(h => h.date)));
    }

    function selectNone() {
        setSelected(new Set());
    }

    async function importSelected() {
        const toImport = holidays.filter(h => selected.has(h.date));
        if (toImport.length === 0) {
            toast.error("No holidays selected");
            return;
        }

        startImport(async () => {
            let imported = 0;
            for (const h of toImport) {
                const formData = new FormData();
                formData.set("name", h.localName || h.name);
                formData.set("date", h.date);
                formData.set("isRecurring", "true");

                const result = await createHoliday(formData);
                if (!("error" in result)) {
                    imported++;
                }
            }

            toast.success(`Imported ${imported} holidays`);
            setHolidays([]);
            setSelected(new Set());
            router.refresh();
        });
    }

    return (
        <div className="space-y-4">
            {/* Country & Year Selection */}
            <div className="flex gap-2">
                <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="flex-1 border rounded-lg p-2.5 bg-background text-sm"
                >
                    <option value="">Select country...</option>
                    {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                </select>
                <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-24 border rounded-lg p-2.5 bg-background text-sm"
                >
                    {[2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                <button
                    onClick={fetchHolidays}
                    disabled={loading || !country}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                    Fetch
                </button>
            </div>

            {/* Holiday List */}
            {holidays.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 p-2 flex items-center justify-between border-b">
                        <span className="text-sm font-medium">{holidays.length} holidays found</span>
                        <div className="flex gap-2">
                            <button onClick={selectAll} className="text-xs text-primary hover:underline">
                                Select all
                            </button>
                            <button onClick={selectNone} className="text-xs text-muted-foreground hover:underline">
                                Clear
                            </button>
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y">
                        {holidays.map(h => (
                            <label
                                key={h.date}
                                className="flex items-center gap-3 p-2 hover:bg-muted/30 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.has(h.date)}
                                    onChange={() => toggleHoliday(h.date)}
                                    className="rounded"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{h.localName || h.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(h.date).toLocaleDateString(undefined, {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                        {h.global && (
                                            <span className="ml-2 text-green-600 dark:text-green-400">• National</span>
                                        )}
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>
                    <div className="p-3 border-t bg-muted/30">
                        <button
                            onClick={importSelected}
                            disabled={importing || selected.size === 0}
                            className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {importing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            Import {selected.size} Holiday{selected.size !== 1 ? 's' : ''}
                        </button>
                    </div>
                </div>
            )}

            {/* Help text */}
            {holidays.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                    Select a country to fetch public holidays from Nager.Date API
                </p>
            )}
        </div>
    );
}
