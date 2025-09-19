import TelegramBot from 'node-telegram-bot-api';
import constants from '../Other/constants.js';
import SubscribersModel from '../Models/SubscribersModel.js';

const { TELEGRAM_BOT_TOKEN_GN, MONGODB_PATH } = process.env;

if (!TELEGRAM_BOT_TOKEN_GN) throw new Error('TELEGRAM_BOT_TOKEN_GN is missing');
if (!MONGODB_PATH) throw new Error('MONGODB_PATH is missing');

const normalizePhone = (raw: string) => { return (raw || '').replace(/[^\d]/g, ''); };

const buildTgName = (from?: TelegramBot.User) =>
  [from?.first_name?.trim(), from?.last_name?.trim()].filter(Boolean).join(' ').trim();

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

  const tg_name = buildTgName(msg.from);

  await SubscribersModel.updateOne(
   { chat_id: msg.chat.id },
   {
     $setOnInsert: { chat_id: msg.chat.id, createdAt: new Date() },
     $set: { tg_name, updatedAt: new Date() },
   },
   { upsert: true },
  );

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
      'Ваш номер не у списку доступу ❌.\nЗверніться до адміністратора.', 
      {
        ...baseOpts,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }
    );

    await bot.sendContact(
      chatId,
      '+380663309198',
      'Oleksandr',
      {
        last_name: 'Havrysh',
        vcard:
          'BEGIN:VCARD\n' +
          'VERSION:3.0\n' +
          'N:Havrysh;Oleksandr;;;\n' +
          'FN:Oleksandr Havrysh\n' +
          'TEL;TYPE=CELL:+380663309198\n' +
          'END:VCARD',
        ...(threadId ? { message_thread_id: threadId } : {}),
      }
    );

    return;
  }

  const tg_name = buildTgName(msg.from);

  await SubscribersModel.updateOne(
    { chat_id: chatId },
    {
      $setOnInsert: { chat_id: chatId, createdAt: new Date() },
      $set: {
        phone: normalized,
        active: true,
        tg_name,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );

  await bot.sendMessage(chatId, 'Верифікацію пройдено ✅. Ви підписані на сповіщення.', baseOpts);
});


bot.onText(/^\/ping$/, async (msg) => {
  await bot.sendMessage(msg.chat.id, 'pong');
});

bot.onText(/^\/whoami$/, async (msg) => {
  const doc = await SubscribersModel.findOne({ chat_id: msg.chat.id, active: true }).lean();
  await bot.sendMessage(
    msg.chat.id,
    `chat_id: ${msg.chat.id}\nactive: ${doc ? '✅' : '❌'}\nname: ${doc?.tg_name || '—'}`
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
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  let sent = 0, deactivated = 0, otherErr = 0;

  for (const id of ids) {
    try {
      await bot.sendMessage(id as any, text);
      sent++;
    } catch (e: any) {
      const status = e?.response?.statusCode;
      const desc = String(e?.response?.body?.description || '');
      if (
        status === 403 && /blocked by the user/i.test(desc) ||
        status === 400 && /(chat not found|user is deactivated)/i.test(desc)
      ) {
        await SubscribersModel.updateOne(
          { chat_id: id },
          { $set: { active: false, updatedAt: new Date() } }
        );
        deactivated++;
      }
      else if (status === 429) {
        const retryAfter =
          Number(e?.response?.body?.parameters?.retry_after) || 3;
        await sleep((retryAfter + 1) * 1000);
        try {
          await bot.sendMessage(id as any, text);
          sent++;
        } catch {
          otherErr++;
        }
      }
    }

    await sleep(40);
  }
}

export default bot;