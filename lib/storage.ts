import { BoardData } from "./types";

export const STORAGE_KEY = "bumble-kanban-state";

export const loadBoardFromStorage = (): BoardData | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as BoardData;
  } catch (error) {
    console.error("Failed to load board state", error);
    return null;
  }
};

export const saveBoardToStorage = (data: BoardData) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save board state", error);
  }
};
