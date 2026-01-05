export type ServiceKey = string | symbol;

export default class GameContext {
  private static services: Map<ServiceKey, unknown> = new Map();

  /** Stores a service instance under the provided key. */
  static register<T = unknown>(key: ServiceKey, instance: T): void {
    this.services.set(key, instance);
  }

  /** Retrieves a registered service by key. */
  static get<T = unknown>(key: ServiceKey): T | undefined {
    return this.services.get(key) as T | undefined;
  }

  /** Updates or inserts a value for the given service key. */
  static set<T = unknown>(key: ServiceKey, value: T): void {
    this.services.set(key, value);
  }

  /** Removes the service entry associated with the key. */
  static delete(key: ServiceKey): boolean {
    return this.services.delete(key);
  }

  /** Clears all registered services. */
  static clear(): void {
    this.services.clear();
  }
}