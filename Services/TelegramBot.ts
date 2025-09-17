import TelegramBot from 'node-telegram-bot-api';

const { TELEGRAM_BOT_TOKEN_GN } = process.env;

if (!TELEGRAM_BOT_TOKEN_GN) {
  throw new Error('TELEGRAM_BOT_TOKEN_GN is missing');
}

const normalizePhone = (raw: string) => (raw || '').replace(/[^\d]/g, '');

const TgPhoneUsers = [
  '+380663309198',
];

const ALLOWED_SET = new Set(
  (TgPhoneUsers.join(','))
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(normalizePhone)
);

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN_GN, { polling: true });

const VERIFIED_SUBSCRIBERS = new Set<number>();

bot.onText(/^\/start$/, async (msg) => {
  const opts: TelegramBot.SendMessageOptions = {
    reply_markup: {
      keyboard: [[{ text: 'Поділитися номером ☎️', request_contact: true }]],
      one_time_keyboard: true,
      resize_keyboard: true
    },
    ...(msg.message_thread_id ? { message_thread_id: msg.message_thread_id } : {})
  };
  await bot.sendMessage(
    msg.chat.id,
    'Привіт! Щоб отримувати сповіщення, поділіться своїм номером телефону.',
    opts
  );
});

bot.on('contact', async (msg) => {
  const chatId = msg.chat.id;
  const phone = msg.contact?.phone_number;
  const threadId = msg.message_thread_id;

  if (!phone) {
    await bot.sendMessage(
      chatId,
      'Не вдалося отримати контакт. Спробуйте /start ще раз.',
      { reply_markup: { remove_keyboard: true }, ...(threadId ? { message_thread_id: threadId } : {}) }
    );
    return;
  }

  const allowed = ALLOWED_SET.has(normalizePhone(phone));

  if (allowed) {
    VERIFIED_SUBSCRIBERS.add(chatId);
    await bot.sendMessage(
      chatId,
      'Верифікацію пройдено ✅. Ви підписані на сповіщення.',
      { reply_markup: { remove_keyboard: true }, ...(threadId ? { message_thread_id: threadId } : {}) }
    );
  } else {
    await bot.sendMessage(
      chatId,
      'Ваш номер не у списку доступу ❌. Зверніться до адміністратора.',
      { reply_markup: { remove_keyboard: true }, ...(threadId ? { message_thread_id: threadId } : {}) }
    );
  }
});

bot.onText(/^\/ping$/, async (msg) => {
  await bot.sendMessage(msg.chat.id, 'pong');
});

bot.onText(/^\/whoami$/, async (msg) => {
  const verified = VERIFIED_SUBSCRIBERS.has(msg.chat.id);
  await bot.sendMessage(
    msg.chat.id,
    `chat_id: ${msg.chat.id}\nverified: ${verified ? '✅' : '❌'}`
  );
});

export async function notifyAll(text: string) {
  const ids = Array.from(VERIFIED_SUBSCRIBERS);
  await Promise.allSettled(ids.map((id) => bot.sendMessage(id, text)));
}

export default bot;
