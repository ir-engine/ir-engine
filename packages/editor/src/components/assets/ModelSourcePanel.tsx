import React from 'react'
import MediaSourcePanel from './MediaSourcePanel'
import { useTranslation } from 'react-i18next'

/**
 * ModelSourcePanel used to render view containg AssetPanelToolbarContent and AssetPanelContentContainer.
 *
 * @author Robert Long
 * @param       {any} props
 * @constructor
 */
export function ModelSourcePanel(props) {
  const { t } = useTranslation()
  return (
    <MediaSourcePanel
      {...props}
      searchPlaceholder={props.source.searchPlaceholder || t('editor:asset.modelSourcePanel.ph-search')}
    />
  )
}

export default ModelSourcePanel
