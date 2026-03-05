"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Since we're no longer supporting multiple organizations, the user list
// can simply be pulled directly from the database.  We still guard the call
// with authentication in case we add filters later.
export async function getAllUsers() {
    const { userId } = auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const users = await db.user.findMany({
        orderBy: { name: "asc" },
    });

    return users;
}
