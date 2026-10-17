import type { Metadata } from "next";
import { tasks, team } from "@/lib/data";
import { KanbanBoard } from "@/components/tasks/kanban-board";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return <KanbanBoard initial={tasks} assignees={team.slice(0, 5).map((m) => m.name)} />;
}
