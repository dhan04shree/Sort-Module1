"use client"

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd"
import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { useTaskStore, type Task } from "@/lib/store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select } from "@/components/ui/select"
import { Trash2 } from "lucide-react"

import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

// Default groups
const GROUPS = {
  status: ["to-do", "in-progress", "review", "completed"],
  priority: ["low", "medium", "high"],
} as const

export default function KanbanView() {
  const tasks = useTaskStore((state) => state.tasks)
  const { updateTask, deleteTask } = useTaskStore()

  const [groupBy, setGroupBy] = useState<"status" | "priority">("status")
  const columns = useMemo(() => GROUPS[groupBy], [groupBy])

  const tasksByGroup = useMemo(() => {
    return columns.reduce((acc, key) => {
      acc[key] = tasks.filter((task) => task[groupBy] === key)
      return acc
    }, {} as Record<string, Task[]>)
  }, [columns, tasks, groupBy])

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result

    if (!destination) return
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return

    const startList = tasksByGroup[source.droppableId]
    const finishList = tasksByGroup[destination.droppableId]

    const draggedTask = startList[source.index]
    const newStart = [...startList]
    newStart.splice(source.index, 1)

    const newFinish = [...finishList]
    newFinish.splice(destination.index, 0, draggedTask)

    const updatedTask = {
      ...draggedTask,
      [groupBy]: destination.droppableId,
    }

    updateTask(updatedTask)
  }

  return (
    <div>
      {/* Group By Dropdown */}
      <div className="fixed top-3 left-250 z-50 p-2 shadow-md">
        <Select value={groupBy} onValueChange={(value) => setGroupBy(value as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="status">Group by Status</SelectItem>
            <SelectItem value="priority">Group by Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {columns.map((col) => (
            <Droppable key={col} droppableId={col}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-[#1f2938c0] p-4 rounded-xl min-h-[300px]"
                >
                  <h2 className="text-lg font-semibold capitalize text-white mb-4">
                    {col.replace("-", " ")}
                  </h2>

                  {(tasksByGroup[col] || []).map((task, index) => (
                    <Draggable draggableId={task.id} index={index} key={task.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-[#3B4F71] text-white mb-4 p-3 shadow rounded-lg"
                        >
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-slate-300 line-clamp-2">
                            {task.description || "No description"}
                          </p>

                          <div className="flex justify-between items-center mt-2">
                            <Badge
                              className={`text-xs ${
                                task.priority === "high"
                                  ? "bg-red-500"
                                  : task.priority === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                            >
                              {task.priority}
                            </Badge>

                            <div className="flex items-center gap-2">
                              {task.assignee && (
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={task.assignee.avatar}
                                    alt={task.assignee.name}
                                  />
                                  <AvatarFallback>
                                    {task.assignee.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-red-400 hover:text-red-600 text-sm ml-1"
                                title="Delete task"
                              >
                               <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
