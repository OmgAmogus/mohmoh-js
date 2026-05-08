import { UTILS } from './utils.js';

/**
 * Validation sécurisée pour tous les types de paquets
 */
export const validatePacket = (type, data, player) => {
    if (!type || !player) return false;

    const validators = {
        'sp': () => {
            if (player.alive) return false;
            return data && data[0] && typeof data[0] === 'object';
        },
        '33': () => {
            if (!player.alive) return false;
            return data[0] === undefined || data[0] === null || UTILS.isNumber(data[0]);
        },
        'c': () => {
            if (!player.alive) return false;
            return typeof data[0] === 'boolean' && (UTILS.isNumber(data[1]) || data[1] === undefined);
        },
        '2': () => {
            if (!player.alive) return false;
            return UTILS.isNumber(data[0]);
        },
        '5': () => {
            if (!player.alive) return false;
            return UTILS.isNumber(data[0]) && data[0] >= 0;
        },
        '6': () => {
            if (!player.alive) return false;
            return player.upgradePoints > 0 && Number.isInteger(data[0]) && data[0] >= 0;
        },
        'ch': () => {
            if (!player.alive) return false;
            return typeof data[0] === 'string' && data[0].length > 0 && data[0].length <= 100;
        },
        '8': () => {
            if (!player.alive || player.team) return false;
            return typeof data[0] === 'string' && data[0].length >= 1 && data[0].length <= 7;
        },
        '13c': () => {
            if (!player.alive) return false;
            return UTILS.isNumber(data[0]) && UTILS.isNumber(data[1]);
        }
    };

    const validator = validators[type];
    return validator ? validator() : true;
};

/**
 * Système anti-spam avancé avec rate limiting par action
 */
export class RateLimiter {
    constructor(maxPerSecond = 100, windowMs = 1000) {
        this.maxPerSecond = maxPerSecond;
        this.windowMs = windowMs;
        this.violations = new Map();
    }

    check(playerId, action, customLimit = null) {
        const key = `${playerId}:${action}`;
        const now = Date.now();
        const limit = customLimit || this.maxPerSecond;

        if (!this.violations.has(key)) {
            this.violations.set(key, []);
        }

        const times = this.violations.get(key).filter(t => now - t < this.windowMs);

        if (times.length >= limit) {
            return false; // Spam détecté
        }

        times.push(now);
        this.violations.set(key, times);
        return true;
    }

    reset(playerId, action) {
        const key = `${playerId}:${action}`;
        this.violations.delete(key);
    }

    cleanup() {
        const now = Date.now();
        for (const [key, times] of this.violations.entries()) {
            const filtered = times.filter(t => now - t < this.windowMs);
            if (filtered.length === 0) {
                this.violations.delete(key);
            } else {
                this.violations.set(key, filtered);
            }
        }
    }
}

/**
 * Détecteur d'exploits et comportements suspects
 */
export class AnomalyDetector {
    constructor() {
        this.suspiciousPlayers = new Map();
        this.thresholds = {
            buildSpam: 500,
            packetSpam: 10000,
            moveSpam: 1000,
            chatSpam: 100
        };
    }

    flagAnomalies(player) {
        const anomalies = [];

        // Détection de spam de construction
        if (player.buildIndex >= 0 && player.packet_spam > this.thresholds.buildSpam) {
            anomalies.push('BUILD_SPAM');
        }

        // Détection de spam de paquets
        if (player.packet_spam > this.thresholds.packetSpam) {
            anomalies.push('PACKET_SPAM');
        }

        // Vérifier les tentatives d'accès illégal
        if (player.weapons && Object.keys(player.weapons).length > 20) {
            anomalies.push('ILLEGAL_WEAPONS');
        }

        if (player.items && Object.keys(player.items).length > 100) {
            anomalies.push('ILLEGAL_ITEMS');
        }

        if (anomalies.length > 0) {
            this.suspiciousPlayers.set(player.sid, {
                anomalies,
                timestamp: Date.now(),
                count: (this.suspiciousPlayers.get(player.sid)?.count || 0) + 1
            });
        }

        return anomalies;
    }

    isBanworthy(player) {
        const record = this.suspiciousPlayers.get(player.sid);
        if (!record) return false;

        // Ban après 3 violations
        return record.count >= 3;
    }

    clear(playerId) {
        this.suspiciousPlayers.delete(playerId);
    }
}
