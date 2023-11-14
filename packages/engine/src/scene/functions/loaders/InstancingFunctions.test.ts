/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { afterEach, beforeEach, describe } from 'mocha'
import { createSandbox, SinonSandbox } from 'sinon'
import { Color } from 'three'

import { getMutableState } from '@etherealengine/hyperflux'

import { destroyEngine, Engine } from '../../../ecs/classes/Engine'
import { EngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import {
  GrassProperties,
  SampleMode,
  ScatterMode,
  ScatterProperties,
  ScatterState
} from '../../components/InstancingComponent'
import { GRASS_PROPERTIES_DEFAULT_VALUES, SCATTER_PROPERTIES_DEFAULT_VALUES } from './InstancingFunctions'

describe('InstancingFunctions', async () => {
  let entity: Entity
  let sandbox: SinonSandbox
  const initEntity = () => {
    entity = createEntity()
  }
  beforeEach(async () => {
    sandbox = createSandbox()
    createEngine()
    initEntity()
    Engine.instance.engineTimer.start()

    getMutableState(EngineState).publicPath.set('')
    await Promise.all([])
  })
  afterEach(async () => {
    sandbox.restore()
    return destroyEngine()
  })

  const scatterProps: ScatterProperties = {
    ...SCATTER_PROPERTIES_DEFAULT_VALUES,
    densityMap: {
      src: '',
      texture: null
    },
    heightMap: {
      src: '',
      texture: null
    }
  }

  const grassProps: GrassProperties = {
    ...GRASS_PROPERTIES_DEFAULT_VALUES,
    grassTexture: {
      src: '',
      texture: null
    },
    alphaMap: {
      src: '',
      texture: null
    },
    sunColor: new Color(1, 1, 1)
  }

  const emptyInstancingCmp = {
    count: 0,
    surface: '',
    sampling: SampleMode.SCATTER,
    mode: ScatterMode.GRASS,
    state: ScatterState.UNSTAGED,
    sampleProperties: scatterProps,
    sourceProperties: grassProps
  }

  describe('deserializeInstancing', () => {})

  describe('stageInstancing', () => {})

  describe('unstageInstancing', () => {})

  describe('serializeInstancing', () => {})
})
