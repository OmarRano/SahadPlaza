export const ENV = {
  jwtSecret: process.env.JWT_SECRET ?? "",
  mongodbUri: process.env.MONGODB_URI ?? "",
  mongodbDbName: process.env.MONGODB_DB_NAME ?? "sahad_stores",
  port: parseInt(process.env.PORT ?? "3000"),
  isProduction: process.env.NODE_ENV === "production",
  appUrl: process.env.VITE_APP_URL ?? "http://localhost:3000",
};
