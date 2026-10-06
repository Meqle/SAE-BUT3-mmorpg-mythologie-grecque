"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const crypto_1 = require("crypto");
const ws_1 = require("ws");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '16kb' }));
const PORT = Number(process.env.PORT || 3001);
const TICK_RATE = 20;
const MAX_PLAYERS_PER_ROOM = 200;
const MAX_ROOMS = 100;
const MAX_MESSAGES_PER_SECOND = 60;
const httpServer = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({
    server: httpServer,
    path: '/ws',
    maxPayload: 4096,
    perMessageDeflate: false
});
const rooms = new Map();
const messageWindows = new WeakMap();
let tickNumber = 0;
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
function send(socket, packet) {
    if (socket.readyState === ws_1.WebSocket.OPEN) {
        socket.send(JSON.stringify(packet));
    }
}
function sendError(socket, message) {
    send(socket, { type: 'ERROR', timestamp: Date.now(), message });
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isGodAffinity(value) {
    return value === 'ZEUS' || value === 'POSEIDON' || value === 'HADES'
        || value === 'ATHENA' || value === 'ARES' || value === 'APOLLO';
}
function isJoinRequestPacket(value) {
    return value.type === 'JOIN_REQUEST'
        && typeof value.timestamp === 'number'
        && typeof value.roomId === 'string'
        && typeof value.username === 'string'
        && isGodAffinity(value.god);
}
function isBooleanKeys(value) {
    if (!isRecord(value))
        return false;
    return ['up', 'down', 'left', 'right'].every((key) => typeof value[key] === 'boolean')
        && (value.jump === undefined || typeof value.jump === 'boolean');
}
function isRoomId(value) {
    return typeof value === 'string' && /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(value);
}
function joinRoom(socket, packet) {
    if (sessions.has(socket)) {
        sendError(socket, 'Cette connexion a déjà rejoint une salle.');
        return;
    }
    const username = packet.username.trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 20);
    if (!username || !isRoomId(packet.roomId) || !isGodAffinity(packet.god)) {
        sendError(socket, 'La demande de connexion contient des informations invalides.');
        return;
    }
    let room = rooms.get(packet.roomId);
    if (!room && rooms.size >= MAX_ROOMS) {
        sendError(socket, 'Le serveur héberge déjà le nombre maximal de salles.');
        return;
    }
    if (!room) {
        room = new Map();
        rooms.set(packet.roomId, room);
    }
    if (room.size >= MAX_PLAYERS_PER_ROOM) {
        sendError(socket, 'Cette salle est complète.');
        return;
    }
    const playerId = (0, crypto_1.randomUUID)();
    const session = {
        socket,
        state: {
            id: playerId,
            username,
            god: packet.god,
            level: 1,
            hp: 100,
            maxHp: 100,
            position: {
                x: 400 + room.size * 48,
                y: 300,
                vx: 0,
                vy: 0,
                direction: 'down',
                isGrounded: true
            },
            viewMode: 'top-down',
            currentRoomId: packet.roomId
        },
        keys: { up: false, down: false, left: false, right: false },
        previousJump: false,
    };
    room.set(playerId, session);
    sessions.set(socket, session);
    const players = Object.fromEntries(Array.from(room, ([id, player]) => [id, player.state]));
    send(socket, {
        type: 'JOIN_RESPONSE',
        timestamp: Date.now(),
        playerId,
        players
    });
}
const sessions = new Map();
function removePlayer(socket) {
    const session = sessions.get(socket);
    if (!session)
        return;
    sessions.delete(socket);
    const room = rooms.get(session.state.currentRoomId);
    room?.delete(session.state.id);
    if (room?.size === 0)
        rooms.delete(session.state.currentRoomId);
}
function updatePlayer(session, deltaSeconds) {
    const { state, keys } = session;
    const position = state.position;
    const horizontal = Number(keys.right) - Number(keys.left);
    const vertical = Number(keys.down) - Number(keys.up);
    const jumpStarted = Boolean(keys.jump) && !session.previousJump;
    session.previousJump = Boolean(keys.jump);
    const speed = 220;
    const acceleration = 1 - Math.pow(0.75, deltaSeconds * 60);
    if (horizontal < 0)
        position.direction = 'left';
    else if (horizontal > 0)
        position.direction = 'right';
    else if (vertical < 0)
        position.direction = 'up';
    else if (vertical > 0)
        position.direction = 'down';
    if (state.viewMode === 'top-down') {
        const length = Math.hypot(horizontal, vertical) || 1;
        const targetVx = (horizontal / length) * speed;
        const targetVy = (vertical / length) * speed;
        position.vx += (targetVx - position.vx) * acceleration;
        position.vy += (targetVy - position.vy) * acceleration;
        position.x += position.vx * deltaSeconds;
        position.y += position.vy * deltaSeconds;
        position.isGrounded = true;
        return;
    }
    position.vx += (horizontal * speed - position.vx) * acceleration;
    position.x += position.vx * deltaSeconds;
    position.vy += 900 * deltaSeconds;
    position.y += position.vy * deltaSeconds;
    const groundY = 456;
    if (position.y >= groundY) {
        position.y = groundY;
        position.vy = 0;
        position.isGrounded = true;
    }
    else {
        position.isGrounded = false;
    }
    if (jumpStarted && position.isGrounded) {
        position.vy = -480;
        position.isGrounded = false;
    }
}
wss.on('connection', (socket, request) => {
    if (wss.clients.size > 1000) {
        socket.close(1013, 'Server is full');
        return;
    }
    const origin = request.headers.origin;
    if (allowedOrigins?.length && (!origin || !allowedOrigins.includes(origin))) {
        socket.close(1008, 'Origin not allowed');
        return;
    }
    messageWindows.set(socket, { startedAt: Date.now(), count: 0 });
    socket.on('message', (data) => {
        const now = Date.now();
        const messageWindow = messageWindows.get(socket);
        if (messageWindow) {
            if (now - messageWindow.startedAt >= 1000) {
                messageWindow.startedAt = now;
                messageWindow.count = 0;
            }
            messageWindow.count += 1;
            if (messageWindow.count > MAX_MESSAGES_PER_SECOND) {
                socket.close(1008, 'Rate limit exceeded');
                return;
            }
        }
        const session = sessions.get(socket);
        let packet;
        try {
            packet = JSON.parse(data.toString());
        }
        catch {
            sendError(socket, 'Le message reçu ne contient pas de JSON valide.');
            return;
        }
        if (!isRecord(packet) || typeof packet.type !== 'string') {
            sendError(socket, 'Format de message invalide.');
            return;
        }
        if (packet.type === 'JOIN_REQUEST') {
            if (!isJoinRequestPacket(packet)) {
                sendError(socket, 'La demande de connexion est invalide.');
                return;
            }
            joinRoom(socket, packet);
            return;
        }
        if (!session) {
            sendError(socket, 'Rejoignez une salle avant d’envoyer des actions.');
            return;
        }
        if (packet.type === 'PLAYER_INPUT') {
            if (!isBooleanKeys(packet.keys)) {
                sendError(socket, 'Les commandes de déplacement sont invalides.');
                return;
            }
            session.keys = packet.keys;
        }
        else if (packet.type === 'SWITCH_VIEW_REQUEST') {
            if (packet.viewMode !== 'top-down' && packet.viewMode !== 'side-view') {
                sendError(socket, 'Le mode de caméra demandé est invalide.');
                return;
            }
            session.state.viewMode = packet.viewMode;
            session.state.position.vx = 0;
            session.state.position.vy = 0;
        }
        else {
            sendError(socket, 'Type de message non pris en charge.');
        }
    });
    socket.on('close', () => removePlayer(socket));
    socket.on('error', (error) => {
        console.error('Erreur WebSocket :', error.message);
        removePlayer(socket);
    });
});
setInterval(() => {
    const deltaSeconds = 1 / TICK_RATE;
    tickNumber += 1;
    for (const [roomId, room] of rooms) {
        for (const session of room.values()) {
            updatePlayer(session, deltaSeconds);
        }
        const packet = {
            type: 'WORLD_TICK',
            timestamp: Date.now(),
            tickNumber,
            players: Object.fromEntries(Array.from(room, ([id, session]) => [id, session.state]))
        };
        const serialized = JSON.stringify(packet);
        for (const session of room.values()) {
            if (session.socket.readyState === ws_1.WebSocket.OPEN) {
                session.socket.send(serialized);
            }
        }
        if (room.size === 0)
            rooms.delete(roomId);
    }
}, 1000 / TICK_RATE);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
