import * as THREE from 'three';
import { GridDimensions } from '../LevelTypes';

export interface TerrainShaderConfig {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
}

export interface TerrainShaderUniforms {
  [key: string]: THREE.IUniform;
}

export abstract class TerrainShader {
  protected material: THREE.ShaderMaterial | null = null;

  abstract getUniforms(config: TerrainShaderConfig): TerrainShaderUniforms;
  abstract getVertexShader(): string;
  abstract getFragmentShader(dimensions: GridDimensions): string;

  createMaterial(config: TerrainShaderConfig, dimensions: GridDimensions): THREE.ShaderMaterial {
    this.material = new THREE.ShaderMaterial({
      uniforms: this.getUniforms(config),
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(dimensions),
    });
    return this.material;
  }

  update(deltaTime: number): void {
    // Override in derived classes if needed
  }
}
