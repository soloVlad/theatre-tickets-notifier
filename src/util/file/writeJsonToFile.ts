import { writeToFile } from "./writeToFile"

export function writeJsonToFile(fileName: string, jsonData: Record<string, unknown>) {
  const data = JSON.stringify(jsonData, null, 2)
  writeToFile(fileName, data);
}
