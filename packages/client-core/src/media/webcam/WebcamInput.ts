import type { FaceDetection, FaceExpressions } from '@vladmandic/face-api'
import * as Comlink from 'comlink'
import { SkinnedMesh } from 'three'

import { isDev } from '@xrengine/common/src/config'
import { createWorkerFromCrossOriginURL } from '@xrengine/common/src/utils/createWorkerFromCrossOriginURL'
import { AvatarRigComponent } from '@xrengine/engine/src/avatar/components/AvatarAnimationComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { WebcamInputComponent } from '@xrengine/engine/src/input/components/WebcamInputComponent'
import { GroupComponent } from '@xrengine/engine/src/scene/components/GroupComponent'

import { MediaStreams } from '../../transports/MediaStreams'
// @ts-ignore
import inputWorkerURL from './WebcamInputWorker.js?worker&url'

const EXPRESSION_THRESHOLD = 0.1

const faceTrackingTimers: any[] = []
let lipsyncTracking = false
let audioContext: AudioContext = null!

let faceWorker: Comlink.Remote<any> = null!
let faceVideo: HTMLVideoElement = null!
let faceCanvas: OffscreenCanvas = null!

export const stopFaceTracking = () => {
  faceTrackingTimers.forEach((timer) => {
    clearInterval(timer)
  })
}

export const stopLipsyncTracking = () => {
  lipsyncTracking = false
  audioContext?.close()
  audioContext = null!
}

export const startFaceTracking = async () => {
  if (!faceWorker) {
    //@ts-ignore   -- for vite dev environments use import.meta.url & built environments use ./worker.js?worker&url
    const workerPath = isDev ? new URL('./WebcamInputWorker.js', import.meta.url).href : inputWorkerURL
    const worker = createWorkerFromCrossOriginURL(workerPath)
    worker.onerror = console.error
    faceWorker = Comlink.wrap(worker)
    // @ts-ignore
    await faceWorker.initialise(import.meta.env.BASE_URL)
  }

  faceVideo = document.createElement('video')

  faceVideo.addEventListener('loadeddata', async () => {
    await faceWorker.create(faceVideo.videoWidth, faceVideo.videoHeight)
    faceCanvas = new OffscreenCanvas(faceVideo.videoWidth, faceVideo.videoHeight)
    const context = faceCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D
    const interval = setInterval(async () => {
      context.drawImage(faceVideo, 0, 0, faceVideo.videoWidth, faceVideo.videoHeight)
      const imageData = context.getImageData(0, 0, faceVideo.videoWidth, faceVideo.videoHeight)
      const pixels = imageData.data.buffer
      const detection = await faceWorker.detect(Comlink.transfer(pixels, [pixels]))
      if (detection) {
        faceToInput(detection)
      }
    }, 100)
    faceTrackingTimers.push(interval)
  })

  faceVideo.srcObject = MediaStreams.instance.videoStream
  faceVideo.muted = true
  faceVideo.play()
}

let prevExp = ''

export async function faceToInput(detection: { detection: FaceDetection; expressions: FaceExpressions }) {
  if (!hasComponent(Engine.instance.currentWorld.localClientEntity, WebcamInputComponent)) return
  const webcampInput = getComponent(Engine.instance.currentWorld.localClientEntity, WebcamInputComponent)

  if (detection !== undefined && detection.expressions !== undefined) {
    for (const expression in detection.expressions) {
      if (prevExp !== expression && detection.expressions[expression] >= EXPRESSION_THRESHOLD) {
        console.log(
          expression +
            ' ' +
            (detection.expressions[expression] < EXPRESSION_THRESHOLD ? 0 : detection.expressions[expression])
        )

        prevExp = expression
        console.log('emotions|' + Engine.instance.currentWorld.localClientEntity + '|' + prevExp)
      }
      // If the detected value of the expression is more than 1/3rd-ish of total, record it
      // This should allow up to 3 expressions but usually 1-2
      const inputIndex = expressionByIndex.findIndex((exp) => exp === expression)!
      const aboveThreshold = detection.expressions[expression] < EXPRESSION_THRESHOLD
      if (aboveThreshold) {
        webcampInput.expressionIndex = inputIndex
        webcampInput.expressionValue = detection.expressions[expression]
      }
    }
  }
}

export const startLipsyncTracking = () => {
  lipsyncTracking = true
  const BoundingFrequencyMasc = [0, 400, 560, 2400, 4800]
  const BoundingFrequencyFem = [0, 500, 700, 3000, 6000]
  audioContext = new AudioContext()
  const FFT_SIZE = 1024
  const samplingFrequency = 44100
  let sensitivityPerPole
  let spectrum
  let spectrumRMS
  const IndicesFrequencyFemale: number[] = []
  const IndicesFrequencyMale: number[] = []

  for (let m = 0; m < BoundingFrequencyMasc.length; m++) {
    IndicesFrequencyMale[m] = Math.round(((2 * FFT_SIZE) / samplingFrequency) * BoundingFrequencyMasc[m])
    console.log('IndicesFrequencyMale[', m, ']', IndicesFrequencyMale[m])
  }

  for (let m = 0; m < BoundingFrequencyFem.length; m++) {
    IndicesFrequencyFemale[m] = Math.round(((2 * FFT_SIZE) / samplingFrequency) * BoundingFrequencyFem[m])
    console.log('IndicesFrequencyMale[', m, ']', IndicesFrequencyMale[m])
  }

  const userSpeechAnalyzer = audioContext.createAnalyser()
  userSpeechAnalyzer.smoothingTimeConstant = 0.5
  userSpeechAnalyzer.fftSize = FFT_SIZE

  const inputStream = audioContext.createMediaStreamSource(MediaStreams.instance.audioStream)
  inputStream.connect(userSpeechAnalyzer)

  const audioProcessor = audioContext.createScriptProcessor(FFT_SIZE * 2, 1, 1)
  userSpeechAnalyzer.connect(audioProcessor)
  audioProcessor.connect(audioContext.destination)

  audioProcessor.onaudioprocess = () => {
    if (!lipsyncTracking || !hasComponent(Engine.instance.currentWorld.localClientEntity, WebcamInputComponent)) return
    // bincount returns array which is half the FFT_SIZE
    spectrum = new Float32Array(userSpeechAnalyzer.frequencyBinCount)
    // Populate frequency data for computing frequency intensities
    userSpeechAnalyzer.getFloatFrequencyData(spectrum) // getByteTimeDomainData gets volumes over the sample time
    // Populate time domain for calculating RMS
    // userSpeechAnalyzer.getFloatTimeDomainData(spectrum);
    // RMS (root mean square) is a better approximation of current input level than peak (just sampling this frame)
    // spectrumRMS = getRMS(spectrum);

    sensitivityPerPole = getSensitivityMap(spectrum)

    // Lower and higher voices have different frequency domains, so we'll separate and max them
    const EnergyBinMasc = new Float32Array(BoundingFrequencyMasc.length)
    const EnergyBinFem = new Float32Array(BoundingFrequencyFem.length)

    // Masc energy bins (groups of frequency-depending energy)
    for (let m = 0; m < BoundingFrequencyMasc.length - 1; m++) {
      for (let j = IndicesFrequencyMale[m]; j <= IndicesFrequencyMale[m + 1]; j++)
        if (sensitivityPerPole[j] > 0) EnergyBinMasc[m] += sensitivityPerPole[j]
      EnergyBinMasc[m] /= IndicesFrequencyMale[m + 1] - IndicesFrequencyMale[m]
    }

    // Fem energy bin
    for (let m = 0; m < BoundingFrequencyFem.length - 1; m++) {
      for (let j = IndicesFrequencyMale[m]; j <= IndicesFrequencyMale[m + 1]; j++)
        if (sensitivityPerPole[j] > 0) EnergyBinFem[m] += sensitivityPerPole[j]
      EnergyBinMasc[m] /= IndicesFrequencyMale[m + 1] - IndicesFrequencyMale[m]
      EnergyBinFem[m] = EnergyBinFem[m] / (IndicesFrequencyFemale[m + 1] - IndicesFrequencyFemale[m])
    }
    const pucker =
      Math.max(EnergyBinFem[1], EnergyBinMasc[1]) > 0.2
        ? 1 - 2 * Math.max(EnergyBinMasc[2], EnergyBinFem[2])
        : (1 - 2 * Math.max(EnergyBinMasc[2], EnergyBinFem[2])) * 5 * Math.max(EnergyBinMasc[1], EnergyBinFem[1])

    const widen = 3 * Math.max(EnergyBinMasc[3], EnergyBinFem[3])
    const open = 0.8 * (Math.max(EnergyBinMasc[1], EnergyBinFem[1]) - Math.max(EnergyBinMasc[3], EnergyBinFem[3]))

    const webcampInput = getComponent(Engine.instance.currentWorld.localClientEntity, WebcamInputComponent)
    webcampInput.pucker = pucker
    webcampInput.widen = widen
    webcampInput.open = open
  }
}

function getRMS(spectrum) {
  let rms = 0
  for (let i = 0; i < spectrum.length; i++) {
    rms += spectrum[i] * spectrum[i]
  }
  rms /= spectrum.length
  rms = Math.sqrt(rms)
  return rms
}

function getSensitivityMap(spectrum) {
  const sensitivity_threshold = 0.5
  const stPSD = new Float32Array(spectrum.length)
  for (let i = 0; i < spectrum.length; i++) {
    stPSD[i] = sensitivity_threshold + (spectrum[i] + 20) / 140
  }
  return stPSD
}

const morphNameByInput = {
  neutral: 'None',
  angry: 'Frown',
  disgusted: 'Frown',
  fearful: 'Frown',
  happy: 'Smile',
  surprised: 'Frown',
  sad: 'Frown',
  pucker: 'None',
  widen: 'Frown',
  open: 'Happy'
}

const expressionByIndex = Object.keys(morphNameByInput)
const morphNameByIndex = Object.values(morphNameByInput)

const setAvatarExpression = (entity: Entity): void => {
  const group = getComponent(entity, GroupComponent)
  const webcamInput = getComponent(entity, WebcamInputComponent)
  let body
  for (const obj of group)
    obj.traverse((obj: SkinnedMesh) => {
      if (!body && obj.morphTargetDictionary) body = obj
    })

  if (!body?.isMesh || !body?.morphTargetDictionary) {
    console.warn('[Avatar Emotions]: This avatar does not support expressive visemes.')
    return
  }

  const morphValue = webcamInput.expressionValue
  const morphName = morphNameByIndex[webcamInput.expressionIndex]
  const morphIndex = body.morphTargetDictionary[morphName]
  console.log(body.morphTargetDictionary)

  if (typeof morphIndex !== 'number') {
    console.warn('[Avatar Emotions]: This avatar does not support the', morphName, ' expression.')
    return
  }

  // console.warn(inputKey + ": " + morphName + ":" + morphIndex + " = " + morphValue)
  if (morphName && morphValue !== null) {
    if (typeof morphValue === 'number') {
      body.morphTargetInfluences![morphIndex] = morphValue // 0.0 - 1.0
    }
  }
}

/** @todo - this is broken - need to define the API */
export default async function WebcamInputSystem(world: World) {
  const webcamQuery = defineQuery([GroupComponent, AvatarRigComponent, WebcamInputComponent])

  const execute = () => {
    // for (const entity of webcamQuery()) setAvatarExpression(entity)
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
