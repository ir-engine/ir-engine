import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { useAssetSearch } from "./useAssetSearch";
import { AssetsPanelToolbar, AssetPanelContentContainer } from "./AssetsPanel";
import AssetSearchInput from "./AssetSearchInput";
import AssetGrid from "./AssetGrid";
import FileInput from "../inputs/FileInput";
import useUpload from "./useUpload";

export default function MediaSourcePanel({
  editor,
  source,
  searchPlaceholder,
  initialSearchParams,
  savedState,
  setSavedState
}) {
  const { params, setParams, isLoading, loadMore, hasMore, results } = useAssetSearch(
    source,
    savedState.searchParams || initialSearchParams
  );

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

  const onUpload = useUpload({ source });

  const onLoadMore = useCallback(() => {
    loadMore(params);
  }, [params, loadMore]);

  const onChangeQuery = useCallback(
    e => {
      const nextParams = { ...params, query: e.target.value };
      setParams(nextParams);
      setSavedState({ ...savedState, searchParams: nextParams });
    },
    [params, setParams, savedState, setSavedState]
  );

  return (
    <>
      <AssetsPanelToolbar title={source.name}>
        <AssetSearchInput
          placeholder={searchPlaceholder}
          value={(params as any).query}
          onChange={onChangeQuery}
        />
        {source.upload && (
          <FileInput
            label="File"
            accept={source.acceptFileTypes || "all"}
            onChange={onUpload}
          />
        )}
      </AssetsPanelToolbar>
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
  );
}

MediaSourcePanel.propTypes = {
  searchPlaceholder: PropTypes.string,
  initialSearchParams: PropTypes.object,
  editor: PropTypes.object,
  source: PropTypes.object,
  multiselectTags: PropTypes.bool,
  savedState: PropTypes.object,
  setSavedState: PropTypes.func.isRequired
};

MediaSourcePanel.defaultProps = {
  searchPlaceholder: "Search...",
  initialSearchParams: {
    query: "",
    tags: []
  },
  multiselectTags: false
};
