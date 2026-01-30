"use client";

import { useEffect, useMemo, useState } from "react";
import { CardItem, Column, Priority } from "@/lib/types";

interface NewCardModalProps {
  isOpen: boolean;
  columns: Column[];
  initialColumnId?: string;
  onClose: () => void;
  onCreate: (card: CardItem) => void;
}

const priorities: Priority[] = ["critical", "high", "medium", "low"];
const assignees = [
  { label: "Bumble 🐝", value: "Bumble" },
  { label: "Optimus 🤖", value: "Optimus" }
] as const;

export default function NewCardModal({
  isOpen,
  columns,
  initialColumnId,
  onClose,
  onCreate
}: NewCardModalProps) {
  const defaultColumnId = useMemo(() => {
    return initialColumnId || columns[0]?.id || "";
  }, [columns, initialColumnId]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("high");
  const [tags, setTags] = useState("");
  const [assignee, setAssignee] = useState<CardItem["assignee"]>("Bumble");
  const [columnId, setColumnId] = useState(defaultColumnId);
  const [dueDate, setDueDate] = useState("");
  const [timeTracked, setTimeTracked] = useState(30);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [subtasks, setSubtasks] = useState<CardItem["subtasks"]>([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setColumnId(defaultColumnId);
  }, [defaultColumnId, isOpen]);

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("high");
    setTags("");
    setAssignee("Bumble");
    setDueDate("");
    setTimeTracked(30);
    setSubtaskInput("");
    setSubtasks([]);
  };

  const handleAddSubtask = () => {
    const trimmed = subtaskInput.trim();
    if (!trimmed) {
      return;
    }
    setSubtasks((prev) => [
      ...prev,
      { id: `subtask-${crypto.randomUUID()}`, title: trimmed, done: false }
    ]);
    setSubtaskInput("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    const card: CardItem = {
      id: `card-${crypto.randomUUID()}`,
      title: title.trim(),
      description: description.trim(),
      status: columnId,
      priority,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      dueDate: dueDate || undefined,
      timeTrackedMinutes: Math.max(timeTracked, 0),
      timeTracking: { isRunning: false },
      assignee,
      subtasks:
        subtasks.length > 0
          ? subtasks
          : [
              {
                id: `subtask-${crypto.randomUUID()}`,
                title: "Kickoff",
                done: false
              }
            ]
    };

    onCreate(card);
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <form
        onSubmit={handleSubmit}
        className="glass-strong w-full max-w-2xl space-y-4 rounded-3xl p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">New Card</h2>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/60"
          >
            Close
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
              placeholder="Launch radar system"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Column</label>
            <select
              value={columnId}
              onChange={(event) => setColumnId(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
            >
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-[80px] rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
              placeholder="Describe the objective."
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Priority</label>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
            >
              {priorities.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Assignee</label>
            <select
              value={assignee}
              onChange={(event) => setAssignee(event.target.value as CardItem["assignee"])}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
            >
              {assignees.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Time tracked (min)</label>
            <input
              type="number"
              min={0}
              value={timeTracked}
              onChange={(event) => setTimeTracked(Number(event.target.value))}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Tags</label>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
              placeholder="work, ai, trading"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Subtasks</p>
          <div className="mt-3 flex gap-2">
            <input
              value={subtaskInput}
              onChange={(event) => setSubtaskInput(event.target.value)}
              className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white"
              placeholder="Add subtask"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="rounded-2xl border border-accent/50 bg-accent/20 px-4 py-2 text-sm text-white"
            >
              Add
            </button>
          </div>
          <div className="mt-3 space-y-2 text-sm text-white/70">
            {subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/30" />
                <span>{subtask.title}</span>
              </div>
            ))}
            {subtasks.length === 0 ? (
              <p className="text-xs text-white/40">No subtasks yet.</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/60"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-black"
          >
            Create Card
          </button>
        </div>
      </form>
    </div>
  );
}
