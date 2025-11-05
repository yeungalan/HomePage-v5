/**
 * Shader utilities for World component
 */

import * as solar from 'solar-calculator'

/**
 * Day/Night shader for globe rendering
 */
export const dayNightShader = {
  vertexShader: `
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    void main() {
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #define PI 3.141592653589793
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec2 sunPosition;

    varying vec3 vWorldPosition;
    varying vec2 vUv;

    float toRad(in float a) {
      return a * PI / 180.0;
    }

    vec3 Polar2Cartesian(in vec2 c) { // [lng, lat]
      float theta = toRad(90.0 - c.x);
      float phi = toRad(90.0 - c.y);
      return vec3(
        sin(phi) * cos(theta),
        cos(phi),
        sin(phi) * sin(theta)
      );
    }

    void main() {
      // Calculate world-space normal from world position
      vec3 worldNormal = normalize(vWorldPosition);

      // Get sun direction directly in world space (no rotation needed)
      vec3 sunDirection = Polar2Cartesian(sunPosition);

      // Calculate lighting intensity
      float intensity = dot(worldNormal, normalize(sunDirection));

      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv);
      float blendFactor = smoothstep(-0.1, 0.1, intensity);
      gl_FragColor = mix(nightColor, dayColor, blendFactor);
    }
  `,
}

/**
 * Calculate sun position for a given timestamp
 */
export const sunPosAt = (dt: number): [number, number] => {
  const day = new Date(+dt).setUTCHours(0, 0, 0, 0)
  const t = solar.century(dt)
  const longitude = ((day - dt) / 864e5) * 360 - 180
  return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)]
}
