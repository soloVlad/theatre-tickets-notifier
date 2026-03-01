import path from 'path';
import fs from 'fs';
import { DATA_FOLDER_PATH } from '@config/constants';

export function writeToFile(fileName: string, data: string) {
  const filePath = path.join(DATA_FOLDER_PATH, fileName);
  fs.writeFileSync(filePath, data, 'utf8');
}
