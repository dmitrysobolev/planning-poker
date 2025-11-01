import { notFound } from "next/navigation";
import JoinClient from "./join-client";

type JoinPageParams = { roomId?: string };

type JoinPageProps = {
  params: Promise<JoinPageParams> | JoinPageParams;
};

export const runtime = "edge";

export default async function JoinPage({ params }: JoinPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const roomId = resolvedParams.roomId?.toUpperCase();

  if (!roomId) {
    notFound();
  }

  return <JoinClient roomId={roomId} />;
}
