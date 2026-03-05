"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createSprint(teamId, data) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const team = await db.team.findUnique({
    where: { id: teamId },
    include: { sprints: { orderBy: { createdAt: "desc" } } },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  // Attempt to create a sprint; if name already exists for this team,
  // append a numeric suffix to make it unique.
  let sprint;
  try {
    sprint = await db.sprint.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        status: "PLANNED",
        teamId: teamId,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      // unique constraint violation; fetch count of existing sprints
      // with the base name and add suffix
      const base = data.name;
      const sameNameCount = await db.sprint.count({
        where: { teamId, name: { startsWith: base } },
      });
      const newName = `${base}-${sameNameCount + 1}`;
      sprint = await db.sprint.create({
        data: {
          name: newName,
          startDate: data.startDate,
          endDate: data.endDate,
          status: "PLANNED",
          teamId: teamId,
        },
      });
    } else {
      throw err;
    }
  }

  return sprint;
}

export async function updateSprintStatus(sprintId, newStatus) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const sprint = await db.sprint.findUnique({
      where: { id: sprintId },
      include: { team: true },
    });

    if (!sprint) {
      throw new Error("Sprint not found");
    }

    const now = new Date();
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);

    if (newStatus === "ACTIVE" && (now < startDate || now > endDate)) {
      throw new Error("Cannot start sprint outside of its date range");
    }

    if (newStatus === "COMPLETED" && sprint.status !== "ACTIVE") {
      throw new Error("Can only complete an active sprint");
    }


    const updatedSprint = await db.sprint.update({
      where: { id: sprintId },
      data: { status: newStatus },
    });

    return { success: true, sprint: updatedSprint };
  } catch (error) {
    throw new Error(error.message);
  }
}
