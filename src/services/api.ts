// API service for making requests to the backend

const API_BASE_URL = "http://localhost:8080";

// User related API calls
export const userApi = {
  // Get user by ID
  getUserById: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/get-by-id/${id}`);
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
      const response = await fetch(
        `${API_BASE_URL}/users/get-by-email/${email}`,
      );
      if (!response.ok) throw new Error("Failed to fetch user");
      return await response.json();
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  },

  // Login user
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        {
          method: "POST",
        },
      );
      if (!response.ok) throw new Error("Invalid credentials");
      return await response.json();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id: number, userData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
      const response = await fetch(
        `${API_BASE_URL}/users/update-car-type/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
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
      const response = await fetch(
        `${API_BASE_URL}/users/activity-history/${userId}`,
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
      const response = await fetch(`${API_BASE_URL}/users/dashboard/${userId}`);
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
      const response = await fetch(`${API_BASE_URL}/projects/get-all`);
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
      const response = await fetch(`${API_BASE_URL}/projects/get-by-id/${id}`);
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
      const response = await fetch(`${API_BASE_URL}/projects/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      const response = await fetch(`${API_BASE_URL}/projects/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
      const response = await fetch(`${API_BASE_URL}/projects/delete/${id}`, {
        method: "DELETE",
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
      const response = await fetch(
        `${API_BASE_URL}/user-projects/vote?userId=${userId}&rewardId=${projectId}`,
        {
          method: "POST",
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
      const response = await fetch(`${API_BASE_URL}/user-projects/${userId}`);
      if (response.status === 204) return []; // No content
      if (!response.ok) throw new Error("Failed to fetch user projects");
      return await response.json();
    } catch (error) {
      console.error("Error fetching user projects:", error);
      throw error;
    }
  },
};
