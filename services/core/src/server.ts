import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { SERVER } from "./config/constants";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middlewares/error-handler";
import routes from "./routes";
import { prisma } from "./lib/prisma";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(morgan("common"));

app.use(routes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

const bootstrap = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully!");

    app.listen(SERVER.port, SERVER.host, () => {
      console.log(`Core API running on port ${SERVER.port}`);
    });
  } catch (error) {
    console.log(`Failed to connect to database: ${error}`);
    process.exit(0);
  }
};

const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down...`);

  await prisma.$disconnect();

  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

bootstrap();

export default app;
