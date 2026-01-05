export interface AssetEntry {
  alias: string;
  src: string;
}

export interface Bundle {
  name: string;
  assets: AssetEntry[];
}

export interface Manifest {
  bundles: Bundle[];
}

export default class GameData {
  /** Gathers asset bundles via Vite globbing for loader manifest. */
  static buildManifest(): Manifest {
    const load = (glob: Record<string, string>): AssetEntry[] =>
      Object.entries(glob).map(([path, url]) => ({
        alias: path.split('/').pop() ?? path,
        src: url,
      }));

    const preloader = import.meta.glob('../assets/preloader/**/*.{json,png,jpg}', { eager: true, import: 'default', query: '?url' }) as Record<string, string>;
    const scenes = import.meta.glob('../assets/scenes/**/*.json', { eager: true, import: 'default', query: '?url' }) as Record<string, string>;
    const entities = import.meta.glob('../assets/entities/**/*.json', { eager: true, import: 'default', query: '?url' }) as Record<string, string>;
    const sprites = import.meta.glob('../assets/sprites/**/*.{json,png}', { eager: true, import: 'default', query: '?url' }) as Record<string, string>;
    const textures = import.meta.glob('../assets/textures/**/*.{png,jpg}', { eager: true, import: 'default', query: '?url' }) as Record<string, string>;
    const font = import.meta.glob('../assets/font/**/*.{png,fnt}', { eager: true, import: 'default', query: '?url' }) as Record<string, string>;
    const particles = import.meta.glob('../assets/particles/**/*.{json}', { eager: true, import: 'default', query: '?url' }) as Record<string, string>;

    return {
      bundles: [
        { name: 'preloader', assets: load(preloader) },
        {
          name: 'game',
          assets: [
            ...load(scenes),
            ...load(entities),
            ...load(textures),
            ...load(sprites),
            ...load(font),
            ...load(particles),
          ],
        }
      ],
    };
  }
}