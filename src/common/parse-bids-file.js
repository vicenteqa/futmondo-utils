import { readFileSync } from 'fs';
import path from 'path';

export function parseBidsFile() {
  const filePath = path.join(process.cwd(), '/data/bids.txt');
  let filteredBids = [];
  const fileRawData = readFileSync(filePath, 'utf8');
  const lines = fileRawData.split('\n');
  const bids = lines.map((line) => {
    const [playerId, maxBidAmount] = line.split(',').map((item) => item.trim());
    const bidObject = { playerId };
    if (maxBidAmount) bidObject.maxBidAmount = parseInt(maxBidAmount, 10);
    return bidObject;
  });
  filteredBids = bids.filter((bid) => bid.playerId);
  return filteredBids;
}
