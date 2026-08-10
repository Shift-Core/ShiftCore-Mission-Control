import express from "express";
import { prisma } from "./lib/prisma";

const app = express();

const PORT = Number(process.env.PORT ?? 4000);

app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "core",
    });
});

app.listen(PORT, "0.0.0.0", async () => {
    try {
        const result = await prisma.$queryRaw`
      SELECT
        current_database() AS database,
        current_schema() AS schema,
        current_user AS user
    `;

        console.log({
            status: "ok",
            database: result,
        })
        console.log(`Core API running on port ${PORT}`);

    } catch (error) {
        console.error("Database health check failed:", error);

        console.log({
            status: "error",
            database: "unavailable",
        })
    }
});