import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { projectApi } from "../services/api";
import { Project } from "../types/api";

// Define ProjectCard component inline
const ProjectCard = ({
  project,
  hasVoted = false,
  onVote,
}: {
  project: Project;
  hasVoted?: boolean;
  onVote: () => void;
}) => {
  const progressPercentage =
    (project.receivedVotes / project.requiredVotes) * 100;
  const isCompleted = project.receivedVotes >= project.requiredVotes;

  return (
    <Card className="overflow-hidden h-full flex flex-col bg-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-green-800">
            {project.name}
          </CardTitle>
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              Goal Reached
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm text-gray-600 mt-1">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-grow">
        <div className="mt-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>
              {project.receivedVotes} / {project.requiredVotes} votes
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-4">
        <Button
          onClick={onVote}
          disabled={hasVoted}
          variant={hasVoted ? "outline" : "default"}
          className={
            hasVoted ? "w-full" : "w-full bg-green-600 hover:bg-green-700"
          }
        >
          {hasVoted ? "Voted" : "Vote"}
        </Button>
      </CardFooter>
    </Card>
  );
};

interface ProjectsListProps {
  userVotedProjectIds?: number[];
  onVote?: (projectId: number) => void;
}

const ProjectsList = ({
  userVotedProjectIds = [],
  onVote = () => {},
}: ProjectsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await projectApi.getAllProjects();
        setProjects(projectsData || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to load projects");
        console.error(err);
        setLoading(false);
        setProjects([]);
      }
    };

    fetchProjects();
  }, []);

  // Filter projects based on search term
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="w-full bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center py-12">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-green-800">
          Environmental Projects
        </h1>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Tabs
            defaultValue="grid"
            className="w-auto"
            onValueChange={setViewMode}
          >
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md p-8">
          <p className="text-lg text-gray-500">
            {searchTerm
              ? "No projects found matching your search."
              : "No projects available at the moment."}
          </p>
          {!searchTerm && (
            <p className="text-gray-500 text-sm mt-2">
              Check back later for new environmental initiatives.
            </p>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              hasVoted={userVotedProjectIds.includes(project.id)}
              onVote={() => onVote(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {project.description}
                      </p>
                    </div>
                    {project.receivedVotes >= project.requiredVotes && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        Goal Reached
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>
                        {project.receivedVotes} / {project.requiredVotes} votes
                      </span>
                    </div>
                    <Progress
                      value={
                        (project.receivedVotes / project.requiredVotes) * 100
                      }
                      className="h-2"
                    />
                  </div>
                </div>

                <div className="p-6 md:w-48 flex items-center justify-center bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100">
                  <Button
                    onClick={() => onVote(project.id)}
                    disabled={userVotedProjectIds.includes(project.id)}
                    variant={
                      userVotedProjectIds.includes(project.id)
                        ? "outline"
                        : "default"
                    }
                    className={
                      userVotedProjectIds.includes(project.id)
                        ? "w-full"
                        : "w-full bg-green-600 hover:bg-green-700"
                    }
                  >
                    {userVotedProjectIds.includes(project.id)
                      ? "Voted"
                      : "Vote"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
