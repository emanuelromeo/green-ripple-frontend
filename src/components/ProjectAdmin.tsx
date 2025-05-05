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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { projectApi } from "../services/api";
import { Project } from "../types/api";
import ProjectCard from "./ProjectCard";

const ProjectAdmin = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form state for creating a new project
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    requiredVotes: 100,
  });

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await projectApi.getAllProjects();
      setProjects(projectsData);
      setError(null);
    } catch (err) {
      setError("Failed to load projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle creating a new project
  const handleCreateProject = async () => {
    try {
      if (
        !newProject.name ||
        !newProject.description ||
        newProject.requiredVotes <= 0
      ) {
        setNotification({
          message: "Please fill all fields correctly",
          type: "error",
        });
        return;
      }

      await projectApi.createProject({
        name: newProject.name,
        description: newProject.description,
        requiredVotes: newProject.requiredVotes,
      });

      // Reset form and close dialog
      setNewProject({
        name: "",
        description: "",
        requiredVotes: 100,
      });
      setIsCreateDialogOpen(false);

      // Show success notification
      setNotification({
        message: "Project created successfully!",
        type: "success",
      });

      // Refresh projects list
      fetchProjects();
    } catch (err: any) {
      setNotification({
        message: err.message || "Failed to create project",
        type: "error",
      });
    }
  };

  // Handle updating a project
  const handleUpdateProject = async (
    projectId: number,
    updatedData: { name: string; description: string; requiredVotes: number },
  ) => {
    try {
      await projectApi.updateProject(projectId, updatedData);

      // Show success notification
      setNotification({
        message: "Project updated successfully!",
        type: "success",
      });

      // Refresh projects list
      fetchProjects();
    } catch (err: any) {
      setNotification({
        message: err.message || "Failed to update project",
        type: "error",
      });
    }
  };

  // Handle deleting a project
  const handleDeleteProject = async (projectId: number) => {
    try {
      await projectApi.deleteProject(projectId);

      // Show success notification
      setNotification({
        message: "Project deleted successfully!",
        type: "success",
      });

      // Refresh projects list
      fetchProjects();
    } catch (err: any) {
      setNotification({
        message: err.message || "Failed to delete project",
        type: "error",
      });
    }
  };

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      {/* Header with search and create button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-green-800">
          Project Management
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

          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-md ${notification.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {notification.message}
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">
            {searchTerm
              ? "No projects found matching your search."
              : "No projects available. Create your first project!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description}
              requiredVotes={project.requiredVotes}
              receivedVotes={project.receivedVotes}
              hasVoted={false}
              onVote={() => {}}
              onUpdate={handleUpdateProject}
              onDelete={handleDeleteProject}
              isAdmin={true}
            />
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new environmental project for users to vote on.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                className="col-span-3"
                placeholder="Urban Tree Planting Initiative"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                className="col-span-3"
                placeholder="Describe the project and its environmental impact..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requiredVotes" className="text-right">
                Required Votes
              </Label>
              <Input
                id="requiredVotes"
                type="number"
                value={newProject.requiredVotes}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    requiredVotes: Number(e.target.value),
                  })
                }
                className="col-span-3"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectAdmin;
