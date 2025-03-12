import * as THREE from 'three';

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
  abstract getFragmentShader(gridSize: number): string;

  createMaterial(config: TerrainShaderConfig, gridSize: number): THREE.ShaderMaterial {
    this.material = new THREE.ShaderMaterial({
      uniforms: this.getUniforms(config),
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(gridSize),
    });
    return this.material;
  }

  update(deltaTime: number): void {
    // Override in derived classes if needed
  }
}
