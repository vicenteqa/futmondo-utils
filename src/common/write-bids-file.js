import { appendFileSync, unlinkSync, existsSync } from 'fs';
import { parseBidsFile } from './parse-bids-file.js';
import { getPlayerData } from '../endpoints/get-player-data.js';
import path from 'path';

const filePath = path.join(process.cwd(), 'data/bids.txt');

function isValidLine(line) {
  const regex = /^[a-f0-9]{24}(,\d+)?$/;
  return regex.test(line);
}

export function writeBidsFile(data) {
  const lines = data.split('\n');

  lines.forEach((line) => {
    if (isValidLine(line)) {
      appendFileSync(filePath, line + '\n', 'utf8');
    } else {
      console.error(`Línea inválida: ${line}`);
    }
  });
}

export function deleteBidsFile() {
  if (existsSync(filePath)) {
    try {
      unlinkSync(filePath);
      console.log(`Archivo ${filePath} eliminado exitosamente.`);
    } catch (err) {
      console.error(`Error al eliminar el archivo ${filePath}:`, err);
    }
  } else {
    console.log(`El archivo ${filePath} no existe.`);
  }
}

export function getBidsInfoFromFile() {
  const bidsFileContent = parseBidsFile();
  bidsFileContent.forEach(async (bid) => {
    const playerData = await getPlayerData(bid.playerId);
    console.log(
      'There is a potential bid placed for ' + playerData.answer.data.name
    );
  });
}
