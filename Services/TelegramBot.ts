import TelegramBot from 'node-telegram-bot-api';
import constants from '../Other/constants.js';
import SubscribersModel from '../Models/SubscribersModel.js';

const NODE_ENV = process.env.NODE_ENV || 'LOCAL';
const isDev = NODE_ENV === 'LOCAL' || NODE_ENV === 'development';

const TELEGRAM_BOT_TOKEN = isDev
  ? process.env.TELEGRAM_BOT_TOKEN_GN_DEV
  : process.env.TELEGRAM_BOT_TOKEN_GN;

if (!TELEGRAM_BOT_TOKEN) {
  console.warn(`⚠️  Subscriber bot skipped — ${isDev ? 'TELEGRAM_BOT_TOKEN_GN_DEV' : 'TELEGRAM_BOT_TOKEN_GN'} is not set`);
}

export async function notifyAll(text: string) {
  if (!TELEGRAM_BOT_TOKEN) return { sent: 0, deactivated: 0, otherErr: 0 };

  const docs = await SubscribersModel.find(
    {
      active: true,
      env: isDev ? 'dev' : 'prod'
    },
    { chat_id: 1, _id: 0 }
  ).lean();

  const ids = docs.map(d => d.chat_id).filter(Boolean);
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  let sent = 0, deactivated = 0, otherErr = 0;

  const message = isDev ? `🛠 [${NODE_ENV}]\n\n${text}` : text;

  for (const id of ids) {
    try {
      await bot!.sendMessage(id as any, message);
      sent++;
    } catch (e: any) {
      const status = e?.response?.statusCode;
      const desc = String(e?.response?.body?.description || '');

      if (
        status === 403 && /blocked by the user/i.test(desc) ||
        status === 400 && /(chat not found|user is deactivated)/i.test(desc)
      ) {
        await SubscribersModel.updateOne(
          { chat_id: id, env: isDev ? 'dev' : 'prod' },
          { $set: { active: false, updatedAt: new Date() } }
        );
        deactivated++;
      }
      else if (status === 429) {
        const retryAfter =
          Number(e?.response?.body?.parameters?.retry_after) || 3;
        await sleep((retryAfter + 1) * 1000);
        try {
          await bot!.sendMessage(id as any, message);
          sent++;
        } catch {
          otherErr++;
        }
      } else {
        otherErr++;
      }
    }

    await sleep(40);
  }

  console.log(`📊 Notification stats [${NODE_ENV}]: sent=${sent}, deactivated=${deactivated}, errors=${otherErr}`);

  return { sent, deactivated, otherErr };
}

let bot: TelegramBot | null = null;

if (TELEGRAM_BOT_TOKEN) {
  const normalizePhone = (raw: string) => (raw || '').replace(/[^\d]/g, '');

  const buildTgName = (from?: TelegramBot.User) =>
    [from?.first_name?.trim(), from?.last_name?.trim()]
      .filter(Boolean)
      .join(' ')
      .trim();

  const TGPHONEUSERS = (
    isDev ? constants.TgPhoneUsersDev : constants.TgPhoneUsers
  ).map((p) => normalizePhone(p));

  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

  console.log(`🤖 Telegram Bot started in ${NODE_ENV} mode (using ${isDev ? 'DEV' : 'PROD'} bot)`);

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
      { chat_id: msg.chat.id, env: isDev ? 'dev' : 'prod' },
      {
        $setOnInsert: {
          chat_id: msg.chat.id,
          env: isDev ? 'dev' : 'prod',
          createdAt: new Date()
        },
        $set: { tg_name, updatedAt: new Date() },
      },
      { upsert: true },
    );

    const greeting = isDev
      ? `🛠 [${NODE_ENV}] Привіт! Щоб отримувати тестові сповіщення, поділіться своїм номером телефону.`
      : 'Привіт! Щоб отримувати сповіщення, поділіться своїм номером телефону.';

    await bot!.sendMessage(msg.chat.id, greeting, opts);
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
      await bot!.sendMessage(
        chatId,
        'Не вдалося отримати контакт. Спробуйте /start ще раз.',
        baseOpts
      );
      return;
    }

    const normalized = normalizePhone(phone);
    const allowed = TGPHONEUSERS.includes(normalized);

    if (!allowed) {
      await bot!.sendMessage(
        chatId,
        `Ваш номер не у списку доступу ❌.\nЗверніться до адміністратора.${isDev ? `\n\n[${NODE_ENV} MODE]` : ''}`,
        {
          ...baseOpts,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }
      );

      await bot!.sendContact(
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
      { chat_id: chatId, env: isDev ? 'dev' : 'prod' },
      {
        $setOnInsert: {
          chat_id: chatId,
          env: isDev ? 'dev' : 'prod',
          createdAt: new Date()
        },
        $set: {
          phone: normalized,
          active: true,
          tg_name,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    const successMsg = isDev
      ? `✅ [${NODE_ENV}] Верифікацію пройдено. Ви підписані на тестові сповіщення.`
      : 'Верифікацію пройдено ✅. Ви підписані на сповіщення.';

    await bot!.sendMessage(chatId, successMsg, baseOpts);
  });

  bot.onText(/^\/ping$/, async (msg) => {
    await bot!.sendMessage(
      msg.chat.id,
      `pong ${isDev ? `🛠 [${NODE_ENV}]` : '✅ [PROD]'}`
    );
  });

  bot.onText(/^\/whoami$/, async (msg) => {
    const doc = await SubscribersModel.findOne({
      chat_id: msg.chat.id,
      active: true,
      env: isDev ? 'dev' : 'prod'
    }).lean();

    await bot!.sendMessage(
      msg.chat.id,
      `${isDev ? `🛠 ${NODE_ENV} MODE\n` : ''}chat_id: ${msg.chat.id}\nactive: ${doc ? '✅' : '❌'}\nname: ${doc?.tg_name || '—'}\nenv: ${isDev ? 'dev' : 'prod'}`
    );
  });

  bot.onText(/^\/unsubscribe$/, async (msg) => {
    await SubscribersModel.updateOne(
      { chat_id: msg.chat.id, env: isDev ? 'dev' : 'prod' },
      { $set: { active: false, updatedAt: new Date() } },
    );
    await bot!.sendMessage(
      msg.chat.id,
      'Відписано від сповіщень. Ви можете знову /start у будь-який час.'
    );
  });
}

export default bot;
