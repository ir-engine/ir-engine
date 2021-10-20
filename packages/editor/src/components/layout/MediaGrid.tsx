import React from 'react'
import styled from 'styled-components'

/**
 *
 * @author Robert Long
 */
const MediaGridItemContainer = (styled as any).div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  outline: none;
  overflow: hidden;
  user-select: none;
  text-decoration: none;
  border-radius: ${(props) => props.borderRadius}px;
  background-color: ${(props) => props.theme.panel2};
  border: 2px solid ${(props) => (props.selected ? props.theme.selected : 'transparent')};
  cursor: pointer;

  ::before {
    content: "";
    display: inline-block;
    width: 1px;
    height: 0;
    padding-bottom: ${(props) => (1 / props.aspectRatio) * 100}%;
  }

  :hover,
  :focus {
    color: inherit;
    border-color: ${(props) => props.theme.blueHover};
  }

  :active {
    border-color: ${(props) => props.theme.selected};
  }
`

MediaGridItemContainer.defaultProps = {
  aspectRatio: 1,
  borderRadius: 6
}

/**
 *
 * @author Robert Long
 */
const MediaGridItemContent = (styled as any).div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`

/**
 *
 * @author Robert Long
 */
const MediaGridItemThumbnailImage = (styled as any).div`
  display: flex;
  flex: 1;
  background-size: cover;
  background-position: 50%;
  background-repeat: no-repeat;
`

/**
 *
 * @author Robert Long
 */
const MediaGridItemThumbnailVideo = (styled as any).video`
  display: flex;
  flex: 1;
`

/**
 *
 * @author Robert Long
 */
const MediaGridItemIconContainer = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px;
  text-align: center;
  overflow: hidden;

  div {
    margin-top: 8px;
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 100%;
  }
`

/**
 *
 * @author Robert Long
 */
const MediaGridItemLabelContainer = (styled as any).div`
  padding-top: 4px;
  display: flex;
  justify-content: center;
`

/**
 *
 * @author Robert Long
 */
const MediaGridItemLabel = (styled as any).div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

/**
 *
 * @author Robert Long
 * @param {any} label
 * @param {any} src
 * @param {any} rest
 * @returns
 */
export function VideoMediaGridItem({ label, src, ...rest }) {
  return (
    <>
      <MediaGridItemContainer {...rest}>
        <MediaGridItemContent>
          <MediaGridItemThumbnailVideo autoPlay muted src={src} />
        </MediaGridItemContent>
      </MediaGridItemContainer>
      <MediaGridItemLabelContainer>
        <MediaGridItemLabel>{label}</MediaGridItemLabel>
      </MediaGridItemLabelContainer>
    </>
  )
}

interface ImageMediaGridItemProp {
  label?: string
  src?: string
  onClick?: Function
}

/**
 *
 * @author Robert Long
 * @param {any} label
 * @param {any} src
 * @param {any} rest
 * @returns
 */
export function ImageMediaGridItem({ label, src, ...rest }: ImageMediaGridItemProp) {
  return (
    <>
      <MediaGridItemContainer {...rest}>
        <MediaGridItemContent>
          <MediaGridItemThumbnailImage style={{ backgroundImage: `url(${src})` }} />
        </MediaGridItemContent>
      </MediaGridItemContainer>
      <MediaGridItemLabelContainer>
        <MediaGridItemLabel>{label}</MediaGridItemLabel>
      </MediaGridItemLabelContainer>
    </>
  )
}

/**
 *
 * @author Robert Long
 * @param {any} label
 * @param {IconComponent} IconComponent
 * @param {any} rest
 * @returns
 */
export function IconMediaGridItem({ label, iconComponent: IconComponent, ...rest }) {
  return (
    <>
      <MediaGridItemContainer {...rest}>
        <MediaGridItemContent>
          <MediaGridItemIconContainer>
            <IconComponent size={48} />
          </MediaGridItemIconContainer>
        </MediaGridItemContent>
      </MediaGridItemContainer>
      <MediaGridItemLabelContainer>
        <MediaGridItemLabel>{label}</MediaGridItemLabel>
      </MediaGridItemLabelContainer>
    </>
  )
}

/**
 *
 *  @author Robert Long
 */
export const MediaGrid = (styled as any).div`
  display: grid;
  grid-gap: ${(props) => props.gap};
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(${(props) => props.minWidth}, 1fr));
  padding: ${(props) => props.gap};
`

MediaGrid.defaultProps = {
  gap: '20px',
  minWidth: '100px'
}
