import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import messageRoutes from "./message.routes.js";
import aiRoutes from "./ai.routes.js";

export function registerRoutes(app) {
  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/ai", aiRoutes);
}
