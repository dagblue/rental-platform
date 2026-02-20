export declare const dbConfig: {
    useDatabase: boolean;
    migrationMode: "dual-write" | "read-db";
};
export declare const getServiceMode: () => {
    useDatabase: boolean;
    dualWrite: boolean;
};
