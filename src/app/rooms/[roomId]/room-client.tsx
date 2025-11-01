"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getParticipant, saveParticipant, clearParticipant } from "@/lib/clientStorage";
import { PlanningStrategy, STRATEGIES } from "@/lib/strategies";
import type { RoomSummary } from "@/types/room";

type RoomClientProps = {
  roomId: string;
};

const POLL_INTERVAL = 3000;

export default function RoomClient({ roomId }: RoomClientProps) {
  const router = useRouter();
  const [room, setRoom] = useState<RoomSummary | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [revealLoading, setRevealLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [strategyLoading, setStrategyLoading] = useState(false);

  useEffect(() => {
    setParticipantId(getParticipant(roomId));
  }, [roomId]);

  useEffect(() => {
    let active = true;

    const fetchRoom = async () => {
      try {
        const query = participantId ? `?participantId=${participantId}` : "";
        const response = await fetch(`/api/rooms/${roomId}${query}`, {
          cache: "no-store",
        });
        if (response.status === 404) {
          throw new Error("Room not found. It may have been closed.");
        }
        if (!response.ok) {
          throw new Error("Failed to load room state");
        }
        const data = (await response.json()) as RoomSummary;
        if (!active) {
          return;
        }
        setRoom(data);
        setInitialLoadError(null);

        if (participantId) {
          const match = data.participants.find(
            (participant) => participant.id === participantId,
          );
          if (!match) {
            setParticipantId(null);
            clearParticipant(roomId);
          } else {
            setParticipantName(match.name);
          }
        }
      } catch (error) {
        if (!active) {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Failed to load room";
        setInitialLoadError(message);
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, POLL_INTERVAL);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [roomId, participantId]);

  const myParticipant = useMemo(() => {
    if (!participantId || !room) {
      return undefined;
    }
    return room.participants.find((participant) => participant.id === participantId);
  }, [participantId, room]);

  const cards = useMemo(() => {
    const strategy = room?.strategy ?? "fibonacci";
    return STRATEGIES[strategy as PlanningStrategy]?.values ?? [];
  }, [room?.strategy]);

  const voteSummary = useMemo(() => {
    if (!room || !room.revealed) {
      return [];
    }
    const counts = new Map<string, number>();
    for (const participant of room.participants) {
      if (participant.vote) {
        counts.set(participant.vote, (counts.get(participant.vote) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [room]);

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (joinLoading) {
      return;
    }
    setJoinLoading(true);
    setJoinError(null);
    try {
      const response = await fetch(`/api/rooms/${roomId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: participantName.trim(),
          participantId,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to join room");
      }
      const nextParticipantId = (data as { participantId: string }).participantId;
      saveParticipant(roomId, nextParticipantId);
      setParticipantId(nextParticipantId);
      setRoom((data as { room: RoomSummary }).room);
    } catch (error) {
      setJoinError(
        error instanceof Error ? error.message : "Failed to join room",
      );
    } finally {
      setJoinLoading(false);
    }
  };

  const handleVote = async (vote: string | null) => {
    if (!participantId) {
      setActionError("Join the room before voting.");
      return;
    }
    if (room?.revealed) {
      setActionError("Reset the round before casting new votes.");
      return;
    }
    if (voteLoading) {
      return;
    }
    setVoteLoading(true);
    setActionError(null);
    try {
      const response = await fetch(`/api/rooms/${roomId}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          vote,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to submit vote");
      }
      setRoom(data as RoomSummary);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Vote failed");
    } finally {
      setVoteLoading(false);
    }
  };

  const handleReveal = async () => {
    if (revealLoading) {
      return;
    }
    setRevealLoading(true);
    setActionError(null);
    try {
      const response = await fetch(`/api/rooms/${roomId}/reveal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to reveal votes");
      }
      setRoom(data as RoomSummary);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to reveal votes",
      );
    } finally {
      setRevealLoading(false);
    }
  };

  const handleReset = async () => {
    if (resetLoading) {
      return;
    }
    setResetLoading(true);
    setActionError(null);
    try {
      const response = await fetch(`/api/rooms/${roomId}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to reset votes");
      }
      setRoom(data as RoomSummary);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to reset votes",
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleStrategyChange = async (value: PlanningStrategy) => {
    if (strategyLoading) {
      return;
    }
    if (!room || room.strategy === value) {
      return;
    }
    setStrategyLoading(true);
    setActionError(null);
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy: value }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to change strategy");
      }
      setRoom(data as RoomSummary);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Strategy change failed",
      );
    } finally {
      setStrategyLoading(false);
    }
  };

  const leaveRoom = () => {
    clearParticipant(roomId);
    setParticipantId(null);
    setParticipantName("");
  };

  const shareUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/rooms/${roomId}`;

  if (initialLoadError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="max-w-md rounded-2xl bg-slate-900 p-10 shadow-lg">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-3 text-sm text-slate-300">{initialLoadError}</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-8 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-400 focus:ring-2 focus:ring-purple-300"
          >
            Go back home
          </button>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="rounded-2xl bg-slate-900 px-10 py-12 shadow-lg">
          <h1 className="text-2xl font-semibold">Loading room…</h1>
          <p className="mt-3 text-sm text-slate-300">
            Hang tight while we fetch the latest state.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col justify-between gap-4 rounded-2xl bg-slate-900 p-6 shadow-lg md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Room {roomId}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Share this code with your teammates to invite them in.
            </p>
            {shareUrl ? (
              <p className="mt-2 text-xs text-slate-400">{shareUrl}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Strategy
            </label>
            <select
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40"
              value={room?.strategy ?? "fibonacci"}
              onChange={(event) =>
                handleStrategyChange(event.target.value as PlanningStrategy)
              }
              disabled={strategyLoading}
            >
              {Object.entries(STRATEGIES).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleReveal}
              disabled={room?.revealed || revealLoading || !room}
              className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-400 focus:ring-2 focus:ring-purple-300 disabled:cursor-not-allowed disabled:bg-purple-500/40"
            >
              {room?.revealed ? "Votes revealed" : revealLoading ? "Revealing…" : "Reveal"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={resetLoading}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-purple-400 hover:text-white focus:ring-2 focus:ring-purple-300 disabled:cursor-not-allowed disabled:border-slate-600/60 disabled:text-slate-400/60"
            >
              {resetLoading ? "Resetting…" : "Reset round"}
            </button>
            {participantId ? (
              <button
                type="button"
                onClick={leaveRoom}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-400 hover:text-red-200 focus:ring-2 focus:ring-red-300"
              >
                Leave
              </button>
            ) : null}
          </div>
        </header>

        {actionError ? (
          <div className="rounded-xl border border-red-400/60 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {actionError}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl bg-slate-900 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white">Pick a card</h2>
            <p className="mt-1 text-sm text-slate-300">
              Your selection stays hidden until someone reveals the round.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {cards.map((value) => {
                const isSelected = myParticipant?.vote === value && !room?.revealed;
                return (
                  <button
                    type="button"
                    key={value}
                    className={`flex h-20 items-center justify-center rounded-xl border text-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      isSelected
                        ? "border-purple-400 bg-purple-500/20 text-white shadow-lg"
                        : "border-slate-700 bg-slate-950 text-slate-200 hover:border-purple-400 hover:text-white"
                    } ${voteLoading ? "opacity-70" : ""}`}
                    onClick={() =>
                      handleVote(
                        isSelected && !room?.revealed ? null : value,
                      )
                    }
                    disabled={voteLoading || Boolean(room?.revealed)}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            {room?.revealed ? (
              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Vote summary
                </h3>
                {voteSummary.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-300">No votes recorded.</p>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm text-slate-100">
                    {voteSummary.map(([value, count]) => (
                      <li
                        key={value}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2"
                      >
                        <span className="font-semibold">{value}</span>
                        <span className="text-xs uppercase tracking-wide text-slate-400">
                          {count} {count === 1 ? "vote" : "votes"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>

          <aside className="rounded-2xl bg-slate-900 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white">
              Participants ({room?.participants.length ?? 0})
            </h2>
            <ul className="mt-4 space-y-3">
              {(room?.participants ?? []).map((participant) => {
                const isSelf = participant.id === participantId;
                const status = room?.revealed
                  ? participant.vote ?? "—"
                  : participant.hasVoted
                    ? "Ready"
                    : "Thinking…";
                return (
                  <li
                    key={participant.id}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                      participant.hasVoted
                        ? "border-purple-400/40 bg-purple-500/10"
                        : "border-slate-800 bg-slate-950"
                    }`}
                  >
                    <span className="font-medium text-slate-100">
                      {participant.name}
                      {isSelf ? " (you)" : ""}
                    </span>
                    <span
                      className={`text-xs uppercase tracking-wide ${
                        room?.revealed && participant.vote
                          ? "text-white"
                          : participant.hasVoted
                            ? "text-purple-200"
                            : "text-slate-400"
                      }`}
                    >
                      {status}
                    </span>
                  </li>
                );
              })}
            </ul>
          </aside>
        </section>

        {!participantId ? (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-950/90 px-4 backdrop-blur">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-xl">
              <h2 className="text-2xl font-semibold text-white">Join this room</h2>
              <p className="mt-2 text-sm text-slate-300">
                Enter your name to participate in the next estimation round.
              </p>
              <form className="mt-6 space-y-5" onSubmit={handleJoin}>
                <div>
                  <label
                    htmlFor="participant-name"
                    className="block text-sm font-medium text-slate-200"
                  >
                    Your name
                  </label>
                  <input
                    id="participant-name"
                    type="text"
                    value={participantName}
                    onChange={(event) => setParticipantName(event.target.value)}
                    placeholder="Casey"
                    required
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
                {joinError ? (
                  <p className="text-sm text-red-400">{joinError}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={joinLoading}
                  className="w-full rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-400 focus:ring-2 focus:ring-purple-300 disabled:cursor-not-allowed disabled:bg-purple-500/40"
                >
                  {joinLoading ? "Joining..." : "Join room"}
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
