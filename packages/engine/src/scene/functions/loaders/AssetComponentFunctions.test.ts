import assert from 'assert'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { createEngine } from '@xrengine/engine/src/initializeEngine'

import { Entity } from '../../../ecs/classes/Entity'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { SCENE_COMPONENT_ASSET, SCENE_COMPONENT_ASSET_DEFAULT_VALUES } from './AssetComponentFunctions'

describe('AssetComponentFunctions', () => {
  let entity: Entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  describe('loadAsset()', () => {
    it('Correctly handles loading empty asset', () => {})

    it('Correctly handles file not existing', () => {})

    it('Correctly handles loading basic test asset file', () => {})

    it('Correctly handles multiple load calls in single frame', () => {})

    it('Calls load, then is deleted in same frame', () => {})
  })

  describe('unloadAsset()', () => {
    it('Correctly handles unloading empty asset', () => {})

    it('Correctly handles unloading basic asset file', () => {})

    it('Correctly handles unloading asset that has had contents moved', () => {})

    it('Correctly handles multiple unload calls in single frame', () => {})

    it('Correctly handles a component calling unload, then being deleted in same frame', () => {})
  })

  describe('deserializeAsset()', () => {})

  describe('serializeAsset()', () => {})

  //test can place empty asset in scene
  //test can serialize scene to file
  //test can deserialize file into scene
  //test serialize multiple assets at once
  //test deserialize multiple assets at once
  //test nested serialization
  //test nested deserialization
})
