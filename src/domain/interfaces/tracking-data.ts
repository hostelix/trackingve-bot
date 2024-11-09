export interface TrackingData<T> {
  tracking: string;
  date: Date;
  destination: string;
  origin: string;
  status?: Array<T>;
}
