import { System } from "../../ecs/classes/System";
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
/** System class which provides methods for Audio system. */
export declare class AudioSystem extends System {
    /** Update type of this system. **Default** to
     * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type. */
    updateType: SystemUpdateType;
    /** Indicates whether the system is ready or not. */
    audioReady: boolean;
    /** Callbacks to be called after system is ready. */
    callbacks: any[];
    /** Queries for different events related to Audio System. */
    queries: any;
    /** Audio Element. */
    audio: any;
    /** Audio Context. */
    context: AudioContext;
    /** World Object. */
    world: any;
    /** Constructs Audio System. */
    constructor();
    /** Dispose audio system and remove event listeners. */
    dispose(): void;
    /**
     * Execute the audio system for different events of queries.
     * @param delta time since last frame.
     * @param time current time.
     */
    execute(delta: any, time: any): void;
    /**
     * Call the callbacks when system is ready or push callbacks in array otherwise.
     * @param cb Callback to be called when system is ready.
     */
    whenReady(cb: any): void;
    /** Enable and start audio system. */
    startAudio(): void;
    /**
     * Log messages on console and on document if available.
     * @param str Message to be logged.
     */
    log(str: string): void;
    /**
     * Start Background music if available.
     * @param ent Entity to get the {@link audio/components/BackgroundMusic.BackgroundMusic | BackgroundMusic} Component.
     */
    startBackgroundMusic(ent: any): void;
    /**
     * Stop Background Music.
     * @param ent Entity to get the {@link audio/components/BackgroundMusic.BackgroundMusic | BackgroundMusic} Component.
     */
    stopBackgroundMusic(ent: any): void;
    /**
     * Play sound effect.
     * @param ent Entity to get the {@link audio/components/PlaySoundEffect.PlaySoundEffect | PlaySoundEffect} Component.
     */
    playSoundEffect(ent: any): void;
}
