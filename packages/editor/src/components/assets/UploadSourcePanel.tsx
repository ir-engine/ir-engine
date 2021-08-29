import React from 'react'
import MediaSourcePanel from './MediaSourcePanel'
import { useTranslation } from 'react-i18next'
/**
 * UploadSourcePanel component used to render MediaSourcePanel.
 *
 * @author Robert Long
 * @param {any} props
 * @constructor
 */
export function UploadSourcePanel(props) {
  const { t } = useTranslation()
  return (
    <MediaSourcePanel
      {...props}
      searchPlaceholder={props.source.searchPlaceholder || t('editor:asset.assetSourcePanel.ph-search')}
    />
  )
}

export default UploadSourcePanel
