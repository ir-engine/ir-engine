import { Audio, PositionalAudio, AudioListener } from "three";
import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { Component } from "../../ecs/classes/Component";
import { System } from "../../ecs/classes/System";
import { types, Ref } from "../../ecs/types/Types";

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
        audioElement: new Ref<Audio | PositionalAudio>,
        listenerElement: new Ref<AudioListener>,
        src: String(),
        volume: 0.25,
        autoplay: true,
        loop: true,
        positional: true,
        refDistance: 20,
    })
}

/** Adds AudioStore component and initialise elements */
export function add_AudioStore(this:Entity, options: typeof AudioStore.schema): Behavior {
    const {listenerElement = new AudioListener, positional} = options
    const ElementClass = positional ? PositionalAudio : Audio
    const audioElement = new ElementClass(listenerElement)
    const state = {...options, listenerElement, audioElement}
    updateElements(state)
    addComponent(this, AudioStore, state)
}

/** Perform audioElement updates when AudioStore component changes */
export function change_AudioStore(this:Entity): Behavior {
    const action = getComponent(this, AudioStore)
    if( 'audioElement' in action ) updateElements(action)
}

/** Private function, that apply audioElement methods */
function updateElements({audioElement, play, src, refDistance}){
    if( audioElement ){
        if( src !== void 0) audioElement.load(src)
    }
    if( audioElement instanceof PositionalAudio ){
        if( refDistance !== void 0) audioElement.refDistance(refDistance)
    }
}
//export function render_AudioState(){} // runs on every tick

/** Compose standart ECS(Y) system from behaviors */
export const SoundSystem: System = createSystem({
    components: [AudioStore],
    behaviors: [add_AudioStore, change_AudioStore],
})