/**
 * Utility to safely serialize data for passing from server to client components.
 * Converts Date objects to ISO strings and removes any non-serializable properties.
 */
export function serializeForClient<T>(data: T): T {
    return JSON.parse(JSON.stringify(data, (key, value) => {
        if (value instanceof Date) {
            return value.toISOString();
        }
        return value;
    }));
}

/**
 * Safely serialize an array of items
 */
export function serializeArrayForClient<T>(items: T[]): T[] {
    return items.map(item => serializeForClient(item));
}

/**
 * Create a simple user object suitable for client components
 */
export function serializeUser(user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
}) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
}
