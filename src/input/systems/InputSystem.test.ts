import InputSystem from  "./InputSystem"
import {test, expect} from "jest-runner-tsc"
test('adds 1 + 2 to equal 3', () => {
    expect( {
        a:1,
        b:2,
    }).equal({
        a:1
    })
})