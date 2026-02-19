import { readJsonFromFile, writeJsonToFile } from "../../util";
import { DATA_FILE_NAME } from "./constants";

export function saveAffiche(months: string[]) {
  try {
    writeJsonToFile(DATA_FILE_NAME, {
      availableMonths: months,
    })
  } catch(error) {
    console.error('Error saving state-puppet-theatre affiche: ', error);
  }
} 
