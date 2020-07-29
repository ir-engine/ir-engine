// Adds support for Promise to socket.io-client
export function promise(socket) {
  return function request(type, data = {}) {
    return new Promise(resolve => {
      socket.emit(type, data, resolve);
      console.log("Emitting data: " + data);
    });
  };
}
