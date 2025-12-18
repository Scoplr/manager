interface BreadcrumbItem {
    label: string;
    href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    {index > 0 && <span className="text-muted-foreground/50">/</span>}
                    {item.href ? (
                        <a href={item.href} className="hover:text-foreground transition-colors">
                            {item.label}
                        </a>
                    ) : (
                        <span className="text-foreground font-medium">{item.label}</span>
                    )}
                </div>
            ))}
        </nav>
    );
}
