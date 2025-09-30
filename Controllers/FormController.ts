import type Hapi from '@hapi/hapi';
// import { notifyAll } from '../Services/TelegramBot.js';

export type PrayerPayload = { name?: string; description?: string };
export type ServePayload  = { name?: string; phone?: string };

export default {
  // POST /forms/prayer
  prayer: async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { name, description } = req.payload as PrayerPayload;

    if (!name || !description) {
      // узгоджено з твоєю відповіддю 400
      return h.response({ ok: false, error: 'name & description required' }).code(400);
    }

    try {
      // await notifyAll(`🙏 Нова молитва\nВід: ${name}\nТекст: ${description}`);
      return h.response({ ok: true }).code(200);
    } catch (err) {
      console.error('FormsController.prayer error:', err);
        
      return h.response({ ok: false, error: 'failed to notify' }).code(500);
    }
  },

  // POST /forms/serve
  serve: async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { name, phone } = req.payload as ServePayload;

    if (!name || !phone) {
      return h.response({ ok: false, error: 'name & phone required' }).code(400);
    }

    try {
      // await notifyAll(`🤝 Хочу послужити\nВід: ${name}\nТелефон: ${phone}`);
      return h.response({ ok: true }).code(200);
    } catch (err) {
      console.error('FormsController.serve error:', err);
      return h.response({ ok: false, error: 'failed to notify' }).code(500);
    }
  },
};
