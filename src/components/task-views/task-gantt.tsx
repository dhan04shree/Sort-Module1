import { useEffect, useRef } from "react";
import gantt from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import { useTaskStore } from "@/lib/store";

const TaskGantt = () => {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  // Transform Zustand tasks into Gantt-compatible format
  const transformedTasks = {
    data: tasks.map((task) => ({
      id: task.id,
      text: task.title,
      start_date: task.startDate?.split("T")[0] ?? task.createdAt.split("T")[0],
      duration: task.dueDate
        ? Math.max(
            1,
            Math.ceil(
              (new Date(task.dueDate).getTime() -
                new Date(task.startDate ?? task.createdAt).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : 1,
      progress:
        task.subtasks && task.subtasks.length > 0
          ? task.subtasks.filter((s) => s.completed).length / task.subtasks.length
          : 0,
    })),
    links:
      tasks.flatMap((task) =>
        task.dependencies?.map((depId, index) => ({
          id: `${task.id}-${index}`,
          source: depId,
          target: task.id,
          type: "0",
        })) ?? []
      ),
  };

  useEffect(() => {
    if (ganttContainer.current) {
      gantt.config.xml_date = "%Y-%m-%d";
      gantt.config.readonly = false;
      gantt.config.editable = true;
      gantt.config.columns = [
        { name: "text", label: "Task name", tree: true, width: "*" },
      ];

      // Init and parse data
      gantt.init(ganttContainer.current);
      gantt.parse(transformedTasks);

      // Event: Sync updates from Gantt to Zustand
      gantt.attachEvent("onAfterTaskUpdate", (id: string, task: any) => {
        console.log("Gantt updated task:", task);

        const updatedTask = {
          id,
          title: task.text,
          startDate: new Date(task.start_date).toISOString(),
          dueDate: new Date(
            new Date(task.start_date).getTime() + task.duration * 86400000
          ).toISOString(),
        };

        updateTask(updatedTask); // Passing the updated task object
      });

      // Event: Sync deletions
      gantt.attachEvent("onAfterTaskDelete", (id: string) => {
        deleteTask(id);
      });
    }

    return () => {
      gantt.clearAll();
    };
  }, [tasks]);

  return (
    <div className="p-4">
      <div
        ref={ganttContainer}
        style={{ width: "100%", height: "500px", backgroundColor: "#f9fafb" }}
        className="rounded-lg shadow"
      />
    </div>
  );
};

export default TaskGantt;
