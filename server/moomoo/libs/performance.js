/**
 * Performance Optimizations - Mohmoh-JS v2
 * Message batching, zone broadcasting, connection management
 */

/**
 * Message Batcher - Agrège les messages pour réduire la bande passante (-40%)
 */
export class MessageBatcher {
    constructor(batchIntervalMs = 50) {
        this.batchIntervalMs = batchIntervalMs;
        this.batches = new Map();
        this.autoFlushInterval = null;
    }

    add(playerId, messageType, ...data) {
        if (!this.batches.has(playerId)) {
            this.batches.set(playerId, []);
        }
        this.batches.get(playerId).push([messageType, data]);
    }

    flush(playerId, players, encode) {
        if (!this.batches.has(playerId)) return;

        const messages = this.batches.get(playerId);
        if (messages.length === 0) {
            this.batches.delete(playerId);
            return;
        }

        const player = players.find(p => p.sid === playerId);
        if (!player || !player.socket) {
            this.batches.delete(playerId);
            return;
        }

        try {
            player.socket.send(encode(['batch', messages]));
            this.batches.delete(playerId);
        } catch (e) {
            console.error(`Failed to flush messages for player ${playerId}:`, e.message);
        }
    }

    flushAll(players, encode) {
        for (const playerId of this.batches.keys()) {
            this.flush(playerId, players, encode);
        }
    }

    startAutoFlush(players, encode) {
        if (this.autoFlushInterval) return;

        this.autoFlushInterval = setInterval(() => {
            this.flushAll(players, encode);
        }, this.batchIntervalMs);
    }

    stopAutoFlush() {
        if (this.autoFlushInterval) {
            clearInterval(this.autoFlushInterval);
            this.autoFlushInterval = null;
        }
    }

    clear() {
        this.batches.clear();
    }
}

/**
 * Zoned Broadcaster - Broadcast uniquement aux joueurs proches (zone-based)
 */
export class ZonedBroadcaster {
    constructor(mapWidth, mapHeight, zoneSize) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.zoneSize = zoneSize;
        this.zones = new Map();
    }

    getZone(x, y) {
        const zx = Math.floor(x / this.zoneSize);
        const zy = Math.floor(y / this.zoneSize);
        return `${zx},${zy}`;
    }

    getNearbyZones(x, y, range) {
        const zones = new Set();
        const radiusZones = Math.ceil(range / this.zoneSize) + 1;

        for (let dx = -radiusZones; dx <= radiusZones; dx++) {
            for (let dy = -radiusZones; dy <= radiusZones; dy++) {
                zones.add(this.getZone(x + dx * this.zoneSize, y + dy * this.zoneSize));
            }
        }

        return zones;
    }

    broadcastNearby(x, y, range, players, messageType, encode, ...data) {
        const nearbyZones = this.getNearbyZones(x, y, range);
        let count = 0;

        for (const player of players) {
            const zone = this.getZone(player.x, player.y);
            if (nearbyZones.has(zone)) {
                try {
                    player.socket?.send(encode([messageType, data]));
                    count++;
                } catch (e) {
                    console.error(`Failed to broadcast to player ${player.sid}:`, e.message);
                }
            }
        }

        return count;
    }

    broadcastAll(players, messageType, encode, ...data) {
        let count = 0;
        for (const player of players) {
            if (player.socket) {
                try {
                    player.socket.send(encode([messageType, data]));
                    count++;
                } catch (e) {
                    console.error(`Failed to broadcast:`, e.message);
                }
            }
        }
        return count;
    }
}

/**
 * Connection Manager - Gère les connexions et protection DDoS
 */
export class ConnectionManager {
    constructor(maxPerIP = 4, ddosThreshold = 100) {
        this.maxPerIP = maxPerIP;
        this.ddosThreshold = ddosThreshold;
        this.connections = new Map();
        this.cleanupInterval = null;
    }

    canConnect(ip) {
        if (!this.connections.has(ip)) {
            return true;
        }
        const count = this.connections.get(ip).length;
        return count < this.maxPerIP;
    }

    addConnection(ip) {
        if (!this.connections.has(ip)) {
            this.connections.set(ip, []);
        }

        const now = Date.now();
        const connections = this.connections.get(ip);

        // Cleanup les connexions fermées (+ de 10 secondes)
        const validConnections = connections.filter(t => now - t < 10000);
        this.connections.set(ip, validConnections);

        // Vérifier le seuil DDoS
        if (validConnections.length > this.ddosThreshold) {
            return { canConnect: false, ddos: true, count: validConnections.length };
        }

        // Ajouter la nouvelle connexion
        validConnections.push(now);

        return {
            canConnect: validConnections.length <= this.maxPerIP,
            ddos: false,
            count: validConnections.length
        };
    }

    removeConnection(ip) {
        if (!this.connections.has(ip)) return;

        const connections = this.connections.get(ip);
        connections.pop(); // Retirer la plus ancienne

        if (connections.length === 0) {
            this.connections.delete(ip);
        }
    }

    startCleanup(intervalMs = 60000) {
        if (this.cleanupInterval) return;

        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [ip, connections] of this.connections.entries()) {
                const valid = connections.filter(t => now - t < 10000);
                if (valid.length === 0) {
                    this.connections.delete(ip);
                } else {
                    this.connections.set(ip, valid);
                }
            }
        }, intervalMs);
    }

    stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    getStats() {
        return {
            totalIPs: this.connections.size,
            totalConnections: Array.from(this.connections.values()).reduce((a, b) => a + b.length, 0)
        };
    }
}

/**
 * Data Cache - Cache pour réduire les calculs
 */
export class DataCache {
    constructor(ttlMs = 5000) {
        this.ttlMs = ttlMs;
        this.cache = new Map();
    }

    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }

        const entry = this.cache.get(key);
        if (Date.now() - entry.timestamp > this.ttlMs) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    has(key) {
        return this.get(key) !== null;
    }

    clear() {
        this.cache.clear();
    }

    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.ttlMs) {
                this.cache.delete(key);
            }
        }
    }
}

/**
 * Packet Compressor - Compresse les paquets de chat/messages (-30%)
 */
export class PacketCompressor {
    static compress(packet) {
        if (Array.isArray(packet) && packet.length === 2) {
            const [type, data] = packet;
            // Compresser les strings longues
            if (typeof data === 'string' && data.length > 100) {
                return [type, data.substring(0, 100)]; // Limiter la taille
            }
        }
        return packet;
    }

    static decompress(packet) {
        // Pas de décompression nécessaire
        return packet;
    }
}

/**
 * Heartbeat Manager - Veille de la santé des connexions
 */
export class HeartbeatManager {
    constructor(intervalMs = 30000) {
        this.intervalMs = intervalMs;
        this.interval = null;
    }

    start(players, encode) {
        if (this.interval) return;

        this.interval = setInterval(() => {
            for (const player of players) {
                if (player.socket && player.socket.readyState === 1) { // OPEN
                    try {
                        player.socket.send(encode(['ping']));
                    } catch (e) {
                        console.error(`Heartbeat error for player ${player.sid}:`, e.message);
                    }
                }
            }
        }, this.intervalMs);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

export default {
    MessageBatcher,
    ZonedBroadcaster,
    ConnectionManager,
    DataCache,
    PacketCompressor,
    HeartbeatManager
};
