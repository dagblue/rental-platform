"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceMode = exports.dbConfig = void 0;
exports.dbConfig = {
    // Toggle to switch between in-memory and database
    useDatabase: false, // Start with false, test, then switch to true
    // Migration mode: 'dual-write' or 'read-db'
    migrationMode: 'dual-write',
};
// Helper to decide which service to use
const getServiceMode = () => {
    return {
        useDatabase: exports.dbConfig.useDatabase,
        dualWrite: exports.dbConfig.migrationMode === 'dual-write',
    };
};
exports.getServiceMode = getServiceMode;
