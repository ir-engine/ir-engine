import React, { useCallback, useState, useRef, useContext, useEffect } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { FlexColumn, FlexRow } from '../layout/Flex'
import { useSelectionHandler } from './useSelection'
import { CaretRight } from '@styled-icons/fa-solid/CaretRight'
import { CaretDown } from '@styled-icons/fa-solid/CaretDown'

/**
 * StyledTagList used to provide styles for tag list.
 *
 * @author Robert Long
 * @type {styled component}
 */
const StyledTagList = (styled as any)(FlexColumn)`
  height: auto;
  min-height: 100%;
  min-width: 175px;
  border-right: 1px solid ${(props) => props.theme.panel};
`

/**
 * TagListHeader used to provide styles for tag list header.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const TagListHeader = (styled as any)(FlexRow)`
  color: ${(props) => props.theme.text2};
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
  min-height: 24px;
  background-color: ${(props) => props.theme.panel2};
  border-bottom: 1px solid ${(props) => props.theme.panel};
`

/**
 * TagListContainer used as container element for tag list.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const TagListContainer = (styled as any).div`
  height: 100%;
  overflow-y: scroll;
  overflow-x: auto;
`
/**
 * TagListToggle styled componet used to create view for toggle list.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const TagListToggle = (styled as any).div`
  padding: 2px 2px;
  margin: 0 2px;

  :hover {
    color: ${(props) => props.theme.text};
    background-color: ${(props) => props.theme.hover2};
    border-radius: 3px;
  }
`

/**
 * TagContent used to provide styles to tag content.
 *
 * @author Robert Long
 * @type {styled component}
 */
const TagContent = (styled as any).div`
  display: flex;
  align-items: center;
  min-height: 24px;

  padding-left: ${(props) => props.depth * 20}px;

  color: ${(props) => props.theme.text};

  background-color: ${(props) => (props.selected ? props.theme.selected : 'transparent')};

  :hover,
  :focus {
    background-color: ${(props) => (props.selected ? props.theme.blueHover : props.theme.hover)};
    color: ${(props) => props.theme.text};
  }

  :active {
    background-color: ${(props) => props.theme.bluePressed};
    color: ${(props) => props.theme.text};
  }
`

/**
 * TreeListItem used to provide styles for list.
 *
 * @author Robert Long
 * @type {styled component}
 */
export const TreeListItem = (styled as any).li`
  display: flex;
  flex-direction: column;
  outline: none;
  overflow: hidden;
  user-select: none;
  min-height: 24px;
  white-space: nowrap;
`

/**
 * TagChildrenList used to provides styles for tag child list.
 *
 * @author Robert Long
 * @type {styled component}
 */
const TagChildrenList = (styled as any).ul`
  width: max-content;
  min-width: 100%;
`

/**
 * TreeLeafSpacer used to provide styles for leaf spacer.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const TreeLeafSpacer = (styled as any).div`
  width: 16px;
`

interface TagListItemProp {
  tag?: any
  depth?: any
  onClick?: Function
  expanded?: any
  onToggleExpanded?: Function
  selectedTags?: any
}

/**
 * TagListItem used to render tag list item.
 *
 * @author Robert Long
 * @param       {object} tag
 * @param       {number} depth
 * @param       {function} onClick
 * @param       {object} expanded
 * @param       {function} onToggleExpanded
 * @param       {array} selectedTags
 * @param       {any} rest
 * @constructor
 */
function TagListItem({ tag, depth, onClick, expanded, onToggleExpanded, selectedTags, ...rest }: TagListItemProp) {
  const onClickItem = useCallback(
    (e) => {
      e.stopPropagation()

      if (tag.disabled) {
        return
      }

      onClick(tag, e)
    },
    [onClick, tag]
  )

  /**
   * callback function to handle toggle on tag items
   */
  const onClickToggle = useCallback(
    (e) => {
      e.stopPropagation()
      onToggleExpanded(tag)
    },
    [onToggleExpanded, tag]
  )

  const selected = selectedTags.indexOf(tag) !== -1 || (selectedTags.length === 0 && tag.value === 'All')
  const isExpanded = expanded[tag.value]

  /**
   * retrun TreeListItem view
   */
  return (
    <TreeListItem selected={selected} {...rest}>
      <TagContent depth={depth} selected={selected} onClick={onClickItem}>
        {tag.children ? (
          <TagListToggle onClick={onClickToggle}>
            {isExpanded ? <CaretDown size={12} /> : <CaretRight size={12} />}
          </TagListToggle>
        ) : (
          <TreeLeafSpacer />
        )}
        {tag.label}
      </TagContent>
      {tag.children && isExpanded && (
        <TagChildrenList>
          {tag.children.map((child) => (
            <TagListItem
              key={child.value}
              tag={child}
              onClick={onClick}
              depth={depth + 1}
              expanded={expanded}
              selectedTags={selectedTags}
              onToggleExpanded={onToggleExpanded}
              {...rest}
            />
          ))}
        </TagChildrenList>
      )}
    </TreeListItem>
  )
}

TagListItem.defaultProps = {
  depth: 0
}

/**
 * define and export TagList component
 * @param       {array} tags
 * @param       {array} selectedTags
 * @param       {function} onChange
 * @param       {boolean} multiselect
 * @param       {object} initialExpandedTags
 * @param       {function} onChangeExpandedTags
 * @constructor
 */
export function TagList({ tags, selectedTags, onChange, multiselect, initialExpandedTags, onChangeExpandedTags }) {
  const theme = useContext(ThemeContext)
  const tagListContainerRef = useRef()
  const [onSelect, clearSelection] = useSelectionHandler(tags, selectedTags, onChange, multiselect)
  const [expanded, setExpanded] = useState(initialExpandedTags || {})
  const onToggleExpanded = useCallback(
    (tag) => {
      const nextExpanded = {
        ...expanded,
        [tag.value]: !expanded[tag.value]
      }

      setExpanded(nextExpanded)
      onChangeExpandedTags(nextExpanded)
    },
    [expanded, setExpanded, onChangeExpandedTags]
  )

  useEffect(() => {
    ;(tagListContainerRef as any).current.querySelectorAll('li').forEach((el, index) => {
      el.style.backgroundColor = index % 2 === 0 ? theme.panel : theme.panel2
    })
  }, [tagListContainerRef, theme, expanded, tags])

  /**
   * retrun view for TagList
   */
  return (
    <StyledTagList>
      <TagListHeader>Tags</TagListHeader>
      <TagListContainer ref={tagListContainerRef}>
        <TagChildrenList>
          <TagListItem
            key="All"
            onClick={clearSelection}
            onToggleExpanded={onToggleExpanded}
            expanded={expanded}
            selectedTags={selectedTags}
            tag={{ label: 'All', value: 'All' }}
          />
          {tags.map((tag) => (
            <TagListItem
              key={tag.value}
              onClick={onSelect}
              onToggleExpanded={onToggleExpanded}
              expanded={expanded}
              selectedTags={selectedTags}
              tag={tag}
            />
          ))}
        </TagChildrenList>
      </TagListContainer>
    </StyledTagList>
  )
}
TagList.defaultProps = {
  tags: [],
  selectedTags: [],
  onSelect: () => {},
  initialExpandedTags: {},
  onChangeExpandedTags: () => {}
}
export default TagList
