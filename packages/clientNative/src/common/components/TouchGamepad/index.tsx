/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react';
import {Pressable, StyleSheet, Text, ViewStyle} from 'react-native';

// import {AppState} from '../../services/AppService';
// import styles from './index.module.scss';

const handleMove = (e: {x: number; y: number}) => {
  window.dispatchEvent('touchstickmove', {
    detail: {
      stick: 'LeftStick',
      value: {x: e.x, y: e.y ? -e.y : 0, angleRad: 0},
    },
  });
};

const handleStop = () => {
  window.dispatchEvent('touchstickmove', {
    detail: {stick: 'LeftStick', value: {x: 0, y: 0, angleRad: 0}},
  });
};

const moveUp = handleMove.bind(null, {x: 0, y: 0.5});
const moveDown = handleMove.bind(null, {x: 0, y: -0.5});
const moveLeft = handleMove.bind(null, {x: -0.5, y: 0});
const moveRight = handleMove.bind(null, {x: 0.5, y: 0});

export const TouchGamepad = () => {
  return (
    <>
      <Pressable onPressIn={moveUp} onPressOut={handleStop} style={styles.up}>
        <Text>W</Text>
      </Pressable>
      <Pressable
        onPressIn={moveLeft}
        onPressOut={handleStop}
        style={styles.left}>
        <Text>A</Text>
      </Pressable>
      <Pressable
        onPressIn={moveDown}
        onPressOut={handleStop}
        style={styles.down}>
        <Text>S</Text>
      </Pressable>
      <Pressable
        onPressIn={moveRight}
        onPressOut={handleStop}
        style={styles.right}>
        <Text>D</Text>
      </Pressable>
    </>
  );
};

const BUTTON_SIZE = 40;
const X_OFFSET = 10;

const buttonStyle: ViewStyle = {
  position: 'absolute',
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  zIndex: 2,
  backgroundColor: 'rgba(200, 200, 200, 0.7)',
  borderRadius: '50%',
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const styles = StyleSheet.create({
  up: {
    ...buttonStyle,
    top: 0,
    left: BUTTON_SIZE + X_OFFSET,
  },
  left: {
    ...buttonStyle,
    top: BUTTON_SIZE,
    left: X_OFFSET,
  },
  right: {
    ...buttonStyle,
    top: BUTTON_SIZE,
    left: BUTTON_SIZE * 2 + X_OFFSET,
  },
  down: {
    ...buttonStyle,
    top: BUTTON_SIZE * 2,
    left: BUTTON_SIZE + X_OFFSET,
  },
});
