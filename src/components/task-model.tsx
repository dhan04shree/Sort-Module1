"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { type Task, useTaskStore } from "@/lib/store"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "create" | "edit" | "view"
  task?: Task
}

const initialTaskData: Partial<Task> = {
  title: "",
  description: "",
  status: "to-do",
  priority: "medium",
  dueDate: "",
  startDate: "",
  assignee: null,
  subtasks: [],
  dependencies: [],
}

export default function TaskModal({
  isOpen,
  onClose,
  mode,
  task,
}: TaskModalProps) {
  const { createTask, updateTask } = useTaskStore()
  const [formData, setFormData] = useState<Partial<Task>>(initialTaskData)  
  const [newSubtask, setNewSubtask] = useState("")
  const isViewOnly = mode === "view"

  useEffect(() => {
    if (task && (mode === "edit" || mode === "view")) {
      setFormData({ ...task })
    } else {
      setFormData(initialTaskData)
    }
  }, [task, mode])

  const updateForm = (name: keyof Task, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      updateForm("subtasks", [
        ...(formData.subtasks || []),
        { title: newSubtask, completed: false },
      ])
      setNewSubtask("")
    }
  }

  const handleToggleSubtask = (index: number) => {
    const updated = [...(formData.subtasks || [])]
    updated[index].completed = !updated[index].completed
    updateForm("subtasks", updated)
  }

  const handleRemoveSubtask = (index: number) => {
    const updated = [...(formData.subtasks || [])]
    updated.splice(index, 1)
    updateForm("subtasks", updated)
  }

  const handleSubmit = () => {
    if (!formData.title) return

    const timestamp = new Date().toISOString()

    if (mode === "create") {
      createTask({
        ...(formData as Task),
        id: `task-${Date.now()}`,
        createdAt: timestamp,
      })
    } else if (mode === "edit" && task) {
      updateTask({
        ...task,
        ...(formData as Task),
        updatedAt: timestamp,
      })
    }

    onClose()
  }

  const SubtaskItem = ({ subtask, index }: { subtask: any; index: number }) => (
    <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-md">
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
  )
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#283953] text-white border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {mode === "create"
              ? "Create New Task"
              : mode === "edit"
              ? "Edit Task"
              : "Task Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right text-slate-300">Title</label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) => updateForm("title", e.target.value)}
              className="col-span-3 bg-white/5 border-white/10 text-white"
              disabled={isViewOnly}
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right text-slate-300">Description</label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => updateForm("description", e.target.value)}
              className="col-span-3 bg-white/5 border-white/10 text-white min-h-[100px]"
              disabled={isViewOnly}
              placeholder="Task description"
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-slate-300">Status</label>
            <div className="col-span-3">
              <Select
                value={formData.status}
                onValueChange={(value) => updateForm("status", value)}
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

          {/* Priority */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-slate-300">Priority</label>
            <div className="col-span-3">
              <Select
                value={formData.priority}
                onValueChange={(value) => updateForm("priority", value)}
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

          {/* Dates */}

        {["startDate", "dueDate"].map((field) => (
       <div key={field} className="grid grid-cols-4 items-center gap-4">
          <label className="text-right text-slate-300">
          {field === "startDate" ? "Start Date" : "Due Date"}
          </label>
          <div className="col-span-3">
          <Popover>
          <PopoverTrigger asChild>
            <div
            className={`w-full px-3 py-2 rounded-md border text-left text-sm cursor-pointer bg-white/5 border-white/10 text-white ${
              !formData[field] && "text-slate-400"
            }`}
            > {formData[field]
              ? format(new Date(formData[field]!), "PPP")
              : `Select ${field === "startDate" ? "start" : "due"} date`}
          </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#283953] border-white/10">
          <Calendar
          mode="single"
          selected={formData[field] ? new Date(formData[field]!) : undefined}
          onSelect={(date) => {
            if (date) {
              updateForm(field as "startDate" | "dueDate", date.toISOString())
            }
          }}
        initialFocus
        />
        </PopoverContent>
        </Popover>
        </div>
        </div>
        ))}
          {/* Subtasks */}
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

              {(formData.subtasks?.length ?? 0) > 0 ? (
                <div className="space-y-2 mt-2">
                  {formData.subtasks!.map((subtask, index) => (
                    <SubtaskItem key={index} subtask={subtask} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-sm">No subtasks added</div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/10 text-white hover:bg-white/10"
          >
            {isViewOnly ? "Close" : "Cancel"}
          </Button>
          {!isViewOnly && (
            <Button
              onClick={handleSubmit}
              className="bg-[#F4A261] hover:bg-[#F4A261]/90 text-[#283953]"
            >
              {mode === "create" ? "Create Task" : "Save Changes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
