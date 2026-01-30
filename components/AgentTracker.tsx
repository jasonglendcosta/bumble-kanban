"use client";

import { AgentStatus } from "@/lib/types";

const statusStyles: Record<AgentStatus, string> = {
  running: "bg-emerald-400/20 text-emerald-200",
  done: "bg-sky-400/20 text-sky-200",
  failed: "bg-rose-400/20 text-rose-200"
};

interface Agent {
  id: string;
  name: string;
  focus: string;
  status: AgentStatus;
}

interface AgentTrackerProps {
  agents: Agent[];
}

export default function AgentTracker({ agents }: AgentTrackerProps) {
  return (
    <section className="glass-strong flex flex-col gap-4 rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Sub-Agent Tracker</h2>
        <span className="text-xs uppercase tracking-[0.3em] text-white/40">Live</span>
      </div>

      <div className="space-y-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div>
              <p className="text-sm font-semibold text-white">{agent.name}</p>
              <p className="text-xs text-white/60">{agent.focus}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase ${statusStyles[agent.status]}`}
            >
              {agent.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
