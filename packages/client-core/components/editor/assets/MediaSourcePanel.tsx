import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { useAssetSearch } from "./useAssetSearch";
import { AssetsPanelToolbar, AssetPanelContentContainer } from "./AssetsPanel";
import AssetSearchInput from "./AssetSearchInput";
import TagList from "./TagList";
import AssetGrid from "./AssetGrid";
import FileInput from "../inputs/FileInput";
import useUpload from "./useUpload";

/**
 * [MediaSourcePanel used to render view for AssetsPanelContainer and AssetsPanelToolbarContainer]
 * @param       {object} editor
 * @param       {object} source
 * @param       {string} searchPlaceholder
 * @param       {object} initialSearchParams
 * @param       {boolean} multiselectTags
 * @param       {object} savedState
 * @param       {[type]} setSavedState
 * @constructor
 */
export default function MediaSourcePanel({
  editor,
  source,
  searchPlaceholder,
  initialSearchParams,
  multiselectTags,
  savedState,
  setSavedState
}) {

  // initializing variables
  const { params, setParams, isLoading, loadMore, hasMore, results } = useAssetSearch(
    source,
    savedState.searchParams || initialSearchParams
  );

  //callback function to handle select on media source
  const onSelect = useCallback(
    item => {
      const { nodeClass, initialProps } = item;
      const node = new nodeClass(editor);

      if (initialProps) {
        Object.assign(node, initialProps);
      }

      const transformPivot = item.transformPivot || source.transformPivot;

      if (transformPivot) {
        editor.editorControls.setTransformPivot(transformPivot);
      }

      editor.spawnGrabbedObject(node);
    },
    [editor, source.transformPivot]
  );

  // function to handle the upload
  const onUpload = useUpload({ source });

  //callback function to handle load more
  const onLoadMore = useCallback(() => {
    loadMore(params);
  }, [params, loadMore]);

  //callback function to handle change query param
  const onChangeQuery = useCallback(
    e => {
      const nextParams = { ...params, query: e.target.value };
      setParams(nextParams);
      setSavedState({ ...savedState, searchParams: nextParams });
    },
    [params, setParams, savedState, setSavedState]
  );

  // callback function to handle changes in tag list
  const onChangeTags = useCallback(
    tags => {
      const nextParams = { ...params, tags };
      setParams(nextParams);
      setSavedState({ ...savedState, searchParams: nextParams });
    },
    [params, setParams, setSavedState, savedState]
  );

  // callback function to handle changes in extended tags
  const onChangeExpandedTags = useCallback(expandedTags => setSavedState({ ...savedState, expandedTags }), [
    savedState,
    setSavedState
  ]);

  // returning view for MediaSourcePanel
  return (
    <>
      <AssetsPanelToolbar title={source.name}>
        <AssetSearchInput
          placeholder={searchPlaceholder}
          value={(params as any).query}
          onChange={onChangeQuery}
          legal={source.searchLegalCopy}
          privacyPolicyUrl={source.privacyPolicyUrl}
        />
        {source.upload && (
        <FileInput
        /* @ts-ignore */
          accept={source.acceptFileTypes || "all"}
          multiple={source.uploadMultiple || false}
          onChange={onUpload}
        />
        )}
      </AssetsPanelToolbar>
      <AssetPanelContentContainer>
        {/*source.tags && (
          <TagList
            multiselect={multiselectTags}
            tags={source.tags}
            /* @ts-ignore */
            /*selectedTags={params.tags}
            onChange={onChangeTags}
            initialExpandedTags={savedState.expandedTags}
            onChangeExpandedTags={onChangeExpandedTags}
          />
        )*/}
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
  );
}

//declairing properties for MediaSourcePanel
MediaSourcePanel.propTypes = {
  searchPlaceholder: PropTypes.string,
  initialSearchParams: PropTypes.object,
  editor: PropTypes.object,
  source: PropTypes.object,
  multiselectTags: PropTypes.bool,
  savedState: PropTypes.object,
  setSavedState: PropTypes.func.isRequired
};

//initializing default Properties
MediaSourcePanel.defaultProps = {
  searchPlaceholder: "Search...",
  initialSearchParams: {
    query: "",
    tags: []
  },
  multiselectTags: false
};
