import { BoxBufferGeometry, Color, ExtrudeGeometry, Font, FontLoader, Mesh, MeshBasicMaterial, MeshNormalMaterial, Quaternion, ShapeGeometry, TextBufferGeometry, Vector3 } from 'three';
import { Body, BodyType, createShapeFromConfig, SHAPES } from 'three-physx';
import { isClient } from '../../common/functions/isClient';
import { Behavior } from '../../common/interfaces/Behavior';
import { addComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { addColliderWithoutEntity } from '../../physics/behaviors/colliderCreateFunctions';
import { ColliderComponent } from '../../physics/components/ColliderComponent';
import { CollisionGroups } from '../../physics/enums/CollisionGroups';
import { PhysicsSystem } from '../../physics/systems/PhysicsSystem';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Object3DComponent } from '../components/Object3DComponent';
import { PortalComponent } from '../components/PortalComponent';

type PortalProps = {
  location: string;
  displayText: string;
}

export const createPortal: Behavior = (entity, args: PortalProps) => {

  if (!isClient) {
    return;
  }

  const transform = getComponent(entity, TransformComponent);

  const portalShape = createShapeFromConfig({
    shape: SHAPES.Box,
    options: { boxExtents: new Vector3().copy(transform.scale).multiplyScalar(0.5) },
    config: {
      isTrigger: true,
      collisionLayer: CollisionGroups.Portal,
      collisionMask: CollisionGroups.Characters
    }
  });

  const portalBody = PhysicsSystem.instance.addBody(new Body({
    shapes: [portalShape],
    type: BodyType.STATIC,
    transform: {
      translation: transform.position,
      rotation: transform.rotation
    }
  }));

  PhysicsSystem.instance.addBody(portalBody);

  portalBody.userData = entity;

  addComponent(entity, ColliderComponent, { body: portalBody });


  const model = new Mesh(new BoxBufferGeometry(), new MeshNormalMaterial())
  model.position.copy(transform.position)
  model.quaternion.copy(transform.rotation)
  model.scale.copy(transform.scale)

  // TEMPORARY - we should cache this in the asset loader as a pre-cached asset
  const loader = new FontLoader();
  loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_bold.typeface.json',
    (font: Font) => {

      const fontResolution = 120;
      const displayText = args.displayText === '' || !args.displayText ? 'EXIT' : args.displayText;

      const shapes = font.generateShapes(displayText, fontResolution);

      const geometry = new ExtrudeGeometry(shapes, { bevelEnabled: false });
      const invResolution = 1 / fontResolution;
      geometry.scale(invResolution, invResolution * 0.8, invResolution);
      geometry.computeBoundingBox();
      const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      geometry.translate(xMid, 0, 0);
      
      const textSize = 0.15;
      const text = new Mesh(geometry, new MeshBasicMaterial({ color: new Color('aqua') }))
      text.scale.setScalar(textSize)
      text.translateY(((transform.scale.y * 0.5) + textSize) * 0.5)

      model.add(text)
    },
    undefined,
    console.error
  );

  // TODO: add a font loader

  addComponent(entity, Object3DComponent, { value: model })
  addComponent(entity, PortalComponent, { location: args.location })
}
