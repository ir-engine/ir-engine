import React from 'react'
import PropTypes from 'prop-types'
import MediaSourcePanel from './MediaSourcePanel'
import { useTranslation } from 'react-i18next'

/**
 * ImageSourcePanel used to render source container.
 *
 * @author Robert Long
 * @param       {any} props
 * @constructor
 */
export function ImageSourcePanel(props) {
  const { t } = useTranslation()
  return (
    <MediaSourcePanel
      {...props}
      searchPlaceholder={props.source.searchPlaceholder || t('editor:asset.imageSourcePanel.ph-search')}
    />
  )
}

// declairing propTypes for ImageSourcePanel
ImageSourcePanel.propTypes = {
  source: PropTypes.object
}
export default ImageSourcePanel
