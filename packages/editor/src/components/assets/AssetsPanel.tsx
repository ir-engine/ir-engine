import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { FlexColumn, FlexRow } from '../layout/Flex'
import AssetDropZone from './AssetDropZone'
import styles from './styles.module.scss'
import EditorEvents from '../../constants/EditorEvents'
import { SourceManager } from '../../managers/SourceManager'
import { CommandManager } from '../../managers/CommandManager'

/**
 * AssetsPanelContainer used as container element for asset penal.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const AssetsPanelContainer = (styled as any)(FlexRow)`
  position: relative;
  flex: 1;
  background-color: ${(props) => props.theme.panel};
`

/**
 * AssetsPanelToolbarContainer used as container element for tools like search input.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const AssetsPanelToolbarContainer = (styled as any).div`
  display: flex;
  min-height: 32px;
  background-color: ${(props) => props.theme.toolbar};
  align-items: center;
  padding: 0 8px;
  justify-content: space-between;
  border-bottom: 1px solid ${(props) => props.theme.panel};
`

/**
 * AssetPanelToolbarContent used to provide styles toolbar content.
 *
 * @author Robert Long
 * @type {Styled component}
 */
export const AssetPanelToolbarContent = (styled as any)(FlexRow)`
  flex: 1;
  align-items: flex-end;

  & > * {
    margin-left: 16px;
  }
`

/**
 * AssetsPanelToolbar used to create view elements for toolbar on asset penal.
 *
 * @author Robert Long
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
  )
}

/**
 * AssetsPanelColumn
 *
 * @author Robert Long
 * @type {Styled component}
 */
const AssetsPanelColumn = (styled as any)(FlexColumn)`
  max-width: 175px;
  border-right: 1px solid ${(props) => props.theme.border};
`

/**
 * AssetPanelContentContainer container element for asset panel.
 *
 * @author Robert Long
 * @type {Styled component}
 * */
export const AssetPanelContentContainer = (styled as any)(FlexRow)`
  flex: 1;
  overflow: hidden;
`

/**
 * AssetsPanel used to render view for AssetsPanel.
 *
 * @author Robert Long
 * @constructor
 */
export default function AssetsPanel() {
  //initializing sources
  const [sources, setSources] = useState(SourceManager.instance.sources)

  //initializing selectedSource as the first element of sources array
  const [selectedSource, setSelectedSource] = useState(sources.length > 0 ? sources[0] : null)
  const SourceComponent = selectedSource && selectedSource.component

  useEffect(() => {
    // function to set selected sources
    const onSetSource = (sourceId) => {
      setSelectedSource(sources.find((s) => s.id === sourceId))
    }

    //function to handle changes in authentication
    const onAuthChanged = () => {
      const nextSources = SourceManager.instance.sources
      setSources(nextSources)

      if (nextSources.indexOf(selectedSource) === -1) {
        setSelectedSource(nextSources.length > 0 ? nextSources[0] : null)
      }
    }

    // function to handle changes in authentication
    const onSettingsChanged = () => {
      const nextSources = SourceManager.instance.sources
      setSources(nextSources)
    }

    CommandManager.instance.addListener(EditorEvents.SETTINGS_CHANGED.toString(), onSettingsChanged)
    CommandManager.instance.addListener(EditorEvents.SOURCE_CHANGED.toString(), onSetSource)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.SOURCE_CHANGED.toString(), onSetSource)
      CommandManager.instance.removeListener(EditorEvents.SETTINGS_CHANGED.toString(), onSettingsChanged)
    }
  }, [setSelectedSource, sources, setSources, selectedSource])

  //initializing savedSourceState with empty object
  const [savedSourceState, setSavedSourceState] = useState({})

  //initializing setSavedState
  const setSavedState = useCallback(
    (state) => {
      setSavedSourceState({
        ...savedSourceState,
        [selectedSource.id]: state
      })
    },
    [selectedSource, setSavedSourceState, savedSourceState]
  )
  //initializing saved state on the bases of  selected source
  const savedState = savedSourceState[selectedSource.id] || {}

  //creating view for asset penal
  return (
    <AssetsPanelContainer id="assets-panel" className={styles.assetsPanel}>
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
      <FlexColumn flex>
        {SourceComponent && (
          <SourceComponent
            key={selectedSource.id}
            source={selectedSource}
            savedState={savedState}
            setSavedState={setSavedState}
          />
        )}
      </FlexColumn>
      <AssetDropZone />
    </AssetsPanelContainer>
  )
}
