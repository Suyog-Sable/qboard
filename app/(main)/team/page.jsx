import { getTeams } from "@/actions/teams";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function TeamsPage() {
    const teams = await getTeams();

    return (
        <div className="container mx-auto">
            <h1 className="text-5xl font-bold mb-6 gradient-title">Teams</h1>
            {teams.length === 0 ? (
                <p>No teams found. <Link href="/team/create" className="text-blue-500 underline">Create one</Link>.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teams.map((team) => (
                        <Card key={team.id}>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    {team.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500 mb-4">{team.description}</p>
                                <Link href={`/team/${team.id}`} className="text-blue-500 hover:underline">
                                    View Team
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}