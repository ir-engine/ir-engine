
/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/


/**
 * @author mrdoob / http://mrdoob.com/
 */

var Stats = function () {

    var mode = 0;

    var container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
    // container.addEventListener('click', function (event) {

    //     event.preventDefault();
    //     showPanel(++mode % container.children.length);

    // }, false);

    //

    function addPanel(panel) {

        container.appendChild(panel.dom);
        return panel;

    }

    function showPanel(id) {

        for (var i = 0; i < container.children.length; i++) {

            container.children[i].style.display = i === id ? 'block' : 'none';

        }

        mode = id;

    }

    //

    var beginTime = (performance || Date).now(), prevTime = beginTime, frames = 0;

    var fpsPanel = addPanel(new Stats.Panel('FPS', '#0ff', '#002'));
    var msPanel = addPanel(new Stats.Panel('MS', '#0f0', '#020'));

    if (self.performance && self.performance.memory) {

        var memPanel = addPanel(new Stats.Panel('MB', '#f08', '#201'));

    }

    showPanel(0);

    return {

        REVISION: 16,

        dom: container,

        addPanel: addPanel,
        showPanel: showPanel,

        begin: function () {

            beginTime = (performance || Date).now();

        },

        end: function () {

            frames++;

            var time = (performance || Date).now();

            msPanel.update(time - beginTime, 200);

            if (time >= prevTime + 1000) {

                fpsPanel.update((frames * 1000) / (time - prevTime), 100);

                prevTime = time;
                frames = 0;

                if (memPanel) {

                    var memory = performance.memory;
                    memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);

                }

            }

            return time;

        },

        update: function () {

            beginTime = this.end();

        },

        // Backwards Compatibility

        domElement: container,
        setMode: showPanel

    };

};

Stats.Panel = function (name, fg, bg) {

    var min = Infinity, max = 0, round = Math.round;
    var PR = round(window.devicePixelRatio || 1);

    var WIDTH = 80 * PR, HEIGHT = 48 * PR,
        TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
        GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
        GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

    var canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = 'width:80px;height:48px';

    var context = canvas.getContext('2d');
    context.font = 'bold ' + (9 * PR) + 'px Helvetica,Arial,sans-serif';
    context.textBaseline = 'top';

    context.fillStyle = bg;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = fg;
    context.fillText(name, TEXT_X, TEXT_Y);
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

    context.fillStyle = bg;
    context.globalAlpha = 0.9;
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

    return {

        dom: canvas,

        update: function (value, maxValue) {

            min = Math.min(min, value);
            max = Math.max(max, value);

            context.fillStyle = bg;
            context.globalAlpha = 1;
            context.fillRect(0, 0, WIDTH, GRAPH_Y);
            context.fillStyle = fg;
            context.fillText(round(value) + ' ' + name + ' (' + round(min) + '-' + round(max) + ')', TEXT_X, TEXT_Y);

            context.drawImage(canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT);

            context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);

            context.fillStyle = bg;
            context.globalAlpha = 0.9;
            context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round((1 - (value / maxValue)) * GRAPH_HEIGHT));

        }

    };

};

export { Stats as default };