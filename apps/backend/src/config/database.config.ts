import { tap } from "node:test/reporters";

export const dbConfig = {
  // Toggle to switch between in-memory and database
  useDatabase: false,
  
  // Migration mode: 'dual-write' or 'read-db'
  migrationMode: 'dual-write' as 'dual-write' | 'read-db',
};

// Helper to decide which service to use
export const getServiceMode = () => {
  return {
    useDatabase: dbConfig.useDatabase,
    dualWrite: dbConfig.migrationMode === 'dual-write',
  };
};
