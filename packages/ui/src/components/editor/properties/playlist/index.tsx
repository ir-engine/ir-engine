/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { PlayMode } from '@ir-engine/engine/src/scene/constants/PlayMode'

import { Entity } from '@ir-engine/ecs'
import { EditorComponentType, commitProperties, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import { PlaylistComponent } from '@ir-engine/engine/src/scene/components/PlaylistComponent'
import { NO_PROXY, State, none, usePrevious } from '@ir-engine/hyperflux'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { IoMdAdd, IoMdPause, IoMdPlay, IoMdSkipBackward, IoMdSkipForward } from 'react-icons/io'
import { MdDelete, MdDragIndicator } from 'react-icons/md'
import { RiPlayList2Fill } from 'react-icons/ri'
import 'react-scrubber/lib/scrubber.css'
import { v4 as uuidv4 } from 'uuid'

import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { Checkbox } from '@ir-engine/ui'
import Button from '../../../../primitives/tailwind/Button'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'
import { ControlledStringInput } from '../../input/String'

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
        tracks: component.tracks.value as Track[]
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
          tracks: component.tracks.value as Track[]
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
    <NodeEditor {...props} name="Playlist" Icon={PlaylistNodeEditor.iconComponent}>
      <DndProvider backend={HTML5Backend}>
        <div ref={drop} className="w-full pl-4 pr-2">
          <InputGroup name="Autoplay" label="Autoplay">
            <Checkbox onChange={commitProperty(PlaylistComponent, 'autoplay')} checked={component.autoplay.value} />
          </InputGroup>
          {component.tracks.length > 0 ? (
            <>
              {component.tracks.value.map((track, index) => {
                return (
                  <Track
                    entity={props.entity}
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
                            tracks: component.tracks.value as Track[]
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

              <div className="grid grid-cols-2 items-center gap-2">
                <div className="col-span-1 flex items-center justify-start">
                  <div
                    className="text-2xl text-white"
                    onClick={() => PlaylistComponent.playNextTrack(props.entity, -1)}
                  >
                    <IoMdSkipBackward />
                  </div>
                  <div className="text-2xl text-white" onClick={togglePause}>
                    {component.paused.value ? <IoMdPlay /> : <IoMdPause />}
                  </div>
                  <div className="text-2xl text-white" onClick={() => PlaylistComponent.playNextTrack(props.entity, 1)}>
                    <IoMdSkipForward />
                  </div>
                  <div className="text-2xl text-white" onClick={addTrack}>
                    <IoMdAdd />
                  </div>
                </div>

                <div className="col-span-2">
                  <SelectInput
                    options={PlayModeOptions}
                    value={component.playMode.value}
                    onChange={commitProperty(PlaylistComponent, 'playMode')}
                  />
                </div>
              </div>
            </>
          ) : (
            <Button size="small" variant="outline" className="w-full" onClick={addTrack}>
              Add track
            </Button>
          )}
        </div>
      </DndProvider>
    </NodeEditor>
  )
}

const Track = ({
  entity,
  track,
  active,
  playing,
  moveTrack,
  findTrack,
  onChange,
  togglePlay
}: {
  entity: Entity
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
    <div className="flex items-center justify-between gap-1" ref={(node) => connectDrop(previewRef(node))}>
      <ControlledStringInput
        type="text"
        value={track.src.value}
        onRelease={(e) => {
          if (e !== previousTrackSource) {
            track.src.set(e)
            onChange()
          }
        }}
      />
      <div ref={dragSourceRef} className="cursor-move text-2xl text-white">
        <MdDragIndicator />
      </div>
      <div className="text-xl text-white" onClick={togglePlay}>
        {playing ? <IoMdPause /> : <IoMdPlay />}
      </div>
      <div
        className="text-2xl text-white"
        onClick={() => {
          track.set(none)
          PlaylistComponent.playNextTrack(entity, 0)
        }}
      >
        <MdDelete />
      </div>
    </div>
  )
}

PlaylistNodeEditor.iconComponent = RiPlayList2Fill

export default PlaylistNodeEditor
