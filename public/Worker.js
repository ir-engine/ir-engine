/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/ring-buffer-ts/dist/index.js":
/*!***************************************************!*\
  !*** ./node_modules/ring-buffer-ts/dist/index.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("!function(e,t){if(true)module.exports=t();else { var i, r; }}(this,(function(){return function(e){var t={};function r(i){if(t[i])return t[i].exports;var s=t[i]={i:i,l:!1,exports:{}};return e[i].call(s.exports,s,s.exports,r),s.l=!0,s.exports}return r.m=e,r.c=t,r.d=function(e,t,i){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},r.r=function(e){\"undefined\"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:\"Module\"}),Object.defineProperty(e,\"__esModule\",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&\"object\"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(r.r(i),Object.defineProperty(i,\"default\",{enumerable:!0,value:e}),2&t&&\"string\"!=typeof e)for(var s in e)r.d(i,s,function(t){return e[t]}.bind(null,s));return i},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,\"a\",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p=\"\",r(r.s=0)}([function(e,t,r){\"use strict\";r.r(t);class i{constructor(e){if(this.buffer=[],this.pos=0,e<0)throw new RangeError(\"The size does not allow negative values.\");this.size=e}static fromArray(e,t=0){const r=new i(t);return r.fromArray(e,0===t),r}getSize(){return this.size}getPos(){return this.pos}getBufferLength(){return this.buffer.length}add(...e){e.forEach(e=>{this.buffer[this.pos]=e,this.pos=(this.pos+1)%this.size})}get(e){if(e<0&&(e+=this.buffer.length),!(e<0||e>this.buffer.length))return this.buffer.length<this.size?this.buffer[e]:this.buffer[(this.pos+e)%this.size]}getFirst(){return this.get(0)}getLast(){return this.get(-1)}remove(e,t=1){if(e<0&&(e+=this.buffer.length),e<0||e>this.buffer.length)return[];const r=this.toArray(),i=r.splice(e,t);return this.fromArray(r),i}removeFirst(){return this.remove(0)[0]}removeLast(){return this.remove(-1)[0]}toArray(){return this.buffer.slice(this.pos).concat(this.buffer.slice(0,this.pos))}fromArray(e,t=!1){if(!Array.isArray(e))throw new TypeError(\"Input value is not an array.\");t&&this.resize(e.length),0!==this.size&&(this.buffer=e.slice(-this.size),this.pos=this.buffer.length%this.size)}clear(){this.buffer=[],this.pos=0}resize(e){if(e<0)throw new RangeError(\"The size does not allow negative values.\");if(0===e)this.clear();else if(e!==this.size){const t=this.toArray();this.fromArray(t.slice(-e)),this.pos=this.buffer.length%e}this.size=e}isFull(){return this.buffer.length===this.size}isEmpty(){return 0===this.buffer.length}}r.d(t,\"RingBuffer\",(function(){return i}))}])}));//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvcmluZy1idWZmZXItdHMvZGlzdC9pbmRleC5qcy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9yaW5nLWJ1ZmZlci10cy9kaXN0L2luZGV4LmpzPzY1NGMiXSwic291cmNlc0NvbnRlbnQiOlsiIWZ1bmN0aW9uKGUsdCl7aWYoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUpbW9kdWxlLmV4cG9ydHM9dCgpO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShbXSx0KTtlbHNle3ZhciByPXQoKTtmb3IodmFyIGkgaW4gcikoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHM/ZXhwb3J0czplKVtpXT1yW2ldfX0odGhpcywoZnVuY3Rpb24oKXtyZXR1cm4gZnVuY3Rpb24oZSl7dmFyIHQ9e307ZnVuY3Rpb24gcihpKXtpZih0W2ldKXJldHVybiB0W2ldLmV4cG9ydHM7dmFyIHM9dFtpXT17aTppLGw6ITEsZXhwb3J0czp7fX07cmV0dXJuIGVbaV0uY2FsbChzLmV4cG9ydHMscyxzLmV4cG9ydHMscikscy5sPSEwLHMuZXhwb3J0c31yZXR1cm4gci5tPWUsci5jPXQsci5kPWZ1bmN0aW9uKGUsdCxpKXtyLm8oZSx0KXx8T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsdCx7ZW51bWVyYWJsZTohMCxnZXQ6aX0pfSxyLnI9ZnVuY3Rpb24oZSl7XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLnRvU3RyaW5nVGFnJiZPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxTeW1ib2wudG9TdHJpbmdUYWcse3ZhbHVlOlwiTW9kdWxlXCJ9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KX0sci50PWZ1bmN0aW9uKGUsdCl7aWYoMSZ0JiYoZT1yKGUpKSw4JnQpcmV0dXJuIGU7aWYoNCZ0JiZcIm9iamVjdFwiPT10eXBlb2YgZSYmZSYmZS5fX2VzTW9kdWxlKXJldHVybiBlO3ZhciBpPU9iamVjdC5jcmVhdGUobnVsbCk7aWYoci5yKGkpLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpLFwiZGVmYXVsdFwiLHtlbnVtZXJhYmxlOiEwLHZhbHVlOmV9KSwyJnQmJlwic3RyaW5nXCIhPXR5cGVvZiBlKWZvcih2YXIgcyBpbiBlKXIuZChpLHMsZnVuY3Rpb24odCl7cmV0dXJuIGVbdF19LmJpbmQobnVsbCxzKSk7cmV0dXJuIGl9LHIubj1mdW5jdGlvbihlKXt2YXIgdD1lJiZlLl9fZXNNb2R1bGU/ZnVuY3Rpb24oKXtyZXR1cm4gZS5kZWZhdWx0fTpmdW5jdGlvbigpe3JldHVybiBlfTtyZXR1cm4gci5kKHQsXCJhXCIsdCksdH0sci5vPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlLHQpfSxyLnA9XCJcIixyKHIucz0wKX0oW2Z1bmN0aW9uKGUsdCxyKXtcInVzZSBzdHJpY3RcIjtyLnIodCk7Y2xhc3MgaXtjb25zdHJ1Y3RvcihlKXtpZih0aGlzLmJ1ZmZlcj1bXSx0aGlzLnBvcz0wLGU8MCl0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIlRoZSBzaXplIGRvZXMgbm90IGFsbG93IG5lZ2F0aXZlIHZhbHVlcy5cIik7dGhpcy5zaXplPWV9c3RhdGljIGZyb21BcnJheShlLHQ9MCl7Y29uc3Qgcj1uZXcgaSh0KTtyZXR1cm4gci5mcm9tQXJyYXkoZSwwPT09dCkscn1nZXRTaXplKCl7cmV0dXJuIHRoaXMuc2l6ZX1nZXRQb3MoKXtyZXR1cm4gdGhpcy5wb3N9Z2V0QnVmZmVyTGVuZ3RoKCl7cmV0dXJuIHRoaXMuYnVmZmVyLmxlbmd0aH1hZGQoLi4uZSl7ZS5mb3JFYWNoKGU9Pnt0aGlzLmJ1ZmZlclt0aGlzLnBvc109ZSx0aGlzLnBvcz0odGhpcy5wb3MrMSkldGhpcy5zaXplfSl9Z2V0KGUpe2lmKGU8MCYmKGUrPXRoaXMuYnVmZmVyLmxlbmd0aCksIShlPDB8fGU+dGhpcy5idWZmZXIubGVuZ3RoKSlyZXR1cm4gdGhpcy5idWZmZXIubGVuZ3RoPHRoaXMuc2l6ZT90aGlzLmJ1ZmZlcltlXTp0aGlzLmJ1ZmZlclsodGhpcy5wb3MrZSkldGhpcy5zaXplXX1nZXRGaXJzdCgpe3JldHVybiB0aGlzLmdldCgwKX1nZXRMYXN0KCl7cmV0dXJuIHRoaXMuZ2V0KC0xKX1yZW1vdmUoZSx0PTEpe2lmKGU8MCYmKGUrPXRoaXMuYnVmZmVyLmxlbmd0aCksZTwwfHxlPnRoaXMuYnVmZmVyLmxlbmd0aClyZXR1cm5bXTtjb25zdCByPXRoaXMudG9BcnJheSgpLGk9ci5zcGxpY2UoZSx0KTtyZXR1cm4gdGhpcy5mcm9tQXJyYXkociksaX1yZW1vdmVGaXJzdCgpe3JldHVybiB0aGlzLnJlbW92ZSgwKVswXX1yZW1vdmVMYXN0KCl7cmV0dXJuIHRoaXMucmVtb3ZlKC0xKVswXX10b0FycmF5KCl7cmV0dXJuIHRoaXMuYnVmZmVyLnNsaWNlKHRoaXMucG9zKS5jb25jYXQodGhpcy5idWZmZXIuc2xpY2UoMCx0aGlzLnBvcykpfWZyb21BcnJheShlLHQ9ITEpe2lmKCFBcnJheS5pc0FycmF5KGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnB1dCB2YWx1ZSBpcyBub3QgYW4gYXJyYXkuXCIpO3QmJnRoaXMucmVzaXplKGUubGVuZ3RoKSwwIT09dGhpcy5zaXplJiYodGhpcy5idWZmZXI9ZS5zbGljZSgtdGhpcy5zaXplKSx0aGlzLnBvcz10aGlzLmJ1ZmZlci5sZW5ndGgldGhpcy5zaXplKX1jbGVhcigpe3RoaXMuYnVmZmVyPVtdLHRoaXMucG9zPTB9cmVzaXplKGUpe2lmKGU8MCl0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIlRoZSBzaXplIGRvZXMgbm90IGFsbG93IG5lZ2F0aXZlIHZhbHVlcy5cIik7aWYoMD09PWUpdGhpcy5jbGVhcigpO2Vsc2UgaWYoZSE9PXRoaXMuc2l6ZSl7Y29uc3QgdD10aGlzLnRvQXJyYXkoKTt0aGlzLmZyb21BcnJheSh0LnNsaWNlKC1lKSksdGhpcy5wb3M9dGhpcy5idWZmZXIubGVuZ3RoJWV9dGhpcy5zaXplPWV9aXNGdWxsKCl7cmV0dXJuIHRoaXMuYnVmZmVyLmxlbmd0aD09PXRoaXMuc2l6ZX1pc0VtcHR5KCl7cmV0dXJuIDA9PT10aGlzLmJ1ZmZlci5sZW5ndGh9fXIuZCh0LFwiUmluZ0J1ZmZlclwiLChmdW5jdGlvbigpe3JldHVybiBpfSkpfV0pfSkpOyJdLCJtYXBwaW5ncyI6IkFBQUEiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./node_modules/ring-buffer-ts/dist/index.js\n");

/***/ }),

/***/ "./src/Enums.ts":
/*!**********************!*\
  !*** ./src/Enums.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nexports.MessageType = void 0;\nvar MessageType;\n(function (MessageType) {\n    MessageType[MessageType[\"InitializationRequest\"] = 0] = \"InitializationRequest\";\n    MessageType[MessageType[\"InitializationResponse\"] = 1] = \"InitializationResponse\";\n    MessageType[MessageType[\"DataRequest\"] = 2] = \"DataRequest\";\n    MessageType[MessageType[\"DataResponse\"] = 3] = \"DataResponse\";\n    MessageType[MessageType[\"SetLoopRequest\"] = 4] = \"SetLoopRequest\";\n    MessageType[MessageType[\"SetStartFrameRequest\"] = 5] = \"SetStartFrameRequest\";\n    MessageType[MessageType[\"SetEndFrameRequest\"] = 6] = \"SetEndFrameRequest\";\n})(MessageType = exports.MessageType || (exports.MessageType = {}));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvRW51bXMudHMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vc3JjL0VudW1zLnRzPzVlNjEiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gTWVzc2FnZVR5cGUge1xuICAgIEluaXRpYWxpemF0aW9uUmVxdWVzdCxcbiAgICBJbml0aWFsaXphdGlvblJlc3BvbnNlLFxuICAgIERhdGFSZXF1ZXN0LFxuICAgIERhdGFSZXNwb25zZSxcbiAgICBTZXRMb29wUmVxdWVzdCxcbiAgICBTZXRTdGFydEZyYW1lUmVxdWVzdCxcbiAgICBTZXRFbmRGcmFtZVJlcXVlc3QsXG59XG5cbiJdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Iiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/Enums.ts\n");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst ring_buffer_ts_1 = __webpack_require__(/*! ring-buffer-ts */ \"./node_modules/ring-buffer-ts/dist/index.js\");\nconst Enums_1 = __webpack_require__(/*! ./Enums */ \"./src/Enums.ts\");\nlet fileHeader;\nlet filePath;\n// let fileReadStream: ReadStream;\nlet isInitialized = false;\nconst bufferSize = 100;\nconst ringBuffer = new ring_buffer_ts_1.RingBuffer(bufferSize);\nlet tempBufferObject;\nlet startFrame = 0;\nlet endFrame = 0;\nlet loop = true;\nlet message;\n// var ctx = self;\n// ctx.addEventListener('message', function (event) {\n//   console.log('Inside worker of bundler');\n//   console.log(event);\n//   ctx.postMessage('Hello');\n// });\nself.addEventListener('message', (event) => {\n    console.log('34', event.data.type);\n    const data = event.data.data;\n    switch (data.type) {\n        case Enums_1.MessageType.InitializationResponse:\n            initialize(data);\n            break;\n        case Enums_1.MessageType.DataRequest:\n            fetch(data);\n            break;\n        case Enums_1.MessageType.SetLoopRequest:\n            loop = data.value;\n            break;\n        case Enums_1.MessageType.SetStartFrameRequest:\n            startFrame = data.values.startFrame;\n            break;\n        case Enums_1.MessageType.SetEndFrameRequest:\n            endFrame = data.values.endFrame;\n            break;\n        default:\n            console.error(data.action + ' was not understood by the worker');\n    }\n});\nfunction initialize(data) {\n    console.log('59', data);\n    if (isInitialized)\n        return console.error('Worker has already been initialized for file ' + data.filePath);\n    isInitialized = true;\n    fileHeader = data.fileHeader;\n    filePath = data.filePath;\n    endFrame = data.endFrame;\n    startFrame = data.startFrame;\n    loop = data.loop;\n    // Create readstream starting from after the file header and long\n    // fileReadStream = new ReadStream(filePath, { start: data.readStreamOffset })\n    postMessage({\n        type: Enums_1.MessageType.InitializationResponse,\n        isInitialized: isInitialized,\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvaW5kZXgudHMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vc3JjL2luZGV4LnRzP2M2YWUiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0IFJlYWRTdHJlYW0gZnJvbSAnZnMtcmVhZHN0cmVhbS1zZWVrJztcbi8vIGltcG9ydCAqIGFzIHBhdGhUb1JlZ0V4cCBmcm9tICdwYXRoLXRvLXJlZ2V4cCc7XG5pbXBvcnQge1xuICBJRmlsZUhlYWRlcixcbiAgV29ya2VyRGF0YVJlcXVlc3QsXG4gIElCdWZmZXIsXG4gIFdvcmtlckRhdGFSZXNwb25zZSxcbiAgV29ya2VySW5pdGlhbGl6YXRpb25SZXNwb25zZSxcbiAgV29ya2VySW5pdGlhbGl6YXRpb25SZXF1ZXN0LFxufSBmcm9tICcuL0ludGVyZmFjZXMnO1xuaW1wb3J0IHsgUmluZ0J1ZmZlciB9IGZyb20gJ3JpbmctYnVmZmVyLXRzJztcbmltcG9ydCB7IE1lc3NhZ2VUeXBlIH0gZnJvbSAnLi9FbnVtcyc7XG5cbmxldCBmaWxlSGVhZGVyOiBJRmlsZUhlYWRlcjtcbmxldCBmaWxlUGF0aDogc3RyaW5nO1xuLy8gbGV0IGZpbGVSZWFkU3RyZWFtOiBSZWFkU3RyZWFtO1xubGV0IGlzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbmNvbnN0IGJ1ZmZlclNpemUgPSAxMDA7XG5jb25zdCByaW5nQnVmZmVyID0gbmV3IFJpbmdCdWZmZXI8SUJ1ZmZlcj4oYnVmZmVyU2l6ZSk7XG5sZXQgdGVtcEJ1ZmZlck9iamVjdDogSUJ1ZmZlcjtcblxubGV0IHN0YXJ0RnJhbWUgPSAwO1xubGV0IGVuZEZyYW1lID0gMDtcbmxldCBsb29wID0gdHJ1ZTtcbmxldCBtZXNzYWdlOiBXb3JrZXJEYXRhUmVzcG9uc2U7XG5cbi8vIHZhciBjdHggPSBzZWxmO1xuLy8gY3R4LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbi8vICAgY29uc29sZS5sb2coJ0luc2lkZSB3b3JrZXIgb2YgYnVuZGxlcicpO1xuLy8gICBjb25zb2xlLmxvZyhldmVudCk7XG4vLyAgIGN0eC5wb3N0TWVzc2FnZSgnSGVsbG8nKTtcbi8vIH0pO1xuXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgY29uc29sZS5sb2coJzM0JywgKDxhbnk+ZXZlbnQpLmRhdGEudHlwZSk7XG4gIGNvbnN0IGRhdGEgPSAoPGFueT5ldmVudCkuZGF0YS5kYXRhO1xuICBzd2l0Y2ggKGRhdGEudHlwZSkge1xuICAgIGNhc2UgTWVzc2FnZVR5cGUuSW5pdGlhbGl6YXRpb25SZXNwb25zZTpcbiAgICAgIGluaXRpYWxpemUoZGF0YSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIE1lc3NhZ2VUeXBlLkRhdGFSZXF1ZXN0OlxuICAgICAgZmV0Y2goZGF0YSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIE1lc3NhZ2VUeXBlLlNldExvb3BSZXF1ZXN0OlxuICAgICAgbG9vcCA9IGRhdGEudmFsdWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIE1lc3NhZ2VUeXBlLlNldFN0YXJ0RnJhbWVSZXF1ZXN0OlxuICAgICAgc3RhcnRGcmFtZSA9IGRhdGEudmFsdWVzLnN0YXJ0RnJhbWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIE1lc3NhZ2VUeXBlLlNldEVuZEZyYW1lUmVxdWVzdDpcbiAgICAgIGVuZEZyYW1lID0gZGF0YS52YWx1ZXMuZW5kRnJhbWU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5lcnJvcihkYXRhLmFjdGlvbiArICcgd2FzIG5vdCB1bmRlcnN0b29kIGJ5IHRoZSB3b3JrZXInKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGluaXRpYWxpemUoZGF0YTogV29ya2VySW5pdGlhbGl6YXRpb25SZXF1ZXN0KTogdm9pZCB7XG4gIGNvbnNvbGUubG9nKCc1OScsIGRhdGEpO1xuICBpZiAoaXNJbml0aWFsaXplZClcbiAgICByZXR1cm4gY29uc29sZS5lcnJvcihcbiAgICAgICdXb3JrZXIgaGFzIGFscmVhZHkgYmVlbiBpbml0aWFsaXplZCBmb3IgZmlsZSAnICsgZGF0YS5maWxlUGF0aFxuICAgICk7XG5cbiAgaXNJbml0aWFsaXplZCA9IHRydWU7XG4gIGZpbGVIZWFkZXIgPSBkYXRhLmZpbGVIZWFkZXI7XG4gIGZpbGVQYXRoID0gZGF0YS5maWxlUGF0aDtcbiAgZW5kRnJhbWUgPSBkYXRhLmVuZEZyYW1lO1xuICBzdGFydEZyYW1lID0gZGF0YS5zdGFydEZyYW1lO1xuICBsb29wID0gZGF0YS5sb29wO1xuICAvLyBDcmVhdGUgcmVhZHN0cmVhbSBzdGFydGluZyBmcm9tIGFmdGVyIHRoZSBmaWxlIGhlYWRlciBhbmQgbG9uZ1xuICAvLyBmaWxlUmVhZFN0cmVhbSA9IG5ldyBSZWFkU3RyZWFtKGZpbGVQYXRoLCB7IHN0YXJ0OiBkYXRhLnJlYWRTdHJlYW1PZmZzZXQgfSlcblxuICBwb3N0TWVzc2FnZSh7XG4gICAgdHlwZTogTWVzc2FnZVR5cGUuSW5pdGlhbGl6YXRpb25SZXNwb25zZSxcbiAgICBpc0luaXRpYWxpemVkOiBpc0luaXRpYWxpemVkLFxuICB9IGFzIFdvcmtlckluaXRpYWxpemF0aW9uUmVzcG9uc2UpO1xufVxuIl0sIm1hcHBpbmdzIjoiOztBQVVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Iiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/index.ts\n");

/***/ })

/******/ });