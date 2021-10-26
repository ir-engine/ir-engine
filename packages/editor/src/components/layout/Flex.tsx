import styled from 'styled-components'

function getFlex(props) {
  if (props.flex == null) {
    return 0
  } else if (typeof props.flex !== 'number') {
    return 1
  }

  return props.flex
}

function cssNumberProp(value) {
  return typeof value === 'number' ? value + 'px' : typeof value === 'string' ? value : 'auto'
}

/**
 *
 * @author Robert Long
 */
export const FlexColumn = (styled as any).div`
  display: flex;
  flex-direction: column;
  flex: ${getFlex};
  height: ${(props) => cssNumberProp(props.height)};
  width: ${(props) => cssNumberProp(props.width)};
`

/**
 *
 * @author Robert Long
 */
export const FlexRow = (styled as any).div`
  display: flex;
  flex: ${getFlex};
  height: ${(props) => cssNumberProp(props.height)};
  width: ${(props) => cssNumberProp(props.width)};
`

/**
 *
 * @author Robert Long
 */
export const VerticalScrollContainer = (styled as any)(FlexColumn)`
  min-height: 0;
`

/**
 *
 * @author Robert Long
 */
export const HorizontalScrollContainer = (styled as any)(FlexRow)`
  overflow-x: auto;
`

/**
 * AssetsPanelContainer used as container element for asset penal.
 *
 * @author Robert Long
 * @type {Styled component}
 */
export const AssetsPanelContainer = (styled as any)(FlexRow)`
 position: relative;
 flex: 1;
 background-color: ${(props) => props.theme.panel};
`
