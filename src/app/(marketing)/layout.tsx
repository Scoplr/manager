import { Metadata } from "next";

export const metadata: Metadata = {
    title: "wrkspace — Team Leave & HR Management for Growing Teams | $25/mo Flat",
    description: "Stop managing your team in 6 different tools. wrkspace replaces spreadsheets, Slack chaos, and per-seat pricing with one simple platform for leave management, approvals, onboarding, and expenses. $25/month flat — unlimited users.",
    keywords: [
        "team leave management software",
        "hr tool for small teams",
        "flat pricing hr software",
        "no per seat pricing hr",
        "simple team management app",
        "employee time off tracking",
        "small business hr software",
        "replace spreadsheet leave tracking",
        "team approval workflow",
        "employee onboarding software"
    ],
    authors: [{ name: "wrkspace" }],
    creator: "wrkspace",
    publisher: "wrkspace",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://wrkspace.app",
        siteName: "wrkspace",
        title: "wrkspace — Team Leave & HR Management | $25/mo Flat",
        description: "One platform for leave management, approvals, onboarding, and expenses. No per-seat pricing. Unlimited users for $25/month.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "wrkspace - Simple HR for Growing Teams",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "wrkspace — Team Leave & HR Management | $25/mo Flat",
        description: "One platform for leave, approvals, and expenses. No per-seat pricing.",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://wrkspace.app",
    },
};

// JSON-LD Structured Data
const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": "https://wrkspace.app/#organization",
            name: "wrkspace",
            url: "https://wrkspace.app",
            logo: {
                "@type": "ImageObject",
                url: "https://wrkspace.app/logo.png",
            },
            sameAs: [],
        },
        {
            "@type": "WebSite",
            "@id": "https://wrkspace.app/#website",
            url: "https://wrkspace.app",
            name: "wrkspace",
            publisher: { "@id": "https://wrkspace.app/#organization" },
        },
        {
            "@type": "SoftwareApplication",
            name: "wrkspace",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
                "@type": "Offer",
                price: "25",
                priceCurrency: "USD",
                priceValidUntil: "2025-12-31",
            },
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                ratingCount: "50",
            },
        },
    ],
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="min-h-screen">
                {children}
            </div>
        </>
    );
}
