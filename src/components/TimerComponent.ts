export default class TimerComponent {
    /** Sets up an empty timer registry for this component. */
    constructor() {
        this.timers = new Map();
    }

    /** Adds a named timer with optional repeat behavior. */
    addTimer(name, duration, callback = null, repeat = false) {
        if (this.timers.has(name)) return;

        this.timers.set(name, {
            duration,
            repeat,
            callback,
            elapsed: 0,
            active: true,
            completed: false
        });
    }

    /** Pauses the specified timer. */
    pauseTimer(name) {
        const t = this.timers.get(name);
        if (t) t.active = false;
    }

    /** Resumes a paused timer. */
    resumeTimer(name) {
        const t = this.timers.get(name);
        if (t) t.active = true;
    }

    /** Removes the timer entry altogether. */
    removeTimer(name) {
        this.timers.delete(name);
    }

    /** Clears every timer without destroying the map. */
    clear() {
        this.timers.clear();
    }

    /** Tears down the timer map for cleanup. */
    destroy(){
        this.timers = null;
    }
}