import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import assert, { strictEqual } from 'assert'
import { Entity } from '../../../ecs/classes/Entity'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { NetworkObjectComponent } from '../../components/NetworkObjectComponent'
import { createDataWriter } from "../SoA/DataWriter"
import { createViewCursor, writeEntityId, writeNetworkId, writeFloat32, writeUint32 } from '../ViewCursor'

describe('SoA serialization', () => {
  
  

})