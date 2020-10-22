import { System } from "../../ecs/classes/System";
import { SoundEffect } from "../components/SoundEffect";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { PlaySoundEffect } from "../components/PlaySoundEffect";
import { AudioEnabled } from "../components/AudioEnabled";

export class AudioSystem extends System {
    audioReady: boolean
    callbacks: any[]
    queries: any
    audio: any
    context: AudioContext
    world: any

    constructor() {
        super();
        this.startAudio = this.startAudio.bind(this);
        this.audioReady = false;
        this.callbacks = [];
        window.addEventListener('touchstart',this.startAudio);
        window.addEventListener('touchend',this.startAudio);
        window.addEventListener('click', this.startAudio);
    }

    dispose(): void {
        this.audioReady = false;
        this.callbacks = [];
        window.removeEventListener('touchstart',this.startAudio);
        window.removeEventListener('touchend',this.startAudio);
        window.removeEventListener('click', this.startAudio);
    }

    execute(delta, time) {
        this.queries.sound_effects.added?.forEach(ent => {
            const effect = ent.getComponent(SoundEffect);
            if(effect.src && !this.audio) {
                effect.audio = new Audio();
                console.log("loading the audio",effect.src);
                effect.audio.addEventListener('loadeddata', () => {
                    console.log("loaded audio from src",effect.src);
                    effect.audio.volume = effect.volume;
                });
                effect.audio.src = effect.src;
            }
        });
        this.queries.music.added?.forEach(ent => {
            this.whenReady(()=>this.startBackgroundMusic(ent));
        });
        this.queries.music.removed?.forEach(ent => {
            this.stopBackgroundMusic(ent);
        });
        this.queries.play.added?.forEach(ent => {
            this.whenReady(()=>this.playSoundEffect(ent));
        });
    }

    whenReady(cb) {
        if(this.audioReady) {
            cb();
        } else {
            this.callbacks.push(cb);
        }
    }

    startAudio() {
        if(this.audioReady) return;
        console.log("initing audio");
        this.audioReady = true;
        window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (window.AudioContext) {
            this.context = new window.AudioContext();
            // Create empty buffer
            const buffer = this.context.createBuffer(1, 1, 22050);
            const source = this.context.createBufferSource();
            source.buffer = buffer;
            // Connect to output (speakers)
            source.connect(this.context.destination);
            // Play sound
            if (source.start) {
                source.start(0);
            } else if ((source as any).play) {
                (source as any).play(0);
            }
        }
        this.world.createEntity().addComponent(AudioEnabled);
        this.callbacks.forEach(cb => cb());
        this.callbacks = null;
        this.log("audio enabled");
    }
    log(str) {
        console.log("LOG: ",str);
        const sel = document.querySelector('#info-alert');
        if(sel) sel.innerHTML = str;
    }

    startBackgroundMusic(ent) {
        const music = ent.getComponent(BackgroundMusic);
        if(music.src && !this.audio) {
            music.audio = new Audio();
            console.log("starting the background music");
            music.audio.loop = true;
            music.audio.volume = music.volume;
            console.log("loading the audio",music.src);
            music.audio.addEventListener('loadeddata', () => {
                console.log("loaded audio from src",music.src);
                music.audio.play();
            });
            music.audio.src = music.src;
        }
    }
    stopBackgroundMusic(ent) {
        const music = ent.getComponent(BackgroundMusic);
        if(music && music.audio) {
            music.audio.pause();
        }
    }

    playSoundEffect(ent) {
        const sound = ent.getComponent(SoundEffect);
        sound.audio.play();
        ent.removeComponent(PlaySoundEffect);
    }
}
AudioSystem.queries = {
    sound_effects: {
        components:[SoundEffect],
        listen: {
            added:true,
        }
    },
    music: {
        components:[BackgroundMusic],
        listen: {
            added:true,
            removed:true,
        }
    },
    play: {
        components:[SoundEffect, PlaySoundEffect],
        listen: {
            added:true,
        }
    }
};