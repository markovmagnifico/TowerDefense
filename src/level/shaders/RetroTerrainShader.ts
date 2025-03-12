import * as THREE from 'three';
import { TerrainShader, TerrainShaderConfig, TerrainShaderUniforms } from './TerrainShader';

export class RetroTerrainShader extends TerrainShader {
  protected material: THREE.ShaderMaterial | null = null;

  getUniforms(config: TerrainShaderConfig): TerrainShaderUniforms {
    return {
      primaryColor: { value: new THREE.Color(config.primaryColor) },
      secondaryColor: { value: new THREE.Color(config.secondaryColor) },
      tertiaryColor: { value: new THREE.Color(config.tertiaryColor || config.secondaryColor) },
    };
  }

  getVertexShader(): string {
    return `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  getFragmentShader(gridSize: number): string {
    return `
      uniform vec3 primaryColor;
      uniform vec3 secondaryColor;
      uniform vec3 tertiaryColor;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vec2 coord = floor(vUv * ${gridSize}.0);
        float pattern = mod(coord.x + coord.y, 3.0);
        
        // Calculate normal for this grid cell using surface derivatives
        vec3 dx = dFdx(vPosition);
        vec3 dy = dFdy(vPosition);
        vec3 normal = normalize(cross(dx, dy));
        
        // Calculate slope
        float slope = 1.0 - abs(normal.y);  // 0 = flat, 1 = vertical
        
        // Quantize slope to grid cells
        slope = floor(slope * ${gridSize}.0) / ${gridSize}.0;
        
        vec3 slopeColor = (slope < 0.2) ? primaryColor : 
                         (slope < 0.7) ? secondaryColor : 
                         tertiaryColor;

        vec3 color;  // Declare color variable
        if (pattern < 1.0) {
            color = slopeColor;
        } else if (pattern < 2.0) {
            color = slopeColor * 0.93;
        } else {
            color = slopeColor * 0.87;
        }
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;
  }

  createMaterial(config: TerrainShaderConfig, gridSize: number): THREE.ShaderMaterial {
    this.material = new THREE.ShaderMaterial({
      uniforms: this.getUniforms(config),
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(gridSize),
      side: THREE.DoubleSide,
    });

    return this.material;
  }

  update(deltaTime: number): void {
    // No animation needed for this shader
  }
}
