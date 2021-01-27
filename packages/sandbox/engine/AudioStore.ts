import { Audio, PositionalAudio, AudioListener } from "three";
import { Behavior } from "../src/common/interfaces/Behavior";
import { Entity } from "../src/ecs/classes/Entity";
import { Component } from "../src/ecs/classes/Component";
import { System } from "../src/ecs/classes/System";
import { types, Types } from "../src/ecs/types/Types";
import { addComponent, getComponent } from "../src/ecs/functions/EntityFunctions";

/** 
 * BEECS example
 * -------------
 * Behavioral Elements Entity Component System
 * 
 * Element — external object (with methods and properties, like Object3D).
 * Component — wrapper for Element properties. Doesn't have methods.
 * Entity — Components Set. Game Object, composed from one or many Component(s).
 * Behavior — function, that execute Element methods.
 * System — Behaviors group. Physics for example.
 */

 /** Store audio player options and refs to the Elements */
export class AudioStore extends Component<Audio | PositionalAudio> {
    static schema = types({
        audioElement: Types.Ref,
        listenerElement: Types.Ref,
        src: String(),
        volume: 0.25,
        autoplay: true,
        loop: true,
        positional: true,
        refDistance: 20,
    })
}

/** Adds AudioStore component and initialise elements */
export const addAudioStore: Behavior = (entity: Entity, args: { options: typeof AudioStore.schema }) => {
    const {listenerElement = new AudioListener(), positional} = args.options
    const ElementClass = positional ? PositionalAudio : Audio
    const audioElement = new ElementClass(listenerElement as AudioListener)
    const state = {...args.options, listenerElement, audioElement}
    updateElements(state as any)
    addComponent(entity, AudioStore, state)
}

/** Perform audioElement updates when AudioStore component changes */
export const changeAudioStore: Behavior = (entity: Entity) => {
    const action = getComponent(entity, AudioStore)
    if( 'audioElement' in action ) updateElements(action)
}

/** Private function, that apply audioElement methods */
function updateElements({audioElement, play, src, refDistance}){
    if( audioElement ){
        if( src !== undefined) audioElement.load(src)
    }
    if( audioElement instanceof PositionalAudio ){
        if( refDistance !== undefined) (audioElement as PositionalAudio).setRefDistance(refDistance)
    }
}
//export function render_AudioState(){} // runs on every tick

/** Compose standard ECS system from behaviors */
// export const SoundSystem: System = createSystem({
//     components: [AudioStore],
//     behaviors: [addAudioStore, changeAudioStore],
// })