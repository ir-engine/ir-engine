/*
CPAL-1.0 License
±
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
import React, { useEffect, useRef, type MouseEvent } from 'react'
import { twMerge } from 'tailwind-merge'

export interface AudioVolumeVisualizerProps {
  audioSrc?: string | null
  value: number
  className?: string
  onChange?: (volume: number) => void
  isPlaying?: boolean
  currentTrackTime?: number
  scaleSettings?: {
    transitionPoint: number
    lowerRangePortion: number
  }
  showCurrentTime?: boolean
}

function AudioVolumeVisualizer({
  audioSrc,
  value,
  className,
  onChange,
  isPlaying: externalIsPlaying,
  currentTrackTime,
  scaleSettings,
  showCurrentTime = false
}: AudioVolumeVisualizerProps) {
  const volume = useHookstate(value)
  const audioData = useHookstate<number[]>([])
  const dbLevels = useHookstate<number[]>([])
  const peakLevel = useHookstate(-100)
  const isInternalPlaying = useHookstate(false)
  const isDragging = useHookstate(false)
  const currentTime = useHookstate(0)
  const duration = useHookstate(0)
  // Default scale configuration
  const defaultTransitionPoint = 10
  const defaultLowerRangePortion = 0.8
  const transitionPoint = scaleSettings?.transitionPoint ?? defaultTransitionPoint
  const lowerRangePortion = scaleSettings?.lowerRangePortion ?? defaultLowerRangePortion
  const upperRangePortion = 1 - lowerRangePortion

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const dragStartYRef = useRef<number>(0)
  const dragStartVolumeRef = useRef<number>(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const peakLevelTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null) // Add this line

  const debouncedLevel = useHookstate('-∞')
  const levelUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  const audio = useHookstate<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioSrc) {
      const newAudio = new Audio()
      newAudio.src = audioSrc
      newAudio.crossOrigin = 'anonymous'
      audio.set(newAudio)
    }
  }, [audioSrc])

  useEffect(() => {
    // Clear any existing interval
    if (levelUpdateTimeoutRef.current) {
      clearInterval(levelUpdateTimeoutRef.current)
    }

    // Set up a new interval that runs every 3 seconds
    levelUpdateTimeoutRef.current = setInterval(() => {
      debouncedLevel.set(getCurrentDecibelLevel())
    }, 3000)

    // Cleanup function to clear the interval when component unmounts or dependencies change
    return () => {
      if (levelUpdateTimeoutRef.current) {
        clearInterval(levelUpdateTimeoutRef.current)
      }
    }
  }, []) // Empty dependency array since we want it to run only on mount

  // Update internal volume when external value changes
  useEffect(() => {
    volume.set(value)

    if (!gainNodeRef.current) return

    // Convert linear volume to dB, allowing for the full range
    const dbValue = value <= 0 ? -60 : Math.min(20, 20 * Math.log10(value))
    const gainValue = dbValue <= -60 ? 0 : Math.pow(10, dbValue / 20)

    // Apply the gain value
    gainNodeRef.current.gain.setValueAtTime(gainValue, audioContextRef.current?.currentTime || 0)

    // Notify parent of dB value change
    if (onChange) {
      onChange(dbValue)
    }
  }, [value])

  // Synchronize external playback state
  useEffect(() => {
    if (!audio.value) return

    if (externalIsPlaying !== undefined) {
      if (externalIsPlaying && audio.value.paused) {
        console.log('External play command received')
        audio.value
          .play()
          .then(() => {
            isInternalPlaying.set(true)
            console.log('Audio playback started successfully')
          })
          .catch((err) => console.error('Error playing audio:', err))
      } else if (!externalIsPlaying && !audio.value.paused) {
        console.log('External pause command received')
        audio.value.pause()
        isInternalPlaying.set(false)
      }
    }
  }, [externalIsPlaying])

  useEffect(() => {
    if (!audio.value) return

    // Generate random data as initial fallback
    const generateRandomData = () => {
      const fakeData = Array(150)
        .fill(0)
        .map(() => Math.random() * 0.8 + 0.2)
      audioData.set(fakeData)

      // Generate random dB levels
      const fakeDbLevels = fakeData.map((value) => {
        // Convert normalized value (0-1) to dB (-60 to +20)
        return 20 * Math.log10(value) * 2
      })
      dbLevels.set(fakeDbLevels)
    }

    generateRandomData()

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const audioContext = audioContextRef.current

      // Create gain node if it doesn't exist
      if (!gainNodeRef.current) {
        gainNodeRef.current = audioContext.createGain()
      }

      // Create analyzer if it doesn't exist
      if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser()
        // Configure analyzer for better precision
        analyserRef.current.fftSize = 2048
        analyserRef.current.smoothingTimeConstant = 0.7 // Increase smoothing for better visualization
        analyserRef.current.minDecibels = -80 // Extend minimum range to capture more low-level signals
        analyserRef.current.maxDecibels = 20
      }

      // Connect audio to analyzer
      const connectAudio = () => {
        try {
          // Disconnect existing connections
          if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect()
          }
          if (analyserRef.current) {
            analyserRef.current.disconnect()
          }
          // Create source node only if it doesn't exist
          if (!sourceNodeRef.current || sourceNodeRef.current.mediaElement !== audio.value) {
            sourceNodeRef.current = audioContext.createMediaElementSource(audio.value! as HTMLMediaElement)
          }

          // Create gain node if it doesn't exist
          if (!gainNodeRef.current) {
            gainNodeRef.current = audioContext.createGain()
          }
          // Make new connections
          sourceNodeRef.current.connect(gainNodeRef.current!)
          gainNodeRef.current!.connect(analyserRef.current!)
          analyserRef.current!.connect(audioContextRef.current!.destination)

          // Set initial gain from volume value
          const dbValue = value <= 0 ? -60 : Math.min(20, 20 * Math.log10(value))
          // When dB is -60 or less, set gain to exactly 0 to ensure silence
          const gainValue = dbValue <= -60 ? 0 : Math.pow(10, dbValue / 20)
          gainNodeRef.current!.gain.value = gainValue
          console.log('Audio chain connected with gain:', gainValue, 'dB:', dbValue)
          console.log('Audio successfully connected to analyzer')
        } catch (error) {
          console.error('Error connecting audio to analyzer:', error)
        }
      }

      // Wait for audio to be ready
      const handleCanPlay = () => {
        connectAudio()

        // Set duration
        duration.set(audio.value?.duration || 0)
        console.log('Audio duration:', audio.value?.duration)
      }

      audio.value.addEventListener('canplay', handleCanPlay)

      // If already in "can play" state, connect immediately
      if (audio.value.readyState >= 2) {
        handleCanPlay()
      }

      return () => {
        audio.value?.removeEventListener('canplay', handleCanPlay)
      }
    } catch (error) {
      console.error('Error initializing audio context:', error)
      generateRandomData()
    }
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect()
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect()
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect()
      }
    }
  }, [audio.value])

  // Update audio context effect to use external audio element
  useEffect(() => {
    if (!audio.value) return

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const audioContext = audioContextRef.current

      // Disconnect existing connections first
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect()
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect()
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect()
      }

      // Create analyzer if it doesn't exist
      if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser()
        analyserRef.current.fftSize = 2048
        analyserRef.current.smoothingTimeConstant = 0.7 // Increase smoothing for better visualization
        analyserRef.current.minDecibels = -80 // Extend minimum range to capture more low-level signals
        analyserRef.current.maxDecibels = 20
      }

      // Only create new source node if it doesn't exist or if the audio element changed
      if (!sourceNodeRef.current || sourceNodeRef.current.mediaElement !== audio.value) {
        try {
          sourceNodeRef.current = audioContext.createMediaElementSource(audio.value as HTMLMediaElement)
        } catch (error) {
          console.warn('Audio element already connected, skipping source creation')
          return
        }
      }

      // Create gain node if it doesn't exist
      if (!gainNodeRef.current) {
        gainNodeRef.current = audioContext.createGain()
      }

      // Connect nodes
      sourceNodeRef.current.connect(analyserRef.current)
      analyserRef.current.connect(gainNodeRef.current)
      gainNodeRef.current.connect(audioContext.destination)

      console.log('Audio successfully connected to analyzer')
    } catch (error) {
      console.error('Error initializing audio context:', error)
    }

    return () => {
      // Cleanup connections
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect()
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect()
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect()
      }
    }
  }, [audio.value])

  // Update audio data during playback
  useEffect(() => {
    if (!analyserRef.current || !audio.value) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount

    // Use Float32Array for frequency data in decibels
    const dataArray = new Float32Array(bufferLength)
    // Array for normalized data (0-1)
    const normalizedArray = new Uint8Array(bufferLength)

    const updateAudioData = () => {
      if (!audio.value || audio.value.paused) {
        animationRef.current = requestAnimationFrame(updateAudioData)
        return
      }

      // Get frequency data in decibels (-80 to +20 dB)
      analyser.getFloatFrequencyData(dataArray)
      // Get normalized data for visualization
      analyser.getByteFrequencyData(normalizedArray)

      // Process data for visualization
      const samples = Array.from(normalizedArray)
        .slice(0, 150)
        .map((val) => val / 255)

      // Process decibel data - Amplify values to use the full range
      const dbSamples = Array.from(dataArray)
        .slice(0, 150)
        .map((db) => {
          const amplifiedDb = db + 20 // Amplify by 20dB
          return Math.max(-60, Math.min(20, amplifiedDb))
        })

      // Calculate current peak level
      const currentPeak = Math.max(...dbSamples)
      if (currentPeak > peakLevel.value) {
        peakLevel.set(currentPeak)

        if (peakLevelTimeoutRef.current) {
          clearTimeout(peakLevelTimeoutRef.current)
        }

        peakLevelTimeoutRef.current = setTimeout(() => {
          peakLevel.set(-100)
        }, 2000)
      }

      audioData.set(samples)
      dbLevels.set(dbSamples)

      animationRef.current = requestAnimationFrame(updateAudioData)
    }

    updateAudioData()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (peakLevelTimeoutRef.current) {
        clearTimeout(peakLevelTimeoutRef.current)
      }
    }
  }, [audio.value])

  // Update time tracking
  useEffect(() => {
    if (!audio.value) return

    const updateTime = () => {
      currentTime.set(audio.value?.currentTime as number)
      duration.set(audio.value?.duration || 0)
    }

    audio.value.addEventListener('timeupdate', updateTime)
    audio.value.addEventListener('durationchange', updateTime)

    return () => {
      audio.value?.removeEventListener('timeupdate', updateTime)
      audio.value?.removeEventListener('durationchange', updateTime)
    }
  }, [audio.value])

  // Handle external currentTrackTime updates
  useEffect(() => {
    if (!audio.value || currentTrackTime === undefined) return

    try {
      // Only update if the difference is significant (more than 0.5 seconds)
      if (Math.abs(audio.value.currentTime - currentTrackTime) > 0.5) {
        console.log('Updating track time from external source:', currentTrackTime)

        // Use the HTMLAudioElement method to set the current time
        if (audio.value instanceof HTMLAudioElement) {
          audio.value.currentTime = currentTrackTime
          currentTime.set(currentTrackTime)
        }
      }
    } catch (error) {
      console.error('Error updating audio current time:', error)
    }
  }, [currentTrackTime])

  // Handle playback and time updates
  useEffect(() => {
    if (!audio.value) return

    // Function to update current time
    const updateTime = () => {
      currentTime.set(audio.value?.currentTime || 0)
    }

    // Update time every 100ms during playback
    const timeInterval = setInterval(() => {
      if (!audio.value?.paused) {
        updateTime()
      }
    }, 100)

    const handlePlay = () => {
      console.log('Audio play event triggered')
      isInternalPlaying.set(true)
      updateTime()
    }

    const handlePause = () => {
      console.log('Audio pause event triggered')
      isInternalPlaying.set(false)
    }

    const handleEnded = () => {
      console.log('Audio ended event triggered')
      isInternalPlaying.set(false)
      currentTime.set(0)
    }

    const handleTimeUpdate = () => {
      updateTime()
    }

    const handleDurationChange = () => {
      duration.set(audio.value?.duration || 0)
      console.log('Duration changed:', audio.value?.duration)
    }

    audio.value.addEventListener('play', handlePlay)
    audio.value.addEventListener('pause', handlePause)
    audio.value.addEventListener('ended', handleEnded)
    audio.value.addEventListener('timeupdate', handleTimeUpdate)
    audio.value.addEventListener('durationchange', handleDurationChange)

    return () => {
      clearInterval(timeInterval)
      audio.value?.removeEventListener('play', handlePlay)
      audio.value?.removeEventListener('pause', handlePause)
      audio.value?.removeEventListener('ended', handleEnded)
      audio.value?.removeEventListener('timeupdate', handleTimeUpdate)
      audio.value?.removeEventListener('durationchange', handleDurationChange)
    }
  }, [])

  // Function to map dB to Y position with non-linear scale
  const mapDbToY = (db: number, rect: DOMRect, maxBarHeight: number, volumeHeight: number): number => {
    // Scale limits
    const minDb = -60
    const midDb = transitionPoint // Configurable transition point (now 0dB)
    const maxDb = 20 // Changed from 0 to 20

    let normalizedHeight = 0

    if (db <= midDb) {
      // Linear scale for -60dB to transitionPoint (using lowerRangePortion of space)
      normalizedHeight = ((Math.max(minDb, db) - minDb) / (midDb - minDb)) * lowerRangePortion
    } else {
      // Linear scale for transitionPoint to +20dB (using upperRangePortion of space)
      normalizedHeight = lowerRangePortion + ((Math.min(maxDb, db) - midDb) / (maxDb - midDb)) * upperRangePortion
    }

    // Calculate Y position (from bottom)
    return rect.height - normalizedHeight * maxBarHeight - volumeHeight - 2
  }

  // Draw visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || audioData.value.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, rect.width, rect.height)

    const barWidth = rect.width / audioData.value.length
    const barSpacing = 1
    const maxBarHeight = rect.height * 0.8

    // Define volume indicator height at the beginning
    const volumeHeight = 5

    // Draw timeline
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Generate reference lines based on transition point
    const generateReferenceLines = () => {
      const lines: any = []

      // Always add -60dB, 0dB and +20dB
      lines.push(-60, 0, 20)

      // Add transition point
      lines.push(transitionPoint)

      // Add lines for lower part (between -60dB and transition point)
      const lowerStep = (transitionPoint + 60) / 4
      for (let db = -60 + lowerStep; db < transitionPoint; db += lowerStep) {
        lines.push(Math.round(db))
      }

      // Add lines for upper part (between transition point and +20dB)
      // Use more lines in the upper range for better visualization
      const upperStep = (20 - transitionPoint) / 4
      for (let db = transitionPoint + upperStep; db < 20; db += upperStep) {
        lines.push(Math.round(db))
      }

      return [...new Set(lines)].sort((a: number, b: number) => a - b)
    }

    // Draw reference lines for decibel levels
    const dbReferenceLines = generateReferenceLines()
    dbReferenceLines.forEach((db: number) => {
      // Calculate Y position using non-linear mapping function
      const y = mapDbToY(db, rect, maxBarHeight, volumeHeight)

      // Highlight transition point
      const isTransitionPoint = db === transitionPoint

      ctx.strokeStyle = isTransitionPoint ? '#ffffff40' : '#ffffff20'
      ctx.lineWidth = isTransitionPoint ? 1.5 : 1
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()

      // Add dB label
      ctx.fillStyle = isTransitionPoint ? '#ffffff' : '#ffffff90'

      // Adjust font size based on dB value to prevent overlapping
      // Use smaller font for values above -40dB where labels tend to overlap
      let fontSize = 10
      if (db > -40) {
        // Gradually decrease font size as dB increases
        fontSize = Math.max(7, 10 - Math.floor((db + 40) / 10))
      }

      ctx.font = isTransitionPoint ? `bold 12px sans-serif` : `${fontSize}px sans-serif`

      // Position the dB labels on the right side instead of the left
      ctx.textAlign = 'right'
      ctx.fillText(`${db} dB`, rect.width - 5, y - 2)
    })

    // Draw decibel level bars from bottom to top
    audioData.value.forEach((_, index) => {
      // Get real dB value for this frequency
      const dbValue = dbLevels.value[index] || -100

      // Calculate bar height using non-linear mapping function
      const y = mapDbToY(dbValue, rect, maxBarHeight, volumeHeight)

      // Calculate actual bar height
      const barBottom = rect.height - volumeHeight - 2
      const height = barBottom - y

      const x = index * barWidth

      // Colors based on dB level
      let hue = 120 // Green
      if (dbValue > -10) {
        hue = 0 // Red for high levels (> -10dB)
      } else if (dbValue > -20) {
        hue = 60 // Yellow for medium levels (between -20dB and -10dB)
      } else if (dbValue > transitionPoint) {
        hue = 90 // Yellow-green for levels between transitionPoint and -20dB
      }

      const saturation = 80
      const lightness = 50

      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`
      ctx.fillRect(x, y, barWidth - barSpacing, height)
    })

    // Draw peak level line
    if (peakLevel.value > -100) {
      // Calculate Y position of peak using the mapping function
      const peakY = mapDbToY(peakLevel.value, rect, maxBarHeight, volumeHeight)

      ctx.strokeStyle = '#ff0000'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, peakY)
      ctx.lineTo(rect.width, peakY)
      ctx.stroke()

      // Add dB label
      ctx.fillStyle = '#ff0000'

      // Adjust font size for peak label based on dB value
      let peakFontSize = 10
      if (peakLevel.value > -40) {
        // Gradually decrease font size as dB increases
        peakFontSize = Math.max(7, 10 - Math.floor((peakLevel.value + 40) / 10))
      }

      ctx.font = `${peakFontSize}px sans-serif`
      // Keep text alignment right for peak label
      ctx.fillText(`Peak: ${peakLevel.value.toFixed(1)} dB`, rect.width - 5, peakY - 5)
    }

    // Draw current time indicator
    if (duration.value > 0) {
      const timePosition = (currentTime.value / duration.value) * rect.width
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(timePosition, 0, 2, rect.height)
    }

    // Draw volume indicator
    ctx.fillStyle = '#4a4a6a'
    ctx.fillRect(0, rect.height - volumeHeight, rect.width, volumeHeight)
    ctx.fillStyle = '#38b2ff'

    // Calculate normalized volume for visualization (0 to 1 range, where 1 represents +20dB)
    const normalizedVolume = Math.min(1, (20 * Math.log10(value) + 60) / 80)
    ctx.fillRect(0, rect.height - volumeHeight, rect.width * normalizedVolume, volumeHeight)

    // Reset text alignment to default for future rendering
    ctx.textAlign = 'start'
  }, [
    value,
    audioData.value,
    dbLevels.value,
    volume.value,
    currentTime.value,
    duration.value,
    peakLevel.value,
    transitionPoint,
    lowerRangePortion,
    upperRangePortion
  ])

  // Handle volume change with mouse
  const handleMouseDown = (e: MouseEvent) => {
    if (!containerRef.current) return

    isDragging.set(true)
    dragStartYRef.current = e.clientY
    dragStartVolumeRef.current = volume.value
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value || !containerRef.current) return

    const deltaY = dragStartYRef.current - e.clientY
    const containerHeight = containerRef.current.clientHeight

    // Calculate new dB value directly
    const currentDb = volume.value <= 0 ? -60 : 20 * Math.log10(dragStartVolumeRef.current)
    const dbChange = (deltaY / containerHeight) * 80 // Range from -60 to +20 = 80dB
    const newDb = Math.max(-60, Math.min(20, currentDb + dbChange))

    // Convert dB to linear gain for the audio element
    // When dB is -60 or less, set gain to exactly 0 to ensure silence
    const newGain = newDb <= -60 ? 0 : Math.pow(10, newDb / 20)
    volume.set(newGain)

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newGain
    }

    if (onChange) {
      onChange(newDb) // Pass dB value to parent
    }
  }

  const handleMouseUp = () => {
    isDragging.set(false)
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate volume decibel level
  const getVolumeDecibelLevel = () => {
    // Convert linear volume (0-1) to decibels (approximately -60dB to +20dB)
    if (volume.value <= 0) return '-∞'
    const db = 20 * Math.log10(volume.value)
    return `${db.toFixed(1)} dB`
  }

  // Calculate current decibel level (RMS)
  const getCurrentDecibelLevel = () => {
    if (dbLevels.value.length === 0) return '-∞'

    // Calculate RMS (Root Mean Square) value of dB levels
    // First convert from dB to linear values
    const linearValues = dbLevels.value.map((db) => Math.pow(10, db / 20))

    // Calculate average of squares
    const meanSquare = linearValues.reduce((sum, val) => sum + val * val, 0) / linearValues.length

    // Take square root and convert back to dB
    const rmsDb = 20 * Math.log10(Math.sqrt(meanSquare))

    return `${rmsDb.toFixed(1)} dBFS`
  }

  return (
    <div
      ref={containerRef}
      className={twMerge('relative h-32 w-full select-none overflow-hidden rounded-md', className)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} className="h-full w-full cursor-ns-resize" />

      {showCurrentTime && (
        <div className="absolute left-2 top-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
          {formatTime(currentTime.value)} / {formatTime(duration.value)}
        </div>
      )}

      <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
        Level: {debouncedLevel.value}
      </div>

      {isDragging.value && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="rounded-md bg-black/70 px-3 py-2 text-sm text-white">Volume: {getVolumeDecibelLevel()}</div>
        </div>
      )}
    </div>
  )
}

export default AudioVolumeVisualizer
