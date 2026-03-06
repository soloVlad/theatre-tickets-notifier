import { readJsonFromFile } from "@util";
import { DATA_FILE_NAME } from "./constants";

export function readSavedAffiche() {
  try {
    const savedAffiche = readJsonFromFile(DATA_FILE_NAME);
    return savedAffiche?.availableMonths;
  } catch {
    return "";
  }
}
