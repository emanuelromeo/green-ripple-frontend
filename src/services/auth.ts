// Authentication service for handling JWT tokens and user authentication

import { User } from "../types/api";

const API_BASE_URL = "http://localhost:8080";

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expirationTime: number;
}

// Token storage keys
const TOKEN_KEY = "auth_token";
const USER_KEY = "current_user";
const TOKEN_EXPIRY_KEY = "token_expiry";

// Mock user data for development without backend
const MOCK_USER: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  city: "New York",
  carType: "ELECTRIC",
  greenPoints: 120,
  votes: 5,
};

// Mock token expiration (24 hours from now)
const MOCK_TOKEN_EXPIRY = Date.now() + 24 * 60 * 60 * 1000;

export const authService = {
  // Login user and store token
  login: async (credentials: LoginUserDto): Promise<User> => {
    try {
      // Real API call for production
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data: LoginResponse = await response.json();

      // Store token and expiration
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(TOKEN_EXPIRY_KEY, String(data.expirationTime));

      // Get user details using the token
      const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user details");
      }

      const user: User = await userResponse.json();
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Register a new user
  register: async (userData: RegisterUserDto): Promise<User> => {
    try {
      // Real API call for production
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Logout user and clear storage
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },

  // Get current token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiryTime) {
      return false;
    }

    // Check if token is expired
    const now = Date.now();
    const expiry = parseInt(expiryTime, 10);

    return now < expiry;
  },
};
