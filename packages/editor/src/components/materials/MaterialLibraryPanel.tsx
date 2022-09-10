import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'
import { areEqual, FixedSizeList } from 'react-window'

import { MaterialLibrary } from '@xrengine/engine/src/renderer/materials/MaterialLibrary'

import styles from '../hierarchy/styles.module.scss'
import MaterialLibraryEntry from './MaterialLibraryEntry'

export default function MaterialLibraryPanel() {
  const { t } = useTranslation()
  const materials = MaterialLibrary.materials
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
                  type: material.type,
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
