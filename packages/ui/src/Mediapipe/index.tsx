import * as cam from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { Pose, POSE_CONNECTIONS, ResultsListener } from '@mediapipe/pose'
import React, { useCallback, useEffect, useRef } from 'react'
import Webcam from 'react-webcam'

import {
  MotionCaptureService,
  MotionCaptureState
} from '@etherealengine/client-core/src/mocap/services/MotionCaptureService'
import { MotionCaptureAction } from '@etherealengine/engine/src/mocap/functions/MotionCaptureAction'
import { dispatchAction, getState, useHookstate } from '@etherealengine/hyperflux'

const Mediapipe = ({}: {}) => {
  const motionCaptureState = useHookstate(getState(MotionCaptureState))

  const canvasRef = useRef(null as any)
  const webcamRef = useRef(null as any)
  const canvasCtxRef = useRef(null as any)

  const onResults: ResultsListener = useCallback(
    (results) => {
      if (canvasCtxRef.current !== null && canvasRef.current !== null) {
        const { poseLandmarks } = results
        dispatchAction(MotionCaptureAction.setData({ data: poseLandmarks }))
      }
    },
    [canvasCtxRef]
  )

  useEffect(() => {
    if (canvasCtxRef.current !== null && motionCaptureState.value?.data !== null) {
      //draw!!!
      canvasCtxRef.current.save()
      canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      canvasCtxRef.current.globalCompositeOperation = 'source-over'
      drawConnectors(canvasCtxRef.current, [...motionCaptureState.value?.data], POSE_CONNECTIONS, {
        color: '#fff' /*'#00FF00'*/,
        lineWidth: 4
      })
      drawLandmarks(canvasCtxRef.current, [...motionCaptureState.value?.data], {
        color: '#fff' /*'#FF0000'*/,
        lineWidth: 2
      })
      canvasCtxRef.current.restore()
    }
  }, [canvasCtxRef, motionCaptureState.data])

  // useEffect(() => {
  //   if (canvasRef.current !== null && webcamRef.current !== null) {
  //     canvasRef.current.width = webcamRef?.current?.video?.width
  //     canvasRef.current.height = webcamRef?.current?.video?.height
  //   }
  // }, [webcamRef])

  useEffect(() => {
    if (canvasRef.current !== null) {
      const canvasElement = canvasRef.current
      canvasCtxRef.current = canvasElement.getContext('2d') //canvas context
    }
  }, [canvasRef])

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      }
    })
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false, //true,
      smoothSegmentation: false, //true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
    pose.onResults(onResults)

    if (webcamRef.current !== null) {
      const camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          // Todo: hook to media service
          await pose.send({ image: webcamRef.current.video })
        },
        width: 640,
        height: 480
      })
      camera.start()
    }
  }, [])

  // Todo: Separate canvas and webcam into separate, reusable components (or create stories / switch to existing)
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Webcam ref={webcamRef} style={{ position: 'absolute', top: 0, left: 0 }} width="640px" height="480px" />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} width="640px" height="480px" />
    </div>
  )
}

Mediapipe.displayName = 'Mediapipe'

Mediapipe.defaultProps = {}

export default Mediapipe
