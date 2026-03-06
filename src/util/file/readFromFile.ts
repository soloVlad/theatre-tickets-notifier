import fs from "node:fs";
import path from "node:path";
import { DATA_FOLDER_PATH } from "@config/constants";

export function readFromFile(fileName: string) {
  const filePath = path.join(DATA_FOLDER_PATH, fileName);
  return fs.readFileSync(filePath, "utf8");
}
