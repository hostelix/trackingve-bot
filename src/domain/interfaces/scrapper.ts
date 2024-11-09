import {TrackingData} from "./tracking-data";

export interface Scrapper<T> {
  scrap(url: string): Promise<TrackingData<T>>;
}
