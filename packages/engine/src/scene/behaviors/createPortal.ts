import { BoxBufferGeometry, Color, Euler, ExtrudeGeometry, Font, FontLoader, Mesh, MeshBasicMaterial, MeshNormalMaterial, Object3D, Quaternion, ShapeGeometry, TextBufferGeometry, Vector3 } from 'three';
import { Body, BodyType, createShapeFromConfig, SHAPES } from 'three-physx';
import { LoadGLTF } from '../../assets/functions/LoadGLTF';
import { isClient } from '../../common/functions/isClient';
import { Behavior } from '../../common/interfaces/Behavior';
import { Engine } from '../../ecs/classes/Engine';
import { addComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { addColliderWithoutEntity } from '../../physics/behaviors/colliderCreateFunctions';
import { ColliderComponent } from '../../physics/components/ColliderComponent';
import { CollisionGroups } from '../../physics/enums/CollisionGroups';
import { PhysicsSystem } from '../../physics/systems/PhysicsSystem';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Object3DComponent } from '../components/Object3DComponent';
import { PortalComponent } from '../components/PortalComponent';

export type PortalProps = {
  location: string;
  displayText: string;
  spawnPosition: Vector3;
  spawnRotation: Quaternion;
}

const vec3 = new Vector3();

export const createPortal: Behavior = (entity, args) => {
  const {
    location,
    displayText,
    spawnPosition,
  } = args;

  const spawnRotation = new Quaternion().setFromEuler(
    new Euler().setFromVector3(
      new Vector3(args.spawnRotation.x, args.spawnRotation.y, args.spawnRotation.z),
      'XYZ'
    )
  );

  if (!isClient) {
    return;
  }

  const transform = getComponent(entity, TransformComponent);

  // this is also not a great idea, we should load this either as a static asset or from the portal node arguments
  LoadGLTF(Engine.publicPath + '/models/common/portal_frame.glb').then(({ scene }: { scene: Mesh }) => {

    const model = scene.clone();
    const previewMesh = model.children[2] as Mesh;

    model.position.copy(transform.position)
    model.quaternion.copy(transform.rotation)
    model.scale.copy(transform.scale)

    previewMesh.geometry.computeBoundingBox();
    previewMesh.geometry.boundingBox.getSize(vec3).multiplyScalar(0.5).setZ(0.1)

    const portalShape = createShapeFromConfig({
      shape: SHAPES.Box,
      options: { boxExtents: vec3 },
      transform: { translation: previewMesh.position },
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

    addComponent(entity, Object3DComponent, { value: model })
  })

  addComponent(entity, PortalComponent, {
    location,
    displayText,
    spawnPosition,
    spawnRotation
  })
}
