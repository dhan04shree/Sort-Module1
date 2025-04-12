"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { type Task, useTaskStore } from "@/lib/store"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "create" | "edit" | "view"
  task?: Task
}

export default function TaskModal({ isOpen, onClose, mode, task }: TaskModalProps) {
  const { createTask, updateTask } = useTaskStore()
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "to-do",
    priority: "medium",
    dueDate: "",
    startDate: "",
    assignee: null,
    subtasks: [],
    dependencies: [],
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarType, setCalendarType] = useState<"start" | "due">("due")
  const [newSubtask, setNewSubtask] = useState("")

  useEffect(() => {
    if (task && (mode === "edit" || mode === "view")) {
      setFormData({
        ...task,
      })
    } else {
      // Reset form for create mode
      setFormData({
        title: "",
        description: "",
        status: "to-do",
        priority: "medium",
        dueDate: "",
        startDate: "",
        assignee: null,
        subtasks: [],
        dependencies: [],
      })
    }
  }, [task, mode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        [calendarType === "due" ? "dueDate" : "startDate"]: date.toISOString(),
      }))
    }
    setIsCalendarOpen(false)
  }

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setFormData((prev) => ({
        ...prev,
        subtasks: [...(prev.subtasks || []), { title: newSubtask, completed: false }],
      }))
      setNewSubtask("")
    }
  }

  const handleToggleSubtask = (index: number) => {
    const updatedSubtasks = [...(formData.subtasks || [])]
    updatedSubtasks[index].completed = !updatedSubtasks[index].completed

    setFormData((prev) => ({
      ...prev,
      subtasks: updatedSubtasks,
    }))
  }

  const handleRemoveSubtask = (index: number) => {
    const updatedSubtasks = [...(formData.subtasks || [])]
    updatedSubtasks.splice(index, 1)

    setFormData((prev) => ({
      ...prev,
      subtasks: updatedSubtasks,
    }))
  }

  const handleSubmit = () => {
    if (!formData.title) return

    if (mode === "create") {
      createTask({
        ...formData,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as Task)
    } else if (mode === "edit" && task) {
      updateTask({
        ...task,
        ...formData,
        updatedAt: new Date().toISOString(),
      } as Task)
    }

    onClose()
  }

  const isViewOnly = mode === "view"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#283953] text-white border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {mode === "create" ? "Create New Task" : mode === "edit" ? "Edit Task" : "Task Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right text-slate-300">
              Title
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="col-span-3 bg-white/5 border-white/10 text-white"
              disabled={isViewOnly}
              placeholder="Task title"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right text-slate-300">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="col-span-3 bg-white/5 border-white/10 text-white min-h-[100px]"
              disabled={isViewOnly}
              placeholder="Task description"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="status" className="text-right text-slate-300">
              Status
            </label>
            <div className="col-span-3">
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
                disabled={isViewOnly}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#283953] border-white/10">
                  <SelectItem value="to-do">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="priority" className="text-right text-slate-300">
              Priority
            </label>
            <div className="col-span-3">
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
                disabled={isViewOnly}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-[#283953] border-white/10">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-slate-300">Start Date</label>
            <div className="col-span-3">
              <Popover
                open={isCalendarOpen && calendarType === "start"}
                onOpenChange={(open) => {
                  if (open) {
                    setCalendarType("start")
                  }
                  setIsCalendarOpen(open)
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white ${!formData.startDate && "text-slate-400"}`}
                    disabled={isViewOnly}
                  >
                    {formData.startDate ? format(new Date(formData.startDate), "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#283953] border-white/10">
                  <Calendar
                    mode="single"
                    selected={formData.startDate ? new Date(formData.startDate) : undefined}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-slate-300">Due Date</label>
            <div className="col-span-3">
              <Popover
                open={isCalendarOpen && calendarType === "due"}
                onOpenChange={(open) => {
                  if (open) {
                    setCalendarType("due")
                  }
                  setIsCalendarOpen(open)
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white ${!formData.dueDate && "text-slate-400"}`}
                    disabled={isViewOnly}
                  >
                    {formData.dueDate ? format(new Date(formData.dueDate), "PPP") : "Select due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#283953] border-white/10">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <label className="text-right text-slate-300 pt-2">Subtasks</label>
            <div className="col-span-3 space-y-2">
              {!isViewOnly && (
                <div className="flex space-x-2">
                  <Input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Add a subtask"
                  />
                  <Button
                    onClick={handleAddSubtask}
                    variant="outline"
                    size="icon"
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {formData.subtasks && formData.subtasks.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {formData.subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-white/5 p-2 rounded-md">
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => handleToggleSubtask(index)}
                        disabled={isViewOnly}
                        className="border-[#F4A261] text-[#F4A261]"
                      />
                      <span className={`flex-1 text-sm ${subtask.completed ? "line-through opacity-70" : ""}`}>
                        {subtask.title}
                      </span>
                      {!isViewOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSubtask(index)}
                          className="h-6 w-6 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-sm">No subtasks added</div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/10 text-white hover:bg-white/10">
            {isViewOnly ? "Close" : "Cancel"}
          </Button>
          {!isViewOnly && (
            <Button onClick={handleSubmit} className="bg-[#F4A261] hover:bg-[#F4A261]/90 text-[#283953]">
              {mode === "create" ? "Create Task" : "Save Changes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
