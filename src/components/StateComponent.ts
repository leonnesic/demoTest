type TimerCallback = (() => void) | null;

interface Timer {
  duration: number;
  repeat: boolean;
  callback: TimerCallback;
  elapsed: number;
  active: boolean;
  completed: boolean;
}

export default class TimerComponent {
  private timers: Map<string, Timer>;

  /** Initializes internal timer map. */
  constructor() {
    this.timers = new Map<string, Timer>();
  }

  /** Registers a named timer with duration and callbacks. */
  addTimer(
    name: string,
    duration: number,
    callback: TimerCallback = null,
    repeat: boolean = false
  ): void {
    if (this.timers.has(name)) return;

    this.timers.set(name, {
      duration,
      repeat,
      callback,
      elapsed: 0,
      active: true,
      completed: false,
    });
  }

  /** Pauses the named timer without clearing it. */
  pauseTimer(name: string): void {
    const t = this.timers.get(name);
    if (t) t.active = false;
  }

  /** Resumes a previously paused timer. */
  resumeTimer(name: string): void {
    const t = this.timers.get(name);
    if (t) t.active = true;
  }

  /** Removes the timer entry immediately. */
  removeTimer(name: string): void {
    this.timers.delete(name);
  }

  /** Clears every timer entry while keeping the map alive. */
  clear(): void {
    this.timers.clear();
  }

  /** Releases timer resources entirely for GC. */
  destroy(): void {
    this.timers.clear();
    this.timers = null;
  }
}