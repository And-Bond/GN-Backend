import type { ServerRoute } from '@hapi/hapi';
import { TelegramPrayer } from '../Models/TelegramPrayerModel.js';
import { TelegramService } from '../Models/TelegramServiceModel.js';
import { notifyAll } from '../Services/TelegramBot.js';

const routes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/forms/prayer',
    options: { auth: false },
    handler: async (req, h) => {
      const { name, description } = req.payload as { name?: string; description?: string };
      if (!name || !description) {
        return h.response({ ok: false, error: 'name & description required' }).code(400);
      }

      const doc = await TelegramPrayer.create({ name, description });
      await notifyAll(`🙏 Нова молитва\nВід: ${name}\nТекст: ${description}`);

      return h.response({ ok: true, data: doc });
    },
  },
  {
    method: 'POST',
    path: '/forms/serve',
    options: { auth: false },
    handler: async (req, h) => {
      const { name, phone } = req.payload as { name?: string; phone?: string };
      if (!name || !phone) {
        return h.response({ ok: false, error: 'name & phone required' }).code(400);
      }

      const doc = await TelegramService.create({ name, phone });
      await notifyAll(`🤝 Хочу послужити\nВід: ${name}\nТелефон: ${phone}`);

      return h.response({ ok: true, data: doc });
    },
  },
];

export default routes;