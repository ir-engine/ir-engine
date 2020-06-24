import { InputState } from '../components/InputState'

export class GamepadInputSystem extends System {
    set debug(debug){
        this.debug = debug
    }

    execute(delta, time) {
        this.queries.simple.added.forEach(ent => {
            let gp = ent.getMutableComponent(SimpleGamepadState)
            window.addEventListener("gamepadconnected", (event) => {
                console.log("A gamepad connected:", event.gamepad);
                gp.connected = true
            });
            window.addEventListener("gamepaddisconnected", (event) => {
                console.log("A gamepad disconnected:", event.gamepad);
                gp.connected = false
            });
        })
        this.queries.simple.results.forEach(ent => {
            let gp = ent.getMutableComponent(SimpleGamepadState)
            if(gp.connected) {
                this._scan_gamepads(gp,ent.getMutableComponent(InputState))
            }
        })
    }

    _scan_gamepads(gp, inp) {
        const gamepads = navigator.getGamepads()
        gamepads.forEach(gamepad => {
            if(gamepad.axes) {
                if(gamepad.axes.length >= 2) {
                    this.scan_x(gp,gamepad.axes[0],inp)
                    this.scan_y(gp,gamepad.axes[1],inp)
                }
            }
        })
    }

    scan_x(gp, x, input) {
        if(x < -gp.axis_threshold) {
            input.states.left = true
            input.states.right = false
            return
        }
        if(x > gp.axis_threshold) {
            input.states.left = false
            input.states.right = true
            return
        }
        input.states.left = false
        input.states.right = false

        if (debug) console.log("left: " + input.states.left);
        if (debug) console.log("right: " + input.states.right)
    }

    scan_y(gp, y, input) {
        if(y < -gp.axis_threshold) {
            input.states.up = false
            input.states.down = true
            return
        }
        if(y > gp.axis_threshold) {
            input.states.up = true
            input.states.down = false
            return
        }
        input.states.up = false
        input.states.down = false

        if (debug) console.log("up: " + input.states.up);
        if (debug) console.log("down: " + input.states.down)
    }
}

GamepadInputSystem.queries = {
    simple: {
        components:[SimpleGamepadState, InputState],
        listen: {
            added:true,
            removed:true,
        }
    }
}
