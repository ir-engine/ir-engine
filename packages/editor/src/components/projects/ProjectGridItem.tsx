import React, { Component } from 'react'
import styled from 'styled-components'
import { showMenu } from '../layout/ContextMenu'
import { MenuButton } from '../inputs/Button'
import StylableContextMenuTrigger from './StylableContextMenuTrigger'
import { EllipsisV } from '@styled-icons/fa-solid/EllipsisV'

/**
 *
 * @author Robert Long
 * @param {any} project
 * @returns
 */
function collectMenuProps({ project }) {
  return { project }
}

/**
 *
 * @author Robert Long
 */
const StyledProjectGridItem = styled.div`
  display: flex;
  flex-direction: column;
  height: 220px;
  border-radius: 6px;
  background-color: ${(props) => props.theme.toolbar};
  text-decoration: none;
  border: 1px solid transparent;

  &:hover {
    color: inherit;
    border-color: ${(props) => props.theme.selected};
  }
`

/**
 *
 * @author Robert Long
 */
const StyledContextMenuTrigger = styled(StylableContextMenuTrigger)`
  display: flex;
  flex-direction: column;
  flex: 1;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
`

/**
 *
 * @author Robert Long
 */
const TitleContainer = styled.div`
  display: flex;
  height: 50px;
  align-items: center;
  padding: 0 16px;

  h3 {
    font-size: 16px;
  }

  button {
    margin-left: auto;

    svg {
      width: 1em;
      height: 1em;
    }
  }
`

/**
 *
 * @author Robert Long
 */
const ThumbnailContainer = styled.div`
  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  align-items: stretch;
  background-color: ${(props) => props.theme.panel};
  overflow: hidden;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
`

/**
 *
 * @author Robert Long
 */
const Thumbnail = styled.div<{ src: string }>`
  display: flex;
  flex: 1;
  background-size: cover;
  background-position: 50%;
  background-repeat: no-repeat;
  background-image: url(${(props) => props.src});
`

/**
 *
 * @author Robert Long
 */
const Col = styled.div`
  display: flex;
  flex-direction: column;

  p {
    color: ${(props) => props.theme.text2};
  }
`

/**
 *
 * @author Robert Long
 */
export const ProjectGridItem = ({ onClickExisting, contextMenuId, project }) => {
  const onShowMenu = (event) => {
    event.preventDefault()
    event.stopPropagation()

    const x = event.clientX || (event.touches && event.touches[0].pageX)
    const y = event.clientY || (event.touches && event.touches[0].pageY)
    showMenu({
      position: { x, y },
      target: event.currentTarget,
      id: contextMenuId,
      data: {
        project: project
      }
    })
  }

  const content = (
    <>
      <ThumbnailContainer>
        {(project.thumbnailUrl ?? project.thumbnail) && <Thumbnail src={project.thumbnailUrl ?? project.thumbnail} />}
      </ThumbnailContainer>
      <TitleContainer>
        <Col>
          <h3>{project.name}</h3>
        </Col>
        {contextMenuId && (
          <MenuButton onClick={onShowMenu}>
            <EllipsisV />
          </MenuButton>
        )}
      </TitleContainer>
    </>
  )

  if (contextMenuId) {
    return (
      <StyledProjectGridItem as="a" onClick={() => onClickExisting(project)}>
        <StyledContextMenuTrigger id={contextMenuId} project={project} collect={collectMenuProps} holdToDisplay={-1}>
          {content}
        </StyledContextMenuTrigger>
      </StyledProjectGridItem>
    )
  } else {
    return (
      <StyledProjectGridItem as="a" onClick={() => onClickExisting(project)}>
        {content}
      </StyledProjectGridItem>
    )
  }
}

export default ProjectGridItem
