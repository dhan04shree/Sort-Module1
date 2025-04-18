import { useMemo, useState } from "react"
import {
  Calendar,
  Views,
  dateFnsLocalizer,
  SlotInfo,
  Event as RBCEvent,
} from "react-big-calendar"
import { useTaskStore } from "@/lib/store"
import { format } from "date-fns/format"
import { parse } from "date-fns/parse"
import { startOfWeek } from "date-fns/startOfWeek"
import { getDay } from "date-fns/getDay"
import { enUS } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"

// Localization setup
const locales = {
  "en-US": enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Define event type
interface CalendarEvent extends RBCEvent {
  id: string
  title: string
  start: Date
  end: Date
}

const TaskCalendar = () => {
  const tasks = useTaskStore((state) => state.tasks)
  const createTask = useTaskStore((state) => state.createTask)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    status: "to-do" as "to-do" | "in-progress" | "review" | "completed",
    priority: "low" as "low" | "medium" | "high",
    startDate: new Date(),
    dueDate: new Date(),
    description:""
  })

  // Map tasks from Zustand to Calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return tasks
      .filter((task) => task.startDate && task.dueDate)
      .map((task) => ({
        id: task.id,
        title: task.title,
        start: new Date(task.startDate!),
        end: new Date(task.dueDate!),
      }))
  }, [tasks])

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const clickedDate = slotInfo.start
    const clickedDateStr = clickedDate.toLocaleDateString()

    // Check if there's already a task for the clicked date
    const existingTask = tasks.find(
      (task) => new Date(task.startDate!).toLocaleDateString() === clickedDateStr
    )

    if (!existingTask) {
      // No task exists for this date, open the modal to create a new task
      setNewTaskData((prev) => ({ ...prev, startDate: clickedDate, dueDate: clickedDate }))
      setIsModalOpen(true)
    } else {
      alert(`A task already exists on ${clickedDateStr}.`)
    }
  }

  const handleCreateTask = () => {
    if (!newTaskData.title.trim()) {
      alert("Task title is required!")
      return
    }

    const newTask = {
      id: `task-${new Date().toISOString()}`, // Generate a unique ID
      title: newTaskData.title,
      status: newTaskData.status,
      priority: newTaskData.priority,
      description:newTaskData.description,
      startDate: newTaskData.startDate?.toISOString(),
      dueDate: newTaskData.dueDate?.toISOString(),
      createdAt: new Date().toISOString(),
    }

    createTask(newTask) // Add new task to Zustand store
    setIsModalOpen(false) // Close the modal
    setNewTaskData({
      title: "",
      status: "to-do",
      priority: "low",
      description:"",
      startDate: new Date(),
      dueDate: new Date() 
    }) // Reset form data
  }

  return (
    <div className="p-4">
      <div className="rounded-none overflow-hidden">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          defaultView={Views.MONTH}
          style={{ height: 600 }}
          className="!bg-gray-50 !text-gray-800"
          onSelectEvent={(event) => alert(`Task: ${event.title}`)}
          onSelectSlot={handleSelectSlot}
        />
      </div>

      {/* Modal for creating a task */}
      {isModalOpen && (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-sm">
    <div className="z-50 bg-white border border-gray-200 shadow-xl rounded-xl w-full max-w-md p-6 text-black">
      <h2 className="text-2xl font-semibold mb-4">Create a New Task</h2>

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Task Title
        </label>
        <input
          id="title"
          type="text"
          value={newTaskData.title}
          onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          placeholder="Enter task title"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={newTaskData.description || ""}
          onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          rows={3}
          placeholder="Describe the task..."
        />
      </div>

      {/* Status */}
      <div className="mb-4">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={newTaskData.status}
          onChange={(e) =>
            setNewTaskData({ ...newTaskData, status: e.target.value as Task["status"] })
          }
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
        >
          <option value="to-do">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
      </div>

          {/* Priority */}
          <div className="mb-6">
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              value={newTaskData.priority}
              onChange={(e) =>
                setNewTaskData({ ...newTaskData, priority: e.target.value as Task["priority"] })
              }
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTask}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
  )
}
export default TaskCalendar
