import { create } from "zustand"

export interface Subtask {
  title: string
  completed: boolean
}

export interface Assignee {
  id: string
  name: string
  avatar?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: "to-do" | "in-progress" | "review" | "completed"
  priority: "low" | "medium" | "high"
  dueDate?: string
  startDate?: string
  createdAt: string
  updatedAt?: string
  assignee?: Assignee | null
  subtasks?: Subtask[]
  dependencies?: string[]
  project?: string
}

interface TaskState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  createTask: (task: Task) => Promise<void>
  updateTask: (task: Task) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

// Mock API endpoint
const API_URL = "/api/tasks"

// Mock data for initial development
const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Design new dashboard layout",
    description: "Create wireframes and mockups for the new admin dashboard",
    status: "completed",
    priority: "high",
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    startDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    assignee: {
      id: "user-1",
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    subtasks: [
      { title: "Research competitor dashboards", completed: true },
      { title: "Create wireframes", completed: true },
      { title: "Design UI components", completed: true },
    ],
    project: "Website Redesign",
  },
  {
    id: "task-2",
    title: "Implement authentication flow",
    description: "Set up user authentication with JWT and refresh tokens",
    status: "in-progress",
    priority: "high",
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    startDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    assignee: {
      id: "user-2",
      name: "Sam Taylor",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    subtasks: [
      { title: "Set up JWT authentication", completed: true },
      { title: "Implement refresh token logic", completed: false },
      { title: "Add password reset functionality", completed: false },
    ],
    dependencies: ["task-5"],
    project: "Authentication System",
  },
 
]

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      // const response = await axios.get(API_URL)
      // set({ tasks: response.data, isLoading: false })

      // Using mock data for now
      setTimeout(() => {
        set({ tasks: mockTasks, isLoading: false })
      }, 800)
    } catch (error) {
      set({ error: "Failed to fetch tasks", isLoading: false })
    }
  },

  createTask: async (task: Task) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      // const response = await axios.post(API_URL, task)
      // set(state => ({ tasks: [...state.tasks, response.data], isLoading: false }))

      // Using mock data for now
      setTimeout(() => {
        set((state) => ({ tasks: [...state.tasks, task], isLoading: false }))
      }, 500)
    } catch (error) {
      set({ error: "Failed to create task", isLoading: false })
    }
  },

  updateTask: async (task: Task) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      // const response = await axios.put(`${API_URL}/${task.id}`, task)
      // set(state => ({
      //   tasks: state.tasks.map(t => t.id === task.id ? response.data : t),
      //   isLoading: false
      // }))

      // Using mock data for now
      setTimeout(() => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
          isLoading: false,
        }))
      }, 500)
    } catch (error) {
      set({ error: "Failed to update task", isLoading: false })
    }
  },

  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      // await axios.delete(`${API_URL}/${id}`)
      // set(state => ({
      //   tasks: state.tasks.filter(t => t.id !== id),
      //   isLoading: false
      // }))

      // Using mock data for now
      setTimeout(() => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          isLoading: false,
        }))
      }, 500)
    } catch (error) {
      set({ error: "Failed to delete task", isLoading: false })
    }
  },
}))
