import express from "express";
import morgan from "morgan";
import { SERVER } from "./config/constants";
import {
    globalErrorHandler,
    notFoundHandler,
} from "./middlewares/error-handler";
import routes from "./routes";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use(routes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(SERVER.port, SERVER.host, () => {
    console.log(`Core API running on port ${SERVER.port}`);
});

export default app;
