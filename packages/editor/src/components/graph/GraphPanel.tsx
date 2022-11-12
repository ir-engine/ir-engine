import BehaveFlow from 'ee-behave-flow/src/App'
import React from 'react'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'

import hierarchyStyles from '../hierarchy/styles.module.scss'

export default function GraphPanel() {
  const { t } = useTranslation()
  return (
    <>
      <div className={hierarchyStyles.panelContainer}>
        <div className={hierarchyStyles.panelSection}>
          <AutoSizer>
            {({ width, height }) => (
              <div style={{ width, height }}>
                <BehaveFlow />
              </div>
            )}
          </AutoSizer>
        </div>
      </div>
    </>
  )
}
