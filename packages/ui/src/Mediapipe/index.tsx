import { useHookstate } from '@hookstate/core'
import * as cam from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { NormalizedLandmarkList, Pose, POSE_CONNECTIONS, ResultsListener } from '@mediapipe/pose'
import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import Webcam from 'react-webcam'

import { SocketWebRTCClientNetwork } from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { mocapDataChannelType, MotionCaptureFunctions } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'

let creatingProducer = false
const startDataProducer = async () => {
  const network = Engine.instance.worldNetwork as SocketWebRTCClientNetwork
  if (!network?.sendTransport || creatingProducer) return
  creatingProducer = true
  const dataProducer = await network.sendTransport.produceData({
    appData: { data: {} },
    ordered: true,
    label: mocapDataChannelType,
    maxPacketLifeTime: 3000,
    // maxRetransmits: 3,
    protocol: 'raw'
  })
  dataProducer.on('transportclose', () => {
    console.log('transportclose')
  })
  network.dataProducers.set(mocapDataChannelType, dataProducer)
}

/**
 * Our results schema is the following:
 *   [length, x0, y0, z0, visible, x1, y1, z1, visible, ...]
 * @param results
 */
const sendResults = (results: NormalizedLandmarkList) => {
  const network = Engine.instance.worldNetwork as SocketWebRTCClientNetwork
  if (!network?.sendTransport) return
  const dataProducer = network.dataProducers.get(mocapDataChannelType)
  if (!dataProducer) {
    startDataProducer()
    return
  }
  if (!dataProducer.closed && dataProducer.readyState === 'open') {
    const data = MotionCaptureFunctions.sendResults(results)
    dataProducer.send(data)
  }
}

const Mediapipe = ({}: {}) => {
  const canvasRef = useRef(null as any)
  const webcamRef = useRef(null as any)
  const canvasCtxRef = useRef(null as any)

  const imageWidth = useHookstate(1)
  const imageHeight = useHookstate(1)

  const onResults: ResultsListener = useCallback(
    (results) => {
      imageWidth.set(results.image.width)
      imageHeight.set(results.image.height)

      if (canvasCtxRef.current !== null && canvasRef.current !== null) {
        const { poseWorldLandmarks, poseLandmarks } = results
        if (canvasCtxRef.current && poseLandmarks?.length) {
          //draw!!!
          canvasCtxRef.current.save()
          canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          canvasCtxRef.current.globalCompositeOperation = 'source-over'
          drawConnectors(canvasCtxRef.current, [...poseLandmarks], POSE_CONNECTIONS, {
            color: '#fff' /*'#00FF00'*/,
            lineWidth: 4
          })
          drawLandmarks(canvasCtxRef.current, [...poseLandmarks], {
            color: '#fff' /*'#FF0000'*/,
            lineWidth: 2
          })
          canvasCtxRef.current.restore()

          sendResults(poseWorldLandmarks)
        }
      }
    },
    [canvasCtxRef]
  )

  // useEffect(() => {
  //   if (canvasRef.current !== null && webcamRef.current !== null) {
  //     canvasRef.current.width = webcamRef?.current?.video?.width
  //     canvasRef.current.height = webcamRef?.current?.video?.height
  //   }
  // }, [webcamRef])

  useLayoutEffect(() => {
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
          imageWidth.set(webcamRef.current.video.offsetWidth)
          imageHeight.set(webcamRef.current.video.offsetHeight)
          // Todo: hook to media service
          await pose.send({ image: webcamRef.current.video })
        }
      })
      camera.start()
    }
  }, [])

  // Todo: Separate canvas and webcam into separate, reusable components (or create stories / switch to existing)
  return (
    <div style={{ width: 'fit-content', height: 'fit-content', position: 'relative' }}>
      <Webcam ref={webcamRef} style={{ width: '100%' }} width="100%" height="100%" />
      <div style={{ objectFit: 'contain', position: 'absolute', top: 0 }}>
        <canvas
          ref={canvasRef}
          style={{
            width: imageWidth.value,
            height: imageHeight.value
          }}
          width={imageWidth.value}
          height={imageHeight.value}
        />
      </div>
    </div>
  )
}

Mediapipe.displayName = 'Mediapipe'

Mediapipe.defaultProps = {}

export default Mediapipe
