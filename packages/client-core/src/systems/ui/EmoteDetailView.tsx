import { createState } from '@speigg/hookstate'
import React from 'react'

import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'

import { useEmoteMenuHooks } from '../../user/components/UserMenu/menus/EmoteMenu'

const styles = {
  actionImg: { opacity: '0.8', display: 'block', width: '100%' },
  container: {
    width: '500px',
    height: '500px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    border: 'solid 100px rgba(51, 51, 110, 0.5)',
    borderBottomColor: 'transparent',
    opacity: '0.9',
    position: 'relative',
    width: '361.4px',
    height: '361.4px',
    borderWidth: '70px'
  },
  itemContainerPrev: {
    width: '40px',
    height: '70px',
    position: 'absolute',
    left: '22px',
    top: '312px',
    backgroundColor: 'rgb(51, 51, 110, 0.5)',
    transform: 'rotate(45deg)',
    borderTopRightRadius: '50px',
    borderBottomRightRadius: '50px',
    opacity: '1'
  },
  iconBlockPrev: {
    position: 'relative',
    border: 'none',
    padding: '0',
    backgroundColor: 'transparent',
    top: '18px',
    right: '3px',
    transform: 'rotate(-50deg)'
  },
  arrowSvg: {
    position: 'relative',
    zIndex: '1',
    fontSize: '30px',
    userSelect: 'none',
    width: '1em',
    height: '1em',
    display: 'inline-block',
    fill: 'currentColor',
    flexShrink: '0'
  },
  itemContainerNext: {
    content: '',
    width: '40px',
    height: '70px',
    position: 'absolute',
    right: '22px',
    top: '312px',
    backgroundColor: 'rgb(51 51 110 / 50%)',
    transform: 'rotate(-225deg)',
    borderTopRightRadius: '50px',
    borderBottomRightRadius: '50px',
    opacity: '1'
  },
  iconBlockNext: {
    position: 'relative',
    border: 'none',
    padding: '0',
    top: '18px',
    right: '3px',
    backgroundColor: 'transparent',
    transform: 'rotate(-130deg)'
  },
  menuItem: {
    borderRadius: '50%',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    margin: '0',
    padding: '0',
    minWidth: '0',
    backgroundColor: 'transparent',
    border: 'none'
  }
}

export function createEmoteDetailView() {
  return createXRUI(EmoteDetailView, createEmoteDetailState())
}

function createEmoteDetailState() {
  return createState({})
}

const EmoteDetailView = () => {
  const { loadPreviousEmotes, menuItemRadius, renderEmoteList, page, imgPerPage, items, loadNextEmotes } =
    useEmoteMenuHooks({
      changeActiveMenu: () => null!
    })

  return (
    <section style={styles.container as {}} xr-layer="true">
      <div style={styles.itemContainer as {}}>
        <div style={styles.itemContainerPrev as {}}>
          <button
            type="button"
            style={
              {
                ...styles.iconBlockPrev,
                ...(page === 0 ? { color: '#c3c3c3', cursor: 'initial' } : { color: '#ffffff' })
              } as {}
            }
            onClick={loadPreviousEmotes}
          >
            <svg
              style={styles.arrowSvg as {}}
              focusable="false"
              aria-hidden="true"
              viewBox="0 0 24 24"
              data-testid="NavigateBeforeIcon"
            >
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
            </svg>
          </button>
        </div>

        <div
          style={{
            width: menuItemRadius,
            height: menuItemRadius,
            position: 'relative'
          }}
        >
          {renderEmoteList()}
        </div>
        <div style={styles.itemContainerNext as {}}>
          <button
            type="button"
            style={
              {
                ...styles.iconBlockNext,
                ...((page + 1) * imgPerPage >= items.length
                  ? { color: '#c3c3c3', cursor: 'initial' }
                  : { color: '#ffffff' })
              } as {}
            }
            onClick={loadNextEmotes}
          >
            <svg style={styles.arrowSvg as {}} focusable="false" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
