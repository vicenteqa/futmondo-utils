import { getTransfers } from '../endpoints/press-room.js';

export async function getTodayTransfers() {
  const response = await getTransfers();
  const transfers = response.answer.news;
  const todayTransfers = transfers.filter(
    (transfer) =>
      new Date(transfer.created).toDateString() === new Date().toDateString()
  );
  return todayTransfers;
}

export async function getTodayRichmondTransfers() {
  const todayTransfers = await getTodayTransfers();
  return todayTransfers.filter((transfer) =>
    transfer._buyer.name.includes('Richmond')
  );
}
