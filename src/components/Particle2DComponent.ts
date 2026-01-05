export interface ParticleEmitterConfigRef {
  effectId: string;
  textureId: string; 
}

export interface Particle2DComponentData {
  emitters: ParticleEmitterConfigRef[];
  isActive?: boolean;
}

export default class Particle2DComponent {
  emitters: ParticleEmitterConfigRef[];
  isActive: boolean;

  /** Mirrors emitter definitions and default active state. */
  constructor(data: Particle2DComponentData) {
    this.emitters = data.emitters;
    this.isActive = data.isActive ?? true;
  }
}