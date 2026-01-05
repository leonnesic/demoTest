import {
    Application,
    Container,
    Graphics
} from 'pixi.js';
import GameContext from '../core/GameContext.js';

export default class Stage2DSystem {
    /** Creates the PIXI application, stage, and camera container. */
    static async init() {
        const BASE_WIDTH = 1920;
        const BASE_HEIGHT = 1080;

        const app = new Application();
        await app.init({
            background: '#000000',
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
        });

        document.body.appendChild(app.canvas);
        globalThis.__PIXI_APP__ = app;

        this.root = new Container();
        this.root.name = 'root';
        app.stage.addChild(this.root);
        app.stage.name = 'stage';

        this.cameraContainer = new Container();
        this.cameraContainer.name = 'camera';
        this.root.addChild(this.cameraContainer);

        const stageBackground = new Graphics()
            .beginFill(0x121212)
            .drawRect(0, 0, BASE_WIDTH, BASE_HEIGHT)
            .endFill();
        stageBackground.name = 'stageBackground';
        this.cameraContainer.addChild(stageBackground);

        Object.assign(app.canvas.style, {
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            position: 'absolute',
            zIndex: '0',
            background: 'rgb(0, 0, 0)',
        });

        app.ticker.stop();

        this.app = app;
        this.BASE_WIDTH = BASE_WIDTH;
        this.BASE_HEIGHT = BASE_HEIGHT;

        GameContext.register('app', app);
        GameContext.register('canvas', app.canvas);
        GameContext.register('stage', app.stage);
        GameContext.register('root', this.root);
        GameContext.register('camera', this.cameraContainer);
        GameContext.register('body', document.body);
        GameContext.register('BASE_WIDTH', BASE_WIDTH);
        GameContext.register('BASE_HEIGHT', BASE_HEIGHT);
        GameContext.register('PIXELS_PER_METER', 100);

        this.onResize();
        window.addEventListener('resize', this.onResize.bind(this));
    }

    /** Renders the PIXI stage manually each tick. */
    static update() {
        this.app.ticker.update();
        this.app.renderer.render(this.app.stage);
        this.app.renderer.gl.finish();
    }

    /** Adjusts canvas scaling to match the window size. */
    static onResize() {
        const app = this.app;
        const BASE_WIDTH = this.BASE_WIDTH;
        const BASE_HEIGHT = this.BASE_HEIGHT;

        const scaleX = window.innerWidth / BASE_WIDTH;
        const scaleY = window.innerHeight / BASE_HEIGHT;
        const scale = Math.min(scaleX, scaleY);

        app.renderer.resize(window.innerWidth, window.innerHeight);

        this.root.scale.set(scale);
        this.root.position.set(
            app.renderer.width / 2 - (BASE_WIDTH * scale) / 2,
            app.renderer.height / 2 - (BASE_HEIGHT * scale) / 2
        );

        GameContext.set('stageScale', scale);
    }

    /** Removes the resize handler and keeps app state. */
    static destroy() {
        window.removeEventListener('resize', this.onResize);
    }
}