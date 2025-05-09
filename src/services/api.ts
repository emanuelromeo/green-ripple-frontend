// API service for making requests to the backend
import { authService } from "./auth";
import { Project, User, UserProject, Activity } from "../types/api";

const API_BASE_URL = "http://localhost:8080";

// Mock data for development without backend
const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    name: "Urban Tree Planting Initiative",
    description:
      "Planting trees in urban areas to improve air quality and provide shade.",
    requiredVotes: 100,
    receivedVotes: 45,
  },
  {
    id: 2,
    name: "Community Solar Power",
    description:
      "Installing solar panels in community spaces to reduce carbon footprint.",
    requiredVotes: 150,
    receivedVotes: 120,
  },
  {
    id: 3,
    name: "Plastic-Free Waterways",
    description: "Cleaning up rivers and streams from plastic pollution.",
    requiredVotes: 80,
    receivedVotes: 35,
  },
  {
    id: 4,
    name: "Sustainable Urban Garden",
    description:
      "Creating community gardens in urban areas to promote sustainable food production.",
    requiredVotes: 120,
    receivedVotes: 90,
  },
];

const MOCK_USER_PROJECTS: UserProject[] = [
  {
    id: 1,
    userId: 1,
    projectId: 2,
    votedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    project: MOCK_PROJECTS[1],
  },
];

// Helper function to add authorization header
const getAuthHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// User related API calls
export const userApi = {
  // Get user by ID
  getUserById: async (id: number) => {
    try {
      // For development without backend
      if (
        process.env.NODE_ENV === "development" ||
        !API_BASE_URL.includes("localhost")
      ) {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.id === id) {
          return currentUser;
        }
        return {
          id: id,
          name: "Demo User",
          email: "demo@example.com",
          city: "Green City",
          carType: "HYBRID",
          greenPoints: 75,
          votes: 1,
        };
      }

      const response = await fetch(`${API_BASE_URL}/users/get-by-id/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch user");
      return await response.json();
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  // Get user by email
  getUserByEmail: async (email: string) => {
    try {
      // For development without backend
      if (
        process.env.NODE_ENV === "development" ||
        !API_BASE_URL.includes("localhost")
      ) {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.email === email) {
          return currentUser;
        }
        return null;
      }

      const response = await fetch(
        `${API_BASE_URL}/users/get-by-email/${email}`,
        {
          headers: getAuthHeaders(),
        },
      );
      if (!response.ok) throw new Error("Failed to fetch user");
      return await response.json();
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id: number, userData: any) => {
    try {
      // For development without backend
      if (
        process.env.NODE_ENV === "development" ||
        !API_BASE_URL.includes("localhost")
      ) {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.id === id) {
          const updatedUser = { ...currentUser, ...userData };
          localStorage.setItem("current_user", JSON.stringify(updatedUser));
          return updatedUser;
        }
        throw new Error("User not found");
      }

      const response = await fetch(`${API_BASE_URL}/users/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Failed to update user");
      return await response.json();
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // Update car type
  updateCarType: async (id: number, carType: string) => {
    try {
      // For development without backend
      if (
        process.env.NODE_ENV === "development" ||
        !API_BASE_URL.includes("localhost")
      ) {
        return userApi.updateUser(id, { carType });
      }

      const response = await fetch(
        `${API_BASE_URL}/users/update-car-type/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ carType }),
        },
      );
      if (!response.ok) throw new Error("Failed to update car type");
      return await response.json();
    } catch (error) {
      console.error("Error updating car type:", error);
      throw error;
    }
  },

  // Get user activity history
  getUserActivityHistory: async (userId: number) => {
    try {
      // For development without backend
      if (
        process.env.NODE_ENV === "development" ||
        !API_BASE_URL.includes("localhost")
      ) {
        return [
          {
            id: 1,
            userId: userId,
            activityType: "VOTE",
            description: "Voted for Community Solar Power project",
            points: 10,
            timestamp: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
          {
            id: 2,
            userId: userId,
            activityType: "ECO_ACTION",
            description: "Used public transportation",
            points: 5,
            timestamp: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
        ];
      }

      const response = await fetch(
        `${API_BASE_URL}/users/activity-history/${userId}`,
        {
          headers: getAuthHeaders(),
        },
      );
      if (!response.ok) throw new Error("Failed to fetch activity history");
      return await response.json();
    } catch (error) {
      console.error("Error fetching activity history:", error);
      throw error;
    }
  },

  // Get dashboard metrics
  getDashboardMetrics: async (userId: number) => {
    try {
      // For development without backend
      if (
        process.env.NODE_ENV === "development" ||
        !API_BASE_URL.includes("localhost")
      ) {
        const currentUser = authService.getCurrentUser() || {
          greenPoints: 0,
          votes: 0,
        };
        return {
          totalGreenPoints: currentUser.greenPoints,
          totalVotes: currentUser.votes,
          totalActivities: currentUser.votes + 1, // Votes plus other activities
        };
      }

      const response = await fetch(
        `${API_BASE_URL}/users/dashboard/${userId}`,
        {
          headers: getAuthHeaders(),
        },
      );
      if (!response.ok) throw new Error("Failed to fetch dashboard metrics");
      return await response.json();
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      throw error;
    }
  },
};

// Project related API calls
export const projectApi = {
  // Get all projects
  getAllProjects: async () => {
    try {
      // For development without backend
      if (
        process.env.NODE_ENV === "development" ||
        !API_BASE_URL.includes("localhost")
      ) {
        return MOCK_PROJECTS;
      }

      const response = await fetch(`${API_BASE_URL}/projects/get-all`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      return await response.json();
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  },

  // Get project by ID
  getProjectById: async (id: number) => {
    try {
      // For development without backend
      if (
        process.env.NODE_ENV === "development" ||
        !API_BASE_URL.includes("localhost")
      ) {
        const project = MOCK_PROJECTS.find((p) => p.id === id);
        if (project) return project;
        throw new Error("Project not found");
      }

      const response = await fetch(`${API_BASE_URL}/projects/get-by-id/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch project");
      return await response.json();
    } catch (error) {
      console.error("Error fetching project:", error);
      throw error;
    }
  },

  // Create a new project
  createProject: async (projectData: Omit<Project, "id" | "receivedVotes">) => {
    try {
      // For development without backend
      if (
        process.env.NODE_ENV === "development" ||
        !API_BASE_URL.includes("localhost")
      ) {
        const newProject = {
          id: MOCK_PROJECTS.length + 1,
          ...projectData,
          receivedVotes: 0,
        };
        MOCK_PROJECTS.push(newProject);
        return newProject;
      }

      const response = await fetch(`${API_BASE_URL}/projects/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) throw new Error("Failed to create project");
      return await response.json();
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },

  // Update an existing project
  updateProject: async (id: number, projectData: Partial<Project>) => {
    try {
      // For development without backend
      if (
        process.env.NODE_ENV === "development" ||
        !API_BASE_URL.includes("localhost")
      ) {
        const index = MOCK_PROJECTS.findIndex((p) => p.id === id);
        if (index === -1) throw new Error("Project not found");

        MOCK_PROJECTS[index] = {
          ...MOCK_PROJECTS[index],
          ...projectData,
        };
        return MOCK_PROJECTS[index];
      }

      const response = await fetch(`${API_BASE_URL}/projects/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) throw new Error("Failed to update project");
      return await response.json();
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  },

  // Delete a project
  deleteProject: async (id: number) => {
    try {
      // For development without backend
      if (
        process.env.NODE_ENV === "development" ||
        !API_BASE_URL.includes("localhost")
      ) {
        const index = MOCK_PROJECTS.findIndex((p) => p.id === id);
        if (index === -1) throw new Error("Project not found");

        const deletedProject = MOCK_PROJECTS[index];
        MOCK_PROJECTS.splice(index, 1);
        return deletedProject;
      }

      const response = await fetch(`${API_BASE_URL}/projects/delete/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete project");
      return await response.json();
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  },
};

// User-Project related API calls
export const userProjectApi = {
  // Vote for a project
  voteProject: async (userId: number, projectId: number) => {
    try {
      // For development without backend
      if (
        process.env.NODE_ENV === "development" ||
        !API_BASE_URL.includes("localhost")
      ) {
        // Check if user has already voted for this project
        if (
          MOCK_USER_PROJECTS.some(
            (up) => up.userId === userId && up.projectId === projectId,
          )
        ) {
          throw new Error("You have already voted for this project");
        }

        // Find the project
        const projectIndex = MOCK_PROJECTS.findIndex((p) => p.id === projectId);
        if (projectIndex === -1) throw new Error("Project not found");

        // Increment vote count
        MOCK_PROJECTS[projectIndex].receivedVotes += 1;

        // Add to user's voted projects
        const newVote = {
          id: MOCK_USER_PROJECTS.length + 1,
          userId,
          projectId,
          votedAt: new Date().toISOString(),
          project: MOCK_PROJECTS[projectIndex],
        };
        MOCK_USER_PROJECTS.push(newVote);

        // Update user's vote count and green points
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            votes: (currentUser.votes || 0) + 1,
            greenPoints: (currentUser.greenPoints || 0) + 10,
          };
          localStorage.setItem("current_user", JSON.stringify(updatedUser));
        }

        return newVote;
      }

      const response = await fetch(
        `${API_BASE_URL}/user-projects/vote?userId=${userId}&rewardId=${projectId}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to vote for project");
      }
      return await response.json();
    } catch (error) {
      console.error("Error voting for project:", error);
      throw error;
    }
  },

  // Get user's voted projects
  getUserProjects: async (userId: number) => {
    try {
      // For development without backend
      if (
        process.env.NODE_ENV === "development" ||
        !API_BASE_URL.includes("localhost")
      ) {
        return MOCK_USER_PROJECTS.filter((up) => up.userId === userId);
      }

      const response = await fetch(`${API_BASE_URL}/user-projects/${userId}`, {
        headers: getAuthHeaders(),
      });
      if (response.status === 204) return []; // No content
      if (!response.ok) throw new Error("Failed to fetch user projects");
      return await response.json();
    } catch (error) {
      console.error("Error fetching user projects:", error);
      throw error;
    }
  },
};
