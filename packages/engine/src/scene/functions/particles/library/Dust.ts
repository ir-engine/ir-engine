import { AdditiveBlending, Color, Sprite, SpriteMaterial } from 'three'
import * as THREE from 'three'
import System, {
  Alpha,
  Body,
  BoxZone,
  Color as Colour,
  ease,
  Emitter,
  Gravity,
  Life,
  LineZone,
  Mass,
  MeshZone,
  PointZone,
  Position,
  Radius,
  RandomDrift,
  Rate,
  Scale,
  ScreenZone,
  Span,
  SphereZone,
  SpriteRenderer,
  Vector3D,
  VectorVelocity
} from 'three-nebula'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  ColorArg,
  FloatArg,
  SelectArg,
  TextureArg,
  Vec2Arg
} from '@xrengine/engine/src/renderer/materials/constants/DefaultArgs'

export const DefaultArgs = {
  src: { ...TextureArg, default: '/static/editor/dot.png' },
  alpha: { ...TextureArg, default: '/static/editor/dot.png' },
  color: ColorArg,
  drift: { ...FloatArg, default: 0.05 },
  emitRate: { ...Vec2Arg, default: [12, 0.1] },
  gravity: { ...FloatArg, default: 0.01 },
  lifetime: { ...FloatArg, default: 15 },
  zoneType: {
    ...SelectArg,
    default: 'SPHERE',
    options: [
      { label: 'Sphere', value: 'SPHERE' },
      { label: 'Point', value: 'POINT' },
      { label: 'Line', value: 'LINE' },
      { label: 'Box', value: 'BOX' },
      { label: 'Mesh', value: 'MESH' },
      { label: 'Screen', value: 'SCREEN' }
    ]
  },
  zoneSize: { ...FloatArg, default: 20 }
}

export default async function Dust(args) {
  const sprite = new Sprite(
    new SpriteMaterial({
      map: await AssetLoader.loadAsync(args.src),
      alphaMap: await AssetLoader.loadAsync(args.alpha),
      color: args.color,
      blending: AdditiveBlending,
      fog: true
    })
  )
  const emitter = new Emitter()
  let zone
  switch (args.zoneType) {
    case 'SPHERE':
      zone = new SphereZone(args.zoneSize)
      break
    case 'BOX':
      zone = new BoxZone(
        -args.zoneSize / 2,
        -args.zoneSize / 2,
        -args.zoneSize / 2,
        args.zoneSize,
        args.zoneSize,
        args.zoneSize
      )
      break
    case 'POINT':
      zone = new PointZone()
      break
    case 'LINE':
      zone = new LineZone(0, 0, 0, 0, args.zoneSize, 0)
      break
    case 'MESH':
      zone = new MeshZone()
      break
    case 'SCREEN':
      zone = new ScreenZone(0, 0, 0, args.zoneSize, args.zoneSize, args.zoneSize)
      break
  }
  emitter
    .setRate(new Rate(12, 0.1))
    .addInitializers([
      new Body(sprite),
      new Mass(1),
      new Radius(new Span(0.05, 0.2)),
      new Life(1, args.lifetime),
      new Position(zone)
      //new VectorVelocity(new Vector3D(...[0,1,2].map(_ => new Span(-args.drift, args.drift))))
    ])
    .addBehaviours([
      new Scale(new Span(1, 1.5), 0.2),
      new RandomDrift(...[0, 0, 0].map((_) => args.drift), 0.05),
      new Gravity(args.gravity),
      new Alpha(1, 0.5, Infinity, ease.easeOutSine),
      new Colour(args.color, '#000000', Infinity, ease.easeOutSine)
    ])
    .setPosition({ x: 0, y: 0 })
    .emit()

  const renderer = new SpriteRenderer(Engine.instance.currentWorld.scene, THREE)
  const system = new System()
  system.addEmitter(emitter).addRenderer(renderer)
  return system
}
