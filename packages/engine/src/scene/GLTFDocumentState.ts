import { defineAction, defineState } from '@etherealengine/hyperflux'
import { GLTF } from '@gltf-transform/core'
import matches, { Validator } from 'ts-matches'

export const GLTFDocumentState = defineState({
  name: 'GLTFDocumentState',
  initial: {} as Record<string, GLTF.IGLTF>
})

export class GLTFSnapshotAction {
  static createSnapshot = defineAction({
    type: 'ee.gltf.snapshot.CREATE_SNAPSHOT' as const,
    source: matches.string as Validator<unknown, string>,
    data: matches.object as Validator<unknown, GLTF.IGLTF>
  })

  static undo = defineAction({
    type: 'ee.gltf.snapshot.UNDO' as const,
    source: matches.string as Validator<unknown, string>,
    count: matches.number
  })

  static redo = defineAction({
    type: 'ee.gltf.snapshot.REDO' as const,
    source: matches.string as Validator<unknown, string>,
    count: matches.number
  })

  static clearHistory = defineAction({
    type: 'ee.gltf.snapshot.CLEAR_HISTORY' as const,
    source: matches.string as Validator<unknown, string>
  })
}
