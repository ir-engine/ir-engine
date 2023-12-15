import { ShaderMaterial, Uniform, Vector3 } from 'three'
import LogarithmicDepthBufferMaterialChunk from '../../scene/functions/LogarithmicDepthBufferMaterialChunk'

const SDFShader = {
  shader: new ShaderMaterial({
    vertexShader: `
    #ifdef USE_FOG
      varying float vFogDepth;
    #endif
    varying vec2 vUv;
    #include <logdepthbuf_pars_vertex>
    ${LogarithmicDepthBufferMaterialChunk}
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      #include <logdepthbuf_vertex>
      #ifdef USE_FOG
        vFogDepth = (modelViewMatrix * vec4(position, 1.0)).z;
      #endif
    }`,
    fragmentShader: `
    precision mediump float;
    uniform vec3 cameraPos;
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    #include <logdepthbuf_pars_fragment>

    #define MAX_STEPS 100
    #define MIN_DIST 0.001
    #define MAX_DIST 1000.0

    vec3 torus(vec3 p, vec2 t) {
      float angle = uTime;
      float c = cos(angle);
      float s = sin(angle);
      mat3 rotationMatrix = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
      p = rotationMatrix * p;

      vec2 q = vec2(length(p.xz) - t.x, p.y);
      return vec3(length(q) - t.y, q.y, 0.0);
 
    }

    float shortestDistanceToTorus(vec3 ro, vec2 t) {
      return torus(ro, t).x;
    }
    vec3 estimateNormal(vec3 p, vec2 torusParams) {
      float epsilon = 0.001; // Adjust
      return normalize(vec3(
        shortestDistanceToTorus(p + vec3(epsilon, 0.0, 0.0), torusParams) - shortestDistanceToTorus(p - vec3(epsilon, 0.0, 0.0), torusParams),
        shortestDistanceToTorus(p + vec3(0.0, epsilon, 0.0), torusParams) - shortestDistanceToTorus(p - vec3(0.0, epsilon, 0.0), torusParams),
        shortestDistanceToTorus(p + vec3(0.0, 0.0, epsilon), torusParams) - shortestDistanceToTorus(p - vec3(0.0, 0.0, epsilon), torusParams)
      ));
  }
    vec3 rayMarch(vec3 ro, vec3 rd) {
      float d = 0.0;
      for (int i = 0; i < MAX_STEPS && d < MAX_DIST; i++) {
        vec3 p = ro + rd * d;
        float dist = shortestDistanceToTorus(p, vec2(0.3, 0.1));
        if (dist < MIN_DIST) {
          float cameraDist = length(p - cameraPos);
          float shade = smoothstep(0.0, 5.0, cameraDist);
          return vec3(shade, 0.0, 0.0);
        }
        d += dist;
      }
      return vec3(0.0);
    }
    vec3 rayMarchPhong(vec3 ro, vec3 rd) {
      float d = 0.0;
      for (int i = 0; i < MAX_STEPS && d < MAX_DIST; i++) {
          vec3 p = ro + rd * d;
          float dist = shortestDistanceToTorus(p, vec2(0.5, 0.2));
          
          if (dist < MIN_DIST) {
              // Estimate normal
              vec3 normal = estimateNormal(p, vec2(0.5, 0.2));
  
              // Shading
              float cameraDist = length(p - cameraPos);
              float shade = smoothstep(0.0, 5.0, cameraDist);
  
              // Phong shading components
              vec3 ambientColor = vec3(0.2, 0.2, 0.2); // Ambient color
              vec3 diffuseColor = uColor*2.0; // Diffuse color
              vec3 specularColor = vec3(1.0, 1.0, 1.0); // Specular color
              float shininess = 32.0;
  
              vec3 lightDirection = normalize(vec3(1.0, 0.5, 1.0)); // Light direction (adjust as needed)
  
              // Diffuse reflection
              float diffuseFactor = max(0.0, dot(normalize(normal), -lightDirection));
              vec3 diffuse = diffuseColor * diffuseFactor;
  
              // Specular reflection
              vec3 viewDirection = normalize(cameraPos - p);
              vec3 reflectionDirection = reflect(lightDirection, normalize(normal));
              float specularFactor = pow(max(0.0, dot(viewDirection, reflectionDirection)), shininess);
              vec3 specular = specularColor * specularFactor;
  
              // Final color
              vec3 phongColor = ambientColor + diffuse + specular;
              vec3 finalColor = mix(vec3(0.0), phongColor, shade);
  
              return finalColor;
          }
  
          d += dist;
      }
  
      return vec3(0.0);
  }
    void main() {
      vec2 uv = vUv;
      vec3 torusPosition = vec3(0.0);
      vec3 viewDir = normalize(vec3(uv - 0.5, 1.0)); 
      // vec3 color = rayMarchPhong(vec3(0.0), viewDir);
      //here is the blocker
      vec3 color = rayMarchPhong(cameraPos, viewDir);
      gl_FragColor = vec4(color, 1.0);
      //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      #include <logdepthbuf_fragment>
    }      
  `,
    uniforms: {
      cameraPos: new Uniform(new Vector3(0, 0, -2)),
      uTime: new Uniform(0),
      uColor: new Uniform(new Vector3(0, 0, -2)),
      torusPosition: new Uniform(new Vector3(0, 0, 0))
    }
  }),
  shader_old: new ShaderMaterial({
    vertexShader: `
    #ifdef USE_FOG
      varying float vFogDepth;
    #endif
    varying vec2 vUv;
    #include <logdepthbuf_pars_vertex>
    ${LogarithmicDepthBufferMaterialChunk}
    
    mat4 translationMatrix = mat4(
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
  );
  
  void main() {
      vUv = uv;
  
      // Apply translation to compensate for rotation
      vec4 worldPosition = translationMatrix * vec4(position, 1.0);
  
      gl_Position = projectionMatrix * modelViewMatrix * worldPosition;
  
      #include <logdepthbuf_vertex>
      #ifdef USE_FOG
          vFogDepth = (modelViewMatrix * vec4(position, 1.0)).z;
      #endif
  }`,
    fragmentShader: `
    precision mediump float;
    uniform vec3 cameraPos;
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    #include <logdepthbuf_pars_fragment>

    #define MAX_STEPS 100
    #define MIN_DIST 0.001
    #define MAX_DIST 1000.0

    vec3 torus(vec3 p, vec2 t) {
      float angle = uTime;
      float c = cos(angle);
      float s = sin(angle);
      mat3 rotationMatrix = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
      p = rotationMatrix * p;

      vec2 q = vec2(length(p.xz) - t.x, p.y);
      return vec3(length(q) - t.y, q.y, 0.0);
      
    }

    float shortestDistanceToTorus(vec3 ro, vec2 t) {
      return torus(ro, t).x;
    }
    vec3 estimateNormal(vec3 p, vec2 torusParams) {
      float epsilon = 0.001; // Adjust
      return normalize(vec3(
        shortestDistanceToTorus(p + vec3(epsilon, 0.0, 0.0), torusParams) - shortestDistanceToTorus(p - vec3(epsilon, 0.0, 0.0), torusParams),
        shortestDistanceToTorus(p + vec3(0.0, epsilon, 0.0), torusParams) - shortestDistanceToTorus(p - vec3(0.0, epsilon, 0.0), torusParams),
        shortestDistanceToTorus(p + vec3(0.0, 0.0, epsilon), torusParams) - shortestDistanceToTorus(p - vec3(0.0, 0.0, epsilon), torusParams)
      ));
    }
    vec3 rayMarch(vec3 ro, vec3 rd) {
      float d = 0.0;
      for (int i = 0; i < MAX_STEPS && d < MAX_DIST; i++) {
        vec3 p = ro + rd * d;
        float dist = shortestDistanceToTorus(p, vec2(0.3, 0.1));
        if (dist < MIN_DIST) {
          float cameraDist = length(p - cameraPos);
          float shade = smoothstep(0.0, 5.0, cameraDist);
          return vec3(shade, 0.0, 0.0);
        }
        d += dist;
      }
      return vec3(0.0);
    }
    vec3 rayMarchPhong(vec3 ro, vec3 rd) {
      float d = 0.0;
      for (int i = 0; i < MAX_STEPS && d < MAX_DIST; i++) {
          vec3 p = ro + rd * d;
          float dist = shortestDistanceToTorus(p, vec2(0.5, 0.2));
          
          if (dist < MIN_DIST) {
              // Estimate normal
              vec3 normal = estimateNormal(p, vec2(0.5, 0.2));
  
              // Shading
              float cameraDist = length(p - cameraPos);
              float shade = smoothstep(0.0, 5.0, cameraDist);
  
              // Phong shading components
              vec3 ambientColor = vec3(0.2, 0.2, 0.2); // Ambient color
              vec3 diffuseColor = uColor*2.0; // Diffuse color
              vec3 specularColor = vec3(1.0, 1.0, 1.0); // Specular color
              float shininess = 32.0;
  
              vec3 lightDirection = normalize(vec3(1.0, 0.5, 1.0)); // Light direction (adjust as needed)
  
              // Diffuse reflection
              float diffuseFactor = max(0.0, dot(normalize(normal), -lightDirection));
              vec3 diffuse = diffuseColor * diffuseFactor;
  
              // Specular reflection
              vec3 viewDirection = normalize(cameraPos - p);
              vec3 reflectionDirection = reflect(lightDirection, normalize(normal));
              float specularFactor = pow(max(0.0, dot(viewDirection, reflectionDirection)), shininess);
              vec3 specular = specularColor * specularFactor;
  
              // Final color
              vec3 phongColor = ambientColor + diffuse + specular;
              vec3 finalColor = mix(vec3(0.0), phongColor, shade);
  
              return finalColor;
          }
  
          d += dist;
      }
  
      return vec3(0.0);
  }
  void main() {
    vec2 uv = vUv;
    vec3 viewDir = normalize(vec3(uv - 0.5, 1.0));
    vec3 color = rayMarchPhong(vec3(0.0,0.0,0.0)), viewDir);
    //float torusDistance = shortestDistanceToTorus(cameraPos, vec2(0.5, 0.2));

    // Set the alpha channel based on the torus distance
    //float alpha = smoothstep(0.1, 0.2, torusDistance);  // Adjust the thresholds as needed

    // Combine color and alpha to control transparency 
    gl_FragColor = vec4(color, 1.0);
    //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    #include <logdepthbuf_fragment>
  }     
  `,
    uniforms: {
      cameraPos: new Uniform(new Vector3(0, 0, -2)),
      //cameraPosition: new Uniform(getComponent(Engine.instance.cameraEntity, TransformComponent).position),
      uTime: new Uniform(0),
      uColor: new Uniform(new Vector3(0, 0, -2))
    }
  })
}
export { SDFShader }
