/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { defineState, getState, isClient } from '@ir-engine/hyperflux'

import { DefaultLoadingManager, WebGLRenderer } from 'three'
import { CORTOLoader } from '../loaders/corto/CORTOLoader'
import { DRACOLoader } from '../loaders/gltf/DRACOLoader'
import { KTX2Loader } from '../loaders/gltf/KTX2Loader'
import { loadDRACODecoderNode, NodeDRACOLoader } from '../loaders/gltf/NodeDracoLoader'
import { DomainConfigState } from './DomainConfigState'

export const AssetLoaderState = defineState({
  name: 'AssetLoaderState',
  initial: () => {
    let dracoLoader: DRACOLoader
    if (isClient) {
      dracoLoader = new DRACOLoader()
      // todo we probably want to react to changes in the domain config state
      dracoLoader.setDecoderPath(getState(DomainConfigState).publicDomain + '/loader_decoders/')
      dracoLoader.setWorkerLimit(1)
    } else {
      loadDRACODecoderNode()
      dracoLoader = new NodeDRACOLoader() as any as DRACOLoader
      /* @ts-ignore */
      dracoLoader.preload = () => {
        return dracoLoader
      }
    }

    const ktx2Loader = new KTX2Loader()
    ktx2Loader.setTranscoderPath(getState(DomainConfigState).publicDomain + '/loader_decoders/basis/')
    if (isClient) {
      const renderer = new WebGLRenderer()
      ktx2Loader.detectSupport(renderer)
      renderer.dispose()
    }

    return {
      manager: DefaultLoadingManager,
      ktx2Loader,
      dracoLoader,
      cortoLoader: null! as CORTOLoader
    }
  }
})
