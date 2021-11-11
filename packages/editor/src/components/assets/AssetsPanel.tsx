import React from 'react'
import styled from 'styled-components'
import { FlexColumn, FlexRow } from '../layout/Flex'
import AssetDropZone from './AssetDropZone'
import styles from './styles.module.scss'
import NodesListPanel from './NodesListPanel'

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
 * AssetPanelContentContainer container element for asset panel.
 *
 * @author Robert Long
 * @type {Styled component}
 * */
export const AssetPanelContentContainer = (styled as any)(FlexRow)`
  flex: 1;
  overflow: auto;
`

/**
 * AssetsPanel used to render view for AssetsPanel.
 *
 * @author Robert Long
 * @constructor
 */
export default function AssetsPanel() {
  return (
    <AssetsPanelContainer id="assets-panel" className={styles.assetsPanel}>
      <NodesListPanel />
      <AssetDropZone />
    </AssetsPanelContainer>
  )
}
