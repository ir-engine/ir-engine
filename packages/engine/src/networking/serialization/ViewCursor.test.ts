import assert, { strictEqual } from 'assert'
import { NetworkId } from "@xrengine/common/src/interfaces/NetworkId"
import { Entity } from "../../ecs/classes/Entity"
import { NetworkObjectComponent } from "../components/NetworkObjectComponent"
import { createViewCursor, writeEntityId, writeFloat32, writeNetworkId, writeUint32 } from "./ViewCursor"

describe('ViewCursor read/write unit tests', () => {

  it('should writeUint32', () => {
    const view = createViewCursor()
    const val = 1234
    writeUint32(view, val)
    strictEqual(view.cursor, Uint32Array.BYTES_PER_ELEMENT)
    strictEqual(view.getUint32(0), val)
  })
  
  it('should writeFloat32', () => {
    const view = createViewCursor()
    const val = 1.5
    writeFloat32(view, val)
    strictEqual(view.cursor, Float32Array.BYTES_PER_ELEMENT)
    strictEqual(view.getFloat32(0), val)
  })
  
  it('should writeEntityId', () => {
    const view = createViewCursor()
    const entity = 1234 as Entity
    writeEntityId(view, entity)
    strictEqual(view.cursor, Uint32Array.BYTES_PER_ELEMENT)
    strictEqual(view.getUint32(0), entity)
  })

  it('should writeNetworkId', () => {
    const view = createViewCursor()
    const entity = 1234 as Entity
    const netId = 5678 as NetworkId
    NetworkObjectComponent.networkId[entity] = netId
    writeNetworkId(view, entity)
    strictEqual(view.cursor, Uint32Array.BYTES_PER_ELEMENT)
    strictEqual(view.getUint32(0), netId)
  })

})