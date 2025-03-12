import * as THREE from 'three';
import { TerrainShader, TerrainShaderConfig, TerrainShaderUniforms } from './TerrainShader';

export class NoiseShader extends TerrainShader {
  getUniforms(config: TerrainShaderConfig): TerrainShaderUniforms {
    return {
      primaryColor: { value: new THREE.Color(config.primaryColor) },
      secondaryColor: { value: new THREE.Color(config.secondaryColor) },
      tertiaryColor: { value: new THREE.Color(config.tertiaryColor || config.secondaryColor) },
      time: { value: 0 },
      noiseScale: { value: 5.0 },
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

  getFragmentShader(gridSize: number): string {
    return `
      uniform vec3 primaryColor;
      uniform vec3 secondaryColor;
      uniform vec3 tertiaryColor;
      uniform float time;
      uniform float noiseScale;
      
      varying vec2 vUv;
      varying float vHeight;
      varying vec3 vNormal;

      // Simplex noise implementation
      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      
      void main() {
        // Generate noise based on position and time
        float n = snoise(vUv * noiseScale + time * 0.1);
        n = (n + 1.0) * 0.5; // normalize to 0-1
        
        // Mix colors based on noise and height
        vec3 baseColor;
        if (n < 0.33) {
          baseColor = mix(primaryColor, secondaryColor, n * 3.0);
        } else if (n < 0.66) {
          baseColor = mix(secondaryColor, tertiaryColor, (n - 0.33) * 3.0);
        } else {
          baseColor = mix(tertiaryColor, primaryColor, (n - 0.66) * 3.0);
        }
        
        // Apply height and normal-based shading
        float heightFactor = vHeight * 0.1 + 0.9;
        float lightIntensity = max(dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))), 0.0);
        float shadingFactor = 0.7 + 0.3 * lightIntensity;
        
        gl_FragColor = vec4(baseColor * heightFactor * shadingFactor, 1.0);
      }
    `;
  }

  update(deltaTime: number): void {
    if (this.material) {
      this.material.uniforms.time.value += deltaTime;
    }
  }
}
