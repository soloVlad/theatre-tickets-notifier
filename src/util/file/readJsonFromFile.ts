import { readFromFile } from "./readFromFile";

export function readJsonFromFile(fileName: string) {
  const data = readFromFile(fileName);
  return JSON.parse(data);
}
