interface UIEventDeclaration {
  action: string;
  params?: Record<string, unknown>;
}

interface UIEvents {
  [eventName: string]: UIEventDeclaration;
}

interface UIComponentData {
  interactive?: boolean;
  cursor?: string;
  keyBindings?: string[];
  customData?: unknown;
  events?: UIEvents;
}

export default class UIComponent {
  interactive: boolean;
  cursor: string;
  keyBindings: string[] | null;
  customData: unknown | null;
  events: UIEvents | null;
  handlers: Record<string, Function> | null;

  /** Sets interactive defaults and event metadata. */
  constructor(data: UIComponentData = {}) {
    this.interactive = data.interactive ?? true;

    this.cursor = data.cursor ?? 'auto';

    this.keyBindings = data.keyBindings || [];

    this.customData = data.customData || null;

    this.events = data.events || {};

    this.handlers = null;
  }

  /** Clears references to handlers and metadata. */
  destroy(): void {
    this.handlers = null;
    this.events = null;
    this.keyBindings = null;
    this.customData = null;
  }
}