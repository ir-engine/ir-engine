export class KeyboardInputSystem extends System {
    debug = false
    
    set debug(debug){
        this.debug = debug
    }

    execute(delta, time) {
        this.queries.controls.added.forEach( ent => {
            let cont = ent.getMutableComponent(KeyboardState)
            document.addEventListener('keydown',cont.on_keydown)
            document.addEventListener('keyup',cont.on_keyup)
        })
        this.queries.controls.results.forEach(ent => {
            let kb = ent.getComponent(KeyboardState)
            let inp = ent.getMutableComponent(InputState)
            Object.keys(kb.mapping).forEach(key => {
                let name = kb.mapping[key]
                let state = kb.getKeyState(key)
                if(state.current === 'down' && state.prev === 'up') {
                    inp.states[name] = (state.current === 'down')
                    inp.changed = true
                    if(debug) console.log(name + " changed to " + state)
                }
                if(state.current === 'up' && state.prev === 'down') {
                    inp.states[name] = (state.current === 'down')
                    inp.changed = true
                    inp.released = true
                    if(debug) console.log(name + " changed to " + state)
                }
                state.prev = state.current
            })
            // console.log("key mapping", kb.mapping['a'], kb.states['a'], "left state",inp.states['left'])
        })
    }
}

KeyboardInputSystem.queries = {
    controls: {
        components:[KeyboardState, InputState],
        listen: { added:true, removed: true},
    },
}
