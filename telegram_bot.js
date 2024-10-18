import { Telegraf } from 'telegraf';
import { getPlayersWithHigherChange } from './src/features/mejores-mercado.feat.js';
import { getCurrentMarket } from './src/features/mercado-caros.feat.js';
import { getLastAccessInfo } from './src/logic/ultimo-acceso.js';
import { sendBidRequest } from './src/features/puja.feat.js';
import 'dotenv/config';

// Reemplaza 'YOUR_BOT_TOKEN' con el token de tu bot
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Manejar el comando /start
bot.start((ctx) =>
  ctx.reply('¡Hola! Soy tu bot de Telegram. ¿En qué puedo ayudarte?')
);

// Manejar el comando /help
bot.help((ctx) =>
  ctx.reply(
    'Puedes usar los siguientes comandos:\n/start - Iniciar el bot\n/help - Obtener ayuda\n/puja {id} {cantidad} - Pujar por un jugador\n/mejores - Obtener los mejores jugadores del mercado\n/mejores id - Obtener los mejores jugadores del mercado con su id\n/caros - Obtener los jugadores más caros del mercado\n/caros id - Obtener los jugadores más caros del mercado con su id\n'
  )
);

bot.command('puja', async (ctx) => {
  const message = ctx.message.text;
  const args = message.split(' ');
  const id = args[1];
  const amount = args[2];
  const response = await sendBidRequest(id, amount);
  ctx.reply(response);
});

bot.command('mejores', async (ctx) => {
  const message = ctx.message.text;
  const args = message.split(' ');
  const showId = args[1] === 'id';
  const players = await getPlayersWithHigherChange();
  const answer = formatBestPlayerDataToString(players, showId);
  ctx.reply(answer);
});

function formatBestPlayerDataToString(players, showId) {
  let answer = '';
  players.forEach((player) => {
    answer += `${player.jugador}\n`;
    answer += `${player.propietario}\n`;
    answer += `Cambio: ${player.cambio}\n`;
    answer += `Ofertas: ${player.ofertas}\n`;
    answer += `Precio: ${player.precio}\n`;
    answer += `Media: ${player.medias.total}\n`;
    answer += `Media casa: ${player.medias.media_casa}\n`;
    answer += `Media fuera: ${player.medias.media_fuera}\n`;
    answer += `Media cinco: ${player.medias.media_cinco}\n`;
    answer += `Forma: ${player.medias.forma}\n`;
    answer += `${showId ? `\n${player.id}` : ''}` + '\n\n\n';
  });
  return answer;
}

function formatExpensivePlayerDataToString(players, showId) {
  let answer = '';
  players.forEach((player) => {
    answer += `**${player.jugador}**\n`;
    answer += `${player.propietario}\n`;
    answer += `Cambio: ${player.cambio}\n`;
    answer += `Ofertas: ${player.ofertas}\n`;
    answer += `Precio: ${player.precio}\n`;
    answer += `${showId ? `\n${player.id}` : ''}` + '\n\n\n';
  });
  return answer;
}

bot.command('caros', async (ctx) => {
  const message = ctx.message.text;
  const args = message.split(' ');
  const showId = args[1] === 'id';
  const players = await getCurrentMarket();
  const answer = formatExpensivePlayerDataToString(players, showId);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

bot.command('conexiones', async (ctx) => {
  const lastUserConnections = await getLastAccessInfo();
  const answer = formatLastAccessDataToString(lastUserConnections);
  ctx.reply(answer);
});

function formatLastAccessDataToString(data) {
  let answer = '';
  data.forEach((user) => {
    answer += `${user.nombre}: ${user.ultimo_acceso}\n`;
  });
  return answer;
}

// Manejar mensajes de texto
bot.on('text', (ctx) => {
  const userMessage = ctx.message.text;
  ctx.reply(`Has dicho: ${userMessage}`);
});

// Iniciar el bot
bot.launch();

console.log('Bot de Telegram iniciado');
