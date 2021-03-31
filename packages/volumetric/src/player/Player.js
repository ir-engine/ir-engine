/*

usage:

p = newer({
  useWorker: <bool>,
  workerFile: <defaults to "Decoder.js"> // give path to Decoder.js
  webgl: true | false | "auto" // defaults to "auto"
});

// canvas property represents the canvas node
// put it somewhere in the dom
p.canvas;

p.webgl; // contains the used rendering mode. if you pass auto to webgl you can see what auto detection resulted in

p.decode(<binary>);

*/



// universal module definition
export default (function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(["./Decoder", "./YUVCanvas"], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        // module.exports = factory(require("./Decoder.js"), require("./YUVCanvas.js"));
    } else {
        // Browser globals (root is window)
        root.Player = factory(root.Decoder, root.YUVCanvas);
    }
})((typeof window != "undefined") ? window : this, function (Decoder, WebGLCanvas) {
    "use strict";
    console.log("PLAYER INITIALIZED");

    var nowValue = Decoder.nowValue;


    var Player = function (parOptions) {
        var self = this;
        this._config = parOptions || {};

        this.render = true;
        if (this._config.render === false) {
            this.render = false;
        };

        this.nowValue = nowValue;

        this._config.workerFile = this._config.workerFile || "Decoder.js";
        if (this._config.preserveDrawingBuffer) {
            this._config.contextOptions = this._config.contextOptions || {};
            this._config.contextOptions.preserveDrawingBuffer = true;
        };

        var webgl = "auto";
        if (this._config.webgl === true) {
            webgl = true;
        } else if (this._config.webgl === false) {
            webgl = false;
        };

        if (webgl == "auto") {
            webgl = true;
            try {
                if (!window.WebGLRenderingContext) {
                    // the browser doesn't even know what WebGL is
                    webgl = false;
                } else {
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext("webgl");
                    if (!ctx) {
                        // browser supports WebGL but initialization failed.
                        webgl = false;
                    };
                };
            } catch (e) {
                webgl = false;
            };
        };

        this.webgl = webgl;

        // choose functions
        if (this.webgl) {
            this.createCanvasObj = this.createCanvasWebGL;
            this.renderFrame = this.renderFrameWebGL;
        } else {
            this.createCanvasObj = this.createCanvasRGB;
            this.renderFrame = this.renderFrameRGB;
        };


        var lastWidth;
        var lastHeight;
        var onPictureDecoded = function (buffer, width, height, infos) {

            document.dispatchEvent(window.broadway_video_started_event);
            document.getElementById("poster").setAttribute('style', "display: none;");

            if (((window.StartTimeDuration === undefined) || (window.StartTimeDuration === null)) && (!window.player_pause)) {
                window.StartTimeDuration = Date.now();
            }

            if ((window.VideoFramesCounter === null) || (window.VideoFramesCounter === undefined)) {
                window.VideoFramesCounter = 0;
            }
            
            window.VideoFramesCounter++;

            self.onPictureDecoded(buffer, width, height, infos);

            var startTime = nowValue();

            var startRenderTime = Date.now();
            

            if ((window.PrevStartTime === null) || (window.PrevStartTime === undefined)) {
                window.PrevStartTime = window.StartTimeDuration;
            }
            window.TimeDuration += (startRenderTime - window.PrevStartTime);

            var diff = startRenderTime - window.PrevStartTime;

            var msPerItem = window.VideoTotalTime * 1000 / window.VideoFramesCount;

            if (window.VideoFramesCount <= window.VideoFramesCounter) {
                // target can be any Element or other EventTarget.
                document.dispatchEvent(window.broadway_video_ended_event);
            }
            
            if (diff > (msPerItem)) {
                diff = 0; //0; //msPerItem/2 //1000 / window.VideoTimeScale;
            } else {
                diff = msPerItem - diff;
            }
            window.TimeDuration2 = window.TimeDuration2 + diff;

            window.CurrentFrameCount++;
            var needToBeTime = (window.VideoFramesCounter - 1) * (window.VideoTotalTime * 1000 / window.VideoFramesCount);
            if (needToBeTime === 0) {
                needToBeTime = msPerItem;
            }

            if (needToBeTime > startRenderTime - window.StartTimeDuration) {
                diff = needToBeTime - (startRenderTime - window.StartTimeDuration);
            }

            if (!buffer || !self.render) {
                return;
            };

            self.renderFrame({
                canvasObj: self.canvasObj,
                data: buffer,
                width: width,
                height: height
            });

            window.PrevStartTime = Date.now();

            setTimeout(function () {
                
                window.PictureWorks = false;
            }.bind(self), diff);


            if (self.onRenderFrameComplete) {
                self.onRenderFrameComplete({
                    data: buffer,
                    width: width,
                    height: height,
                    infos: infos,
                    canvasObj: self.canvasObj
                });
            };


        };

        // provide size

        if (!this._config.size) {
            this._config.size = {};
        };
        this._config.size.width = this._config.size.width || 200;
        this._config.size.height = this._config.size.height || 200;

        if (this._config.useWorker) {
            var worker = new Worker(this._config.workerFile);
            this.worker = worker;

            window.PictureWorks = false;
            window.PictureBuffer = [];
            window.TimeDuration = 0;
            window.TimeDuration2 = 0;
            window.CurrentFrameCount = 0;
          
            setInterval(function () {
                
                if ((window.PictureBuffer === null) || (window.PictureBuffer === undefined)) {
                    window.PictureBuffer = [];
                }

                if ((window.PictureWorks === null) || (window.PictureWorks === undefined) || (window.PictureWorks === false)) {
                    if (!window.player_pause) {
                        if (window.PictureBuffer.length > 0) {
                            window.PictureWorks = true;
                            var data2 = window.PictureBuffer.shift(); ///shift();
                            try {
                                onPictureDecoded.call(self, new Uint8Array(data2.buf, 0, data2.length), data2.width, data2.height, data2.infos);
                            } catch (ex) {
                            }
                        }
                    } else {
                        window.PictureWorks = true;
                        window.PrevStartTime = Date.now();
                    }
                }
            }, 1);

            worker.addEventListener('message', function (e) {
                var data = e.data;
                if (data.consoleLog) {
                    console.log(data.consoleLog);
                    return;
                };

                if ((window.PictureBuffer === null) || (window.PictureBuffer === undefined)) {
                    window.PictureBuffer = [];
                }

                window.startRenderTime = Date.now();

                if ((window.PictureWorks === null) || (window.PictureWorks === undefined) || (window.PictureWorks === false)) {
                    if (window.PictureBuffer.length > 0) {
                        window.PictureBuffer.push(data);
                    } else {
                        window.PictureWorks = true;
                        onPictureDecoded.call(self, new Uint8Array(data.buf, 0, data.length), data.width, data.height, data.infos);
                    }
                } else {
                    window.PictureBuffer.push(data);
                }
            }, false);

            worker.postMessage({
                type: "Broadway.js - Worker init", options: {
                    rgb: !webgl,
                    memsize: this.memsize,
                    reuseMemory: this._config.reuseMemory ? true : false
                }
            });

            if (this._config.transferMemory) {
                this.decode = function (parData, parInfo) {
                    // no copy
                    // instead we are transfering the ownership of the buffer
                    // dangerous!!!

                    worker.postMessage({ buf: parData.buffer, offset: parData.byteOffset, length: parData.length, info: parInfo }, [parData.buffer]); // Send data to our worker.
                };

            } else {
                this.decode = function (parData, parInfo) {
                    // Copy the sample so that we only do a structured clone of the
                    // region of interest
                    var copyU8 = new Uint8Array(parData.length);
                    copyU8.set(parData, 0, parData.length);
                    worker.postMessage({ buf: copyU8.buffer, offset: 0, length: parData.length, info: parInfo }, [copyU8.buffer]); // Send data to our worker.
                };

            };

            if (this._config.reuseMemory) {
                this.recycleMemory = function (parArray) {
                    //this.beforeRecycle();
                    worker.postMessage({ reuse: parArray.buffer }, [parArray.buffer]); // Send data to our worker.
                    //this.afterRecycle();
                };
            }

        } else {

            this.decoder = new Decoder({
                rgb: !webgl
            });
            this.decoder.onPictureDecoded = onPictureDecoded;

            this.decode = function (parData, parInfo) {
                self.decoder.decode(parData, parInfo);
            };

        };



        if (this.render) {
            this.canvasObj = this.createCanvasObj({
                contextOptions: this._config.contextOptions
            });
            this.canvas = this.canvasObj.canvas;
        };

        this.domNode = this.canvas;

        lastWidth = this._config.size.width;
        lastHeight = this._config.size.height;

    };

    Player.prototype = {

        onPictureDecoded: function (buffer, width, height, infos) { },

        // call when memory of decoded frames is not used anymore
        recycleMemory: function (buf) {
        },
        /*beforeRecycle: function(){},
        afterRecycle: function(){},*/

        // for both functions options is:
        //
        //  width
        //  height
        //  enableScreenshot
        //
        // returns a object that has a property canvas which is a html5 canvas
        createCanvasWebGL: function (options) {
            var canvasObj = this._createBasicCanvasObj(options);
            canvasObj.contextOptions = options.contextOptions;
            return canvasObj;
        },

        createCanvasRGB: function (options) {
            var canvasObj = this._createBasicCanvasObj(options);
            return canvasObj;
        },

        // part that is the same for webGL and RGB
        _createBasicCanvasObj: function (options) {
            options = options || {};

            var obj = {};
            var width = options.width;
            if (!width) {
                width = this._config.size.width;
            };
            var height = options.height;
            if (!height) {
                height = this._config.size.height;
            };
            obj.canvas = document.createElement('canvas');
            obj.canvas.width = width;
            obj.canvas.height = height;
            obj.canvas.style.backgroundColor = "#0D0E1B";


            return obj;
        },

        // options:
        //
        // canvas
        // data
        renderFrameWebGL: function (options) {

            var canvasObj = options.canvasObj;

            var width = options.width || canvasObj.canvas.width;
            var height = options.height || canvasObj.canvas.height;

            if (canvasObj.canvas.width !== width || canvasObj.canvas.height !== height || !canvasObj.webGLCanvas) {
                canvasObj.canvas.width = width;
                canvasObj.canvas.height = height;
                canvasObj.webGLCanvas = new WebGLCanvas({
                    canvas: canvasObj.canvas,
                    contextOptions: canvasObj.contextOptions,
                    width: width,
                    height: height
                });
            };

            var ylen = width * height;
            var uvlen = (width / 2) * (height / 2);

            canvasObj.webGLCanvas.drawNextOutputPicture({
                yData: options.data.subarray(0, ylen),
                uData: options.data.subarray(ylen, ylen + uvlen),
                vData: options.data.subarray(ylen + uvlen, ylen + uvlen + uvlen)
            });

            var self = this;
            self.recycleMemory(options.data);

        },
        renderFrameRGB: function (options) {
            var canvasObj = options.canvasObj;

            var width = options.width || canvasObj.canvas.width;
            var height = options.height || canvasObj.canvas.height;

            if (canvasObj.canvas.width !== width || canvasObj.canvas.height !== height) {
                canvasObj.canvas.width = width;
                canvasObj.canvas.height = height;
            };

            var ctx = canvasObj.ctx;
            var imgData = canvasObj.imgData;

            if (!ctx) {
                canvasObj.ctx = canvasObj.canvas.getContext('2d');
                ctx = canvasObj.ctx;

                canvasObj.imgData = ctx.createImageData(width, height);
                imgData = canvasObj.imgData;
            };

            imgData.data.set(options.data);
            ctx.putImageData(imgData, 0, 0);

            var self = this;
            self.recycleMemory(options.data);
        }

    };

    return Player;

});

