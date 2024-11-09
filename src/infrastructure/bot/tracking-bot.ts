import {Context, Telegraf} from "telegraf";
import {message} from "telegraf/filters";
import {isValidCommand, PROVIDERS} from "../utils/bot";
import {ZoomData, ZoomScrapperAdapter} from "../adapters/zoom";
import { format } from "date-fns";


export class TrackingBot {
  private bot: Telegraf<Context>;

  constructor() {
    this.bot = new Telegraf(process.env.BOT_TOKEN ?? '')
  }

  async init(): Promise<void> {
    this.bot.start(this.handleStart);
    this.bot.help(this.handleHelp);

    this.bot.on(message('text'), async (ctx) => {
      if (isValidCommand(ctx.message.text)) {
        const [tracking, provider] = ctx.message.text.split('@');

        if (PROVIDERS.includes(provider.toLowerCase())) {
          this.processTracking(tracking, provider, ctx);
        } else {
          ctx.reply(`No se reconoce el proveedor ${provider}. Proveedores soportados: ZOOM, MRW, TEALCA`);
        }
      }
    });

    return this.bot.launch();
  }

  stop(): void {
    return this.bot.stop();
  }

  private handleStart(ctx: Context) {
    ctx.reply(`Hola Bienvenido ${ctx.from?.first_name ?? 'Usuario'}`);
  }

  private handleHelp(ctx: Context) {
    ctx.reply(`Debes enviar el numero de guía del envío para poder consultar la información del mismo de la siguiente manera: NUMERO_GUIA@PROVEEDOR. \nEJ: 123456789@ZOOM`);
  }

  private async processTracking(tracking: string, provider: string, ctx: Context) {
    switch (provider.toLowerCase()) {
      case 'zoom':
        const message = await ctx.reply(`⏳ Estamos consultando la información del envío ${tracking} en la plataforma ZOOM.`);
        const url = 'https://zoom.red/tracking-de-envios-personas/?nro-guia=1592963502&tipo-consulta=1';

        const zoomScrapper = new ZoomScrapperAdapter<ZoomData>(url);
        const data = await zoomScrapper.scrap();

        let messageText = `N° DE GUÍA: ${data.tracking}\nFECHA: ${data.date}\nORGIEN: ${data.origin}\nDESTINO: ${data.destination}\n\n`;

        data.status?.forEach((status) => {
          messageText += `===============================================\n`;
          messageText += `${status.order} | ${format(status.date, 'dd/MM/yyyy HH:mm')} | ${status.office} | ${status.location} | ${status.status}\n`;
        });

        ctx.reply(messageText);
        break;
      default:
        ctx.reply(`Aun no se soporta el proveedor ${provider.toUpperCase()}, proximamente se agregara.`);
        break;
    }
  }
}
