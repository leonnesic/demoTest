import { gsap } from 'gsap';
import ComponentType from '../core/ComponentType';
import EntityManager from '../core/EntityManager';
import type Entity from '../core/Entity';

const { TIMER } = ComponentType;

interface TimerData {
  duration: number;
  repeat: boolean;
  callback: (() => void) | null;
  active: boolean;
  completed: boolean;
}

interface TimerComponent {
  timers: Map<string, TimerData>;
}

export default class TimerSystem {
  static timers: Map<string, any> = new Map();

  /** Starts a GSAP timer entry for the entity. */
  static start(
    entityId: string,
    timerName: string,
    duration: number,
    callback: (() => void) | null = null,
    repeat = false
  ): void {
    const entity: Entity | undefined = EntityManager.getEntity(entityId);
    if (!entity) return;

    const timerComp = entity.getComponent<TimerComponent>(TIMER);
    if (!timerComp) return;

    const key = `${entityId}_${timerName}`;
    if (this.timers.has(key)) return; // Prevent duplicates

    timerComp.timers.set(timerName, {
      duration,
      repeat,
      callback,
      active: true,
      completed: false,
    } as TimerData);

    const gsapTimer = gsap.delayedCall(duration, () => {
      const t = timerComp.timers.get(timerName);
      if (!t) return;

      t.completed = true;
      t.active = false;

      if (t.callback) t.callback();

      if (t.repeat) {
        t.completed = false;
        t.active = true;
        this.timers.delete(key);
        this.start(entityId, timerName, duration, t.callback, repeat);
        return;
      }

      timerComp.timers.delete(timerName);
      this.timers.delete(key);
    });

    this.timers.set(key, gsapTimer);
  }

  /** Pauses the running timer. */
  static pause(entityId: string, timerName: string): void {
    const key = `${entityId}_${timerName}`;
    const timer = this.timers.get(key);
    if (!timer) return;

    timer.pause?.();

    const entity = EntityManager.getEntity(entityId);
    const timerComp = entity?.getComponent<TimerComponent>(TIMER);
    const t = timerComp?.timers.get(timerName);
    if (t) t.active = false;
  }

  /** Resumes a paused timer. */
  static resume(entityId: string, timerName: string): void {
    const key = `${entityId}_${timerName}`;
    const timer = this.timers.get(key);
    if (!timer) return;

    timer.play?.();

    const entity = EntityManager.getEntity(entityId);
    const timerComp = entity?.getComponent<TimerComponent>(TIMER);
    const t = timerComp?.timers.get(timerName);
    if (t) t.active = true;
  }

  /** Stops and removes the named timer. */
  static stop(entityId: string, timerName: string): void {
    const key = `${entityId}_${timerName}`;
    const timer = this.timers.get(key);

    if (timer) timer.kill?.();
    this.timers.delete(key);

    const entity = EntityManager.getEntity(entityId);
    const timerComp = entity?.getComponent<TimerComponent>(TIMER);
    timerComp?.timers.delete(timerName);
  }

  /** Waits until the named timer completes. */
  static async wait(entityId: string, timerName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const entity = EntityManager.getEntity(entityId);
      if (!entity) return reject(`Entity ${entityId} not found.`);

      const timerComp = entity.getComponent<TimerComponent>(TIMER);
      if (!timerComp) return reject(`TimerComponent missing on entity ${entityId}.`);

      const t = timerComp.timers.get(timerName);
      if (!t) return reject(`Timer "${timerName}" not found on entity ${entityId}.`);

      const key = `${entityId}_${timerName}`;
      const gsapTimer = this.timers.get(key);

      if (!gsapTimer) return reject(`GSAP timer missing for ${timerName}.`);

      gsapTimer.eventCallback?.('onComplete', () => resolve());
    });
  }

  /** Clears all GSAP timer handles. */
  static clearAll(): void {
    this.timers.forEach((t) => t.kill?.());
    this.timers.clear();
  }

  /** Clears timers and resets per-entity timer tables. */
  static destroy(): void {
    this.clearAll();

    const entities = EntityManager.queryEntities([TIMER]);
    for (const entity of entities) {
      const timerComp = entity.getComponent<TimerComponent>(TIMER);
      if (timerComp) {
        timerComp.timers.clear();
      }
    }

    console.debug('[TimerSystem] Destroyed');
  }
}