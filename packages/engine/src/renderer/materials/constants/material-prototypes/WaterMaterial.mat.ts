import {
  AdditiveBlending,
  Color,
  Material,
  RawShaderMaterial,
  Shader,
  ShaderMaterial,
  Uniform,
  WebGLRenderer
} from 'three'

import { Engine } from '../../../../ecs/classes/Engine'
import { addComponent } from '../../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../../ecs/functions/EntityFunctions'
import { setCallback } from '../../../../scene/components/CallbackComponent'
import { GroupComponent } from '../../../../scene/components/GroupComponent'
import { UpdatableCallback, UpdatableComponent } from '../../../../scene/components/UpdatableComponent'
import { MaterialPrototypeComponentType } from '../../components/MaterialPrototypeComponent'
import { SourceType } from '../../components/MaterialSource'
import { ColorArg, FloatArg, ObjectArg, Vec2Arg } from '../DefaultArgs'

export const DefaultArgs = {
  waveTime: FloatArg,
  surfaceY: { ...FloatArg, default: 0.15 },
  waveHeight: { ...FloatArg, default: 0.3 },
  waveLength: { ...FloatArg, default: 0.025 },
  waveSpeed: { ...FloatArg, default: 0.1 },
  waterColor: { ...ColorArg, default: '#56d' },
  waveRange: { ...Vec2Arg, default: [0.5, 0.2] },
  rippleFactor: { ...Vec2Arg, default: [16, 16] },
  rippleMagnitude: { ...FloatArg, default: 0.25 }
}

export type WaterMaterialParameters = {
  waveTime: number
  surfaceY: number
  waveHeight: number
  waveLength: number
  waveSpeed: number
  waterColor: Color
  waveRange?: [number, number]
  rippleFactor?: [number, number]
  rippleMagnitude?: number
}

export class WaterMaterial extends ShaderMaterial {
  constructor(params: WaterMaterialParameters) {
    const uniforms = params
      ? Object.fromEntries(Object.entries(params).map(([field, value]) => [field, new Uniform(value)]))
      : {}
    const vertexShader = `
    #ifdef USE_FOG
        varying float vFogDepth;
    #endif
    #ifdef USE_COLOR
        varying vec3 vColor;
    #endif
    varying vec2 vUv;
    uniform float waveTime;
    uniform float waveLength;
    uniform vec2 rippleFactor;
    uniform float rippleMagnitude;

    #include <logdepthbuf_pars_vertex>
    void main() {
      vUv = uv;
      vUv.x += cos(waveTime / waveLength + uv.x * rippleFactor.x) * rippleMagnitude * 0.5 + rippleMagnitude * 0.5;
      vUv.y += sin(waveTime / waveLength + uv.y * rippleFactor.y) * rippleMagnitude * 0.5 + rippleMagnitude * 0.5;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      #ifdef USE_LOGDEPTHBUF
        #ifdef USE_LOGDEPTHBUF_EXT
          vFragDepth = 1.0 + gl_Position.w;
          vIsPerspective = 1.0; //float( isPerspectiveMatrix( projectionMatrix ) );
        #else
          if ( isPerspectiveMatrix( projectionMatrix ) ) {
            gl_Position.z = log2( max( 0.0001, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
            gl_Position.z *= gl_Position.w;
          }
        #endif
      #endif
      #ifdef USE_COLOR
          vColor = color;
      #endif
      #ifdef USE_FOG
          vFogDepth = (modelViewMatrix * vec4(position, 1.0)).z;
      #endif
    }
  `
    const fragmentShader = `
    varying vec2 vUv;

    uniform vec3 waterColor;

    uniform float waveTime;
    uniform float surfaceY;
    uniform float waveHeight;
    uniform float waveLength;
    uniform float waveSpeed;

    uniform vec2 waveRange;

    uniform vec2 rippleFactor;
    uniform float rippleMagnitude;
    

    #ifdef USE_FOG
      uniform vec3 fogColor;
      varying float vFogDepth;
      #ifdef FOG_EXP2
        uniform float fogDensity;
      #else
        uniform float fogNear;
        uniform float fogFar;
      #endif
    #endif
    #ifdef USE_COLOR
      varying vec3 vColor;
    #endif
    #include <logdepthbuf_pars_fragment>
    void main() {
      float pi = 3.14159265358979323846264;
      
      float x = vUv.x;
      float y = vUv.y;
      //x += cos(waveTime / waveLength + vUv.x * rippleFactor.x) * rippleMagnitude * 0.5 + rippleMagnitude * 0.5;
      //y += sin(waveTime / waveLength + vUv.y * rippleFactor.y) * rippleMagnitude * 0.5 + rippleMagnitude * 0.5;
      if (y < surfaceY + waveRange.x * waveHeight) {
        if (y < surfaceY + waveRange.y * waveHeight) {
            gl_FragColor = vec4(waterColor, 1.0);
        } else if (y < surfaceY + waveRange.x * waveHeight -
                  0.7 * waveHeight * abs(sin(2.0 * pi * -waveSpeed * waveTime + 2.0 * pi * x / waveLength)) +
                  0.3 * waveHeight * pow(sin(4.0 * pi * -waveSpeed * waveTime + pi * x / waveLength), 2.0))
        {
            gl_FragColor = vec4(waterColor, 1.0);
        }
      }
      #include <logdepthbuf_fragment>
      #ifdef USE_COLOR
        gl_FragColor.rgb *= vColor;
      #endif
      #ifdef USE_FOG
        #ifdef FOG_EXP2
          float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
        #else
          float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
        #endif
        gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
      #endif
    }
  `
    super({ vertexShader, fragmentShader, uniforms })

    const updater = createEntity()
    setCallback(updater, UpdatableCallback, (dt) => {
      this.uniforms.waveTime.value += dt
    })
    addComponent(updater, GroupComponent, [])
    addComponent(updater, UpdatableComponent, true)
    this.blending = AdditiveBlending
    this.fog = true
    this.vertexColors = true
    this.defines['USE_FOG'] = ''
    const fogSettings = Engine.instance.currentWorld.sceneMetadata.fog
    this.uniforms['fogColor'] = new Uniform(new Color(fogSettings.color.value))
    this.uniforms['fogNear'] = new Uniform(fogSettings.near.value)
    this.uniforms['fogFar'] = new Uniform(fogSettings.far.value / 10)
    this.transparent = true
    this.alphaTest = 2
    this.needsUpdate = true
  }

  type = 'WaterMaterial'

  get surfaceY(): number {
    return this.uniforms.surfaceY.value
  }
  set surfaceY(value: number) {
    this.uniforms.surfaceY.value = value
  }

  get waterColor(): Color {
    return this.uniforms.waterColor.value
  }
  set waterColor(value: Color) {
    this.uniforms.waterColor.value.copy(value)
  }
  get waveTime(): number {
    return this.uniforms.waveTime.value
  }
  set waveTime(value: number) {
    this.uniforms.waveTime.value = value
  }
  get waveHeight(): number {
    return this.uniforms.waveHeight.value
  }
  set waveHeight(value: number) {
    this.uniforms.waveHeight.value = value
  }
  get waveLength(): number {
    return this.uniforms.waveLength.value
  }
  set waveLength(value: number) {
    this.uniforms.waveLength.value = value
  }
  get waveSpeed(): number {
    return this.uniforms.waveSpeed.value
  }
  set waveSpeed(value: number) {
    this.uniforms.waveSpeed.value = value
  }
  get waveRange(): [number, number] {
    return this.uniforms.waveRange.value
  }
  set waveRange(value: [number, number]) {
    this.uniforms.waveRange.value = value
  }
  get rippleFactor(): [number, number] {
    return this.uniforms.rippleFactor.value
  }
  set rippleFactor(value: [number, number]) {
    this.uniforms.rippleFactor.value = value
  }
  get rippleMagnitude(): number {
    return this.uniforms.rippleMagnitude.value
  }
  set rippleMagnitude(value: number) {
    this.uniforms.rippleMagnitude.value = value
  }
}

export const WaterMaterialPrototype: MaterialPrototypeComponentType = {
  prototypeId: 'WaterMaterial',
  baseMaterial: WaterMaterial,
  arguments: DefaultArgs,
  src: { type: SourceType.BUILT_IN, path: '' }
}

export default WaterMaterialPrototype
