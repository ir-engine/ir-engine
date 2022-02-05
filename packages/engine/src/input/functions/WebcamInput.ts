import * as Comlink from 'comlink'
import { Engine } from '../../ecs/classes/Engine'
import { MediaStreams } from '../../networking/systems/MediaStreamSystem'
import { CameraInput } from '../enums/InputEnums'
import { InputType } from '../enums/InputType'
import { WebCamInputComponent } from '../components/WebCamInputComponent'
import { hasComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { useWorld } from '../../ecs/functions/SystemHooks'
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
    //@ts-ignore
    const worker = new Worker(new URL('./WebcamInputWorker.js', import.meta.url), { type: 'module' })
    faceWorker = Comlink.wrap(worker)
    await faceWorker.initialise()
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

const nameToInputValue = {
  angry: CameraInput.Angry,
  disgusted: CameraInput.Disgusted,
  fearful: CameraInput.Fearful,
  happy: CameraInput.Happy,
  neutral: CameraInput.Neutral,
  sad: CameraInput.Sad,
  surprised: CameraInput.Surprised
}

let prevExp: string = ''

export async function faceToInput(detection) {
  if (detection !== undefined && detection.expressions !== undefined) {
    for (const expression in detection.expressions) {
      if (prevExp !== expression && detection.expressions[expression] >= EXPRESSION_THRESHOLD) {
        console.log(
          expression +
            ' ' +
            (detection.expressions[expression] < EXPRESSION_THRESHOLD ? 0 : detection.expressions[expression])
        )
        prevExp = expression
        /*const user = useAuthState().user
        await sendChatMessage({
          targetObjectId: user.instanceId.value,
          targetObjectType: 'instance',
          text: '[emotions]' + prevExp
        })*/
        if (hasComponent(useWorld().localClientEntity, WebCamInputComponent)) {
          getComponent(useWorld().localClientEntity, WebCamInputComponent).emotions.push(prevExp)
        }
        console.log('emotions|' + useWorld().localClientEntity + '|' + prevExp)
      }
      // If the detected value of the expression is more than 1/3rd-ish of total, record it
      // This should allow up to 3 expressions but usually 1-2
      const inputKey = nameToInputValue[expression]
      Engine.inputState.set(inputKey, {
        type: InputType.ONEDIM,
        value: detection.expressions[expression] < EXPRESSION_THRESHOLD ? 0 : detection.expressions[expression],
        lifecycleState: LifecycleValue.Changed
      })
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
    if (!lipsyncTracking) return
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

    lipToInput(pucker, widen, open)
  }
}

export const lipToInput = (pucker, widen, open) => {
  if (pucker > 0.2)
    Engine.inputState.set(nameToInputValue['pucker'], {
      type: InputType.ONEDIM,
      value: pucker,
      lifecycleState: LifecycleValue.Changed
    })
  else if (Engine.inputState.has(nameToInputValue['pucker'])) Engine.inputState.delete(nameToInputValue['pucker'])

  // Calculate lips widing and apply as input
  if (widen > 0.2)
    Engine.inputState.set(nameToInputValue['widen'], {
      type: InputType.ONEDIM,
      value: widen,
      lifecycleState: LifecycleValue.Changed
    })
  else if (Engine.inputState.has(nameToInputValue['widen'])) Engine.inputState.delete(nameToInputValue['widen'])

  // Calculate mouth opening and apply as input
  if (open > 0.2)
    Engine.inputState.set(nameToInputValue['open'], {
      type: InputType.ONEDIM,
      value: open,
      lifecycleState: LifecycleValue.Changed
    })
  else if (Engine.inputState.has(nameToInputValue['open'])) Engine.inputState.delete(nameToInputValue['open'])
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
