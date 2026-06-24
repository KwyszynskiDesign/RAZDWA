export const APP_ENV = (process.env.RAZDWA_ENV ?? "dev") as "dev" | "staging" | "client";
export const CLIENT_ID: string = process.env.RAZDWA_CLIENT_ID ?? "";
export const GAS_URL: string = process.env.GOOGLE_APPS_SCRIPT_URL ?? "";
