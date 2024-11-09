import dotenv from 'dotenv';
import {TrackingBot} from "./infrastructure/bot/tracking-bot";

dotenv.config();

const bot = new TrackingBot();

bot.init();

process.once('SIGINT', () => bot.stop())
process.once('SIGTERM', () => bot.stop())


