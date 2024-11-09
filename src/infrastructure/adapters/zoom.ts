import {Scrapper} from "../../domain/interfaces/scrapper";
import * as cheerio from 'cheerio';
import {TrackingData} from "../../domain/interfaces/tracking-data";
import {parse} from "date-fns";
import puppeteer from "puppeteer";

export interface ZoomData {
  order: number;
  date: Date;
  status: string;
  location: string;
  office: string;
}

export class ZoomScrapperAdapter<ZoomData> implements Scrapper<ZoomData> {
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async scrap(): Promise<TrackingData<ZoomData>> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(this.url);
    const html = await page.content();
    await browser.close();
    const tData = this.processTrackingData(html);
    tData.status = this.processStatusData(html);
    return tData;
  }

  private processTrackingData(html: string): TrackingData<ZoomData> {
    const $ = cheerio.load(html);
    const table = $('table.zappi-trk-resumen');
    const rows = table.find('tbody > tr');

    let tracking = '';
    let origin = '';
    let destination = '';
    let date = '';

    rows.each((i, row) => {
      if (i === 0) return;
      const cells = $(row).find('td');

      const cellValue = cells.eq(1).text().trim();

      if (i === 1) {
        tracking = cellValue;
      }
      if (i === 3) {
        date = cellValue;
      }

      if (i === 5) {
        origin = cellValue;
      }

      if (i === 6) {
        destination = cellValue;
      }
    });

    return {
      tracking,
      date: parse(date, 'dd/MM/yyyy', new Date()),
      destination,
      origin,
    } as TrackingData<ZoomData>;
  }

  private processStatusData(html: string): ZoomData[] {
    const $ = cheerio.load(html);
    const table = $('div.tabla-wrapper > table');

    if (table.length > 0) {
      const rows = table.find('tbody > tr');
      const data: ZoomData[] = [];

      rows.each((i, row) => {
        if (i === 0) return;
        const cells = $(row).find('td');

        const cellOrder = cells.eq(0).text();
        const cellDate = cells.eq(1).text();
        const cellHour = cells.eq(2).text();

        const order = parseInt(cellOrder);
        const date = parse(`${cellDate} ${cellHour}`, 'dd/MM/yy HH:mm', new Date());
        const status = cells.eq(3).text().trim();
        const location = cells.eq(4).text().trim();
        const office = cells.eq(5).text().trim();

        data.push({
          order,
          date,
          status,
          location,
          office,
        } as ZoomData);
      });
      return data;
    }

    return [];
  }
}
