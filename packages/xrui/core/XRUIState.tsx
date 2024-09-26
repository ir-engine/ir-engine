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

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'
import { defineState, getMutableState, getState, useMutableState, useState } from '@ir-engine/hyperflux'
import Dexie, { Table } from 'dexie'
import React, { useEffect } from 'react'
import { CanvasTexture, CompressedTexture, Matrix4 } from 'three'
import { Bounds } from './classes/Bounds'
import { Edges } from './classes/Edges'

export type SnapshotHash = string & OpaqueType<'SnapshotHash'>
export type TextureHash = string & OpaqueType<'Texturehash'>

export interface HTMLSnapshotData {
  hash: string
  clonedElement: HTMLElement
  fontFamilies: string[]
  metrics: {
    bounds: Bounds
    padding: Edges
    margin: Edges
    border: Edges
    fullWidth: number
    fullHeight: number
    pixelRatio: number
    textureWidth: number
    textureHeight: number
  }
  pseudo: {
    hover: boolean
    active: boolean
    focus: boolean
    target: boolean
  }
  cssTransform: Matrix4 | undefined
  referenceCount: number
  pendingStoreLookup: boolean
  pendingSerialization: boolean
  svgDoc?: string
  svgURL?: string
  textureHash?: TextureHash
}

export interface HTMLTextureData {
  hash: TextureHash
  timestamp: number
  pendingStoreLookup: boolean
  storedTextureBuffer?: Uint8Array
  canvasTexture?: CanvasTexture
  compressedTexture?: CompressedTexture
}

export class XRUIStore extends Dexie {
  snapshots!: Table<HTMLSnapshotData>
  textures!: Table<HTMLTextureData>
  constructor() {
    super('xrui-layer-store')
    this.version(1).stores({
      snapshots: '&hash',
      textures: '&hash, timestamp'
    })
  }
}

export const XRUIState = defineState({
  name: 'XRUIState',

  initial: () => {
    return {
      store: new XRUIStore(),
      snapshots: {} as Record<string, HTMLSnapshotData>,
      textures: {} as Record<TextureHash, HTMLTextureData>,
      unsavedTextures: [] as TextureHash[],
      cleanupIntermediateData: true // set false to keep memory-heavy intermediate data (e.g., svg docs) for debugging
    }
  },

  async saveStore() {
    const state = getMutableState(XRUIState)
    const textureEntries = state.unsavedTextures.map(
      (v) => [v.value, state.textures[v.value].value] as [TextureHash, HTMLTextureData]
    )
    state.unsavedTextures.set([])
    return XRUIState._loadIntoStore({}, Object.fromEntries(textureEntries))
  },

  async _loadIntoStore(
    snapshots: Record<SnapshotHash, HTMLSnapshotData>,
    textures: Record<TextureHash, HTMLTextureData>
  ) {
    const state = getMutableState(XRUIState)
    // load into textureData
    state.snapshots.merge(snapshots)
    state.textures.merge(textures)
    const loadedTextureHashes = Object.keys(textures)
    // upload all the known state data, except for svg url
    const snapshotData = Object.values(state.snapshots.value).map((v) => {
      return {
        ...v,
        svgDoc: undefined,
        svgURL: undefined
      }
    }) as HTMLSnapshotData[]
    // only upload the texture buffer
    const textureData = Object.values(state.textures.value)
      .filter((v) => {
        return loadedTextureHashes.includes(v.hash)
      })
      .map((v) => {
        return {
          hash: v.hash,
          timestamp: v.timestamp,
          storedTextureBuffer: v.storedTextureBuffer
        }
      }) as HTMLTextureData[]
    // load into db
    return Promise.all([
      state.store.snapshots.value.bulkPut(snapshotData),
      state.store.textures.value.bulkPut(textureData)
    ])
  },

  getActiveStateHashes() {
    return Object.keys(getState(XRUIState).snapshots)
  },

  reactor: () => {
    const state = useMutableState(XRUIState)

    useEffect(() => {
      if (state.unsavedTextures.length > 0) {
        XRUIState.saveStore()
      }
    }, [state.unsavedTextures])

    return (
      <>
        {state.snapshots.keys.map((hash: SnapshotHash) => (
          <XRUISnapshotReactor key={hash} hash={hash} />
        ))}
        {state.textures.keys.map((hash: TextureHash) => (
          <XRUITextureReactor key={hash} hash={hash} />
        ))}
      </>
    )
  }

  // async requestStoredData(hash: SnapshotHash, abortSignal?: AbortSignal) {
  //   const stateData = XRUILayerState.getStateData(hash)

  //   if (!this._statesRequestedFromStore.has(hash)) {
  //     this._statesRequestedFromStore.add(hash)
  //     if (state?.textureHash) {
  //       stateData.texture = this.getTextureState(state.textureHash)
  //     }
  //   }
  //   const textureData = stateData.texture
  //   if (
  //     textureData &&
  //     textureData.hash &&
  //     !textureData.canvas &&
  //     !textureData.ktx2Url &&
  //     !this._texturesRequestedFromStore.has(textureData?.hash)
  //   ) {
  //     this._texturesRequestedFromStore.add(textureData.hash)
  //     const storedTexture = await this.store.textures.get(textureData.hash)
  //     if (storedTexture?.texture && !textureData.canvas) {
  //       const data = await new Promise<Uint8Array>((resolve, reject) => {
  //         decompress(storedTexture.texture!, { consume: true }, (err, data) => {
  //           if (err) return reject(err)
  //           resolve(data)
  //         })
  //       })
  //       if (!textureData.canvas) {
  //         textureData.ktx2Url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/ktx2' }))
  //       }
  //     }
  //   }
  //   return stateData
  // },

  /**
   * Export the cache data for this
   */
  // async downloadStoreCache() {
  //   await XRUILayerState.saveStore()
  //   const blob = await XRUILayerState.exportCache()
  //   const path = location.pathname.split('/').filter((x) => x)
  //   downloadBlob(blob, 'web.' + location.host + '.' + (path[path.length - 1] ?? '') + '.cache')
  // },

  /**
  //  * Export a cache file for the given state hashes
  //  * @param states by default all active states are exported
  //  * @returns
  //  */
  // async exportCache(states: StateHash[] = this.getActiveStateHashes()) {
  //   const stateData = (await this.store.states.bulkGet(states)) as StateData[]

  //   let textureData = (await this.store.textures.bulkGet(
  //     stateData.map((v) => v.textureHash).filter((v) => typeof v === 'string') as TextureHash[]
  //   )) as TextureData[]
  //   textureData = textureData.filter((v) => v && typeof v.hash === 'string' && v.texture)

  //   const data = {
  //     states: Object.fromEntries(stateData.map((v) => [v.hash, v])),
  //     textureData: Object.fromEntries(textureData.map((v) => [v.hash, v]))
  //   }
  //   const buffer = this._packr.pack(data)

  //   return new Promise<Blob>((resolve, reject) => {
  //     compress(buffer, { consume: true }, (err, data) => {
  //       if (err) return reject(err)
  //       resolve(new Blob([data.buffer]))
  //     })
  //   })
  // },

  // async importCache(url: string) {
  //   try {
  //     const response = await fetch(url)
  //     const zipped = await response.arrayBuffer()
  //     const buffer = await new Promise<Uint8Array>((resolve, reject) => {
  //       decompress(new Uint8Array(zipped), { consume: true }, (err, data) => {
  //         if (err) return reject(err)
  //         resolve(data)
  //       })
  //     })
  //     const data = this._unpackr.unpack(buffer) as {
  //       states: Record<StateHash, StateStoreData>
  //       textures: Record<TextureHash, TextureStoreData>
  //     }

  //     data.textureData = data.textureData.filter((t) => t && t.hash && t.texture)
  //     return XRUILayerState.loadIntoStore(data)
  //   } catch (err) {
  //     console.warn('Failed to import cache', err)
  //   }
  // },
})

// const _packr = new Packr({ structuredClone: true })
// const _unpackr = new Unpackr({ structuredClone: true })

function XRUISnapshotReactor(props: { hash: SnapshotHash }) {
  const state = useMutableState(XRUIState).snapshots[props.hash]
  const textureHash = state.textureHash.value
  const pendingStoreLookup = useState(true)

  // try fetch from store if we are missing texture hash
  useEffect(() => {
    if (!textureHash) {
      const layerState = getState(XRUIState)
      layerState.store.snapshots.get(props.hash).then((data) => {
        if (data?.textureHash && !state.textureHash.value) {
          state.textureHash.set(data.textureHash)
        }
        pendingStoreLookup.set(false)
      })
    } else {
      pendingStoreLookup.set(false)
    }
  }, [])

  // begin serialization process if there is no texture data, and we have an svg document
  useEffect(() => {
    if (!textureHash && !pendingStoreLookup.value && state.svgDoc.value && !state.svgURL.value) {
      state.svgURL.set(URL.createObjectURL(new Blob([state.svgDoc.value], { type: 'image/svg+xml' })))
    }
  }, [textureHash, pendingStoreLookup, state.svgDoc, state.svgURL])

  // rasterize svg image if we need to
  useEffect(() => {
    if (!textureHash && !pendingStoreLookup.value && state.svgURL.value) {
      let abort = false
      const svgImage = new Image()

      const svgImagePromise = new Promise<void>((resolve, reject) => {
        svgImage.onload = () => {
          resolve()
        }
        svgImage.onerror = (error) => {
          reject(error)
        }
        svgImage.width = state.metrics.fullWidth.value
        svgImage.height = state.metrics.fullHeight.value
        svgImage.src = state.svgURL.value!
      })
        .then(() => {
          if (!svgImage.complete || svgImage.currentSrc !== state.svgURL.value || abort) return
          return svgImage.decode()
        })
        .then(() => {})

      return () => {
        abort = true
        svgImage.src = ''
      }
    }
  }, [textureHash, pendingStoreLookup, state.svgDoc])

  return null
}

function XRUITextureReactor(props: { hash: TextureHash }) {
  const state = useMutableState(XRUIState).textures[props.hash]
  const pendingStoreLookup = useState(true)

  // try fetch from store if we are missing texture data
  useEffect(() => {
    if (!state.storedTextureBuffer) {
      const layerState = getState(XRUIState)
      layerState.store.textures.get(props.hash).then((data) => {
        if (data?.storedTextureBuffer) {
          state.storedTextureBuffer.set(data.storedTextureBuffer)
          state.canvasTexture.set(data.canvasTexture)
          state.compressedTexture.set(data.compressedTexture)
        }
        pendingStoreLookup.set(false)
      })
    } else {
      pendingStoreLookup.set(false)
    }
  }, [])

  return null
}
