"use client";

import { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { CardItem as CardItemType } from "@/lib/types";
import { formatDate, formatMinutes, getCountdown, getRunningMinutes } from "@/lib/utils";

const priorityStyles: Record<CardItemType["priority"], string> = {
  low: "bg-white/10 text-white/70",
  medium: "bg-sky-400/20 text-sky-200",
  high: "bg-amber-400/20 text-amber-200",
  critical: "bg-rose-400/30 text-rose-200"
};

const assigneeMeta: Record<string, string> = {
  Bumble: "🐝",
  Optimus: "🤖",
  Jason: "👤"
};

interface CardItemProps {
  card: CardItemType;
  columnId: string;
  onToggleSubtask: (cardId: string, subtaskId: string) => void;
  onToggleTimer: (cardId: string) => void;
}

export default function CardItem({
  card,
  columnId,
  onToggleSubtask,
  onToggleTimer
}: CardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: card.id,
    data: { type: "card", columnId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const [now, setNow] = useState(() => new Date());
  const tracking = card.timeTracking ?? { isRunning: false };
  const countdown = getCountdown(card.dueDate, now);
  const trackedMinutes = tracking.isRunning
    ? getRunningMinutes(card.timeTrackedMinutes, tracking.startedAt, now)
    : card.timeTrackedMinutes;
  const completedSubtasks = card.subtasks.filter((subtask) => subtask.done).length;
  const countdownTone =
    countdown?.tone === "overdue"
      ? "text-rose-200"
      : countdown?.tone === "soon"
        ? "text-amber-200"
        : "text-white/60";

  const isDashboard = card.id.startsWith("dash-");

  useEffect(() => {
    if (!card.dueDate && !tracking.isRunning) {
      return;
    }

    const interval = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(interval);
  }, [card.dueDate, tracking.isRunning]);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-strong rounded-2xl border border-white/10 p-4 transition hover:border-accent/40 ${
        isDragging ? "opacity-70" : ""
      } ${isDashboard ? "border-accent/30 bg-accent/5" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="mt-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[0.6rem] text-white/60 transition hover:border-accent/40 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label="Drag card"
          >
            ⋮⋮
          </button>
          <div>
            <h3 className="text-sm font-semibold text-white">{card.title}</h3>
            <p className="mt-1 text-xs text-white/60">{card.description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase ${priorityStyles[card.priority]}`}
          >
            {card.priority}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.6rem] text-white/70">
            {assigneeMeta[card.assignee] || "👤"} {card.assignee}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {card.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-white/60"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Dashboard Open Button */}
      {card.link && (
        <div className="mt-3">
          <a
            href={card.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/20 px-4 py-2 text-xs font-semibold text-accent-glow transition hover:bg-accent/30 hover:shadow-glow"
          >
            <span>🚀</span>
            <span>Open Dashboard</span>
          </a>
        </div>
      )}

      <div className="mt-4 space-y-2 text-[0.7rem] text-white/70">
        <div className="flex items-center justify-between">
          <span>Due {formatDate(card.dueDate) || "TBD"}</span>
          <span className={`text-[0.65rem] ${countdownTone}`}>
            {countdown?.label ?? "No deadline"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>
            Subtasks {completedSubtasks}/{card.subtasks.length}
          </span>
          <div className="flex items-center gap-2">
            <span>{formatMinutes(trackedMinutes)}</span>
            <button
              type="button"
              onClick={() => onToggleTimer(card.id)}
              className={`rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] transition ${
                tracking.isRunning
                  ? "border-emerald-400/40 bg-emerald-400/20 text-emerald-200"
                  : "border-white/15 bg-white/5 text-white/70 hover:border-accent/40"
              }`}
            >
              {tracking.isRunning ? "Stop" : "Start"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {card.subtasks.map((subtask) => (
          <label key={subtask.id} className="flex items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              checked={subtask.done}
              onChange={() => onToggleSubtask(card.id, subtask.id)}
              className="h-3 w-3 rounded border-white/20 bg-white/10 accent-accent"
            />
            <span className={subtask.done ? "line-through text-white/40" : ""}>
              {subtask.title}
            </span>
          </label>
        ))}
        {card.subtasks.length === 0 ? (
          <p className="text-xs text-white/40">No subtasks added.</p>
        ) : null}
      </div>
    </motion.div>
  );
}
