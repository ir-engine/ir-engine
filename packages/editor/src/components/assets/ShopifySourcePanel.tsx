import React from 'react'
import MediaSourcePanel from './MediaSourcePanel'
import { useTranslation } from 'react-i18next'

/**
 * ShopifySourcePanel used to render view containg AssetPanelToolbarContent and AssetPanelContentContainer.
 *
 * @author Robert Long
 * @param       {any} props
 * @constructor
 */
export function ShopifySourcePanel(props) {
  const { t } = useTranslation()
  return (
    <MediaSourcePanel
      {...props}
      searchPlaceholder={props.source.searchPlaceholder || t('editor:asset.shopifySourcePanel.ph-search')}
    />
  )
}

export default ShopifySourcePanel
