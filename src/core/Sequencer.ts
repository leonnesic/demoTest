import gsap from 'gsap';

export interface SequencerOptions {
    autoClear ? : boolean;
    debug ? : boolean;
}

type SequencerAction = () => Promise < void > ;

export default class Sequencer {
    actions: SequencerAction[];
    labels: Map < string,
    number > ;
    autoClear: boolean;
    debug: boolean;
    pointer: number;

    /** Initializes sequencer state including options for clearing and logging. */
    constructor({
        autoClear = true,
        debug = false
    }: SequencerOptions = {}) {
        this.actions = [];
        this.labels = new Map < string, number > ();
        this.autoClear = !!autoClear;
        this.debug = !!debug;
        this.pointer = 0;
    }

    /** Enqueues an action with optional arguments for later execution. */
    add(action: (...args: any[]) => any, ...args: any[]): this {
        this.actions.push(async () => {
            if (this.debug) console.log(`[Sequencer] ▶ ${action.name || 'anonymous'}`);
            await action(...args);
        });
        return this;
    }

    /** Inserts a delay step that resolves after the given duration. */
    delay(timeMsOrSec: number): this {
        const ms = timeMsOrSec < 20 ? timeMsOrSec * 1000 : timeMsOrSec;
        this.actions.push(() => new Promise < void > (resolve => gsap.delayedCall(ms / 1000, () => resolve())));
        return this;
    }

    /** Marks the current position so flow can jump back later. */
    label(name: string): this {
        this.labels.set(name, this.actions.length);
        return this;
    }

    /** Pushes a goto action that rewinds the pointer to the named label. */
    goto(labelName: string): this {
        const idx = this.labels.get(labelName);
        if (idx === undefined) throw new Error(`Label "${labelName}" not found`);
        this.actions.push(async () => {
            if (this.debug) console.log(`[Sequencer] 🔁 goto ${labelName}`);
            this.pointer = idx;
        });
        return this;
    }

    /** Runs multiple actions concurrently and waits for completion. */
    parallel(...fns: Array < () => any | Promise < any >> ): this {
        this.actions.push(async () => {
            if (this.debug) console.log(`[Sequencer] ▶ parallel`);
            await Promise.all(fns.map(fn => Promise.resolve(fn())));
        });
        return this;
    }

    /** Executes queued actions sequentially and resets if requested. */
    async run(): Promise < void > {
        this.pointer = 0;
        while (this.pointer < this.actions.length) {
            const action = this.actions[this.pointer];
            await action();
            this.pointer++;
        }
        if (this.autoClear) this.clear();
    }

    /** Clears the action list and label registry to start fresh. */
    clear(): void {
        this.actions = [];
        this.labels.clear();
    }
}