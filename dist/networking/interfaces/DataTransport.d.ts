import Message from "./Message";
export default interface DataTransport {
    initialize(initializationCallback?: any): boolean;
    deinitialize(deinitializationCallback?: any): boolean;
    getAllMessages: Message[];
    addMessageToQueue(message: Message): boolean;
    sendAllMessages(): any;
    getNewClients(): number[];
    getAllClients(): number[];
}
