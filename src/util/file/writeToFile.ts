import fs from "node:fs";
import path from "node:path";
import { DATA_FOLDER_PATH } from "@config/constants";

export function writeToFile(fileName: string, data: string) {
  const filePath = path.join(DATA_FOLDER_PATH, fileName);
  fs.writeFileSync(filePath, data, "utf8");
}
