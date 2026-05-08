/**
 * Main Improved - Serveur Optimisé Mohmoh-JS v2
 * Utilise les systèmes de sécurité et performance
 * 
 * Usage: node main-improved.js
 */

import e from "express";
import path from "node:path";
import { WebSocketServer } from "ws";
import { createServer } from "node:http";
import { decode, encode } from "msgpack-lite";
import { Game } from "./moomoo/server.js";
import { Player } from "./moomoo/modules/player.js";
import { items } from "./moomoo/modules/items.js";
import { UTILS } from "./moomoo/libs/utils.js";
import { hats, accessories } from "./moomoo/modules/store.js";
import { delay } from "./moomoo/modules/delay.js";
import { filter_chat } from "./moomoo/libs/filterchat.js";
import { 
    config, 
    log, 
    serverStats, 
    perfMonitor, 
    validateConfig 
} from "./moomoo/config-improved.js";
import { 
    validatePacket, 
    RateLimiter, 
    AnomalyDetector 
} from "./moomoo/libs/security.js";
import { 
    MessageBatcher, 
    ZonedBroadcaster, 
    ConnectionManager 
} from "./moomoo/libs/performance.js";

// === VALIDATION ===
validateConfig();

// === INSTANCES GLOBALES ===
const app = e();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const game = new Game();

// === SYSTÈMES D'OPTIMISATION ===
const rateLimiter = new RateLimiter(config.RATE_LIMIT.globalPacketsPerSecond);
const anomalyDetector = new AnomalyDetector();
const messageBatcher = new MessageBatcher(config.PERFORMANCE.messageBatchIntervalMs);
const broadcaster = new ZonedBroadcaster(
    config.MAP.width,
    config.MAP.height,
    config.PERFORMANCE.zoneSize
);
const connManager = new ConnectionManager(
    config.PLAYERS.maxPlayersPerIP,
    config.RATE_LIMIT.ddosThreshold
);

// === CONFIGURATION EXPRESS ===
const INDEX = path.join(import.meta.dirname, "../client/index.html");
const PORT = config.NETWORK.port;

app.get("/", (req, res) => {
    res.sendFile(INDEX);
});

app.get("/ping", (_req, res) => {
    res.send("Ok");
});

app.get("/stats", (_req, res) => {
    serverStats.printStats();
    res.json({
        uptime: serverStats.getUptime(),
        players: serverStats.playerCount,
        packetsRx: serverStats.packetsRx,
        packetsTx: serverStats.packetsTx,
        errors: serverStats.errors,
        cheatersBanned: serverStats.cheatersBanned,
    });
});

app.use(e.static("../client/public"));

// === WEBSOCKET HANDLER ===
wss.on("connection", async (socket, req) => {
    const timer = perfMonitor.startTimer('connection_init');

    try {
        // === VÉRIFICATIONS DE CONNEXION ===
        
        // Max joueurs atteint
        if (game.players.length > config.PLAYERS.maxPlayersHard) {
            log('warn', 'Server full', { players: game.players.length });
            socket.close(4002);
            return;
        }

        // Obtenir l'IP du joueur
        const addr = req.headers["x-forwarded-for"]?.split(",")[0] ?? req.socket.remoteAddress;

        // Rate limiting par IP
        const connCheck = connManager.addConnection(addr);
        if (!connCheck.ddos && !connManager.canConnect(addr)) {
            log('warn', 'Too many connections from IP', { ip: addr });
            socket.close(4001);
            return;
        }

        if (connCheck.ddos) {
            log('error', 'DDoS detected', { ip: addr, connections: connCheck.count });
            socket.close(4003);
            return;
        }

        // Ajouter le joueur au serveur
        const player = game.addPlayer(socket);
        serverStats.playerCount = game.players.length;

        log('info', 'Player connected', { sid: player.sid, ip: addr, totalPlayers: game.players.length });

        // === MESSAGE HANDLER ===
        socket.on("message", async msg => {
            try {
                serverStats.recordPacketIn();

                // Décoder le message
                const [type, data] = decode(new Uint8Array(msg));
                const t = type?.toString();

                // Rate limiting global
                if (!rateLimiter.check(player.sid, 'global')) {
                    log('warn', 'Global rate limit exceeded', { sid: player.sid });
                    socket.close(4004);
                    return;
                }

                // Validation du paquet
                if (config.SECURITY.packetValidation && !validatePacket(t, data, player)) {
                    const anomalies = anomalyDetector.flagAnomalies(player);
                    log('warn', 'Invalid packet detected', { sid: player.sid, type: t, anomalies });

                    if (anomalyDetector.isBanworthy(player)) {
                        log('error', 'Player auto-banned', { sid: player.sid, anomalies });
                        serverStats.recordCheaterBan();
                        socket.close(4000);
                        return;
                    }
                }

                // Ajouter délai pour éviter le surcharge
                await delay();

                // === TRAITEMENT DES PAQUETS ===
                switch (t) {
                    case "sp": {
                        if (player.alive) break;
                        player.setUserData(data[0]);
                        player.spawn(data[0]?.moofoll);
                        messageBatcher.add(player.sid, "1", player.sid);
                        break;
                    }

                    case "33": {
                        if (!player.alive) break;
                        player.moveDir = data[0];
                        break;
                    }

                    case "c": {
                        if (!player.alive) break;
                        player.mouseState = data[0];
                        if (data[0] && player.buildIndex === -1) {
                            player.hits++;
                        }
                        if (UTILS.isNumber(data[1])) {
                            player.dir = data[1];
                        }
                        if (player.buildIndex >= 0) {
                            const item = items.list[player.buildIndex];
                            if (data[0]) {
                                player.packet_spam++;
                                if (player.packet_spam >= config.SECURITY.maxPacketSpam) {
                                    log('error', 'Packet spam detected', { sid: player.sid });
                                    socket.close(4000);
                                    return;
                                }
                                player.buildItem(item);
                            }
                            player.mouseState = 0;
                            player.hits = 0;
                        }
                        break;
                    }

                    case "7": {
                        if (!player.alive) break;
                        if (data[0]) {
                            player.autoGather = !player.autoGather;
                        }
                        break;
                    }

                    case "2": {
                        if (!player.alive) break;
                        if (UTILS.isNumber(data[0])) {
                            player.dir = data[0];
                        }
                        break;
                    }

                    case "5": {
                        if (!player.alive) break;
                        if (!UTILS.isNumber(data[0])) break;

                        if (data[1]) {
                            const wpn = items.weapons[data[0]];
                            if (!wpn) break;
                            if (player.weapons[wpn.type] !== data[0]) break;
                            player.buildIndex = -1;
                            player.weaponIndex = data[0];
                            break;
                        }

                        const item = items.list[data[0]];
                        if (!item) break;

                        if (player.buildIndex === data[0]) {
                            player.buildIndex = -1;
                            player.mouseState = 0;
                            break;
                        }

                        player.buildIndex = data[0];
                        player.mouseState = 0;
                        break;
                    }

                    case "13c": {
                        if (!player.alive) break;
                        const [type, id, index] = data;

                        if (index) {
                            let tail = accessories.find(acc => acc.id == id);
                            if (tail) {
                                if (type) {
                                    if (!player.tails[id] && player.points >= tail.price) {
                                        player.tails[id] = 1;
                                        messageBatcher.add(player.sid, "us", 0, id, 1);
                                    }
                                } else {
                                    if (player.tails[id]) {
                                        player.tail = tail;
                                        player.tailIndex = player.tail.id;
                                        messageBatcher.add(player.sid, "us", 1, id, 1);
                                    }
                                }
                            } else {
                                if (id == 0) {
                                    player.tail = {};
                                    player.tailIndex = 0;
                                    messageBatcher.add(player.sid, "us", 1, 0, 1);
                                }
                            }
                        } else {
                            let hat = hats.find(hat => hat.id == id);
                            if (hat) {
                                if (type) {
                                    if (!player.skins[id] && player.points >= hat.price) {
                                        player.skins[id] = 1;
                                        messageBatcher.add(player.sid, "us", 0, id, 0);
                                    }
                                } else {
                                    if (player.skins[id]) {
                                        player.skin = hat;
                                        player.skinIndex = player.skin.id;
                                        messageBatcher.add(player.sid, "us", 1, id, 0);
                                    }
                                }
                            } else {
                                if (id == 0) {
                                    player.skin = {};
                                    player.skinIndex = 0;
                                    messageBatcher.add(player.sid, "us", 1, 0, 0);
                                }
                            }
                        }
                        break;
                    }

                    case "6": {
                        if (!player.alive) break;
                        if (player.upgradePoints <= 0) break;

                        const item = Number.parseInt(data[0]);
                        const upgr_items = items.list.filter(x => x.age === player.upgrAge);
                        const upgr_weapons = items.weapons.filter(x => x.age === player.upgrAge);

                        const update = (() => {
                            if (item < items.weapons.length) {
                                const wpn = upgr_weapons.find(x => x.id === item);
                                if (!wpn) return false;
                                player.weapons[wpn.type] = wpn.id;
                                player.weaponXP[wpn.type] = 0;
                                const type = player.weaponIndex < 9 ? 0 : 1;
                                if (wpn.type === type) {
                                    player.weaponIndex = wpn.id;
                                }
                                return true;
                            }

                            const i2 = item - items.weapons.length;
                            if (!upgr_items.some(x => x.id === i2)) return false;
                            player.addItem(i2);
                            return true;
                        })();

                        if (!update) break;

                        player.upgrAge++;
                        player.upgradePoints--;
                        messageBatcher.add(player.sid, "17", player.items, 0);
                        messageBatcher.add(player.sid, "17", player.weapons, 1);

                        if (player.age >= 0) {
                            messageBatcher.add(player.sid, "16", player.upgradePoints, player.upgrAge);
                        } else {
                            messageBatcher.add(player.sid, "16", 0, 0);
                        }
                        break;
                    }

                    case "ch": {
                        if (!player.alive) break;
                        if (player.chat_cooldown > 0) break;
                        if (typeof data[0] !== "string") break;

                        const chat = filter_chat(data[0]);
                        if (chat.length === 0) break;

                        game.server.broadcast("ch", player.sid, chat);
                        player.chat_cooldown = config.CHAT.cooldownMs;
                        break;
                    }

                    case "pp": {
                        messageBatcher.add(player.sid, "pp");
                        break;
                    }

                    // Clan commands
                    case "8": case "9": case "10": case "11": case "12": {
                        if (!player.alive) break;
                        log('debug', 'Clan command', { sid: player.sid, type: t });
                        break;
                    }

                    case "14": {
                        if (!player.alive) break;
                        if (player.ping_cooldown > 0) break;
                        player.ping_cooldown = config.PERFORMANCE.zoneSize;
                        game.server.broadcast("p", player.x, player.y);
                        break;
                    }

                    case "rmd": {
                        if (!player.alive) break;
                        player.resetMoveDir();
                        break;
                    }

                    default:
                        break;
                }

                serverStats.recordPacketOut();
                perfMonitor.endTimer('packet_process', timer);

            } catch (err) {
                serverStats.recordError();
                log('error', 'Message processing error', { error: err.message, sid: player?.sid });
            }
        });

        // === CLOSE HANDLER ===
        socket.on("close", reason => {
            connManager.removeConnection(addr);
            anomalyDetector.clear(player.sid);

            if (player.team) {
                if (player.is_owner) {
                    game.clan_manager.remove(player.team);
                } else {
                    game.clan_manager.kick(player.team, player.sid);
                }
            }

            game.removePlayer(player.id);
            serverStats.playerCount = game.players.length;

            log('info', 'Player disconnected', { sid: player.sid, totalPlayers: game.players.length });
        });

        perfMonitor.endTimer('connection_init', timer);

    } catch (err) {
        serverStats.recordError();
        log('error', 'Connection error', { error: err.message });
        socket.close();
    }
});

// === OPTIMISATION PÉRIODIQUE ===

// Batching automatique
messageBatcher.startAutoFlush(game.players, encode);

// Cleanup des connexions
connManager.startCleanup(config.PERFORMANCE.cleanupIntervalMs);

// Afficher les stats toutes les 5 minutes
setInterval(() => {
    if (config.LOGGING.enableConsole) {
        serverStats.printStats();
        perfMonitor.printReport();
    }
}, 300000);

// === DÉMARRAGE ===
server.listen(PORT, (error) => {
    if (error) {
        log('error', 'Server startup error', { error: error.message });
        throw error;
    }

    log('info', `Server running on http://0.0.0.0:${PORT}`);
    log('info', `Configuration loaded. Max players: ${config.PLAYERS.maxPlayersHard}`);
});

export { game, wss, app, server };
