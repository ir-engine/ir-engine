import {
  __commonJS
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/wildemitter/wildemitter.js
var require_wildemitter = __commonJS({
  "../../node_modules/wildemitter/wildemitter.js"(exports, module) {
    module.exports = WildEmitter;
    function WildEmitter() {
    }
    WildEmitter.mixin = function(constructor) {
      var prototype = constructor.prototype || constructor;
      prototype.isWildEmitter = true;
      prototype.on = function(event, groupName, fn) {
        this.callbacks = this.callbacks || {};
        var hasGroup = arguments.length === 3, group = hasGroup ? arguments[1] : void 0, func = hasGroup ? arguments[2] : arguments[1];
        func._groupName = group;
        (this.callbacks[event] = this.callbacks[event] || []).push(func);
        return this;
      };
      prototype.once = function(event, groupName, fn) {
        var self = this, hasGroup = arguments.length === 3, group = hasGroup ? arguments[1] : void 0, func = hasGroup ? arguments[2] : arguments[1];
        function on() {
          self.off(event, on);
          func.apply(this, arguments);
        }
        this.on(event, group, on);
        return this;
      };
      prototype.releaseGroup = function(groupName) {
        this.callbacks = this.callbacks || {};
        var item, i, len, handlers;
        for (item in this.callbacks) {
          handlers = this.callbacks[item];
          for (i = 0, len = handlers.length; i < len; i++) {
            if (handlers[i]._groupName === groupName) {
              handlers.splice(i, 1);
              i--;
              len--;
            }
          }
        }
        return this;
      };
      prototype.off = function(event, fn) {
        this.callbacks = this.callbacks || {};
        var callbacks = this.callbacks[event], i;
        if (!callbacks)
          return this;
        if (arguments.length === 1) {
          delete this.callbacks[event];
          return this;
        }
        i = callbacks.indexOf(fn);
        if (i !== -1) {
          callbacks.splice(i, 1);
          if (callbacks.length === 0) {
            delete this.callbacks[event];
          }
        }
        return this;
      };
      prototype.emit = function(event) {
        this.callbacks = this.callbacks || {};
        var args = [].slice.call(arguments, 1), callbacks = this.callbacks[event], specialCallbacks = this.getWildcardCallbacks(event), i, len, item, listeners;
        if (callbacks) {
          listeners = callbacks.slice();
          for (i = 0, len = listeners.length; i < len; ++i) {
            if (!listeners[i]) {
              break;
            }
            listeners[i].apply(this, args);
          }
        }
        if (specialCallbacks) {
          len = specialCallbacks.length;
          listeners = specialCallbacks.slice();
          for (i = 0, len = listeners.length; i < len; ++i) {
            if (!listeners[i]) {
              break;
            }
            listeners[i].apply(this, [event].concat(args));
          }
        }
        return this;
      };
      prototype.getWildcardCallbacks = function(eventName) {
        this.callbacks = this.callbacks || {};
        var item, split, result = [];
        for (item in this.callbacks) {
          split = item.split("*");
          if (item === "*" || split.length === 2 && eventName.slice(0, split[0].length) === split[0]) {
            result = result.concat(this.callbacks[item]);
          }
        }
        return result;
      };
    };
    WildEmitter.mixin(WildEmitter);
  }
});

// ../../node_modules/hark/hark.js
var require_hark = __commonJS({
  "../../node_modules/hark/hark.js"(exports, module) {
    var WildEmitter = require_wildemitter();
    function getMaxVolume(analyser, fftBins) {
      var maxVolume = -Infinity;
      analyser.getFloatFrequencyData(fftBins);
      for (var i = 4, ii = fftBins.length; i < ii; i++) {
        if (fftBins[i] > maxVolume && fftBins[i] < 0) {
          maxVolume = fftBins[i];
        }
      }
      ;
      return maxVolume;
    }
    var audioContextType;
    if (typeof window !== "undefined") {
      audioContextType = window.AudioContext || window.webkitAudioContext;
    }
    var audioContext = null;
    module.exports = function(stream, options) {
      var harker = new WildEmitter();
      if (!audioContextType)
        return harker;
      var options = options || {}, smoothing = options.smoothing || 0.1, interval = options.interval || 50, threshold = options.threshold, play = options.play, history = options.history || 10, running = true;
      audioContext = options.audioContext || audioContext || new audioContextType();
      var sourceNode, fftBins, analyser;
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = smoothing;
      fftBins = new Float32Array(analyser.frequencyBinCount);
      if (stream.jquery)
        stream = stream[0];
      if (stream instanceof HTMLAudioElement || stream instanceof HTMLVideoElement) {
        sourceNode = audioContext.createMediaElementSource(stream);
        if (typeof play === "undefined")
          play = true;
        threshold = threshold || -50;
      } else {
        sourceNode = audioContext.createMediaStreamSource(stream);
        threshold = threshold || -50;
      }
      sourceNode.connect(analyser);
      if (play)
        analyser.connect(audioContext.destination);
      harker.speaking = false;
      harker.suspend = function() {
        return audioContext.suspend();
      };
      harker.resume = function() {
        return audioContext.resume();
      };
      Object.defineProperty(harker, "state", { get: function() {
        return audioContext.state;
      } });
      audioContext.onstatechange = function() {
        harker.emit("state_change", audioContext.state);
      };
      harker.setThreshold = function(t) {
        threshold = t;
      };
      harker.setInterval = function(i2) {
        interval = i2;
      };
      harker.stop = function() {
        running = false;
        harker.emit("volume_change", -100, threshold);
        if (harker.speaking) {
          harker.speaking = false;
          harker.emit("stopped_speaking");
        }
        analyser.disconnect();
        sourceNode.disconnect();
      };
      harker.speakingHistory = [];
      for (var i = 0; i < history; i++) {
        harker.speakingHistory.push(0);
      }
      var looper = function() {
        setTimeout(function() {
          if (!running) {
            return;
          }
          var currentVolume = getMaxVolume(analyser, fftBins);
          harker.emit("volume_change", currentVolume, threshold);
          var history2 = 0;
          if (currentVolume > threshold && !harker.speaking) {
            for (var i2 = harker.speakingHistory.length - 3; i2 < harker.speakingHistory.length; i2++) {
              history2 += harker.speakingHistory[i2];
            }
            if (history2 >= 2) {
              harker.speaking = true;
              harker.emit("speaking");
            }
          } else if (currentVolume < threshold && harker.speaking) {
            for (var i2 = 0; i2 < harker.speakingHistory.length; i2++) {
              history2 += harker.speakingHistory[i2];
            }
            if (history2 == 0) {
              harker.speaking = false;
              harker.emit("stopped_speaking");
            }
          }
          harker.speakingHistory.shift();
          harker.speakingHistory.push(0 + (currentVolume > threshold));
          looper();
        }, interval);
      };
      looper();
      return harker;
    };
  }
});
export default require_hark();
//# sourceMappingURL=hark.js.map
