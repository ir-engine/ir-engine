import { Not } from '../../ecs/functions/ComponentFunctions'
import { System } from '../../ecs/classes/System'
import { getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver'
import { Network } from '../../networking/classes/Network'
import { Vault } from '../../networking/classes/Vault'
import { NetworkObject } from '../../networking/components/NetworkObject'
import { calculateInterpolation, createSnapshot } from '../../networking/functions/NetworkInterpolationFunctions'
import { ColliderComponent } from '../components/ColliderComponent'
import { InterpolationComponent } from '../components/InterpolationComponent'
import { BodyType } from 'three-physx'
import { findInterpolationSnapshot } from '../behaviors/findInterpolationSnapshot'
import { Vector3 } from 'three'
import { SnapshotData } from '../../networking/types/SnapshotDataTypes'
import { characterCorrectionBehavior } from '../../avatar/behaviors/avatarCorrectionBehavior'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { avatarInterpolationBehavior } from '../../avatar/behaviors/avatarInterpolationBehavior'
import { rigidbodyInterpolationBehavior } from '../behaviors/rigidbodyInterpolationBehavior'
import { LocalInterpolationComponent } from '../components/LocalInterpolationComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { rigidbodyCorrectionBehavior } from '../behaviors/rigidbodyCorrectionBehavior'
import { VelocityComponent } from '../components/VelocityComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

const vec3 = new Vector3()

export class InterpolationSystem extends System {
  execute(delta: number): void {
    if (!Network.instance?.snapshot) return

    const snapshots: SnapshotData = {
      interpolation: calculateInterpolation('x y z quat velocity'),
      correction: Vault.instance?.get(Network.instance.snapshot.timeCorrection, true),
      new: []
    }

    // Create new snapshot position for next frame server correction
    Vault.instance.add(createSnapshot(snapshots.new))

    for (const entity of this.queryResults.localCharacterInterpolation.all) {
      characterCorrectionBehavior(entity, snapshots, delta)
    }

    for (const entity of this.queryResults.networkClientInterpolation.all) {
      avatarInterpolationBehavior(entity, snapshots, delta)
    }

    for (const entity of this.queryResults.networkObjectInterpolation.all) {
      rigidbodyInterpolationBehavior(entity, snapshots, delta)
    }

    for (const entity of this.queryResults.localObjectInterpolation.all) {
      rigidbodyCorrectionBehavior(entity, snapshots, delta)
    }

    // If a networked entity does not have an interpolation component, just copy the data
    for (const entity of this.queryResults.correctionFromServer.all) {
      const snapshot = findInterpolationSnapshot(entity, Network.instance.snapshot)
      if (snapshot == null) continue
      const collider = getMutableComponent(entity, ColliderComponent)
      const velocity = getMutableComponent(entity, VelocityComponent)
      // dynamic objects should be interpolated, kinematic objects should not
      if (velocity && collider.body.type !== BodyType.KINEMATIC) {
        velocity.velocity.subVectors(collider.body.transform.translation, vec3.set(snapshot.x, snapshot.y, snapshot.z))
        collider.body.updateTransform({
          translation: {
            x: snapshot.x,
            y: snapshot.y,
            z: snapshot.z
          },
          rotation: {
            x: snapshot.qX,
            y: snapshot.qY,
            z: snapshot.qZ,
            w: snapshot.qW
          }
        })
      }
    }
  }
}

InterpolationSystem.queries = {
  localCharacterInterpolation: {
    components: [AvatarControllerComponent, InterpolationComponent, NetworkObject]
  },
  networkClientInterpolation: {
    components: [Not(AvatarControllerComponent), AvatarComponent, InterpolationComponent, NetworkObject]
  },
  localObjectInterpolation: {
    components: [
      Not(AvatarComponent),
      LocalInterpolationComponent,
      InterpolationComponent,
      ColliderComponent,
      NetworkObject
    ]
  },
  networkObjectInterpolation: {
    components: [
      Not(AvatarComponent),
      Not(LocalInterpolationComponent),
      InterpolationComponent,
      ColliderComponent,
      NetworkObject
    ]
  },
  correctionFromServer: {
    components: [Not(InterpolationComponent), ColliderComponent, NetworkObject]
  }
}
