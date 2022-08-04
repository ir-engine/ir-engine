import { AdditiveBlending, Color, Sprite, SpriteMaterial } from 'three'
import * as THREE from 'three'
import System, {
  Alpha,
  Body,
  Color as Colour,
  ease,
  Emitter,
  Gravity,
  Life,
  Mass,
  Position,
  Radius,
  RandomDrift,
  Rate,
  Scale,
  Span,
  SphereZone,
  SpriteRenderer,
  Vector3D,
  VectorVelocity
} from 'three-nebula'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { ColorArg, FloatArg, TextureArg, Vec2Arg } from '@xrengine/engine/src/renderer/materials/constants/DefaultArgs'

export const DefaultArgs = {
  src: { ...TextureArg, default: '/static/editor/dot.png' },
  color: ColorArg,
  drift: { ...FloatArg, default: 0.05 },
  emitRate: { ...Vec2Arg, default: [12, 0.1] },
  lifetime: { ...FloatArg, default: 15 },
  zoneSize: { ...FloatArg, default: 20 }
}

export default async function Dust(args) {
  const sprite = new Sprite(
    new SpriteMaterial({
      map: await AssetLoader.loadAsync(args.src),
      color: 0xfff,
      blending: AdditiveBlending,
      fog: true
    })
  )
  const createEmitter = () => {
    const emitter = new Emitter()
    return emitter
      .setRate(new Rate(12, 0.1))
      .addInitializers([
        new Body(sprite),
        new Mass(1),
        new Radius(new Span(0.05, 0.2)),
        new Life(1, args.lifetime),
        new Position(new SphereZone(args.zoneSize))
        //new VectorVelocity(new Vector3D(...[0,1,2].map(_ => new Span(-args.drift, args.drift))))
      ])
      .addBehaviours([
        new Scale(new Span(1, 1.5), 0.2),
        new RandomDrift(...[0, 0, 0].map((_) => args.drift), 0.05),
        new Gravity(0.01),
        new Alpha(1, 0.5, Infinity, ease.easeOutSine),
        new Colour('#FFFFFF', '#000000', Infinity, ease.easeOutSine)
      ])
      .setPosition({ x: 0, y: 0 })
      .emit()
  }

  const system = new System()
  system.addEmitter(createEmitter()).addRenderer(new SpriteRenderer(Engine.instance.currentWorld.scene, THREE))

  return system
}
