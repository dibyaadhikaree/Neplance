const app = require("./src/app");

const dotenv = require("dotenv");
const logger = require("./src/utils/logger");
dotenv.config({ path: "./.env" });

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception detected; terminating process.", err);
  process.exit(1);
});

const port = process.env.PORT;

const connectDB = require("./src/config/db");

// Connect to Database
connectDB();

const server = app.listen(port, "127.0.0.1", () => {
  logger.info(`Server listening on 127.0.0.1:${port}`);
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled rejection detected; shutting down the server.", err);
  server.close(() => {
    logger.info("Server closed after unhandled rejection.");
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  logger.warn("SIGTERM received. Initiating graceful shutdown.");
  server.close(() => {
    logger.info("Process terminated gracefully.");
  });
});
