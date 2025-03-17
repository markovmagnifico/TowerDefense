import * as THREE from 'three';
import { TerrainShader, TerrainShaderConfig, TerrainShaderUniforms } from './TerrainShader';
import { GridDimensions } from '../LevelTypes';

export class SteepnessShader extends TerrainShader {
  getUniforms(config: TerrainShaderConfig): TerrainShaderUniforms {
    return {
      primaryColor: { value: new THREE.Color(config.primaryColor) }, // Flat terrain
      secondaryColor: { value: new THREE.Color(config.secondaryColor) }, // Medium slopes
      tertiaryColor: { value: new THREE.Color(config.tertiaryColor || config.secondaryColor) }, // Steep cliffs
      slopeThreshold1: { value: 0.3 }, // Transition from flat to medium
      slopeThreshold2: { value: 0.7 }, // Transition from medium to steep
    };
  }

  getVertexShader(): string {
    return `
      varying vec2 vUv;
      varying float vHeight;
      varying vec3 vNormal;
      varying float vSteepness;
      
      void main() {
        vUv = uv;
        vHeight = position.z;
        vNormal = normalize(normal);
        
        // Calculate steepness based on normal's angle from up vector
        vSteepness = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  getFragmentShader(dimensions: GridDimensions): string {
    return `
      uniform vec3 primaryColor;
      uniform vec3 secondaryColor;
      uniform vec3 tertiaryColor;
      uniform float slopeThreshold1;
      uniform float slopeThreshold2;
      
      varying vec2 vUv;
      varying float vHeight;
      varying vec3 vNormal;
      varying float vSteepness;
      
      void main() {
        vec2 coord = floor(vec2(vUv.x * ${dimensions.width}.0, vUv.y * ${dimensions.height}.0));
        float pattern = mod(coord.x + coord.y, 2.0);
        
        vec3 baseColor;
        
        // Smooth transitions between colors based on steepness
        if (vSteepness < slopeThreshold1) {
          baseColor = mix(primaryColor, secondaryColor, vSteepness / slopeThreshold1);
        } else if (vSteepness < slopeThreshold2) {
          float t = (vSteepness - slopeThreshold1) / (slopeThreshold2 - slopeThreshold1);
          baseColor = mix(secondaryColor, tertiaryColor, t);
        } else {
          baseColor = tertiaryColor;
        }
        
        // Apply height-based shading and basic lighting
        float heightFactor = vHeight * 0.1 + 0.9;
        float lightIntensity = max(dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))), 0.0);
        float shadingFactor = 0.7 + 0.3 * lightIntensity;
        
        // Apply subtle pattern variation
        float patternFactor = pattern == 0.0 ? 1.0 : 0.95;
        
        gl_FragColor = vec4(baseColor * heightFactor * shadingFactor * patternFactor, 1.0);
      }
    `;
  }
}
