import { GNBot } from '../Other/TelegramBots.js';

const getMe = async () => GNBot.getMe();

const sendMessage = async (payload) => {
  return GNBot.sendMessage(payload.chatId, payload.message, {
    parse_mode: payload.parseMode,
    message_thread_id: payload.messageThreadId,
  });
};

const editMessage = async (payload) => {
  return GNBot.editMessageText(payload.message, {
    chat_id: payload.chatId,
    message_id: payload.messageId,
    parse_mode: payload.parseMode,
  });
};

const sendMenuButtons = async (chatId, message, buttons) => {
  return GNBot.sendMessage(chatId, message, {
    reply_markup: {
      keyboard: buttons.map((row) => row.map((text) => ({ text }))),
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

const sendInlineMenuButtons = async (payload) => {
  return GNBot.sendMessage(payload.chatId, payload.message, {
    message_thread_id: payload.messageThreadId,
    reply_markup: {
      inline_keyboard: payload.buttons.map((row) =>
        row.map(({ text, callback_data }) => ({ text, callback_data }))
      ),
    },
  });
};

const getChatInfo = async (chatId) => GNBot.getChat(chatId);

const getMemberInfoFromChat = async (chatId, userId) => {
  return GNBot.getChatMember(chatId, userId);
};

const createPoll = async (chatId, question, options, isAnonymous) => {
  return GNBot.sendPoll(chatId, question, options, { is_anonymous: isAnonymous });
};

const sendDice = async (chatId) => GNBot.sendDice(chatId);

const setWebhook = async (url) => GNBot.setWebHook(url);

const getWebhookInfo = async () => GNBot.getWebHookInfo();

const deleteWebhook = async () => GNBot.deleteWebHook();


export default {
  getMe,
  sendMessage,
  editMessage,
  sendMenuButtons,
  sendInlineMenuButtons,
  getChatInfo,
  getMemberInfoFromChat,
  createPoll,
  sendDice,
  setWebhook,
  getWebhookInfo,
  deleteWebhook
}