import * as cam from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { Pose, POSE_CONNECTIONS, ResultsListener } from '@mediapipe/pose'
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'

const Mediapipe = ({}: {}) => {
  const canvasRef = useRef(null as any)
  const webcamRef = useRef(null as any)
  const canvasCtxRef = useRef(null as any)

  const onResults: ResultsListener = useCallback((results) => {
    if (canvasCtxRef.current !== null && canvasRef.current !== null) {
      const { poseLandmarks } = results
      canvasCtxRef.current.save()
      canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      canvasCtxRef.current.globalCompositeOperation = 'source-over'
      drawConnectors(canvasCtxRef.current, poseLandmarks, POSE_CONNECTIONS, {
        color: '#fff' /*'#00FF00'*/,
        lineWidth: 4
      })
      drawLandmarks(canvasCtxRef.current, poseLandmarks, { color: '#fff' /*'#FF0000'*/, lineWidth: 2 })
      canvasCtxRef.current.restore()
    }
  }, [])

  // useEffect(() => {
  //   if (canvasRef.current !== null && webcamRef.current !== null) {
  //     canvasRef.current.width = webcamRef.current.video.videoWidth
  //     canvasRef.current.height = webcamRef.current.video.videoHeight
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
          //this block runs once every frame
          await pose.send({ image: webcamRef.current.video })
        },
        width: 640,
        height: 480
      })
      camera.start()
    }
  }, [])

  return (
    <div>
      <Webcam ref={webcamRef} style={{ position: 'absolute', top: 0, left: 0 }} width="640px" height="480px" />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} width="640px" height="480px" />
    </div>
  )
}

Mediapipe.displayName = 'Mediapipe'

Mediapipe.defaultProps = {}

export default Mediapipe
