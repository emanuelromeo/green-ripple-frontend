import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Leaf } from "lucide-react";
import { userProjectApi, projectApi } from "../services/api";
import { User, Project, UserProject } from "../types/api";

interface UserProfileProps {
  user?: User;
  userId?: number;
}

const UserProfile = ({ user, userId }: UserProfileProps) => {
  const [votedProjects, setVotedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's voted projects if userId is provided and user doesn't have votedProjects
  useEffect(() => {
    const fetchVotedProjects = async () => {
      setLoading(true);
      try {
        // Get user's voted projects
        const userProjects = await userProjectApi.getUserProjects(userId);

        // Fetch details for each project
        const projectDetails = await Promise.all(
          userProjects.map(async (up: UserProject) => {
            const project = await projectApi.getProjectById(up.projectId);
            return {
              ...project,
              votedAt: up.votedAt,
            };
          }),
        );

        setVotedProjects(projectDetails);
      } catch (err) {
        setError("Failed to load voted projects");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVotedProjects();
  }, [userId, user]);

  // If no user is provided, show a loading state
  if (!user && loading) {
    return <div className="p-4">Loading user profile...</div>;
  }

  // If there was an error, show an error message
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  // Display user data or error message
  const displayUser = user || {
    id: 0,
    name: "User data unavailable",
    email: "No email available",
    city: "No city available",
    carType: "UNKNOWN",
    greenPoints: 0,
    votes: 0,
    votedProjects: [],
  };

  const projectsToDisplay = user?.votedProjects || votedProjects;

  return (
    <div className="w-full p-6 bg-white">
      <div className="flex flex-col md:flex-row gap-6">
        {/* User Info Card */}
        <Card className="w-full md:w-1/3">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUser.name}`}
                  alt={displayUser.name}
                />
                <AvatarFallback>
                  {displayUser.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{displayUser.name}</CardTitle>
                <CardDescription>{displayUser.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Location
                </p>
                <p>{displayUser.city}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Car Type
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      displayUser.carType === "ELECTRIC"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {displayUser.carType}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Green Stats Card */}
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" />
              <span>Green Impact</span>
            </CardTitle>
            <CardDescription>
              Your environmental contribution statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">
                  Green Points
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {displayUser.greenPoints}
                </p>
                <p className="text-sm text-muted-foreground">
                  Earned through eco-friendly actions
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">
                  Projects Voted
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {displayUser.votes}
                </p>
                <p className="text-sm text-muted-foreground">
                  Supporting environmental initiatives
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voted Projects Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Projects You've Supported</CardTitle>
          <CardDescription>
            History of environmental projects you've voted for
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading projects...</div>
          ) : projectsToDisplay && projectsToDisplay.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Voted On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectsToDisplay.map((project: any) => {
                  const progress = Math.round(
                    (project.receivedVotes / project.requiredVotes) * 100,
                  );
                  const date = new Date(project.votedAt).toLocaleDateString();

                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {project.name}
                      </TableCell>
                      <TableCell>{project.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-green-600 h-2.5 rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{date}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4">No voted projects found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
