var Emitter = require('events').EventEmitter;
var emitter = new Emitter();
emitter.setMaxListeners(0);

class Events {
  on = (eventName, args: any) => {
    emitter.on.apply(emitter, {...eventName, ... args});
    return this;
  };

  emit(eventName, args: any) {
    emitter.emit.apply(emitter, {...eventName, ... args});
    return this;
  };

  removeListener(eventName, args: any) {
    emitter.removeListener.apply(emitter, {...eventName, ... args});
    return this;
  };
}

export default new Events();
