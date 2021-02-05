import { MediaStreamSystem } from "@xr3ngine/engine/src/networking/systems/MediaStreamSystem";
import * as faceapi from "face-api.js";
import { Behavior } from "../../common/interfaces/Behavior";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../components/Input";
import { CameraInput } from "../enums/CameraInput";
import { InputType } from "../enums/InputType";

const EXPRESSION_THRESHOLD = 0.1;

const faceTrackingTimers = [];
let lipsyncTracking = false;
let audioContext = null;

export const stopFaceTracking = () => {
    faceTrackingTimers.forEach(timer => {
        clearInterval(timer);
    });
}

export const stopLipsyncTracking = () => {
    lipsyncTracking = false;
    audioContext?.close();
    audioContext = null;
}

export const startFaceTracking: Behavior = (entity) => {
    console.log("**************** STARTING FACE TRACKING")
    const video = document.createElement('video');
    video.srcObject = MediaStreamSystem.instance.mediaStream;
    Promise.all([
        console.log("Start load detectors"),
        faceapi.nets.tinyFaceDetector.loadFromUri('/facetracking'),
        faceapi.nets.faceExpressionNet.loadFromUri('/facetracking')
    ]).then(() => {
        console.log("Face detectors loaded!");
        video.addEventListener('play', () => {
            console.log("Video start playing");
            // console.dir(video);
            // Record input at 30 FPS for now
            const interval = setInterval(async () => faceToInput(entity, video), 33);
            faceTrackingTimers.push(interval);
            console.log("*************** RUNNING FACE TRACKING")
        });

        video.muted = true;
        video.play();
    });
};

export const startLipsyncTracking: Behavior = (entity) => {
    lipsyncTracking = true;
    const BoundingFrequencyMasc = [0, 400, 560, 2400, 4800];
    const BoundingFrequencyFem = [0, 500, 700, 3000, 6000];
    audioContext = new AudioContext();
    const FFT_SIZE = 1024;
    const samplingFrequency = 44100;
    let sensitivityPerPole;
    let spectrum;
    let spectrumRMS;
    const IndicesFrequencyFemale = [];
    const IndicesFrequencyMale = [];

    for (let m = 0; m < BoundingFrequencyMasc.length; m++) {
        IndicesFrequencyMale[m] = Math.round(((2 * FFT_SIZE) / samplingFrequency) * BoundingFrequencyMasc[m]);
        console.log("IndicesFrequencyMale[", m, "]", IndicesFrequencyMale[m]);
    }

    for (let m = 0; m < BoundingFrequencyFem.length; m++) {
        IndicesFrequencyFemale[m] = Math.round(((2 * FFT_SIZE) / samplingFrequency) * BoundingFrequencyFem[m]);
        console.log("IndicesFrequencyMale[", m, "]", IndicesFrequencyMale[m]);
    }

    const userSpeechAnalyzer = audioContext.createAnalyser();
    userSpeechAnalyzer.smoothingTimeConstant = 0.5;
    userSpeechAnalyzer.fftSize = FFT_SIZE;

    const inputStream = audioContext.createMediaStreamSource(MediaStreamSystem.instance.mediaStream);
    inputStream.connect(userSpeechAnalyzer);

    const audioProcessor = audioContext.createScriptProcessor(FFT_SIZE * 2, 1, 1);
    userSpeechAnalyzer.connect(audioProcessor);
    audioProcessor.connect(audioContext.destination);

    audioProcessor.onaudioprocess = () => {
        if (!lipsyncTracking) return;
        // bincount returns array which is half the FFT_SIZE
        spectrum = new Float32Array(userSpeechAnalyzer.frequencyBinCount);
        // Populate frequency data for computing frequency intensities
        userSpeechAnalyzer.getFloatFrequencyData(spectrum);// getByteTimeDomainData gets volumes over the sample time
        // Populate time domain for calculating RMS
        userSpeechAnalyzer.getFloatTimeDomainData(spectrum);
        // RMS (root mean square) is a better approximation of current input level than peak (just sampling this frame)
        spectrumRMS = getRMS(spectrum);

        sensitivityPerPole = getSensitivityMap(spectrum);

        // Lower and higher voices have different frequency domains, so we'll separate and max them
        const EnergyBinMasc = new Float32Array(BoundingFrequencyMasc.length);
        const EnergyBinFem = new Float32Array(BoundingFrequencyFem.length);

        // Masc energy bins (groups of frequency-depending energy)
        for (let m = 0; m < BoundingFrequencyMasc.length - 1; m++) {
            for (let j = IndicesFrequencyMale[m]; j <= IndicesFrequencyMale[m + 1]; j++)
                if (sensitivityPerPole[j] > 0) EnergyBinMasc[m] += sensitivityPerPole[j];
            EnergyBinMasc[m] /= (IndicesFrequencyMale[m + 1] - IndicesFrequencyMale[m]);
        }

        // Fem energy bin
        for (let m = 0; m < BoundingFrequencyFem.length - 1; m++) {
            for (let j = IndicesFrequencyMale[m]; j <= IndicesFrequencyMale[m + 1]; j++)
                if (sensitivityPerPole[j] > 0) EnergyBinFem[m] += sensitivityPerPole[j];
            EnergyBinMasc[m] /= (IndicesFrequencyMale[m + 1] - IndicesFrequencyMale[m]);
            EnergyBinFem[m] = EnergyBinFem[m] / (IndicesFrequencyFemale[m + 1] - IndicesFrequencyFemale[m]);
        }

        const input = getMutableComponent(entity, Input);

        const pucker = Math.max(EnergyBinFem[1], EnergyBinMasc[1]) > 0.2 ?
            1 - 2 * Math.max(EnergyBinMasc[2], EnergyBinFem[2])
            : (1 - 2 * Math.max(EnergyBinMasc[2], EnergyBinFem[2])) * 5 * Math.max(EnergyBinMasc[1], EnergyBinFem[1]);

        if (pucker > .2)
            input.data.set(nameToInputValue["pucker"], {
                type: InputType.ONEDIM,
                value: pucker
            });
        else if (input.data.has(nameToInputValue["pucker"]))
            input.data.delete(nameToInputValue["pucker"]);

        // Calculate lips widing and apply as input
        const widen = 3 * Math.max(EnergyBinMasc[3], EnergyBinFem[3]);
        if (widen > .2)
            input.data.set(nameToInputValue["widen"], {
                type: InputType.ONEDIM,
                value: widen
            });
        else if (input.data.has(nameToInputValue["widen"]))
            input.data.delete(nameToInputValue["widen"]);

        // Calculate mouth opening and apply as input
        const open = 0.8 * (Math.max(EnergyBinMasc[1], EnergyBinFem[1]) - Math.max(EnergyBinMasc[3], EnergyBinFem[3]));
        if (open > .2)
            input.data.set(nameToInputValue["open"], {
                type: InputType.ONEDIM,
                value: open
            });
        else if (input.data.has(nameToInputValue["open"]))
            input.data.delete(nameToInputValue["open"]);
    };
};

const nameToInputValue = {
    angry: CameraInput.Angry,
    disgusted: CameraInput.Disgusted,
    fearful: CameraInput.Fearful,
    happy: CameraInput.Happy,
    neutral: CameraInput.Neutral,
    sad: CameraInput.Sad,
    surprised: CameraInput.Surprised
};
const faceApiOptions = new faceapi.TinyFaceDetectorOptions();
async function faceToInput(entity, video) {
    const detection = await faceapi.detectSingleFace(video, faceApiOptions).withFaceExpressions();
    // console.log("*************** detection", detection)

    if (detection !== undefined && detection.expressions !== undefined) {
        // console.log("EXPRESSIONS");
        // console.log(detection.expressions);
        const expressions = {};
        const input = getMutableComponent(entity, Input);
        for (const expression in detection.expressions) {
            // If the detected value of the expression is more than 1/3rd-ish of total, record it
            // This should allow up to 3 expressions but usually 1-2
            const cameraInputKey = nameToInputValue[expression];
            const inputKey = input.schema.cameraInputMap[cameraInputKey];
            if (!inputKey) {
                // skip if expression is not in schema
                continue;
            }
            // set it on the map
            input.data.set(inputKey, {
                type: InputType.ONEDIM,
                value: detection.expressions[expression] < EXPRESSION_THRESHOLD? 0 : detection.expressions[expression]
            });
        }
    }
}

function getRMS(spectrum) {
    let rms = 0;
    for (let i = 0; i < spectrum.length; i++) {
        rms += spectrum[i] * spectrum[i];
    }
    rms /= spectrum.length;
    rms = Math.sqrt(rms);
    return rms;
}

function getSensitivityMap(spectrum) {
    const sensitivity_threshold = 0.5;
    const stPSD = new Float32Array(spectrum.length);
    for (let i = 0; i < spectrum.length; i++) {
        stPSD[i] = sensitivity_threshold + ((spectrum[i] + 20) / 140);
    }
    return stPSD;
}
