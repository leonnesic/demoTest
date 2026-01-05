import { Signal } from 'signals';

export default class EventBus {
  static events = new Map();

  /** Registers a listener for the given event channel. */
  static on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, new Signal());
    }
    this.events.get(event).add(listener);
  }

  /** Emits an event synchronously to all listeners. */
  static emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).dispatch(data);
    }
  }

  /** Dispatches events while awaiting any promise-based handlers. */
  static async emitAsync(event, data) {
  if (!this.events.has(event)) return;
  const signal = this.events.get(event);

  // signals.js doesn’t have a built-in "listeners" property
  // so we can wrap dispatch and catch async functions instead
  const listeners = signal._bindings.map(binding => binding._listener);

  const promises = listeners.map(listener => {
    try {
      const result = listener(data);
      return result instanceof Promise ? result : Promise.resolve(result);
    } catch (err) {
      return Promise.reject(err);
    }
  });

  return Promise.all(promises);
}

  /** Removes a specific listener from the channel. */
  static off(event, listener) {
    if (this.events.has(event)) {
      this.events.get(event).remove(listener);
    }
  }

  /** Clears all listeners tied to the event. */
  static offAll(event) {
    if (this.events.has(event)) {
      this.events.get(event).removeAll();
    }
  }
}
