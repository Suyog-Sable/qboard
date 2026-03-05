"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";

export async function createTeam(data) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    try {
        // Prefer Prisma model create when available
        if (db.team && typeof db.team.create === "function") {
            const team = await db.team.create({
                data: {
                    name: data.name,
                    key: data.key,
                    description: data.description,
                    // no organizationId needed - default org is implied
                },
            });

            return team;
        }

        // Fallback: if Prisma model accessor is unavailable for some reason,
        // insert using a raw SQL query (works with PostgreSQL). We generate a
        // server-side id and return the inserted row.
        const id = randomUUID();
        const rows = await db.$queryRaw`
            INSERT INTO "Team" ("id","name","key","description","organizationId","createdAt","updatedAt")
            VALUES (${id}, ${data.name}, ${data.key}, ${data.description}, NULL, now(), now())
            RETURNING *;
        `;

        // $queryRaw returns an array of rows for SELECT/INSERT RETURNING
        return Array.isArray(rows) ? rows[0] : rows;
    } catch (error) {
        throw new Error("Error creating team: " + error.message);
    }
}

export async function getTeam(teamId) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const team = await db.team.findUnique({
        where: { id: teamId },
        include: {
            sprints: {
                orderBy: { createdAt: "desc" },
            },
        },
    });

    return team;
}

export async function deleteTeam(teamId) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const team = await db.team.findUnique({
        where: { id: teamId },
    });

    if (!team) {
        throw new Error("Team not found or you don't have permission to delete it");
    }

    await db.team.delete({
        where: { id: teamId },
    });

    return { success: true };
}

export async function getTeams() {
    const { userId } = auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }
    const teams = await db.team.findMany({
        orderBy: { createdAt: "desc" },
    });
    return teams;
}
