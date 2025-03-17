import { GNBot } from '../Other/TelegramBots.js';
// Types
import type TelegramBot from 'node-telegram-bot-api'

const getMe = async () => GNBot.getMe();

const sendMessage = async (chatId: TelegramBot.ChatId, message: string, options?: TelegramBot.SendMessageOptions) => {
  return GNBot.sendMessage(chatId, message, options);
};

const editMessage = async (message: string, options: TelegramBot.EditMessageTextOptions) => {
  return GNBot.editMessageText(message, options);
};

const sendMenuButtons = async (chatId: TelegramBot.ChatId, message: string, options: TelegramBot.SendMessageOptions) => {
  return GNBot.sendMessage(chatId, message, options);
};

const sendInlineMenuButtons = async (chatId: TelegramBot.ChatId, message: string, options: TelegramBot.SendMessageOptions) => {
  return GNBot.sendMessage(chatId, message, options);
};

const getChatInfo = async (chatId: TelegramBot.ChatId) => GNBot.getChat(chatId);

const getMemberInfoFromChat = async (chatId: TelegramBot.ChatId, userId: number) => {
  return GNBot.getChatMember(chatId, userId);
};

const createPoll = async (chatId: TelegramBot.ChatId, question: string, pullOptions: string[], options: TelegramBot.SendPollOptions) => {
  return GNBot.sendPoll(chatId, question, pullOptions, options);
};

const sendDice = async (chatId: TelegramBot.ChatId) => GNBot.sendDice(chatId);

const setWebhook = async (url: string) => GNBot.setWebHook(url);

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