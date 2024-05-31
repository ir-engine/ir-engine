/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { PlayMode } from '@etherealengine/engine/src/scene/constants/PlayMode'

import { usePrevious } from '@etherealengine/common/src/utils/usePrevious'
import { PlaylistComponent } from '@etherealengine/engine/src/scene/components/PlaylistComponent'
import { NO_PROXY, State, none } from '@etherealengine/hyperflux'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import VideocamIcon from '@mui/icons-material/Videocam'
import IconButton from '@mui/material/IconButton'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import 'react-scrubber/lib/scrubber.css'
import { v4 as uuidv4 } from 'uuid'
import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import { ControlledStringInput } from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, commitProperties, commitProperty } from './Util'

const PlayModeOptions = [
  {
    label: 'Random',
    value: PlayMode.random
  },
  {
    label: 'Loop',
    value: PlayMode.loop
  },
  {
    label: 'SingleLoop',
    value: PlayMode.singleloop
  }
]

const ItemType = {
  track: 'track'
}

interface Track {
  uuid: string
  src: string
}

/**
 * VolumetricNodeEditor provides the editor view to customize properties.
 *
 * @param       {any} props
 * @constructor
 */
export const PlaylistNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const component = useComponent(props.entity, PlaylistComponent)
  // const currentTrackIndex = useHookstate(-1)

  const addTrack = () => {
    component.tracks.merge([
      {
        uuid: uuidv4(),
        src: ''
      }
    ])
    commitProperties(
      PlaylistComponent,
      {
        tracks: component.tracks.value
      },
      [props.entity]
    )
  }

  const findTrack = (trackUUID: string) => {
    for (let i = 0; i < component.tracks.length; i++) {
      if (component.tracks[i].uuid.value === trackUUID) {
        return {
          track: component.tracks[i].get(NO_PROXY),
          index: i
        }
      }
    }
    return {
      track: undefined,
      index: -1
    }
  }

  const moveTrack = (trackUUID: string, atIndex: number) => {
    const { track, index } = findTrack(trackUUID)
    if (track && index !== -1) {
      component.tracks.set((arr) => {
        arr.splice(index, 1)
        arr.splice(atIndex, 0, track)
        return arr
      })
      commitProperties(
        PlaylistComponent,
        {
          tracks: component.tracks.value
        },
        [props.entity]
      )
    }
  }

  const [, drop] = useDrop(() => ({ accept: ItemType.track }))

  const togglePause = () => {
    component.paused.set(!component.paused.value)
  }

  return (
    <NodeEditor {...props} name="Playlist">
      <DndProvider backend={HTML5Backend}>
        <div
          ref={drop}
          style={{
            width: '100%',
            paddingLeft: '20px',
            paddingRight: '10px'
          }}
        >
          <InputGroup name="Autoplay" label="Autoplay">
            <BooleanInput onChange={commitProperty(PlaylistComponent, 'autoplay')} value={component.autoplay.value} />
          </InputGroup>
          {component.tracks.length > 0 ? (
            <>
              {component.tracks.value.map((track, index) => {
                return (
                  <Track
                    track={component.tracks[index]}
                    moveTrack={moveTrack}
                    findTrack={findTrack}
                    key={track.uuid}
                    active={track.uuid === component.currentTrackUUID.value}
                    onChange={() => {
                      if (track.uuid === component.currentTrackUUID.value) {
                        const newUUID = uuidv4()
                        component.tracks[index].uuid.set(newUUID)
                        commitProperties(
                          PlaylistComponent,
                          {
                            tracks: component.tracks.value
                          },
                          [props.entity]
                        )
                        component.currentTrackUUID.set(newUUID)
                      }
                    }}
                    playing={track.uuid === component.currentTrackUUID.value && !component.paused.value}
                    togglePlay={() => {
                      if (track.uuid === component.currentTrackUUID.value) {
                        component.paused.set((p) => !p)
                      } else {
                        component.merge({
                          currentTrackUUID: track.uuid,
                          currentTrackIndex: index,
                          paused: false
                        })
                      }
                    }}
                  />
                )
              })}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    gridColumn: 'span 1 / span 1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'start'
                  }}
                >
                  <IconButton onClick={() => PlaylistComponent.playNextTrack(props.entity, -1)}>
                    <SkipPreviousIcon
                      style={{
                        color: 'white'
                      }}
                    />
                  </IconButton>
                  <IconButton onClick={togglePause}>
                    {component.paused.value ? (
                      <PlayArrowIcon
                        style={{
                          color: 'white'
                        }}
                      />
                    ) : (
                      <PauseIcon
                        style={{
                          color: 'white'
                        }}
                      />
                    )}
                  </IconButton>
                  <IconButton onClick={() => PlaylistComponent.playNextTrack(props.entity, 1)}>
                    <SkipNextIcon
                      style={{
                        color: 'white'
                      }}
                    />
                  </IconButton>
                  <IconButton onClick={addTrack}>
                    <AddIcon
                      style={{
                        color: 'white'
                      }}
                    />
                  </IconButton>
                </div>

                <div
                  style={{
                    gridColumn: 'span 2 / span 2'
                  }}
                >
                  <SelectInput
                    options={PlayModeOptions}
                    value={component.playMode.value}
                    onChange={commitProperty(PlaylistComponent, 'playMode')}
                  />
                </div>
              </div>
            </>
          ) : (
            <Button
              style={{
                width: '100%'
              }}
              onClick={addTrack}
            >
              Add track
            </Button>
          )}
        </div>
      </DndProvider>
    </NodeEditor>
  )
}

const Track = ({
  track,
  active,
  playing,
  moveTrack,
  findTrack,
  onChange,
  togglePlay
}: {
  track: State<Track>
  active: boolean
  playing: boolean
  moveTrack: (trackUUID: string, atIndex: number) => void
  findTrack: (trackUUID: string) => {
    track: Track | undefined
    index: number
  }
  onChange: () => void
  togglePlay: () => void
}) => {
  const originalIndex = findTrack(track.uuid.value).index
  const [{ opacity }, dragSourceRef, previewRef] = useDrag({
    type: ItemType.track,
    item: { uuid: track.uuid.value, index: originalIndex },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0 : 1
    })
  })

  const [, connectDrop] = useDrop({
    accept: ItemType.track,
    hover({ uuid: draggedtrackUUID }: { uuid: string; index: number }) {
      if (draggedtrackUUID !== track.uuid.value) {
        const { index: overIndex } = findTrack(track.uuid.value)
        moveTrack(draggedtrackUUID, overIndex)
      }
    }
  })

  const previousTrackSource = usePrevious(track.src)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',

        opacity
      }}
      ref={(node) => connectDrop(previewRef(node))}
    >
      <ControlledStringInput
        type="text"
        value={track.src.value}
        onRelease={(e) => {
          if (e !== previousTrackSource) {
            track.src.set(e)
            onChange()
          }
        }}
        style={{
          border: active ? '2px solid black' : ''
        }}
      />
      <IconButton
        ref={dragSourceRef}
        style={{
          cursor: 'move'
        }}
      >
        <DragIndicatorIcon
          style={{
            color: 'white'
          }}
        />
      </IconButton>
      <IconButton onClick={togglePlay}>
        {playing ? (
          <PauseIcon
            style={{
              color: 'white'
            }}
          />
        ) : (
          <PlayArrowIcon
            style={{
              color: 'white'
            }}
          />
        )}
      </IconButton>
      <IconButton
        onClick={() => {
          track.set(none)
        }}
      >
        <DeleteIcon
          style={{
            color: 'white'
          }}
        />
      </IconButton>
    </div>
  )
}

PlaylistNodeEditor.iconComponent = VideocamIcon

export default PlaylistNodeEditor
