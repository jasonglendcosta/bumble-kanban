"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { CardItem as CardItemType, Column as ColumnType } from "@/lib/types";
import CardItem from "./CardItem";

interface ColumnProps {
  column: ColumnType;
  cards: CardItemType[];
  onAddCard: (columnId: string) => void;
  onToggleSubtask: (cardId: string, subtaskId: string) => void;
  onToggleTimer: (cardId: string) => void;
}

export default function Column({
  column,
  cards,
  onAddCard,
  onToggleSubtask,
  onToggleTimer
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: "column", columnId: column.id }
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass flex h-full w-[300px] flex-col gap-4 rounded-3xl p-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            {column.title}
          </p>
          <h3 className="text-sm font-semibold text-white">{cards.length} cards</h3>
        </div>
        <button
          type="button"
          onClick={() => onAddCard(column.id)}
          className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 transition hover:border-accent/60 hover:text-white"
        >
          + Add
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-3 rounded-2xl border border-dashed border-white/10 p-2 transition ${
          isOver ? "border-accent/60 bg-accent/5" : ""
        }`}
      >
        <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              columnId={column.id}
              onToggleSubtask={onToggleSubtask}
              onToggleTimer={onToggleTimer}
            />
          ))}
        </SortableContext>
      </div>
    </motion.div>
  );
}
