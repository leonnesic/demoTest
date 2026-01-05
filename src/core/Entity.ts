export default class Entity {
  name: string;
  private components: Map<string | number, any>;

  /** Creates an entity container with the given name. */
  constructor(name: string) {
    this.name = name;
    this.components = new Map();
  }

  /** Attaches a component instance by type identifier. */
  addComponent(componentName: string | number, component: any): void {
    this.components.set(componentName, component);
  }

  /** Detaches a component from the entity. */
  removeComponent(componentName: string | number): void {
    this.components.delete(componentName);
  }

  /** Retrieves a component by its identifier. */
  getComponent<T = any>(componentName: string | number): T | undefined {
    return this.components.get(componentName) as T | undefined;
  }

  /** Returns all component instances stored on the entity. */
  getComponents<T = any>(): T[] {
    return Array.from(this.components.values()) as T[];
  }

  /** Checks whether a component of the requested type exists. */
  hasComponent(type: string | number): boolean {
    return this.components.has(type);
  }

  /** Clears every component from the entity. */
  removeAllComponents(): void {
    this.components.clear();
  }
}