import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'
import { areEqual, FixedSizeList } from 'react-window'

import { MaterialLibrary } from '@xrengine/engine/src/renderer/materials/MaterialLibrary'

import styles from '../hierarchy/styles.module.scss'
import MaterialLibraryEntry from './MaterialLibraryEntry'

export default function MaterialLibraryPanel() {
  const { t } = useTranslation()
  const materials = Object.entries(MaterialLibrary)
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
              itemCount={materials.length}
              itemData={{
                nodes: Object.keys(MaterialLibrary).map((name) => ({ type: name }))
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
