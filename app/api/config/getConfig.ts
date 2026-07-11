import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface Config {
  email: string;
  location: string;
  tenant: string;
  token: string;
  policy: string;
  space: string;
  duration: string;
  tel: string;
}

export function getConfig(): Config {
  const configPath = join(process.cwd(), "db", "config.json");
  return JSON.parse(readFileSync(configPath, "utf8")) as Config;
}
