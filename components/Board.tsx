"use client";

import { useMemo, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { BoardData, CardItem, Filters } from "@/lib/types";
import Column from "./Column";

interface BoardProps {
  board: BoardData;
  filters: Filters;
  searchTerm: string;
  setBoard: React.Dispatch<React.SetStateAction<BoardData>>;
  onRequestNewCard: (columnId?: string) => void;
}

export default function Board({
  board,
  filters,
  searchTerm,
  setBoard,
  onRequestNewCard
}: BoardProps) {
  const [activeCard, setActiveCard] = useState<CardItem | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredColumns = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return board.columns.map((column) => {
      const filteredCards = column.cards.filter((card) => {
        const matchesSearch = normalizedSearch
          ? [
              card.title,
              card.description,
              card.assignee,
              card.priority,
              card.tags.join(" "),
              ...card.subtasks.map((subtask) => subtask.title)
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedSearch)
          : true;

        const matchesPriority =
          filters.priority === "all" ? true : card.priority === filters.priority;

        const matchesTag = filters.tag === "all" ? true : card.tags.includes(filters.tag);

        const matchesAssignee =
          filters.assignee === "all" ? true : card.assignee === filters.assignee;

        return matchesSearch && matchesPriority && matchesTag && matchesAssignee;
      });

      return {
        ...column,
        cards: filteredCards
      };
    });
  }, [board.columns, filters, searchTerm]);

  const findColumnByCardId = (cardId: string) =>
    board.columns.find((column) => column.cards.some((card) => card.id === cardId));

  const updateCard = (cardId: string, updater: (card: CardItem) => CardItem) => {
    setBoard((prev) => {
      const nextColumns = prev.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) => (card.id === cardId ? updater(card) : card))
      }));

      return {
        ...prev,
        columns: nextColumns,
        lastUpdated: new Date().toISOString()
      };
    });
  };

  const handleToggleSubtask = (cardId: string, subtaskId: string) => {
    updateCard(cardId, (card) => ({
      ...card,
      subtasks: card.subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
      )
    }));
  };

  const handleToggleTimer = (cardId: string) => {
    updateCard(cardId, (card) => {
      const tracking = card.timeTracking ?? { isRunning: false };

      if (tracking.isRunning) {
        const startedAt = tracking.startedAt ? new Date(tracking.startedAt) : null;
        const startedTime = startedAt && !Number.isNaN(startedAt.getTime())
          ? startedAt.getTime()
          : Date.now();
        const diffMinutes = Math.max(
          Math.floor((Date.now() - startedTime) / 60000),
          0
        );

        return {
          ...card,
          timeTrackedMinutes: card.timeTrackedMinutes + diffMinutes,
          timeTracking: { isRunning: false }
        };
      }

      return {
        ...card,
        timeTracking: { isRunning: true, startedAt: new Date().toISOString() }
      };
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "card") {
      const column = findColumnByCardId(active.id as string);
      const card = column?.cards.find((item) => item.id === active.id);
      if (card) {
        setActiveCard(card);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) {
      return;
    }

    const sourceColumn = findColumnByCardId(activeId);
    if (!sourceColumn) {
      return;
    }

    const sourceIndex = sourceColumn.cards.findIndex((card) => card.id === activeId);
    if (sourceIndex < 0) {
      return;
    }
    const targetColumnId =
      over.data.current?.type === "card"
        ? (over.data.current.columnId as string)
        : over.data.current?.type === "column"
          ? (over.data.current.columnId as string)
          : null;

    if (!targetColumnId) {
      return;
    }

    setBoard((prev) => {
      const nextColumns = prev.columns.map((column) => ({
        ...column,
        cards: [...column.cards]
      }));

      const source = nextColumns.find((column) => column.id === sourceColumn.id);
      const destination = nextColumns.find((column) => column.id === targetColumnId);

      if (!source || !destination) {
        return prev;
      }

      let targetIndex = destination.cards.length;
      if (over.data.current?.type === "card") {
        targetIndex = destination.cards.findIndex((card) => card.id === overId);
        if (targetIndex < 0) {
          return prev;
        }
      }

      if (source.id === destination.id) {
        const normalizedTarget =
          over.data.current?.type === "column"
            ? destination.cards.length - 1
            : targetIndex;
        const reordered = arrayMove(source.cards, sourceIndex, normalizedTarget);
        source.cards = reordered;
      } else {
        const [movedCard] = source.cards.splice(sourceIndex, 1);
        movedCard.status = destination.id;
        destination.cards.splice(targetIndex, 0, movedCard);
      }

      return {
        ...prev,
        columns: nextColumns,
        lastUpdated: new Date().toISOString()
      };
    });
  };

  const handleAddColumn = () => {
    const title = newColumnTitle.trim();
    if (!title) {
      return;
    }

    const baseId = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const columnId = baseId || `column-${crypto.randomUUID().slice(0, 6)}`;

    setBoard((prev) => {
      const exists = prev.columns.some((column) => column.id === columnId);
      const finalId = exists ? `${columnId}-${prev.columns.length + 1}` : columnId;
      return {
        ...prev,
        columns: [
          ...prev.columns,
          {
            id: finalId,
            title,
            cards: []
          }
        ],
        lastUpdated: new Date().toISOString()
      };
    });

    setNewColumnTitle("");
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4">
        {filteredColumns.map((column) => (
          <Column
            key={column.id}
            column={column}
            cards={column.cards}
            onAddCard={onRequestNewCard}
            onToggleSubtask={handleToggleSubtask}
            onToggleTimer={handleToggleTimer}
          />
        ))}
        <motion.div
          layout
          className="glass flex h-full w-[260px] flex-col gap-3 rounded-3xl p-4"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">New Column</p>
          <input
            value={newColumnTitle}
            onChange={(event) => setNewColumnTitle(event.target.value)}
            placeholder="Add custom column"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddColumn}
            className="rounded-2xl border border-accent/60 bg-accent/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/30"
          >
            Create Column
          </button>
          <p className="text-xs text-white/50">
            Custom lanes stay synced in local storage.
          </p>
        </motion.div>
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="glass-strong w-[280px] rounded-2xl border border-white/10 p-4 shadow-glow">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{activeCard.title}</p>
              <span className="rounded-full bg-accent/20 px-2 py-1 text-[0.65rem] text-white">
                {activeCard.priority}
              </span>
            </div>
            <p className="mt-2 text-xs text-white/60">{activeCard.description}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
