/**
 * Configuration Centralisée Mohmoh-JS v2
 * Tous les paramètres au même endroit
 */

export const config = {
    // === JOUEURS ===
    PLAYERS: {
        maxPlayersHard: 800,
        maxPlayersPerIP: 4,
        spawnProtectionMs: 3000,
    },

    // === RÉSEAU ===
    NETWORK: {
        port: process.env.PORT || 8080,
        host: process.env.HOST || '0.0.0.0',
    },

    // === SÉCURITÉ ===
    SECURITY: {
        autobanCheaters: true,
        enableDetailedLogging: process.env.DEBUG === 'true',
        packetValidation: true,
        maxPacketSpam: 10000,
    },

    // === RATE LIMITING ===
    RATE_LIMIT: {
        globalPacketsPerSecond: 100,
        movePacketsPerSecond: 1000,
        chatPacketsPerSecond: 50,
        buildPacketsPerSecond: 500,
        ddosThreshold: 100,
    },

    // === CHAT ===
    CHAT: {
        cooldownMs: 300,
        maxLength: 100,
        minLength: 1,
        enableFiltering: true,
    },

    // === CLAN ===
    CLAN: {
        cooldownMs: 200,
        maxNameLength: 7,
        minNameLength: 1,
    },

    // === PERFORMANCE ===
    PERFORMANCE: {
        messageBatchIntervalMs: 50,
        zoneSize: 300,
        cleanupIntervalMs: 60000,
        enableMetrics: true,
    },

    // === LOGGING ===
    LOGGING: {
        level: process.env.LOG_LEVEL || 'info', // debug, info, warn, error
        enableConsole: true,
        enableFile: false,
        logFile: './server.log',
    },

    // === MAP ===
    MAP: {
        width: 8000,
        height: 8000,
        spawnRadius: 100,
    }
};

/**
 * Valider la configuration au démarrage
 */
export const validateConfig = () => {
    if (config.PLAYERS.maxPlayersHard <= 0) {
        throw new Error('maxPlayersHard must be > 0');
    }
    if (config.RATE_LIMIT.globalPacketsPerSecond <= 0) {
        throw new Error('globalPacketsPerSecond must be > 0');
    }
    log('info', 'Configuration validated successfully');
};

/**
 * Système de Logging Centralisé
 */
export const log = (level, message, meta = {}) => {
    if (!config.LOGGING.enableConsole) return;

    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[config.LOGGING.level] || 1;
    const messageLevel = levels[level] || 1;

    if (messageLevel < currentLevel) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';

    console.log(`${prefix} ${message}${metaStr}`);
};

/**
 * Statistiques du Serveur
 */
export const serverStats = {
    startTime: Date.now(),
    playerCount: 0,
    packetsRx: 0,
    packetsTx: 0,
    errors: 0,
    cheatersBanned: 0,

    recordPacketIn() {
        this.packetsRx++;
    },

    recordPacketOut() {
        this.packetsTx++;
    },

    recordError() {
        this.errors++;
    },

    recordCheaterBan() {
        this.cheatersBanned++;
        log('warn', `Cheater banned. Total: ${this.cheatersBanned}`);
    },

    getUptime() {
        const ms = Date.now() - this.startTime;
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
    },

    getAveragePacketThroughput() {
        const seconds = (Date.now() - this.startTime) / 1000;
        if (seconds === 0) return 0;
        return Math.round((this.packetsRx + this.packetsTx) / seconds * 100) / 100;
    },

    printStats() {
        console.log('\n=== SERVER STATS ===');
        console.log(`uptime: ${this.getUptime()}`);
        console.log(`players: ${this.playerCount}`);
        console.log(`packetsRx: ${this.packetsRx}`);
        console.log(`packetsTx: ${this.packetsTx}`);
        console.log(`errors: ${this.errors}`);
        console.log(`cheatersBanned: ${this.cheatersBanned}`);
        console.log(`avgPacketThroughput: ${this.getAveragePacketThroughput()}`);
        console.log('====================\n');
    },

    reset() {
        this.startTime = Date.now();
        this.packetsRx = 0;
        this.packetsTx = 0;
        this.errors = 0;
        this.cheatersBanned = 0;
    }
};

/**
 * Performance Monitor
 */
export const perfMonitor = {
    metrics: new Map(),

    startTimer(name) {
        return Date.now();
    },

    endTimer(name, startTime) {
        const duration = Date.now() - startTime;

        if (!this.metrics.has(name)) {
            this.metrics.set(name, {
                count: 0,
                total: 0,
                min: Infinity,
                max: -Infinity
            });
        }

        const metric = this.metrics.get(name);
        metric.count++;
        metric.total += duration;
        metric.min = Math.min(metric.min, duration);
        metric.max = Math.max(metric.max, duration);

        if (config.LOGGING.enableConsole && config.PERFORMANCE.enableMetrics) {
            if (duration > 50) { // Log si > 50ms
                log('debug', `[PERF] ${name}: ${duration}ms`, {});
            }
        }
    },

    getMetric(name) {
        if (!this.metrics.has(name)) return null;
        const m = this.metrics.get(name);
        return {
            avg: Math.round(m.total / m.count * 100) / 100,
            min: m.min,
            max: m.max,
            count: m.count
        };
    },

    printReport() {
        console.log('\n=== PERFORMANCE REPORT ===');
        for (const [name, metric] of this.metrics.entries()) {
            const avg = Math.round(metric.total / metric.count * 100) / 100;
            console.log(`${name}: avg=${avg}ms, min=${metric.min}ms, max=${metric.max}ms (${metric.count} samples)`);
        }
        console.log('==========================\n');
    },

    clear() {
        this.metrics.clear();
    },

    reset() {
        this.clear();
    }
};

// Valider la config au import
validateConfig();
log('info', `Server configuration loaded. Max players: ${config.PLAYERS.maxPlayersHard}`);
