"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, CheckSquare, Square, ChevronDown, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import "../../index.css"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { type Task, useTaskStore } from "@/lib/store"
import TaskModal from "../../components/task-model"


export default function TaskList() {
  const tasks = useTaskStore((state) => state.tasks)
  const { updateTask, deleteTask } = useTaskStore()
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  const handleStatusChange = (task: Task, completed: boolean) => {
    updateTask({
      ...task,
      status: completed ? "completed" : "in-progress",
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-[#E9C46A] text-[#283953]"
      case "low":
        return "bg-[#2A9D8F] text-white"
      default:
        return "bg-slate-400 text-white"
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="py-3 px-4 text-slate-300 font-medium">Status</th>
            <th className="py-3 px-4 text-slate-300 font-medium">Task</th>
            <th className="py-3 px-4 text-slate-300 font-medium">Priority</th>
            <th className="py-3 px-4 text-slate-300 font-medium">Assignee</th>
            <th className="py-3 px-4 text-slate-300 font-medium">Due Date</th>
            <th className="py-3 px-4 text-slate-300 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <>
              <tr key={task.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="py-3 px-4">
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={(checked) => handleStatusChange(task, checked as boolean)}
                    className="border-[#F4A261] text-[#F4A261]"
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 mr-2 text-slate-300 hover:text-white"
                      onClick={() => toggleTaskExpansion(task.id)}
                    >
                      {expandedTasks[task.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </Button>
                    <span className={`text-white ${task.status === "completed" ? "line-through opacity-70" : ""}`}>
                      {task.title}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge className={`${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={task.assignee?.avatar} alt={task.assignee?.name} />
                    <AvatarFallback className="bg-[#2A9D8F] text-white">
                      {task.assignee?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "-"}
                </td>
                <td className="py-3 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4 text-slate-300" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#283953] border-white/10">
                      <DropdownMenuItem
                        className="text-slate-300 hover:text-white focus:text-white cursor-pointer"
                        onClick={() => setEditTask(task)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-400 hover:text-red-300 focus:text-red-300 cursor-pointer"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
              {expandedTasks[task.id] && (
                <tr className="bg-white/5">
                  <td colSpan={6} className="py-3 px-4 pl-12">
                    <div className="text-slate-300 mb-3">
                      <p className="mb-2">{task.description || "No description provided."}</p>

                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-white font-medium mb-2">Subtasks</h4>
                          <ul className="space-y-2">
                            {task.subtasks.map((subtask, index) => (
                              <li key={index} className="flex items-center">
                                {subtask.completed ? (
                                  <CheckSquare size={16} className="mr-2 text-[#2A9D8F]" />
                                ) : (
                                  <Square size={16} className="mr-2 text-slate-400" />
                                )}
                                <span className={subtask.completed ? "line-through opacity-70" : ""}>
                                  {subtask.title}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-300">
                No tasks found. Create a new task to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {editTask && <TaskModal isOpen={!!editTask} onClose={() => setEditTask(null)} mode="edit" task={editTask} />}
    </div>
  )
}
