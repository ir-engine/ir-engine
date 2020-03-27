import Vue from 'vue'

import 'aframe'
import 'networked-aframe'
import 'aframe-input-mapping-component'
import 'aframe-teleport-controls'
import registerAframeInput from '../components/aframe/input-register-aframe.js'

registerAframeInput();

['a-scene', 'a-assets', 'a-entity'].forEach((val, index) => { Vue.config.ignoredElements.push(val) })
// primitives
Object.keys(AFRAME.primitives.primitives).forEach(function (key, index) {
    Vue.config.ignoredElements.push(key)
})