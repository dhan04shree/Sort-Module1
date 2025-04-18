"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TaskList from "../components/task-views/task-list"
import TaskKanban from "../components/task-views/task-kanban"
import TaskCalendar from "../components/task-views/task-calender"
import TaskGantt from "../components/task-views/task-gantt"
import TaskModal from "../components/task-model"
import { useTaskStore } from "@/lib/store"

export default function TaskDashboard() {
  const { tasks, fetchTasks, isLoading } = useTaskStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeView, setActiveView] = useState("list")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      fetchTasks()
    } catch (err) {
      setError("Failed to fetch tasks. Please try again.")
    }
  }, [fetchTasks])

  const handleCreateTask = () => {
    setIsCreateModalOpen(true)
  }

  // Add this function to safely render views with error handling
  const renderView = (viewName: string, Component: React.ComponentType<any>) => {
    try {
      return <Component tasks={tasks} />
    } catch (err) {
      console.error(`Error rendering ${viewName} view:`, err)
      return (
        <div className="p-6 bg-white/5 rounded-lg text-center">
          <p className="text-red-400">There was an error displaying this view. Please try another view.</p>
        </div>
      )
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Task Management</h1>
          <p className="text-slate-300 mt-1">Manage your tasks and projects efficiently</p>
        </div>
        <Button onClick={handleCreateTask} className="bg-[#F4A261] hover:bg-[#F4A261]/90 text-[#283953]">
          Create New Task
        </Button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-white">{error}</div>}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 md:p-6 shadow-lg border border-white/10">

      <Tabs defaultValue="list" value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid grid-cols-4 gap-x-10 mb-6">
      <TabsTrigger
        value="list"
        className="cursor-pointer text-slate-300 py-1 font-medium transition-all border-0 data-[state=active]:border-[#2A9D8F] data-[state=active]:border-b-2 rounded-none"
      >
        List View
      </TabsTrigger>
      <TabsTrigger
        value="kanban"
        className="cursor-pointer text-slate-300  py-1 font-medium transition-all border-0 data-[state=active]:border-[#2A9D8F] data-[state=active]:border-b-2 rounded-none"
      >
        Kanban Board
      </TabsTrigger>
      <TabsTrigger
        value="calendar"
        className="cursor-pointer text-slate-300 py-1 font-medium transition-all border-0 data-[state=active]:border-[#2A9D8F] data-[state=active]:border-b-2 rounded-none"
      >
        Calendar
      </TabsTrigger>
      <TabsTrigger
        value="gantt"
        className="cursor-pointer text-slate-300 py-1 font-medium transition-all border-0 data-[state=active]:border-[#2A9D8F] data-[state=active]:border-b-2 rounded-none"
      >
        Gantt Chart
      </TabsTrigger>
    </TabsList>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-[#2A9D8F] animate-spin" />
            </div>
          ) : (
            <>
              <TabsContent value="list">{renderView("List", TaskList)}</TabsContent>
              <TabsContent value="kanban">{renderView("Kanban", TaskKanban)}</TabsContent>
              <TabsContent value="calendar">{renderView("Calendar", TaskCalendar)}</TabsContent>
              <TabsContent value="gantt">{renderView("Gantt", TaskGantt)}</TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <TaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} mode="create" />
    </div>
  )
}
