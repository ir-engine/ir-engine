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

import { useHookstate } from '@ir-engine/hyperflux'
import { ArgTypes } from '@storybook/react'
import React, { ChangeEvent, useRef } from 'react'
import { FaBackwardStep, FaPause, FaPlay, FaUpload } from 'react-icons/fa6'
import Button from '../../../primitives/tailwind/Button'
import InputGroup from '../input/Group'
import Slider from '../Slider'
import AudioVolumeVisualizer, { AudioVolumeVisualizerProps } from './index'

const argTypes: ArgTypes = {
  min: {
    control: 'number'
  },
  max: {
    control: 'number'
  },
  step: {
    control: 'number'
  },
  startingValue: {
    control: 'number'
  },
  label: {
    control: 'text'
  }
}

export default {
  title: 'Components/Editor/AudioVolumeVisualizer',
  component: AudioVolumeVisualizer,
  parameters: {
    componentSubtitle: 'AudioVolumeVisualizer',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=3968-12405&node-type=frame&t=XAGvEGVnphLHTwP3-0'
    }
  },
  argTypes,
  args: {
    startingValue: 0,
    min: 0,
    max: 100,
    step: 1,
    label: 'Label'
  }
}

const AudioVolumeVisualizerRenderer = (args: AudioVolumeVisualizerProps & { startingValue: number }) => {
  // Initialize with a value of 0dB for volume (unity gain)
  const initialDbValue = 0
  const displayVolume = useHookstate(initialDbValue)
  // Convert dB to linear gain (0dB = gain 1.0)
  const initialGain = Math.pow(10, initialDbValue / 20) // = 1.0
  const visualizerVolume = useHookstate(initialGain)

  const audioElement = useHookstate<HTMLMediaElement | null>(null)
  const isPlaying = useHookstate(false)
  const audioSrc = useHookstate<string | null>(null)
  const currentTrackTime = useHookstate(0)
  const audioDuration = useHookstate(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleVolumeChange = (newDbValue: number) => {
    // Clamp dB value between -60 and +20
    const clampedDb = Math.max(-60, Math.min(20, newDbValue))
    displayVolume.set(Math.round(clampedDb))

    // Convert dB to linear gain
    const newGain = Math.pow(10, clampedDb / 20)
    visualizerVolume.set(newGain)

    if (audioElement.value) {
      // Ensure that the audio element volume is synchronized
      try {
        if (audioElement.value instanceof HTMLAudioElement) {
          audioElement.value.volume = Math.max(0, Math.min(1, newGain))
        }
      } catch (error) {
        console.error('Error setting audio volume:', error)
      }
    }

    console.log(`Volume changed: ${clampedDb} dB (gain: ${newGain.toFixed(4)})`)
  }

  // Registrar el volumen inicial para depuración
  console.log(`Initial volume: ${initialDbValue} dB (gain: ${initialGain.toFixed(4)})`)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      // Validate type and size (max 10MB)
      if (file.type.startsWith('audio/') && file.size > 0 && file.size <= 10 * 1024 * 1024) {
        // Stop current playback if any
        if (audioElement.value) {
          audioElement.value.pause()
          audioElement.value.remove() // Remove old audio element
          isPlaying.set(false)
        }

        // Create new audio element
        const audio = new Audio()
        let src: string
        try {
          src = URL.createObjectURL(file)
          audio.src = src
          audioSrc.set(src)
          audio.crossOrigin = 'anonymous'
          audioElement.set(audio)
        } catch (error) {
          console.error('Error creating object URL for file:', error)
          alert('Failed to load the audio file. Please try again.')
          return
        }

        // Set initial volume (0dB = gain 1.0)
        try {
          audio.volume = Math.max(0, Math.min(1, visualizerVolume.value))
          console.log(
            'Set initial audio volume: gain =',
            visualizerVolume.value.toFixed(2),
            'dB =',
            displayVolume.value
          )

          // Get duration when metadata is loaded
          audio.addEventListener('loadedmetadata', () => {
            audioDuration.set(audio.duration)
            console.log('Audio duration:', audio.duration)
          })
        } catch (error) {
          console.error('Error setting initial audio volume:', error)
        }

        console.log('Audio element created:', file.name)
      } else {
        // Provide more specific error message based on validation failure
        if (!file.type.startsWith('audio/')) {
          alert('Please select a valid audio file. Supported formats include MP3, WAV, OGG, etc.')
        } else if (file.size <= 0) {
          alert('The selected file appears to be empty. Please select a valid audio file.')
        } else if (file.size > 10 * 1024 * 1024) {
          alert('The selected file exceeds the maximum size limit of 10MB. Please select a smaller file.')
        } else {
          alert('Please select a valid audio file.')
        }
      }
    }
  }

  const resetAudio = () => {
    if (!audioElement.value) return

    try {
      // Update both the audio element and our state
      if (audioElement.value instanceof HTMLAudioElement) {
        audioElement.value.currentTime = 0
        currentTrackTime.set(0)
      }

      if (!isPlaying.value) {
        audioElement.value
          .play()
          .then(() => {
            isPlaying.set(true)
          })
          .catch((error) => {
            console.error('Error playing audio:', error)
          })
      }
    } catch (error) {
      console.error('Error resetting audio:', error)
    }
  }

  // Handle time update from the slider
  const handleTimeChange = (newTime: number) => {
    if (!audioElement.value) return

    try {
      // Update both the audio element and our state
      if (audioElement.value instanceof HTMLAudioElement) {
        audioElement.value.currentTime = newTime
        currentTrackTime.set(newTime)
      }
    } catch (error) {
      console.error('Error setting audio time:', error)
    }
  }

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const togglePlayback = () => {
    if (!audioElement) return

    console.log('Toggle playback. Current state:', isPlaying)

    if (isPlaying.value) {
      audioElement.value?.pause()
      isPlaying.set(false)
    } else {
      // Play the audio and handle errors
      audioElement.value
        ?.play()
        .then(() => {
          console.log('Audio playing successfully')
          isPlaying.set(true)
        })
        .catch((error) => {
          console.error('Error playing audio:', error)
          alert('Could not play audio. Error: ' + error.message)
        })
    }
  }

  return (
    <InputGroup name="Volume" label={'Volume'} info={'Volume'}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/mp3,audio/*" className="hidden" />
      <Button onClick={triggerFileInput} size="sm" className="mb-1 flex items-center gap-2">
        <FaUpload size={16} />
        <span>Load MP3</span>
      </Button>
      {audioElement.value && (
        <div className="flex items-center gap-4">
          <Button size="sm" onClick={resetAudio} className="rounded-full" disabled={!audioElement.value}>
            <FaBackwardStep className="h-4 w-4" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={togglePlayback}
            className="rounded-full"
            disabled={!audioElement.value}
          >
            {isPlaying.value ? <FaPause className="h-4 w-4" /> : <FaPlay className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Time control */}
      {audioElement.value && audioDuration.value > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs">{formatTime(currentTrackTime.value)}</span>
          <Slider
            value={currentTrackTime.value}
            max={audioDuration.value}
            min={0}
            step={0.1}
            onChange={handleTimeChange}
            className="flex-1"
            aria-label="Track Position"
          />
          <span className="text-xs">{formatTime(audioDuration.value)}</span>
        </div>
      )}
      <AudioVolumeVisualizer
        audioSrc={audioSrc.value}
        value={visualizerVolume.value}
        onChange={handleVolumeChange}
        isPlaying={isPlaying.value}
        currentTrackTime={currentTrackTime.value}
        scaleSettings={{
          transitionPoint: 0,
          lowerRangePortion: 0.4
        }}
        showCurrentTime={true}
        className={audioElement.value ? 'my-4' : 'mb-0 h-0 overflow-hidden'}
      />
      <div className="mb-4 flex">
        <Slider
          value={displayVolume.value}
          units="dB"
          max={20}
          min={-60}
          step={1}
          onChange={handleVolumeChange}
          className="flex-1"
          aria-label="Volume"
        />
      </div>
    </InputGroup>
  )
}

export const Default = {
  name: 'Default',
  render: AudioVolumeVisualizerRenderer
}
