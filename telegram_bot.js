import { Telegraf } from 'telegraf';
import { payClausula } from './src/endpoints/pay-clausula.js';
import { getSortedMarket } from './src/features/mejores-mercado.feat.js';
import { getBestMarket } from './src/features/mejores-mercado.feat.js';
import { getBetis } from './src/features/mejores-mercado.feat.js';
import { getLastAccessInfo } from './src/logic/ultimo-acceso.js';
import { setBid } from './src/logic/puja.js';
import { formatCurrency, sleep } from './src/common/utils.js';
import { getPlayersFromSpecificUser } from './src/logic/get-teams-players.js';
import { getTodayRichmondTransfers } from './src/logic/get-today-transfers.js';
import { getTodayTransfers } from './src/logic/get-today-transfers.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import cron from 'node-cron';

dayjs.extend(utc);
dayjs.extend(timezone);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

let scheduledBidStatus = true;

bot.start((ctx) => ctx.reply('¡Hola! Soy tu bot de Futmondo.'));

bot.help((ctx) =>
  ctx.reply(
    'Puedes usar los siguientes comandos:\n/start - Iniciar el bot\n/help - Obtener ayuda\n/puja {id} {cantidad} - Pujar por un jugador\n/mejores - Obtener los mejores jugadores del mercado\n/mejores id - Obtener los mejores jugadores del mercado con su id\n/caros - Obtener los jugadores más caros del mercado\n/caros id - Obtener los jugadores más caros del mercado con su id\n'
  )
);

bot.command('misfichajes', async (ctx) => {
  const todayOwnTransfers = await getTodayRichmondTransfers();
  if (todayOwnTransfers.length > 0) {
    const answer = formatOwnTransfersData(todayOwnTransfers);
    ctx.reply(`Fichajes de hoy:\n\n${answer}`, { parse_mode: 'Markdown' });
  } else ctx.reply('No hay fichajes de hoy');
});

cron.schedule('45 6 * * *', async () => {
  const chatId = process.env.CHAT_ID;
  const todayOwnTransfers = await getTodayRichmondTransfers();
  if (todayOwnTransfers.length > 0) {
    const answer = formatOwnTransfersData(todayOwnTransfers);
    bot.telegram.sendMessage(chatId, `Fichajes de hoy:\n\n${answer}`, {
      parse_mode: 'Markdown',
    });
  }
});

bot.command('fichajes', async (ctx) => {
  const todayTransfers = await getTodayTransfers();
  if (todayTransfers.length > 0) {
    const message = formatTransfersData(todayTransfers);
    ctx.reply(message, { parse_mode: 'Markdown' });
  } else ctx.reply('No hay fichajes de hoy');
});

function formatTransfersData(transfers) {
  let answer = '';
  transfers.forEach((transfer) => {
    answer += `*${transfer._player.name}* de *${transfer._seller === undefined ? 'CPU' : transfer._seller.name}* a *${transfer._buyer.name}* por ${formatCurrency(transfer.price)}\n`;
  });
  return answer;
}

function formatOwnTransfersData(transfers) {
  let answer = '';
  transfers.forEach((transfer) => {
    answer += `Has fichado a *${transfer._player.name}* por ${formatCurrency(transfer.price)}\n`;
  });
  return answer;
}

bot.command('switchbid', async (ctx) => {
  scheduledBidStatus = !scheduledBidStatus;
  ctx.reply(
    `Pujas automáticas: ${scheduledBidStatus ? 'Activadas' : 'Desactivadas'}`,
    {
      parse_mode: 'Markdown',
    }
  );
});

bot.command('team', async (ctx) => {
  const args = getArgs(ctx);
  const team = args[1];
  const players = await getPlayersFromSpecificUser(team);
  const answer = formatTeamPlayersDataToString(players);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

bot.command('puja', async (ctx) => {
  const args = getArgs(ctx);
  const id = args[1];
  const amount = args[2];
  const response = await setBid(id, amount);
  ctx.reply(response, { parse_mode: 'Markdown' });
});

bot.command('market', async (ctx) => {
  const args = getArgs(ctx);
  let sortingMethod = args[1];
  const players = await getSortedMarket(sortingMethod);
  let answer = '';
  if (players === undefined)
    answer = 'No se han podido obtener los datos del mercado';
  else answer = formatMarketDataToString(players);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

bot.command('wanted', async (ctx) => {
  const players = await getBestMarket();
  let answer = '';
  if (players === undefined)
    answer = 'No se han podido obtener los datos del mercado';
  else if (players.length === 0)
    answer = 'No hay jugadores deseados en el mercado';
  else answer = formatMarketDataToString(players);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

bot.command('betis', async (ctx) => {
  const players = await getBetis();
  let answer = '';
  if (players === undefined)
    answer = 'No se han podido obtener los datos del mercado';
  else if (players.length === 0)
    answer = 'No hay jugadores del Betis en el mercado';
  else answer = formatMarketDataToString(players);
  ctx.reply(`Jugadores del Betis en el mercado: \n\n${answer}`, {
    parse_mode: 'Markdown',
  });
});

cron.schedule('30 3 * * *', async () => {
  if (scheduledBidStatus) {
    const chatId = process.env.CHAT_ID;
    const players = await getBestMarket();
    if (players.length === 0) return;
    else {
      for (let i = 0; i < players.length; i++) {
        const bidResult = await setBid(players[i].id);
        bot.telegram.sendMessage(chatId, bidResult, { parse_mode: 'Markdown' });
      }
    }
  }
});

function formatMarketDataToString(players) {
  let answer = '';
  players.forEach((player) => {
    answer += `*${player.jugador}* ${player.lesionado ? '🏥' : ''}\n`;
    answer += `${player.propietario}\n`;
    answer += `Cambio: ${formatCurrency(player.cambio)}\n`;
    answer += `Pujas: ${player.pujas}\n`;
    answer += `Precio: ${formatCurrency(player.precio)}\n`;
    answer += `Media: ${player.media}\n`;
    answer += `Forma: ${player.forma}\n`;
    answer += `\n\`/puja ${player.id}\`\n\n\n`;
  });
  return answer;
}

function formatTeamPlayersDataToString(players) {
  let answer = '';
  players.forEach((player) => {
    answer += `*${player.jugador}* ${player.lesionado ? '🏥' : ''}\n`;
    answer += `${player.propietario}\n`;
    answer += `Cambio: ${formatCurrency(player.cambio)}\n`;
    answer += `Pujas: ${player.pujas}\n`;
    answer += `Cláusula: ${formatCurrency(player.clausula)}\n`;
    answer += `Media: ${player.media}\n`;
    answer += `Forma: ${player.forma}\n`;
    answer += `\n\`/clausulazo ${player.slug} ${player.clausula} ${player.id} ${player.jugador.replace(/\s+/g, '')}\`\n\n\n`;
  });
  return answer;
}

cron.schedule('0 0 * * *', async () => {});

bot.command('conexiones', async (ctx) => {
  const lastUserConnections = await getLastAccessInfo();
  const answer = formatLastAccessDataToString(lastUserConnections);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

cron.schedule('45 06 * * *', async () => {
  const chatId = process.env.CHAT_ID;
  const betisPlayers = await getBetis();
  if (betisPlayers.length === 0) return;
  else {
    const message = formatMarketDataToString(betisPlayers);
    bot.telegram.sendMessage(
      chatId,
      `Jugadores del Betis en el mercado: \n\n${message}`,
      { parse_mode: 'Markdown' }
    );
  }
});

function getArgs(ctx) {
  const message = ctx.message.text;
  return message.split(' ');
}

function formatLastAccessDataToString(data) {
  let answer = '';
  data.forEach((user) => {
    answer += `*${user.nombre}*: ${user.ultimo_acceso}\n`;
  });
  return answer;
}

bot.launch();

console.log('Telegram Bot de Futmondo iniciado');
