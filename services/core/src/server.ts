import express from "express";
import morgan from "morgan";
import { SERVER } from "./config/constants";
import { prisma } from "./lib/prisma";
import {
    globalErrorHandler,
    notFoundHandler,
} from "./middlewares/error-handler";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: SERVER.serviceName,
    });
});

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(SERVER.port, SERVER.host, async () => {
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
        });
        console.log(`Core API running on port ${SERVER.port}`);
    } catch (error) {
        console.error("Database health check failed:", error);

        console.log({
            status: "error",
            database: "unavailable",
        });
    }
});

export default app;
