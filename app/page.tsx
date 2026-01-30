"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AgentTracker from "@/components/AgentTracker";
import Board from "@/components/Board";
import Header from "@/components/Header";
import NewCardModal from "@/components/NewCardModal";
import { seedData } from "@/lib/seed";
import { loadBoardFromStorage, saveBoardToStorage } from "@/lib/storage";
import { BoardData, CardItem, Filters } from "@/lib/types";

const agentRoster = [
  {
    id: "agent-1",
    name: "Scout-01",
    focus: "Market signals + competitor intel",
    status: "running" as const
  },
  {
    id: "agent-2",
    name: "Forge-07",
    focus: "Prototype build pipeline",
    status: "done" as const
  },
  {
    id: "agent-3",
    name: "Pulse-Delta",
    focus: "User interviews + sentiment",
    status: "running" as const
  },
  {
    id: "agent-4",
    name: "Shield-Atlas",
    focus: "Risk + QA sweeps",
    status: "failed" as const
  }
];

export default function Home() {
  const [board, setBoard] = useState<BoardData>(seedData);
  const [filters, setFilters] = useState<Filters>({
    tag: "all",
    priority: "all",
    assignee: "all"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftColumnId, setDraftColumnId] = useState<string | undefined>(undefined);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = loadBoardFromStorage();
    if (stored) {
      setBoard(stored);
    }
  }, []);

  useEffect(() => {
    saveBoardToStorage(board);
  }, [board]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInput = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (isInput) {
        return;
      }

      if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        setDraftColumnId(undefined);
        setIsModalOpen(true);
      }

      if (event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleCreateCard = (card: CardItem) => {
    setBoard((prev) => {
      const nextColumns = prev.columns.map((column) => ({
        ...column,
        cards: [...column.cards]
      }));

      const target = nextColumns.find((column) => column.id === card.status);
      if (!target) {
        return prev;
      }

      target.cards.unshift(card);

      return {
        ...prev,
        columns: nextColumns,
        lastUpdated: new Date().toISOString()
      };
    });
  };

  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    board.columns.forEach((column) => {
      column.cards.forEach((card) => card.tags.forEach((tag) => tagSet.add(tag)));
    });
    return Array.from(tagSet).sort();
  }, [board.columns]);

  return (
    <main className="px-6 py-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10">
        <Header
          search={searchTerm}
          filters={filters}
          tags={tags}
          onSearchChange={setSearchTerm}
          onFiltersChange={setFilters}
          onNewCard={() => {
            setDraftColumnId(undefined);
            setIsModalOpen(true);
          }}
          searchInputRef={searchInputRef}
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Mission Board</h2>
                <p className="text-sm text-white/50">
                  Drag and drop to reroute priorities. Last sync {new Date(board.lastUpdated).toLocaleString()}.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                Autosave enabled
              </div>
            </div>

            <Board
              board={board}
              filters={filters}
              searchTerm={searchTerm}
              setBoard={setBoard}
              onRequestNewCard={(columnId) => {
                setDraftColumnId(columnId);
                setIsModalOpen(true);
              }}
            />
          </section>

          <div className="space-y-6">
            <AgentTracker agents={agentRoster} />
            <section className="glass-strong rounded-3xl p-6">
              <h3 className="text-sm font-semibold text-white">Quick Stats</h3>
              <div className="mt-4 space-y-3 text-sm text-white/70">
                <div className="flex items-center justify-between">
                  <span>Total columns</span>
                  <span className="text-white">{board.columns.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total cards</span>
                  <span className="text-white">
                    {board.columns.reduce((sum, column) => sum + column.cards.length, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active filters</span>
                  <span className="text-white">
                    {filters.tag !== "all" ||
                    filters.priority !== "all" ||
                    filters.assignee !== "all"
                      ? "On"
                      : "Off"}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <NewCardModal
        isOpen={isModalOpen}
        columns={board.columns}
        initialColumnId={draftColumnId}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateCard}
      />
    </main>
  );
}
