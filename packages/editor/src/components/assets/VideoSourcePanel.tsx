import React from 'react'
import MediaSourcePanel from './MediaSourcePanel'
import { useTranslation } from 'react-i18next'

/**
 * VideoSourcePanel used to render view of MediaSourcePanel.
 *
 * @author Robert Long
 * @param       {object} props
 * @constructor
 */
export function VideoSourcePanel(props) {
  const { t } = useTranslation()
  return (
    <MediaSourcePanel
      {...props}
      searchPlaceholder={props.source.searchPlaceholder || t('editor:asset.videoSourcePanel.ph-search')}
    />
  )
}

export default VideoSourcePanel
