import { auth } from "@clerk/nextjs/server";
import { getTeam } from "@/actions/teams";
import { notFound } from "next/navigation";
import SprintCreationForm from "../../team/_components/create-sprint";
import SprintBoard from "../../team/_components/sprint-board";
import UserIssues from "../../team/_components/user-issues";


export default async function TeamPage({ params }) {
  const { teamId } = await params;

  const { userId } = auth();
  const team = await getTeam(teamId);

  if (!team) {
    notFound();
  }

  const sprintCount = team.sprints?.length ?? 0;

  return (
    <div className="container mx-auto">
      <SprintCreationForm
        teamTitle={team.name}
        teamId={teamId}
        teamKey={team.key}
        // sprintKey={sprintCount + 1} // ✅ safe even if undefined
        sprintKey={team.sprints?.length + 1}
      />

      {sprintCount > 0 ? (
        <SprintBoard
          sprints={team.sprints}
          teamId={teamId}
        />
      ) : (
        <div>Create a Sprint from button above</div>
      )}

      <div className="mt-8">
        <UserIssues userId={userId} />
      </div>
    </div>
  );
}
