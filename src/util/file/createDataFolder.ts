import fs from "node:fs";
import { DATA_FOLDER_PATH } from "@config/constants";

export function createDataFolder() {
  if (!fs.existsSync(DATA_FOLDER_PATH)) {
    fs.mkdirSync(DATA_FOLDER_PATH, { recursive: true });
  }
}
