import React, { useCallback } from 'react'
import AssetGrid from './AssetGrid'
import { AssetPanelContentContainer } from './AssetsPanel'
import { useAssetSearch } from './useAssetSearch'
import useUpload from './useUpload'

/**
 * MediaSourcePanel used to render view for AssetsPanelContainer and AssetsPanelToolbarContainer.
 *
 * @author Robert Long
 * @param       {object} editor
 * @param       {object} source
 * @constructor
 */
export function MediaSourcePanel({ editor, source }) {
  // initializing variables
  const { params, setParams, isLoading, loadMore, hasMore, results } = useAssetSearch(source)
  //callback function to handle select on media source
  const onSelect = useCallback(
    (item) => {
      const { nodeClass, initialProps } = item
      const node = new nodeClass(editor)

      if (initialProps) {
        Object.assign(node, initialProps)
      }

      const transformPivot = item.transformPivot || source.transformPivot

      if (transformPivot) {
        editor.editorControls.setTransformPivot(transformPivot)
      }

      editor.spawnGrabbedObject(node)
    },
    [editor, source.transformPivot]
  )

  // function to handle the upload
  const onUpload = useUpload({ source })

  //callback function to handle load more
  const onLoadMore = useCallback(() => {
    loadMore(params)
  }, [params, loadMore])

  // returning view for MediaSourcePanel
  return (
    <>
      {/* <AssetsPanelToolbar title={source.name}>
        {source.upload && (
        <FileInput
          accept={source.acceptFileTypes || "all"}
          multiple={source.uploadMultiple || false}
          onChange={onUpload}
        />
        )}
      </AssetsPanelToolbar> */}
      <AssetPanelContentContainer>
        <AssetGrid
          source={source}
          items={results}
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          onSelect={onSelect}
          isLoading={isLoading}
        />
      </AssetPanelContentContainer>
    </>
  )
}

export default MediaSourcePanel
