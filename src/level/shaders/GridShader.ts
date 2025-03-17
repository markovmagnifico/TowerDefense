import * as THREE from 'three';
import { TerrainShader, TerrainShaderConfig, TerrainShaderUniforms } from './TerrainShader';
import { GridDimensions } from '../LevelTypes';

export class GridShader extends TerrainShader {
  getUniforms(config: TerrainShaderConfig): TerrainShaderUniforms {
    return {
      lightColor: { value: new THREE.Color(config.primaryColor) },
      darkColor: { value: new THREE.Color(config.secondaryColor) },
    };
  }

  getVertexShader(): string {
    return `
      varying vec2 vUv;
      varying float vHeight;
      varying vec3 vNormal;
      
      void main() {
        vUv = uv;
        vHeight = position.z;
        vNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  getFragmentShader(dimensions: GridDimensions): string {
    return `
      uniform vec3 lightColor;
      uniform vec3 darkColor;
      varying vec2 vUv;
      varying float vHeight;
      varying vec3 vNormal;
      
      void main() {
        vec2 coord = floor(vec2(vUv.x * ${dimensions.width}.0, vUv.y * ${dimensions.height}.0));
        bool isLight = mod(coord.x + coord.y, 2.0) == 0.0;
        vec3 baseColor = isLight ? lightColor : darkColor;
        
        // Height-based shading
        float heightFactor = vHeight * 0.1 + 0.9;
        
        // Simple diffuse lighting
        float lightIntensity = max(dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))), 0.0);
        float shadingFactor = 0.7 + 0.3 * lightIntensity;
        
        gl_FragColor = vec4(baseColor * heightFactor * shadingFactor, 1.0);
      }
    `;
  }
}
