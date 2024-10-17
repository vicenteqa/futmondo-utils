import { Telegraf } from 'telegraf';
import { getPlayersWithHigherChange } from './src/features/mejores-mercado.feat.js';
import { getCurrentMarket } from './src/features/mercado-caros.feat.js';
import { getLastAccessInfo } from './src/logic/ultimo-acceso.js';

// Reemplaza 'YOUR_BOT_TOKEN' con el token de tu bot
const bot = new Telegraf('6868170300:AAFd1r7zT50Dnjaal36w6-YCe7Kg-MZG5YU');

// Manejar el comando /start
bot.start((ctx) =>
  ctx.reply('¡Hola! Soy tu bot de Telegram. ¿En qué puedo ayudarte?')
);

// Manejar el comando /help
bot.help((ctx) =>
  ctx.reply(
    'Puedes usar los siguientes comandos:\n/start - Iniciar el bot\n/help - Obtener ayuda'
  )
);

bot.command('puja', (ctx) => {
  ctx.reply('¡Vamos a pujar!');
});

bot.command('mejores', async (ctx) => {
  const players = await getPlayersWithHigherChange();
  const answer = formatBestPlayerDataToString(players);
  ctx.reply(answer);
});

function formatBestPlayerDataToString(players) {
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
    answer += `ID: ${player.id}\n\n`;
  });
  return answer;
}

function formatExpensivePlayerDataToString(players) {
  let answer = '';
  players.forEach((player) => {
    answer += `${player.jugador}\n`;
    answer += `${player.propietario}\n`;
    answer += `Cambio: ${player.cambio}\n`;
    answer += `Ofertas: ${player.ofertas}\n`;
    answer += `Precio: ${player.precio}\n`;
    answer += `ID: ${player.id}\n\n`;
  });
  return answer;
}

bot.command('caros', async (ctx) => {
  const message = ctx.message.text;
  const args = message.split(' ');
  const amount = args[1];
  const players = await getCurrentMarket(amount);
  const answer = formatExpensivePlayerDataToString(players);
  ctx.reply(answer);
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
