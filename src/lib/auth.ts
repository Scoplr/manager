import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm"; // ... keep imports

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "Email",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;

                const email = (credentials.email as string).toLowerCase();
                const password = credentials.password as string;

                // === SUPER ADMIN LOGIN ===
                const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
                const superAdminPasswordHash = process.env.SUPER_ADMIN_PASSWORD_HASH;

                if (superAdminEmail && superAdminPasswordHash && email === superAdminEmail) {
                    const isValidPassword = await bcrypt.compare(password, superAdminPasswordHash);
                    if (isValidPassword) {
                        return {
                            id: "super-admin",
                            email: email,
                            name: "Super Admin",
                            role: "admin",
                        };
                    } else {
                        throw new Error("Invalid password for admin.");
                    }
                }

                // === REGULAR USER LOGIN ===

                // 1. Block generic domains
                const genericDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com"];
                const domain = email.split("@")[1];
                if (genericDomains.includes(domain)) {
                    throw new Error("Public email domains are not allowed. Please use your work email.");
                }

                // 2. Lookup User
                const userResult = await db.select().from(users).where(eq(users.email, email));
                const user = userResult[0];

                // 3. Strict Login
                if (!user) {
                    throw new Error("Account not found. Please contact your organization administrator.");
                }

                // 4. Ensure User belongs to an Organization
                if (!user.organizationId) {
                    throw new Error("Account is not linked to an organization. Contact support.");
                }

                // 5. Verify Password
                if (!user.password) {
                    throw new Error("Password not set. Please contact your administrator to set up your account.");
                }

                const passwordsMatch = await bcrypt.compare(password, user.password);
                if (!passwordsMatch) {
                    throw new Error("Invalid password.");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    // ... keep rest
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
});
