import { notFound } from "next/navigation";
import RoomClient from "./room-client";

type RoomPageParams = { roomId?: string };

type RoomPageProps = {
  params: Promise<RoomPageParams> | RoomPageParams;
};

export default async function RoomPage({ params }: RoomPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const roomId = resolvedParams.roomId?.toUpperCase();

  if (!roomId) {
    notFound();
  }

  return <RoomClient roomId={roomId} />;
}
