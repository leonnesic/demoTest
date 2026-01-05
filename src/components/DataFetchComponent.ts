export default class DataFetchComponent {
    url: string;
    result?: any;
    callback?: (payload: any) => void;

  /** Stores URL and optional callback for data fetching. */
  constructor(payload: any, callback?: (payload: any) => void) {
    this.url = payload.url;
    this.result = payload.result;
    this.callback = callback;
  }
}