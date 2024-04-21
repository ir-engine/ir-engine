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

import { PlaylistComponent } from '@etherealengine/engine/src/scene/components/PlaylistComponent'
import { NO_PROXY, State, none } from '@etherealengine/hyperflux'
import DeleteIcon from '@mui/icons-material/Delete'
import VideocamIcon from '@mui/icons-material/Videocam'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import 'react-scrubber/lib/scrubber.css'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import { ControlledStringInput } from '../inputs/StringInput'
import { EditorComponentType, commitProperty } from './Util'

const PlayModeOptions = [
  {
    label: 'Single',
    value: PlayMode.single
  },
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

  const addTrack = () => {
    component.tracks.merge([
      {
        uuid: uuidv4(),
        src: ''
      }
    ])
  }

  const findTrack = (trackUUID: string) => {
    const track = component.tracks.get(NO_PROXY).find((track) => track.uuid === trackUUID)
    console.log('findTrack: ', trackUUID, track)
    // return {
    //   track,
    //   index: track ? component.tracks.get(NO_PROXY).indexOf(track) : -1
    // }

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
    }
  }

  const [, drop] = useDrop(() => ({ accept: ItemType.track }))

  console.log('component.tracks: ', component.get(NO_PROXY).tracks.length, component.get(NO_PROXY))

  return (
    <DndProvider backend={HTML5Backend}>
      <div ref={drop}>
        {component.tracks.length > 0 ? (
          <>
            {component.tracks.map((track, index) => {
              return <Track track={track} moveTrack={moveTrack} findTrack={findTrack} key={index} />
            })}
            <Button onClick={addTrack}>Add track</Button>
          </>
        ) : (
          <div>
            <div>
              <Button onClick={addTrack}>Add track</Button>
              <div>
                <label>{t('PlayMode')}</label>
                <SelectInput
                  options={PlayModeOptions}
                  value={component.playMode.value}
                  onChange={commitProperty(PlaylistComponent, 'playMode')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  )
}

const Track = ({
  track,
  moveTrack,
  findTrack
}: {
  track: State<Track>
  moveTrack: (trackUUID: string, atIndex: number) => void
  findTrack: (trackUUID: string) => {
    track: Track | undefined
    index: number
  }
}) => {
  const id = track.uuid.value
  const originalIndex = findTrack(id).index
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemType.track,
      item: { uuid: id, index: originalIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
      // end: (item, monitor) => {
      //   const { uuid: droppedId, index } = item
      //   const didDrop = monitor.didDrop()
      //   if (!didDrop) {
      //     moveTrack(droppedId, index)
      //   }
      // }
    }),
    []
  )

  const [, drop] = useDrop(
    () => ({
      accept: ItemType.track,
      hover({ uuid: draggedtrackUUID }: { uuid: string; index: number }) {
        if (draggedtrackUUID !== id) {
          console.log(draggedtrackUUID, 'is hovering over track: ', id)
          const { index: overIndex } = findTrack(id)
          moveTrack(draggedtrackUUID, overIndex)
        }
      }
    }),
    []
  )

  const opacity = isDragging ? 0 : 1

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{ cursor: 'move', backgroundColor: opacity === 1 ? 'transparent' : 'red' }}
    >
      <InputGroup name={`Track ${originalIndex}`}>
        <ControlledStringInput
          type="text"
          value={track.src.value}
          onRelease={(e) => {
            track.src.set(e)
          }}
        />
        <Button
          onClick={() => {
            track.set(none)
          }}
        >
          <DeleteIcon />
        </Button>
      </InputGroup>
    </div>
  )
}

PlaylistNodeEditor.iconComponent = VideocamIcon

export default PlaylistNodeEditor
