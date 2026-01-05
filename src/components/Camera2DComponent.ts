export interface Camera2DComponentData {
    targetId ? : string | null;
    snapToChunk ? : boolean;
    position ? : {
        x: number;y: number
    };
    zoom ? : number;
    viewport ? : {
        width: number;height: number
    };
    bounds ? : {
        x: number;y: number;width: number;height: number
    } | null;
    active ? : boolean;
    smooth ? : boolean;
}

export default class Camera2DComponent {
    followEntity: string | null;
    snapToChunk: boolean;
    position: {
        x: number;y: number
    };
    zoom: number;
    viewport: {
        width: number;height: number
    };
    bounds: {
        x: number;y: number;width: number;height: number
    } | null;
    active: boolean;
    smooth: boolean;

    /** Configures camera defaults such as zoom, bounds, and smoothing. */
    constructor(payload: Camera2DComponentData = {}) {
        const {
            targetId = null,
                snapToChunk = false,
                position = {
                    x: 0,
                    y: 0
                },
                zoom = 1,
                viewport = {
                    width: 800,
                    height: 600
                },
                bounds = null,
                active = true,
                smooth = true,
        } = payload;

        this.followEntity = targetId;
        this.snapToChunk = snapToChunk;
        this.position = position;
        this.zoom = zoom;
        this.viewport = viewport;
        this.bounds = bounds;
        this.active = active;
        this.smooth = smooth;
    }

    /** Resets camera settings to unreachable defaults. */
    destroy(): void {
        this.followEntity = null;
        this.snapToChunk = false;
        this.position = {
            x: 0,
            y: 0
        };
        this.zoom = 1;
        this.viewport = {
            width: 0,
            height: 0
        };
        this.bounds = null;
        this.active = false;
        this.smooth = false;
    }
}