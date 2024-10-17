import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Ruta del archivo fichajes.json
const filePath = path.join(process.cwd(), 'fichajes.json');

// Función para agrupar las transacciones por día y reducir la información
function groupTransactionsByDay(filePath) {
  const rawData = readFileSync(filePath, 'utf8');
  const data = JSON.parse(rawData);

  const groupedTransactions = data.answer.news.reduce((acc, transaction) => {
    const date = new Date(transaction.created).toISOString().split('T')[0];

    const reducedTransaction = {
      player: transaction._player.name,
      price: transaction.price,
      seller: transaction._seller ? transaction._seller.name : 'computer',
      buyer: transaction._buyer ? transaction._buyer.name : 'computer',
    };

    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(reducedTransaction);

    return acc;
  }, {});

  return groupedTransactions;
}

// Función para filtrar las transacciones de los últimos N días
function filterTransactionsByLastNDays(transactions, days) {
  if (days === undefined) {
    return transactions;
  }

  const today = new Date();
  const filteredTransactions = {};

  Object.keys(transactions).forEach((date) => {
    const transactionDate = new Date(date);
    const diffTime = Math.abs(today - transactionDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= days) {
      filteredTransactions[date] = transactions[date];
    }
  });

  return filteredTransactions;
}

// Llamar a la función y escribir el resultado en un nuevo archivo
const groupedTransactions = groupTransactionsByDay(filePath);
const outputFilePath = path.join(
  process.cwd(),
  'data/grouped-transactions.json'
);
writeFileSync(
  outputFilePath,
  JSON.stringify(groupedTransactions, null, 2),
  'utf8'
);
console.log(`Transacciones agrupadas por día guardadas en ${outputFilePath}`);

// Generar el archivo reducido de los últimos N días
const lastNDays = 20; // Cambia este valor por el número de días que desees o déjalo como undefined para todas las transacciones
const lastNDaysTransactions = filterTransactionsByLastNDays(
  groupedTransactions,
  lastNDays
);
const outputLastNDaysFilePath = path.join(
  process.cwd(),
  `data/grouped-transactions-last-${lastNDays || 'all'}-days.json`
);
writeFileSync(
  outputLastNDaysFilePath,
  JSON.stringify(lastNDaysTransactions, null, 2),
  'utf8'
);
console.log(
  `Transacciones de los últimos ${lastNDays || 'todos'} días guardadas en ${outputLastNDaysFilePath}`
);
