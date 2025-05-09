import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Dashboard from "./Dashboard";
import UserProfile from "./UserProfile";
import ProjectsList from "./ProjectsList";
import ProjectAdmin from "./ProjectAdmin";
import { Leaf } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { userApi, projectApi, userProjectApi } from "../services/api";
import { User, Project, UserProject } from "../types/api";

export default function Home() {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          console.log("Fetching current user data");
          const userData = await userApi.getCurrentUser();
          setUserDetails(userData);
        } catch (err) {
          console.error("Failed to load user data:", err);
          // If API fails but we have user from auth context, use that
          if (user) {
            setUserDetails(user);
          }
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, user]);

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await projectApi.getAllProjects();
        setProjects(projectsData);
      } catch (err) {
        console.error("Failed to load projects:", err);
        // Continue with empty projects if API fails
      }
    };

    fetchProjects();
  }, []);

  // Fetch user's voted projects
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching user projects");
        const userProjectsData = await userProjectApi.getUserProjects();
        setUserProjects(userProjectsData);
      } catch (err) {
        console.error("Failed to load user projects:", err);
        // Continue with empty user projects if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [isAuthenticated]);

  // Function to handle voting for a project
  const handleVote = async (projectId: number) => {
    if (!isAuthenticated) {
      setError("You must be logged in to vote");
      setTimeout(() => setError(null), 3000);
      return;
    }
    try {
      // Check if user has already voted for this project
      const alreadyVoted = userProjects.some(
        (up) => up.projectId === projectId,
      );
      if (alreadyVoted) {
        setError("You have already voted for this project");
        // Clear error after 3 seconds
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Optimistically update the UI
      // Find the project and increment its vote count
      const updatedProjects = projects.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            receivedVotes: project.receivedVotes + 1,
          };
        }
        return project;
      });
      setProjects(updatedProjects);

      // Add to user's voted projects
      const newVote = {
        id: Date.now(), // Temporary ID
        projectId: projectId,
        votedAt: new Date().toISOString(),
        project: projects.find((p) => p.id === projectId),
      };
      setUserProjects([...userProjects, newVote]);

      // Optimistically update user's vote count
      if (userDetails) {
        setUserDetails({
          ...userDetails,
          votes: userDetails.votes + 1,
          greenPoints: userDetails.greenPoints + 10, // Assuming each vote gives 10 points
        });
      }

      // Call API to vote for the project
      await userProjectApi.voteProject(projectId);

      // After successful API call, refresh data from server to ensure consistency
      const [updatedUserProjects, serverProjects, updatedUser] =
        await Promise.all([
          userProjectApi.getUserProjects(),
          projectApi.getAllProjects(),
          userApi.getCurrentUser(),
        ]);

      setUserProjects(updatedUserProjects);
      setProjects(serverProjects);
      setUserDetails(updatedUser);

      // Show success message
      setError("Vote successfully cast!");
      // Clear message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to vote for project");
      console.error(err);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);

      // Refresh data from server to revert any optimistic updates
      try {
        const [updatedUserProjects, serverProjects, updatedUser] =
          await Promise.all([
            userProjectApi.getUserProjects(),
            projectApi.getAllProjects(),
            userApi.getCurrentUser(),
          ]);

        setUserProjects(updatedUserProjects);
        setProjects(serverProjects);
        setUserDetails(updatedUser);
      } catch (refreshErr) {
        console.error("Failed to refresh data after error:", refreshErr);
      }
    }
  };

  // Display user data or error message
  const displayUser = userDetails || {
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4 md:p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 text-white p-2 rounded-full">
              <Leaf size={24} />
            </div>
            <h1 className="text-2xl font-bold text-green-800">Green Ripple</h1>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm text-green-700 font-medium">
                {displayUser.name}
              </p>
              <p className="text-xs text-green-600">
                {displayUser.greenPoints} Green Points
              </p>
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm border-green-100 shadow-md">
          <CardContent className="p-0">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-green-50 rounded-t-lg border-b border-green-100">
                <TabsTrigger
                  value="dashboard"
                  className="data-[state=active]:bg-white data-[state=active]:text-green-700"
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="data-[state=active]:bg-white data-[state=active]:text-green-700"
                >
                  Projects
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="data-[state=active]:bg-white data-[state=active]:text-green-700"
                >
                  Admin
                </TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard" className="p-6">
                <Dashboard />
              </TabsContent>
              <TabsContent value="projects" className="p-6">
                <ProjectsList
                  userVotedProjectIds={userProjects.map((up) => up.projectId)}
                  onVote={handleVote}
                />
              </TabsContent>
              <TabsContent value="admin" className="p-6">
                <ProjectAdmin />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {error && (
        <div
          className={`mt-4 p-4 rounded-md ${error.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {error}
        </div>
      )}

      <footer className="mt-8 text-center text-sm text-green-600">
        <p>
          © {new Date().getFullYear()} Green Ripple - Making the world greener,
          one vote at a time
        </p>
      </footer>
    </div>
  );
}
