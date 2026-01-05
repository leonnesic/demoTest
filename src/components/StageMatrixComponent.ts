export interface StageMatrixComponentData {
    matrixX ? : number;
    matrixY ? : number;
}

export default class StageMatrixComponent {
    x: number | null;
    y: number | null;
    prevX: number | null;
    prevY: number | null;

    /** Stores grid coordinates and last seen values. */
    constructor({
        matrixX = 0,
        matrixY = 0
    }: StageMatrixComponentData = {}) {
        this.x = matrixX;
        this.y = matrixY;
        this.prevX = matrixX;
        this.prevY = matrixY;
    }

    /** Updates grid position and tracks previous coordinates. */
    set(x: number, y: number): boolean {
        if (this.x !== x || this.y !== y) {
            this.prevX = this.x;
            this.prevY = this.y;
            this.x = x;
            this.y = y;
            return true;
        }
        return false;
    }

    /** Checks whether the stored position matches the provided values. */
    is(x: number, y: number): boolean {
        return this.x === x && this.y === y;
    }

    /** Indicates whether the position changed since the last check. */
    hasChanged(): boolean {
        return this.x !== this.prevX || this.y !== this.prevY;
    }

    /** Resets all coordinates to zero. */
    reset(): void {
        this.x = 0;
        this.y = 0;
        this.prevX = 0;
        this.prevY = 0;
    }

    /** Clears all stored coordinate references. */
    destroy(): void {
        this.x = null;
        this.y = null;
        this.prevX = null;
        this.prevY = null;
    }
}