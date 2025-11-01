"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { STRATEGIES, DEFAULT_STRATEGY, PlanningStrategy } from "@/lib/strategies";
import { getParticipant, saveParticipant } from "@/lib/clientStorage";

export default function Home() {
  const router = useRouter();
  const [strategy, setStrategy] = useState<PlanningStrategy>(DEFAULT_STRATEGY);
  const [hostName, setHostName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const strategyOptions = useMemo(
    () =>
      Object.entries(STRATEGIES).map(([key, config]) => ({
        key,
        label: config.label,
        description: config.description,
      })),
    [],
  );

  const handleCreateRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createLoading) {
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy,
          hostName: hostName.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to create room");
      }
      const { roomId, participantId } = data as {
        roomId: string;
        participantId: string | null;
      };
      if (participantId) {
        saveParticipant(roomId, participantId);
      }
      router.push(`/rooms/${roomId}`);
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Failed to create room",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (joinLoading) {
      return;
    }
    const normalizedRoomId = joinRoomId.trim().toUpperCase();
    if (!normalizedRoomId) {
      setJoinError("Room code is required");
      return;
    }
    setJoinLoading(true);
    setJoinError(null);
    try {
      const response = await fetch(`/api/rooms/${normalizedRoomId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: joinName.trim(),
          participantId: getParticipant(normalizedRoomId),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to join room");
      }
      const { participantId } = data as {
        participantId: string;
      };
      saveParticipant(normalizedRoomId, participantId);
      router.push(`/rooms/${normalizedRoomId}`);
    } catch (error) {
      setJoinError(
        error instanceof Error ? error.message : "Failed to join room",
      );
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16 md:flex-row md:gap-16">
        <section className="flex-1 rounded-2xl bg-slate-900 p-8 shadow-lg">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">
              Planning Poker
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Spin up a room, invite your team, and estimate stories using
              Fibonacci or T-Shirt sizing.
            </p>
          </header>
          <form className="space-y-6" onSubmit={handleCreateRoom}>
            <div>
              <label
                htmlFor="host-name"
                className="block text-sm font-medium text-slate-200"
              >
                Your name
              </label>
              <input
                id="host-name"
                type="text"
                placeholder="Casey"
                value={hostName}
                onChange={(event) => setHostName(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">
                Strategy
              </label>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {strategyOptions.map((option) => (
                  <button
                    type="button"
                    key={option.key}
                    onClick={() => setStrategy(option.key as PlanningStrategy)}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      strategy === option.key
                        ? "border-purple-400 bg-purple-500/10"
                        : "border-slate-800 bg-slate-950 hover:border-slate-600"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-slate-100">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {createError ? (
              <p className="text-sm text-red-400">{createError}</p>
            ) : null}
            <button
              type="submit"
              disabled={createLoading}
              className="w-full rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-400 focus:ring-2 focus:ring-purple-300 disabled:cursor-not-allowed disabled:bg-purple-500/40"
            >
              {createLoading ? "Creating..." : "Create room"}
            </button>
          </form>
        </section>

        <section className="flex-1 rounded-2xl bg-slate-900 p-8 shadow-lg">
          <header className="mb-6">
            <h2 className="text-2xl font-semibold text-white">
              Join an existing room
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Enter a room code shared by your teammates and jump right in.
            </p>
          </header>
          <form className="space-y-6" onSubmit={handleJoinRoom}>
            <div>
              <label
                htmlFor="room-code"
                className="block text-sm font-medium text-slate-200"
              >
                Room code
              </label>
              <input
                id="room-code"
                type="text"
                placeholder="e.g. A1BC"
                value={joinRoomId}
                onChange={(event) => setJoinRoomId(event.target.value.toUpperCase())}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base uppercase text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40"
                maxLength={6}
              />
            </div>
            <div>
              <label
                htmlFor="join-name"
                className="block text-sm font-medium text-slate-200"
              >
                Your name
              </label>
              <input
                id="join-name"
                type="text"
                placeholder="Casey"
                value={joinName}
                onChange={(event) => setJoinName(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40"
                required
              />
            </div>
            {joinError ? <p className="text-sm text-red-400">{joinError}</p> : null}
            <button
              type="submit"
              disabled={joinLoading}
              className="w-full rounded-lg border border-purple-400 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:bg-purple-500/10 focus:ring-2 focus:ring-purple-300 disabled:cursor-not-allowed disabled:border-purple-400/40 disabled:text-purple-300/60"
            >
              {joinLoading ? "Joining..." : "Join room"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
