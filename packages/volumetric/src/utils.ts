/* eslint-disable no-restricted-globals */
const isWebWorker = typeof self === 'object'
  && self.constructor
  && self.constructor.name === 'DedicatedWorkerGlobalScope';
const applyElementArguments = (el: any, args: any) => {
  Object.entries(args).forEach((entry: any) => {
    const [key, value] = entry;
    el[key] = value;
  });
  return el;
};

export const createElement = (type: string, args: any) => {
  return isWebWorker ? document.createElement(type, args) : applyElementArguments(document.createElement(type), args);
};

export const moduloBy = (number, modulo) => (number + modulo) % modulo;
