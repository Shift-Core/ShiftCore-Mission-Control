export type THealthStatus = "ok" | "error";

export type THealthResponse = {
    status: "ok";
    service: string;
    datetime: string;
};

export type TDatabaseHealthResponse = {
    status: THealthStatus;
    service: string;
    datetime: string;
    database: {
        status: "connected" | "unavailable";
    };
};
