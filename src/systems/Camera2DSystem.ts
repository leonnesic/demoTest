import * as PIXI from 'pixi.js';
import EventBus from '../utils/EventBus';
import EntityManager from '../core/EntityManager';
import ComponentType from '../core/ComponentType';
import GameContext from '../core/GameContext';
import Camera2DComponent from './Camera2DComponent';
import {
    Vec2
} from './Transform2DSystem';

export default class Camera2DSystem {
    static root: PIXI.Container | null = null;
    static activeCamera: Camera2DComponent | null = null;

    static zoomSpeed = 6;
    static moveSpeed = 6;

    static minZoom = 0.5;
    static maxZoom = 3;

    /** Registers camera creation listener and reads root container. */
    static init(): void {
        this.root = GameContext.get < PIXI.Container > ('root') ?? null;

        EventBus.on(ComponentType.CAMERA2D, async (entityId: string) => {
            this.addEntity(entityId);
        });
    }

    /** Activates the camera component for the given entity. */
    static addEntity(entityId: string): void {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) return;

        const cameraComp = entity.getComponent < Camera2DComponent > (ComponentType.CAMERA2D);
        if (!cameraComp) return;

        if (cameraComp.active) {
            this.activeCamera = cameraComp;
        }
    }

    /** Updates camera position and zoom every frame. */
    static update(deltaTime: number): void {
        if (!this.activeCamera || !this.root) return;

        const camera = this.activeCamera;
        const dt = Math.min(deltaTime, 1 / 60);

        if (camera.followEntity) {
            const target = EntityManager.getEntity(camera.followEntity);
            const transform = target?.getComponent < {
                position: Vec2
            } > (ComponentType.TRANSFORM2D);

            if (transform) {
                if (camera.smooth) {
                    camera.position.x = this._lerp(camera.position.x, transform.position.x, this.moveSpeed * dt);
                    camera.position.y = this._lerp(camera.position.y, transform.position.y, this.moveSpeed * dt);
                } else {
                    camera.position.x = transform.position.x;
                    camera.position.y = transform.position.y;
                }
            }
        }

        camera.zoom = this._lerp(camera.zoom, camera.targetZoom ?? camera.zoom, this.zoomSpeed * dt);

        const renderer = GameContext.get < PIXI.Application > ('app')?.renderer;
        if (!renderer) return;

        this.root.position.set(
            renderer.width / 2 - camera.position.x * camera.zoom,
            renderer.height / 2 - camera.position.y * camera.zoom
        );

        this.root.scale.set(camera.zoom);
    }

    /** Adjusts the active camera zoom level, optionally smoothly. */
    static setZoom(zoomLevel: number, smooth = true): void {
        zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, zoomLevel));
        if (!this.activeCamera) return;

        if (smooth) {
            this.activeCamera.targetZoom = zoomLevel;
        } else {
            this.activeCamera.zoom = zoomLevel;
            this.activeCamera.targetZoom = zoomLevel;
        }
    }

    /** Interpolates between two values by a given t factor. */
    static _lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    /** Clears camera references for shutdown. */
    static destroy(): void {
        this.activeCamera = null;
        this.root = null;
    }
}