import TelegramBot from 'node-telegram-bot-api';
import constants from '../Other/constants.js';
import SubscribersModel from '../Models/SubscribersModel.js';

const { TELEGRAM_BOT_TOKEN_GN, MONGODB_PATH } = process.env;

if (!TELEGRAM_BOT_TOKEN_GN) throw new Error('TELEGRAM_BOT_TOKEN_GN is missing');
if (!MONGODB_PATH) throw new Error('MONGODB_PATH is missing');

const normalizePhone = (raw: string) => { return (raw || '').replace(/[^\d]/g, ''); };
const TGPHONEUSERS = constants.TgPhoneUsers.map((p) => normalizePhone(p));

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN_GN, { polling: true });

bot.onText(/^\/start$/, async (msg) => {
  const opts: TelegramBot.SendMessageOptions = {
    reply_markup: {
      keyboard: [[{ text: 'Поділитися номером ☎️', request_contact: true }]],
      one_time_keyboard: true,
      resize_keyboard: true,
    },
    ...(msg.message_thread_id ? { message_thread_id: msg.message_thread_id } : {}),
  };
  await bot.sendMessage(
    msg.chat.id,
    'Привіт! Щоб отримувати сповіщення, поділіться своїм номером телефону.',
    opts,
  );
});

bot.on('contact', async (msg) => {
  const chatId = msg.chat.id;
  const phone = msg.contact?.phone_number;
  const threadId = msg.message_thread_id;

  const baseOpts: TelegramBot.SendMessageOptions = {
    reply_markup: { remove_keyboard: true },
    ...(threadId ? { message_thread_id: threadId } : {}),
  };

  if (!phone) {
    await bot.sendMessage(chatId, 'Не вдалося отримати контакт. Спробуйте /start ще раз.', baseOpts);
    return;
  }

  const normalized = normalizePhone(phone);
  const allowed = TGPHONEUSERS.includes(normalized);

  if (!allowed) {
    await bot.sendMessage(
      chatId,
      'Ваш номер не у списку доступу ❌. Зверніться до адміністратора.',
      baseOpts,
    );
    return;
  }

  await SubscribersModel.updateOne(
    { chat_id: chatId },
    {
      $setOnInsert: { createdAt: new Date() },
      $set: {
        phone: normalized,
        active: true,
        chat_id: chatId,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );

  await bot.sendMessage(
    chatId,
    'Верифікацію пройдено ✅. Ви підписані на сповіщення.',
    baseOpts,
  );
});

bot.onText(/^\/ping$/, async (msg) => {
  await bot.sendMessage(msg.chat.id, 'pong');
});

bot.onText(/^\/whoami$/, async (msg) => {
  const doc = await SubscribersModel.findOne({ chat_id: msg.chat.id, active: true });
  const active = !!doc;
  await bot.sendMessage(
    msg.chat.id,
    `chat_id: ${msg.chat.id}\nactive: ${active ? '✅' : '❌'}`,
  );
});

bot.onText(/^\/unsubscribe$/, async (msg) => {
  await SubscribersModel.updateOne(
    { chat_id: msg.chat.id },
    { $set: { active: false, updatedAt: new Date() } },
  );
  await bot.sendMessage(msg.chat.id, 'Відписано від сповіщень. Ви можете знову /start у будь-який час.');
});

export async function notifyAll(text: string) {
  const docs = await SubscribersModel.find(
    { active: true },
    { chat_id: 1, _id: 0 }
  ).lean();

  const ids = docs.map(d => d.chat_id).filter(Boolean);

  const results = await Promise.allSettled(
    ids.map(id => bot.sendMessage(id, text))
  );

  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length) {
    console.error('notifyAll failed:', failed.map(f => (f as any).reason));
  }
}

export default bot;
