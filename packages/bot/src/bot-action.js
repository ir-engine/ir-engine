const BotActionType = {
    None:           'none',

    Connect:        'connect',
    Disconnect:     'disconnect',

    EnterRoom:      'enterRoom',
    LeaveRoom:      'leaveRoom',

    MoveLeft:       'moveLeft',
    MoveRight:      'moveRight',
    MoveForward:    'moveForward',
    MoveBackward:   'moveBackward',

    SendAudio:      'sendAudio',
    ReceiveAudio:   'receiveAudio',

    InteractObject: 'interactObject',

    SendMessage:    'sendMessage',
};

class MessageData {
    constructor(message) {
        this.message = message;
    }
}

class EnterRoomData {
    constructor(domain, locationName) {
        this.domain = domain;
        this.locationName = locationName;
    }
}

class BotAction {
    constructor(type, data = {}) {
        this.type = type;
        this.data = data;
    }

    static connect(domain) {
        
    }

    static sendMessage(message) {
        return new BotAction(BotActionType.SendMessage, new MessageData(message));
    }

    static sendAudio() {
        return new BotAction(BotActionType.SendAudio, {});
    }

    static receiveAudio() {

    }

    static moveLeft() {

    }

    static moveRight() {

    }

    static moveForward() {

    }

    static moveBackward() {

    }

    static interactObject() {

    }

    static enterRoom(domain, locationName) {
        return new BotAction(BotActionType.EnterRoom, new EnterRoomData(domain, locationName));
    }
}

module.exports = {
    BotAction,
    BotActionType
}
