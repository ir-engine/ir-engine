import React, { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'
import { areEqual, FixedSizeList } from 'react-window'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { MaterialLibrary } from '@xrengine/engine/src/renderer/materials/MaterialLibrary'
import { useState } from '@xrengine/hyperflux'

import { useEditorState } from '../../services/EditorServices'
import { HeirarchyTreeCollapsedNodeType } from '../hierarchy/HeirarchyTreeWalker'
import styles from '../hierarchy/styles.module.scss'
import MaterialLibraryEntry, { MaterialLibraryEntryType } from './MaterialLibraryEntry'

export default function MaterialLibraryPanel() {
  const { t } = useTranslation()
  const materials = MaterialLibrary.materials

  const editorState = useEditorState()
  const MemoMatLibEntry = memo(MaterialLibraryEntry, areEqual)

  return (
    <>
      <div className={styles.panelContainer}>
        <AutoSizer>
          {({ width, height }) => (
            <FixedSizeList
              height={height}
              width={width}
              itemSize={32}
              itemCount={materials.size}
              itemData={{
                nodes: [...MaterialLibrary.materials.values()].map(({ material, prototype }) => ({
                  material,
                  prototype
                }))
              }}
              itemKey={(index, _) => index}
              innerElementType="ul"
            >
              {MemoMatLibEntry}
            </FixedSizeList>
          )}
        </AutoSizer>
      </div>
    </>
  )
}
