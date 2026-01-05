export interface LayoutComponentData {
  payload?: Record<string, any> | null;
}

export default class LayoutComponent {
  payload: Record<string, any> | null;

  /** Stores layout helper payload data. */
  constructor({ payload = null }: LayoutComponentData = {}) {
    this.payload = payload;
  }

  /** Releases the payload reference. */
  destroy(): void {
    this.payload = null;
  }
}