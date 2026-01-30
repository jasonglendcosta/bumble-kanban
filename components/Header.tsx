"use client";

import { Assignee, Filters } from "@/lib/types";

const assigneeOptions: { value: Assignee; label: string }[] = [
  { value: "Bumble", label: "Bumble 🐝" },
  { value: "Optimus", label: "Optimus 🤖" }
];

interface HeaderProps {
  search: string;
  filters: Filters;
  tags: string[];
  onSearchChange: (value: string) => void;
  onFiltersChange: (filters: Filters) => void;
  onNewCard: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export default function Header({
  search,
  filters,
  tags,
  onSearchChange,
  onFiltersChange,
  onNewCard,
  searchInputRef
}: HeaderProps) {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-white/50">
          Bumble Kanban · God Mode
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-glow">
          Command the swarm with cinematic flow.
        </h1>
        <p className="mt-2 text-xs text-white/50">
          Shortcuts: <span className="text-white/80">N</span> new card ·
          <span className="text-white/80"> /</span> search
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
          <span className="text-xs text-white/40">/</span>
          <input
            ref={searchInputRef}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search cards, tags, assignees..."
            className="w-56 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>
        <select
          value={filters.priority}
          onChange={(event) =>
            onFiltersChange({ ...filters, priority: event.target.value as Filters["priority"] })
          }
          className="glass rounded-full px-4 py-2 text-sm text-white/80 focus:outline-none"
        >
          <option value="all">All priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={filters.tag}
          onChange={(event) => onFiltersChange({ ...filters, tag: event.target.value })}
          className="glass rounded-full px-4 py-2 text-sm text-white/80 focus:outline-none"
        >
          <option value="all">All tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <select
          value={filters.assignee}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              assignee: event.target.value as Filters["assignee"]
            })
          }
          className="glass rounded-full px-4 py-2 text-sm text-white/80 focus:outline-none"
        >
          <option value="all">All assignees</option>
          {assigneeOptions.map((assignee) => (
            <option key={assignee.value} value={assignee.value}>
              {assignee.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onNewCard}
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-black shadow-glow transition hover:brightness-110"
        >
          + New Card (N)
        </button>
      </div>
    </header>
  );
}
