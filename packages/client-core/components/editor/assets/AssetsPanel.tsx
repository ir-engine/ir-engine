import React, { useContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Column, Row } from "../layout/Flex";
import { List, ListItem } from "../layout/List";
import { EditorContext } from "../contexts/EditorContext";
import AssetDropZone from "./AssetDropZone";

/**
 * [AssetsPanelContainer used as container element for asset penal]
 * @type {Styled component}
 */
const AssetsPanelContainer = (styled as any)(Row)`
  position: relative;
  flex: 1;
  background-color: ${props => props.theme.panel};
`;

/**
 * [AssetsPanelToolbarContainer used as container element for tools like search input]
 * @type {Styled component}
 */
const AssetsPanelToolbarContainer = (styled as any).div`
  display: flex;
  min-height: 32px;
  background-color: ${props => props.theme.toolbar};
  align-items: center;
  padding: 0 8px;
  justify-content: space-between;
  border-bottom: 1px solid ${props => props.theme.panel};
`;

/**
 * [AssetPanelToolbarContent used to provide styles toolbar content]
 * @type {Styled component}
 */
export const AssetPanelToolbarContent = (styled as any)(Row)`
  flex: 1;
  align-items: flex-end;

  & > * {
    margin-left: 16px;
  }
`;

/**
 * [AssetsPanelToolbar used to create view elements for toolbar on asset penal]
 * @param       {string} title    [contains the title for toolbar]
 * @param       {node} children
 * @param       {any} rest
 * @constructor
 */
export function AssetsPanelToolbar({ title, children, ...rest }) {
  return (
    <AssetsPanelToolbarContainer {...rest}>
      <div>{title}</div>
      <AssetPanelToolbarContent>{children}</AssetPanelToolbarContent>
    </AssetsPanelToolbarContainer>
  );
}

/**
 * [declairing propTypes for AssetsPanelToolbar]
 * @type {Object}
 */
AssetsPanelToolbar.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node
};

/**
 * [AssetsPanelColumn ]
 * @type {Styled component}
 */
const AssetsPanelColumn = (styled as any)(Column)`
  max-width: 175px;
  border-right: 1px solid ${props => props.theme.border};
`;

/**
 * [AssetPanelContentContainer container element for asset panel]
 * @type {Styled component}
 * */
export const AssetPanelContentContainer = (styled as any)(Row)`
  flex: 1;
  overflow: hidden;
`;

/**
 * [getSources used to get sources out of editor and filter sources on the basis of requiresAuthentication or isAuthenticated]
 * @param  {Object} editor
 * @return {[type]}        [description]
 */
function getSources(editor) {
  const isAuthenticated = editor.api.isAuthenticated();
  return editor.sources.filter(source => !source.requiresAuthentication || isAuthenticated);
}

/**
 * [AssetsPanel used to render view for AssetsPanel]
 * @constructor
 */
export default function AssetsPanel() {

  //initializing editor with EditorContext
  const editor = useContext(EditorContext);

  //initializing sources using getSources from editor
  const [sources, setSources] = useState(
    getSources(editor)
  );

  //initializing selectedSource as the first element of sources array
  const [selectedSource, setSelectedSource] = useState(sources.length > 0 ? sources[0] : null);
  const SourceComponent = selectedSource && selectedSource.component;

  useEffect(() => {
    const onSetSource = sourceId => {
      setSelectedSource(sources.find(s => s.id === sourceId));
    };

    const onAuthChanged = () => {
      const nextSources = getSources(editor);
      setSources(nextSources);

      if (nextSources.indexOf(selectedSource) === -1) {
        setSelectedSource(nextSources.length > 0 ? nextSources[0] : null);
      }
    };

    const onSettingsChanged = () => {
      const nextSources = getSources(editor);
      setSources(nextSources);
    };

    editor.addListener("settingsChanged", onSettingsChanged);
    editor.addListener("setSource", onSetSource);
    editor.api.addListener("authentication-changed", onAuthChanged);

    return () => {
      editor.removeListener("setSource", onSetSource);
      editor.api.removeListener("authentication-changed", onAuthChanged);
    };
  }, [editor, setSelectedSource, sources, setSources, selectedSource]);

  const [savedSourceState, setSavedSourceState] = useState({});

  const setSavedState = useCallback(
    state => {
      setSavedSourceState({
        ...savedSourceState,
        [selectedSource.id]: state
      });
    },
    [selectedSource, setSavedSourceState, savedSourceState]
  );

  const savedState = savedSourceState[selectedSource.id] || {};

  return (
    <AssetsPanelContainer id="assets-panel">
      { /* @ts-ignore */ }
      {/* <AssetsPanelColumn flex>
        <AssetsPanelToolbar title="Assets" />
        <List>
          {sources.map(source => (
            <ListItem key={source.id} onClick={() => setSelectedSource(source)} selected={selectedSource === source}>
              {source.name}
            </ListItem>
          ))}
        </List>
      </AssetsPanelColumn> */}
      <Column flex>
        {SourceComponent && (
          <SourceComponent
            key={selectedSource.id}
            source={selectedSource}
            editor={editor}
            savedState={savedState}
            setSavedState={setSavedState}
          />
        )}
      </Column>
      <AssetDropZone />
    </AssetsPanelContainer>
  );
}
