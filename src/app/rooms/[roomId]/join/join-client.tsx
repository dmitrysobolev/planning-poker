"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getParticipant,
  saveParticipant,
  clearParticipant,
} from "@/lib/clientStorage";

type JoinClientProps = {
  roomId: string;
};

export default function JoinClient({ roomId }: JoinClientProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedParticipantId, setStoredParticipantId] = useState<string | null>(
    null,
  );
  const [reuseExisting, setReuseExisting] = useState(false);

  useEffect(() => {
    const existing = getParticipant(roomId);
    setStoredParticipantId(existing);
    setReuseExisting(false);
  }, [roomId]);

  useEffect(() => {
    if (!storedParticipantId) {
      setReuseExisting(false);
    }
  }, [storedParticipantId]);

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitLoading) {
      return;
    }
    setSubmitLoading(true);
    setError(null);
    try {
      const reuse = reuseExisting && Boolean(storedParticipantId);
      const response = await fetch(`/api/rooms/${roomId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          participantId: reuse ? storedParticipantId ?? undefined : undefined,
          reuseExisting: reuse,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to join room");
      }
      const nextParticipantId = (data as { participantId: string }).participantId;
      saveParticipant(roomId, nextParticipantId);
      setStoredParticipantId(nextParticipantId);
      router.replace(`/rooms/${roomId}`);
    } catch (joinError) {
      setError(
        joinError instanceof Error ? joinError.message : "Failed to join room",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleContinue = () => {
    router.replace(`/rooms/${roomId}`);
  };

  const handleClearIdentity = () => {
    clearParticipant(roomId);
    setStoredParticipantId(null);
    setReuseExisting(false);
  };

  const toggleReuseExisting = (event: ChangeEvent<HTMLInputElement>) => {
    setReuseExisting(event.target.checked);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16 text-white">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 p-10 shadow-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Join Room {roomId}
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Enter your name to join the session. You will see everyone&apos;s votes
          once someone reveals the round.
        </p>
        {storedParticipantId ? (
          <div className="mt-6 rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-3 text-sm text-purple-100">
            <p>
              This browser already has access to the room. Continue below to join
              again.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-lg bg-purple-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-400 focus:ring-2 focus:ring-purple-300"
              >
                Continue to room
              </button>
              <button
                type="button"
                onClick={handleClearIdentity}
                className="rounded-lg border border-purple-300/30 px-3 py-1.5 text-xs font-semibold text-purple-100 transition hover:border-purple-200 hover:text-white focus:ring-2 focus:ring-purple-200"
              >
                Forget this identity
              </button>
            </div>
            <label className="mt-4 flex items-start gap-2 text-xs text-purple-100/90">
              <input
                type="checkbox"
                className="mt-0.5 accent-purple-400"
                checked={reuseExisting}
                onChange={toggleReuseExisting}
              />
              <span>
                Update my existing name instead of joining as a new teammate.
                Leave unchecked to create a brand-new participant.
              </span>
            </label>
          </div>
        ) : null}
        <form className="mt-8 space-y-6" onSubmit={handleJoin}>
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
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Casey"
              required
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-400">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-400 focus:ring-2 focus:ring-purple-300 disabled:cursor-not-allowed disabled:bg-purple-500/40"
          >
            {submitLoading ? "Joining…" : "Join room"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-6 text-xs font-semibold text-slate-400 transition hover:text-slate-200"
        >
          Back to home
        </button>
      </div>
    </main>
  );
}
