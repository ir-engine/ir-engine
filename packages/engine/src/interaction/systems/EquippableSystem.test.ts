import { createWorld } from 'bitecs';
import { TestNetwork } from '../../../tests/networking/TestNetwork';
import { Engine } from '../../ecs/classes/Engine';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions';
import { createEntity } from '../../ecs/functions/EntityFunctions';
import { Network } from '../../networking/classes/Network';
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent';
import { EquipperComponent } from '../components/EquipperComponent';
import EquippableSystem from './EquippableSystem';
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { createAvatar } from '../../avatar/functions/createAvatar';
import { Quaternion, Vector3 } from 'three';
import { getHandTransform } from '../../xr/functions/WebXRFunctions';
import { EquippedComponent } from '../components/EquippedComponent';
import { EquippableAttachmentPoint } from '../enums/EquippedEnums';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { getParity } from '../functions/equippableFunctions';
import assert, { strictEqual } from 'assert';

describe('equippableSystem', () => {
    let world;
    let equippableSystem;

    before (async() => {
        world = createWorld();
        Network.instance = new TestNetwork()
        Engine.currentWorld = world;
        equippableSystem = await EquippableSystem(world);
        await Engine.currentWorld.physics.createScene({ verbose: true })
    })
    
    after(() => {
      Engine.currentWorld = null!
      delete (globalThis as any).PhysX
    })

    it('system test', async() => {
        Engine.userId = world.hostId
        Engine.hasJoinedWorld = true
        const player: Entity = createEntity(world);
        const item: Entity = createEntity(world);

        
        const networkObject = addComponent(player, NetworkObjectComponent, {
            ownerId: Engine.userId,
            networkId: 0 as NetworkId,
            prefab: '',
            parameters: {},
        })

        createAvatar({
          prefab: 'avatar',
          parameters: { position: new Vector3(-0.48624888685311896, 0, -0.12087574159728942), rotation: new Quaternion() },
          type: 'network.SPAWN_OBJECT',
          networkId: networkObject.networkId,
          $from: Engine.userId,
          $to: 'all',
          $tick: Engine.currentWorld.fixedTick,
          $cache: true
        })

        const equippedComponent = addComponent(item, EquippedComponent, { equipperEntity: player, attachmentPoint: EquippableAttachmentPoint.HEAD })
        addComponent(player, EquipperComponent, { equippedEntity: item, data: {} as any })
        
        const equippableTransform = addComponent(item, TransformComponent, { position: new Vector3(0, 0, 0), rotation: new Quaternion(), scale: new Vector3(1, 1, 1) })
        const attachmentPoint = equippedComponent.attachmentPoint
        const handTransform = getHandTransform(item, getParity(attachmentPoint))
        const { position, rotation } = handTransform
        
        equippableSystem();

        assert(!hasComponent(item, EquipperComponent))

        strictEqual(equippableTransform.position.x, position.x)
        strictEqual(equippableTransform.position.y, position.y)
        strictEqual(equippableTransform.position.z, position.z)

        strictEqual(equippableTransform.rotation.x, rotation.x)
        strictEqual(equippableTransform.rotation.y, rotation.y)
        strictEqual(equippableTransform.rotation.z, rotation.z)
        strictEqual(equippableTransform.rotation.w, rotation.w)

        removeComponent(item, EquippedComponent)
        equippableSystem();
    })
})