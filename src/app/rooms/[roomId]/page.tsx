import RoomClient from "./room-client";

type RoomPageProps = {
  params: { roomId: string };
};

export default function RoomPage({ params }: RoomPageProps) {
  const roomId = params.roomId.toUpperCase();
  return <RoomClient roomId={roomId} />;
}
