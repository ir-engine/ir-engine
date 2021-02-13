const BotActionType = {
    None:           'none',

    // connection
    Connect:        'connect',
    Disconnect:     'disconnect',

    // room
    EnterRoom:      'enterRoom',
    LeaveRoom:      'leaveRoom',

    // key
    KeyPress:       'keyPress',

    // audio
    SendAudio:      'sendAudio',
    StopAudio:      'stopAudio',
    ReceiveAudio:   'receiveAudio',

    // video
    SendVideo:      'sendVideo',
    StopVideo:      'stopVideo',
    ReceiveVideo:   'receiveVideo',

    // interact
    InteractObject: 'interactObject',

    // send message
    SendMessage:    'sendMessage',

    // flow control
    OpIf:            'opIf',
    Delay:           'delay',
};

class MessageData {
    /**
     * 
     * @param {*} message is string to be sent
     */
    constructor(message) {
        this.message = message;
    }
}

class EnterRoomData {
    /**
     * Room url will be https://${domain}/location/${locationName}
     * @param {*} domain is domain
     * @param {*} locationName is location name
     */
    constructor(domain, locationName) {
        this.domain = domain;
        this.locationName = locationName;
    }
}

class KeyEventData {
    constructor(key, pressedTime) {
        this.key = key;
        this.pressedTime = pressedTime; // in milliseconds
    }
}

class SendMediaData {
    constructor(duration) {
        this.duration = duration;
    }
}

class DelayData {
    constructor(timeout) {
        this.timeout = timeout;
    }
}

class OperatorData {
    /**
     * if expression() is true, then call trueCallback(). otherwise call falseCallback()
     * @param {*} expression is callback for expression. (stats) => {}
     * @param {*} trueCallback is callback for true of expression. () => {}
     * @param {*} falseCallback is callback for false of expression. () => {}
     */

    constructor(expression, trueCallback, falseCallback) {
        this.expression = expression;
        this.trueCallback = trueCallback;
        this.falseCallback = falseCallback;
    }
}
class BotAction {
    /**
     * 
     * @param {*} type is type of BotActionType.
     * @param {*} data is type of MessageData | KeyEventData | EnterRoomData | OperatorData | ...
     */

    constructor(type, data = {}) {
        this.type = type;
        this.data = data;
    }

    static connect() {
        return new BotAction(BotActionType.Connect, {});
    }

    static sendMessage(message) {
        return new BotAction(BotActionType.SendMessage, new MessageData(message));
    }

    static sendAudio(duration) {
        return new BotAction(BotActionType.SendAudio, new SendMediaData(duration));
    }

    static stopAudio() {
        return new BotAction(BotActionType.StopAudio, {});
    }

    static receiveAudio() {
        return new BotAction(BotActionType.ReceiveAudio, {});
    }

    static sendVideo(duration) {
        return new BotAction(BotActionType.SendVideo, new SendMediaData(duration));
    }

    static stopVideo() {
        return new BotAction(BotActionType.StopVideo, {});
    }

    static receiveVideo() {
        return new BotAction(BotActionType.ReceiveVideo, {});
    }

    static keyPress(key, pressedTime) {
        return new BotAction(BotActionType.KeyPress, new KeyEventData(key, pressedTime));
    }

    static interactObject() {
        return new BotAction(BotActionType.InteractObject);
    }

    static enterRoom(domain, locationName) {
        return new BotAction(BotActionType.EnterRoom, new EnterRoomData(domain, locationName));
    }
    
    static leaveRoom(domain, locationName) {
        return new BotAction(BotActionType.LeaveRoom, new EnterRoomData(domain, locationName));
    }

    static disconnect() {
        return new BotAction(BotActionType.Disconnect);
    }

    static opIf(expression, trueCallback, falseCallback) {
        return new BotAction(BotActionType.OpIf, new OperatorData(expression, trueCallback, falseCallback));
    }

    static delay(timeout) {
        return new BotAction(BotActionType.Delay, new DelayData(timeout));
    }
};

module.exports = {
    BotAction,
    BotActionType
}
