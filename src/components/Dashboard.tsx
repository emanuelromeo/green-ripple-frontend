import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Leaf } from "lucide-react";
import UserProfile from "./UserProfile";
import ProjectsList from "./ProjectsList";
import { userApi, projectApi, userProjectApi } from "../services/api";
import { User, Project, UserProject } from "../types/api";

interface DashboardProps {
  userId?: number;
}

const Dashboard = ({ userId = 1 }: DashboardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userApi.getUserById(userId);
        setUser(userData);
      } catch (err) {
        setError("Failed to load user data");
        console.error(err);
      }
    };

    fetchUserData();
  }, [userId]);

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await projectApi.getAllProjects();
        setProjects(projectsData);
      } catch (err) {
        setError("Failed to load projects");
        console.error(err);
      }
    };

    fetchProjects();
  }, []);

  // Fetch user's voted projects
  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        const userProjectsData = await userProjectApi.getUserProjects(userId);
        setUserProjects(userProjectsData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load user projects");
        console.error(err);
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [userId]);

  // Function to handle voting for a project
  const handleVote = async (projectId: number) => {
    try {
      // Check if user has already voted for this project
      const alreadyVoted = userProjects.some(
        (up) => up.projectId === projectId,
      );
      if (alreadyVoted) return;

      // Call API to vote for the project
      await userProjectApi.voteProject(userId, projectId);

      // Refresh user projects
      const updatedUserProjects = await userProjectApi.getUserProjects(userId);
      setUserProjects(updatedUserProjects);

      // Refresh projects to get updated vote count
      const updatedProjects = await projectApi.getAllProjects();
      setProjects(updatedProjects);

      // Refresh user data to get updated green points and votes
      const updatedUser = await userApi.getUserById(userId);
      setUser(updatedUser);
    } catch (err) {
      setError("Failed to vote for project");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
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

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Green Ripple</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-medium">{displayUser.name}</span>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-700">
                  {displayUser.greenPoints} Green Points
                </Badge>
              </div>
            </div>
            <Avatar>
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUser.name}`}
                alt={displayUser.name}
              />
              <AvatarFallback>
                {displayUser.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 mt-6">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-green-800">Dashboard</CardTitle>
            <CardDescription>
              View your profile and explore environmental projects
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
                <TabsTrigger
                  value="profile"
                  className="rounded-none data-[state=active]:bg-green-50"
                >
                  My Profile
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="rounded-none data-[state=active]:bg-green-50"
                >
                  Projects
                </TabsTrigger>
              </TabsList>
              <div className="p-4">
                <TabsContent value="profile">
                  <UserProfile user={displayUser} />
                </TabsContent>
                <TabsContent value="projects">
                  <ProjectsList
                    userVotedProjectIds={userProjects.map((up) => up.projectId)}
                    onVote={handleVote}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>
            © {new Date().getFullYear()} Green Ripple - Making the world more
            sustainable, one project at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
