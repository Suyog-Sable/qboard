"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getIssuesForSprint(sprintId) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const sprint = await db.sprint.findUnique({
    where: { id: sprintId },
    include: { team: true },
  });


  const issues = await db.issue.findMany({
    where: { sprintId: sprintId },
    orderBy: [{ status: "asc" }, { order: "asc" }],
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issues;
}

export async function createIssue(teamId, data) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  let user = await db.user.findUnique({ where: { clerkUserId: userId } });

  const lastIssue = await db.issue.findFirst({
    where: { teamId, status: data.status },
    orderBy: { order: "desc" },
  });

  const newOrder = lastIssue ? lastIssue.order + 1 : 0;

  const issue = await db.issue.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      teamId: teamId,
      sprintId: data.sprintId,
      reporterId: user.id,
      assigneeId: data.assigneeId || null, // Add this line
      order: newOrder,
    },
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issue;
}

export async function updateIssueOrder(updatedIssues) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Use the array form of $transaction which sends a single batch of
  // statements, avoiding a long-lived lock on the database that could
  // trigger timeouts in busy environments.
  const tryUpdate = async () => {
    return await db.$transaction(
      updatedIssues.map((issue) =>
        db.issue.update({
          where: { id: issue.id },
          data: {
            status: issue.status,
            order: issue.order,
          },
        })
      )
    );
  };

  try {
    await tryUpdate();
  } catch (err) {
    // A common failure is a timeout; we can retry once after a small delay.
    if (err?.code === 'P2034' || err?.code === 'P2028') {
      // transaction API error or connection error
      await new Promise((r) => setTimeout(r, 200));
      await tryUpdate();
    } else {
      throw err;
    }
  }

  return { success: true };
}

export async function deleteIssue(issueId) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: { team: true },
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  if (issue.reporterId !== user.id) {
    throw new Error("You don't have permission to delete this issue");
  }

  await db.issue.delete({ where: { id: issueId } });

  return { success: true };
}

export async function updateIssue(issueId, data) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const issue = await db.issue.findUnique({
      where: { id: issueId },
      include: { team: true },
    });
    if (!issue) {
      throw new Error("Issue not found");
    }

    const updatedIssue = await db.issue.update({
      where: { id: issueId },
      data: {
        status: data.status,
        priority: data.priority,
      },
      include: {
        assignee: true,
        reporter: true,
      },
    });

    return updatedIssue;
  } catch (error) {
    throw new Error("Error updating issue: " + error.message);
  }
}

export async function getUserIssues(userId) {
  const { userId: authId } = auth();
  if (!authId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const issues = await db.issue.findMany({
    where: {
      OR: [{ assigneeId: user.id }, { reporterId: user.id }],
    },
    include: { team: true, assignee: true, reporter: true },
    orderBy: { updatedAt: "desc" },
  });

  return issues;
}
