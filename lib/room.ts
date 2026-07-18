import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured, ensureAnonAuth } from "./firebase";
import type { RoomState, Player, GameId } from "@/types";

const LOCAL_PREFIX = "tgg_room_";
const LOCAL_CHANNEL = "tgg_room_sync";

function randomCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function defaultRoom(code: string, hostId: string): RoomState {
  return {
    code,
    hostId,
    createdAt: Date.now(),
    status: "lobby",
    currentGame: null,
    soundOn: true,
    timerSeconds: 5,
    questionNumber: 0,
    players: {},
  };
}

// ---------------------------------------------------------------------------
// Local (offline demo) backend — uses localStorage + BroadcastChannel so that
// multiple browser tabs on the same device (e.g. TV tab + phone tab) can
// still sync live without any network/Firebase project configured.
// ---------------------------------------------------------------------------
class LocalBackend {
  private channel: BroadcastChannel | null =
    typeof window !== "undefined" && "BroadcastChannel" in window
      ? new BroadcastChannel(LOCAL_CHANNEL)
      : null;

  read(code: string): RoomState | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(LOCAL_PREFIX + code);
    return raw ? (JSON.parse(raw) as RoomState) : null;
  }

  write(room: RoomState) {
    window.localStorage.setItem(LOCAL_PREFIX + room.code, JSON.stringify(room));
    this.channel?.postMessage({ code: room.code });
    // Also fire a synthetic storage event for same-tab listeners.
    window.dispatchEvent(new CustomEvent("tgg-local-room", { detail: room.code }));
  }

  subscribe(code: string, cb: (room: RoomState | null) => void) {
    const handler = () => cb(this.read(code));
    handler();
    const onMsg = (e: MessageEvent) => {
      if (e.data?.code === code) handler();
    };
    const onLocal = (e: Event) => {
      if ((e as CustomEvent).detail === code) handler();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_PREFIX + code) handler();
    };
    this.channel?.addEventListener("message", onMsg);
    window.addEventListener("tgg-local-room", onLocal);
    window.addEventListener("storage", onStorage);
    return () => {
      this.channel?.removeEventListener("message", onMsg);
      window.removeEventListener("tgg-local-room", onLocal);
      window.removeEventListener("storage", onStorage);
    };
  }
}

const localBackend = new LocalBackend();

// ---------------------------------------------------------------------------
// Public API — automatically routes to Firestore or the local backend
// ---------------------------------------------------------------------------

export async function createRoom(): Promise<RoomState> {
  const hostId = (await ensureAnonAuth()) ?? randomId();
  let code = randomCode();

  if (isFirebaseConfigured && db) {
    // Avoid extremely unlikely collisions with an active room.
    for (let attempts = 0; attempts < 5; attempts++) {
      const snap = await getDoc(doc(db, "rooms", code));
      if (!snap.exists()) break;
      code = randomCode();
    }
    const room = defaultRoom(code, hostId);
    await setDoc(doc(db, "rooms", code), { ...room, createdAt: serverTimestamp() });
    return room;
  }

  const room = defaultRoom(code, hostId);
  localBackend.write(room);
  return room;
}

export async function getRoom(code: string): Promise<RoomState | null> {
  if (isFirebaseConfigured && db) {
    const snap = await getDoc(doc(db, "rooms", code));
    return snap.exists() ? (snap.data() as RoomState) : null;
  }
  return localBackend.read(code);
}

export async function joinRoom(
  code: string,
  name: string,
  emoji: string
): Promise<{ playerId: string } | null> {
  const playerId = (await ensureAnonAuth()) ?? randomId();
  const player: Player = {
    id: playerId,
    name: name.slice(0, 16) || "Player",
    emoji,
    score: 0,
    joinedAt: Date.now(),
    connected: true,
  };

  if (isFirebaseConfigured && db) {
    const ref = doc(db, "rooms", code);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    await updateDoc(ref, { [`players.${playerId}`]: player });
    return { playerId };
  }

  const room = localBackend.read(code);
  if (!room) return null;
  room.players[playerId] = player;
  localBackend.write(room);
  return { playerId };
}

export function subscribeRoom(
  code: string,
  cb: (room: RoomState | null) => void
): () => void {
  if (isFirebaseConfigured && db) {
    return onSnapshot(doc(db, "rooms", code), (snap) => {
      cb(snap.exists() ? (snap.data() as RoomState) : null);
    });
  }
  return localBackend.subscribe(code, cb);
}

export async function updateRoom(
  code: string,
  patch: Partial<RoomState>
): Promise<void> {
  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, "rooms", code), patch as Record<string, unknown>);
    return;
  }
  const room = localBackend.read(code);
  if (!room) return;
  localBackend.write({ ...room, ...patch });
}

/** Convenience helper for deeply patching a specific field, e.g. a player's score. */
export async function patchRoomField(
  code: string,
  fieldPath: string,
  value: unknown
): Promise<void> {
  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, "rooms", code), { [fieldPath]: value });
    return;
  }
  const room = localBackend.read(code);
  if (!room) return;
  const keys = fieldPath.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let target: any = room;
  for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
  target[keys[keys.length - 1]] = value;
  localBackend.write(room);
}

export function randomGameId(): GameId {
  return Math.random() > 0.5 ? "color-memory" : "odd-one-out";
}

export { randomCode };
