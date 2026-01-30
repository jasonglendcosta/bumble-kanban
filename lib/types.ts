export type Priority = "low" | "medium" | "high" | "critical";
export type AgentStatus = "running" | "done" | "failed";
export type Assignee = "Bumble" | "Optimus";

export interface TimeTracking {
  isRunning: boolean;
  startedAt?: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface CardItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: Priority;
  tags: string[];
  dueDate?: string;
  timeTrackedMinutes: number;
  timeTracking?: TimeTracking;
  assignee: Assignee;
  subtasks: Subtask[];
}

export interface Column {
  id: string;
  title: string;
  cards: CardItem[];
}

export interface BoardData {
  columns: Column[];
  lastUpdated: string;
  meta: {
    version: number;
  };
}

export interface Filters {
  tag: string;
  priority: Priority | "all";
  assignee: Assignee | "all";
}
