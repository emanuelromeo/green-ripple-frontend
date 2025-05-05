// API Types for the application

export interface User {
  id: number;
  name: string;
  email: string;
  city: string;
  carType: string;
  greenPoints: number;
  votes: number;
  votedProjects?: Project[];
}

export interface Project {
  id: number;
  name: string;
  description: string;
  requiredVotes: number;
  receivedVotes: number;
}

export interface UserProject {
  id: number;
  userId: number;
  projectId: number;
  votedAt: string;
  project?: Project;
}

export interface Activity {
  id: number;
  userId: number;
  activityType: string;
  description: string;
  points: number;
  timestamp: string;
}

export interface DashboardMetrics {
  totalGreenPoints: number;
  totalVotes: number;
  totalActivities: number;
}
