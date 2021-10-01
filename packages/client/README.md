[![Build Status](https://travis-ci.org/xrengine/xrengine.svg?branch=master)](https://travis-ci.org/xrengine/xrengine)
# XREngine Client
## About

XREngine is an end-to-end solution for hosting humans and non-humans in a virtual space. This project would literally not be possible without the community contributions of Mozilla Hubs, Janus VR, Avaer + Exokit, Mr Doob, Hayden James Lee and many others.

Our goal is an easy-to-use, well documented, end-to-end Javascript (or Typescript) exprience that anyone with a little bit of Javascript and HTML knowledge can dig into, deploy and make meaningful modifications and contributions to. If you fit this category and you are struggling with any aspect of getting started, we want to hear fromm you so that this can be a better exprience.

XREngine is a free, open source, MIT-licensed project. You are welcome to do anything you want with it. We hope that you use it to make something beautiful.

This is the client portion of XREngine. To deploy everything at once with Kubernetes or Docker Compose, check out the branches in xrengine-ops. Or you can start the server with NPM (check out scripts/start-db.sh to get the database runnning), run the xrengine client and everything should connect out of the box.

## Getting Started

To run

```
npm install
npm run build
npm run dev
```

## config file

### xr

#### networked-scene

properties for the [NAF](https://github.com/networked-aframe/networked-aframe) networked-scene component

- **app** unique app name (no spaces)
- **room** name of initial room
- **audio** set true to enable audio streaming (if using an adapter that supports it)
- **adapter** which network service to use
- **serverURL** where the WebSocket / signalling server is located

#### avatar

- **defaultAvatarModelSrc** gltf for the default avatar
- **defaultAvatarModelScale** scale for the default avatar

#### environment

##### floor

- **src** source for the floor texture
- **height** height(length) of the floor
- **width** width of the floor

##### skybox

- **src** source for the skybox texture
- **height** height(length) of the skybox texture
- **width** width of the skybox texture
- **radius** radius of the skybox
- **rotation** x,y,z rotation of the skybox
- **thetaLength** [skybox's](https://aframe.io/docs/master/primitives/a-sky.html) [vertical sweep angle size](https://threejs.org/docs/index.html#api/en/geometries/SphereBufferGeometry) in degrees

## Docker

You can run it using docker, if you don't have node installed or need to test.
``` bash
# Build the image
docker build --tag xrengine .

# Run the image (deletes itself when you close it)
docker run -d --rm --name client -e "NEXT_PUBLIC_API_SERVER=https://127.0.0.1:3030" -p "3030:3030"  xrengine

# Stop the server
docker stop client
```

### Docker image configurations

This image uses build-time arguments, they are not used during runtime yet

- `NODE_ENV` controls the config/*.js file to load and build against [default: production]
- `NEXT_PUBLIC_API_SERVER` points to an instance of the xrengine [default: https://127.0.0.1:3030]


## Redux store management

We are putting Redux actions into redux folder.

There are following files.

actions.ts          : In this file, we are defining all actions which is using this app.

feathers.ts         : In this file, we defined the feathers app.
                      You don't need to change this file.
                      You can set the `featherStoreKey` from `/config/server.ts` for the storage key of the feathers.

persisted.store.ts  : In this file, we synchronize store varialble with local storage.
                      You don't need to change this file.
                      You can set `localStorageKey` from `/config/server.ts` for the redux store key.

reducers            : In this file, we are defining all reducers.
                      Once you add a new reducer, please add that under the line `auth: authReducer`.
                      If you don't add the reducer into this, you can't dispatch actions you added.

service.common.ts   : In this file, we are defining utility functions which are commonly used.

store.ts            : In this file, we defined Redux store.

auth/actions.ts     : In this file, we defined authentication actions.

auth/reducers.ts    : In this file, we defined AuthState and action process routines.

auth/services.ts    : In this file, we defined service function for authorization.

auth/selector.ts    : In this file, we defined state selector for AuthState.

### How to use Redux.

```
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { 
  loginUserByPassword,
} from '@xrengine/client-core/redux/auth/service'
import { selectAuthState } from '@xrengine/client-core/redux/auth/selector'

...

interface Props {
  auth: any,
  loginUserByPassword: typeof loginUserByPassword
}

const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state),   // fetch authState from store.
                                    // Note: `state` and `auth` is Immutable variable.
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  loginUserByPassword: bindActionCreators(loginUserByPassword, dispatch)  // Mapping service to props
})

...

class Login extends React.Component<LoginProps> {
...
    handleEmailLogin = (e: any): void => {
        // call service which is mapping with redux.
        this.props.loginUserByPassword({
            email: this.state.email,
            password: this.state.password
        })
  }
...
}

...

// we should connect Redux and Component like as following.
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)

```

### Tutorial for Redux store.

Let's explain step by step about the login process.
1. We should declare `LOGIN_USER_SUCCESS` and `LOGIN_USER_ERROR` actions.
    Add following lines in `/redux/actions.ts`.
    ```
    export const LOGIN_USER_SUCCESS = 'LOGIN_USER_SUCCESS'
    export const LOGIN_USER_ERROR = 'LOGIN_USER_ERROR'
    ```
2. We should define actions && reducers && services.
    - Create the `auth` folder in `/redux` folder.
    - Add the `actions.ts` file in `/redux/auth` folder.
    - Add the following codes in `actions.ts` file.
    ```
    import {
        LOGIN_USER_BY_GITHUB_ERROR,
        LOGIN_USER_BY_GITHUB_SUCCESS
    } from '../actions'

    export function loginUserSuccess(user: any): any {
        return {
            type: LOGIN_USER_SUCCESS,
            user,
            message: ''
        }
    }

    export function loginUserError(err: string): any {
        return {
            type: LOGIN_USER_ERROR,
            message: err
        }
    }
    ```
    - Add the `reducers.ts` file in `/redux/auth` folder.
    - Add the following codes in `reducers.ts` 
    ```
    import Immutable from 'immutable'
    import { 
        LOGIN_USER_SUCCESS,
        LOGIN_USER_ERROR
    } from "../actions"

    export const initialAuthState: AuthState = {
        isLoggedIn: false,
        user: undefined,
        error: '',

        isProcessing: false
    }

    // Note: In next.js, we should use Immutable variable for state type.
    const immutableState = Immutable.fromJS(    export const initialAuthState: AuthState = {
)

    const authReducer = (state = immutableState, action: any): any => {
        switch(action.type) {
            case LOGIN_USER_SUCCESS:
                return state
                    .set('isLoggedIn', true)
                    .set('user', (action as LoginResultAction).user)
            case LOGIN_USER_ERROR:
                return state
                    .set('error', (action as LoginResultAction).message)
        }

        return state
    }

    export default authReducer
    ```
    - Add the `selector.ts` file in `/redux/auth` folder.
    ```
    import { createSelector } from 'reselect'

    // Note: 'auth' is the state key so you can change this whatever you want.
    const selectState = (state: any): any => state.get('auth')
    export const selectAuthState = createSelector([selectState], (auth) => auth)

    ```
    - Add the `service.ts` file in `/redux/auth` folder.
    ```
    ...

    export function loginUserByPassword(form: any) {
        return (dispatch: Dispatch): any => {
            dispatch(actionProcessing(true))

            client.authenticate({
                strategy: 'local',
                email: form.email,
                password: form.password
            })
            .then((res: any) => {
            const val = res as AuthUser
            if (!val.user.isVerified) {
                client.logout()
                return dispatch(loginUserError('Unverified user'))
            }
            return dispatch(loginUserSuccess(val))
            })
            .catch(() => dispatch(loginUserError('Failed to login')))
            .finally( ()=> dispatch(actionProcessing(false)))
        }
    }
    ```

    - Add the following codes in `/redux/reducers.ts` file to combine reducers.
    ```
    import { combineReducers } from 'redux-immutable'
    import authReducer from './auth/reducers'

    export default combineReducers({
        auth: authReducer
    })
    ```

3. How to use the Redux store and services in Component.
   Please refer `How to use Redux` section.



### How to access detected device and if WebXR is supported:

```
import { connect } from 'react-redux'
import { detectDeviceType } from '@xrengine/client-core/redux/devicedetect/service'
import { bindActionCreators, Dispatch } from 'redux'
import { selectDeviceDetectState } from '@xrengine/client-core/redux/devicedetect/selector'

...

interface Props {
  deviceInfo: any
}

const mapStateToProps = (state: any): any => {
  return {
    deviceInfo: selectDeviceDetectState(state),
  }
}

...

class Login extends React.Component<Props> {
...
    //this.props.deviceInfo.get('isDetected') -> it will tell us that whether the device is detected or not.
    //this.props.deviceInfo.get('isDetected') -> returns true always because it is dispatched in _app.tsx
    //this.props.deviceInfo.get('content') -> it will return the entire object with the following content in it
    <!-- {
        WebXRSupported: true,
        device: {
            "client": {
                "type": "browser",
                "name": "Chrome",
                "version": "69.0",
                "engine": "Blink",
                "engineVersion": ""
            },
            "os": {
                "name": "Mac",
                "version": "10.13",
                "platform": ""
            },
            "device": {
                "type": "desktop",
                "brand": "Apple",
                "model": ""
            },
            "bot": null
        }
    } -->
    

...
}

...

// we should connect Redux and Component like as following.
export default connect(
  mapStateToProps
)(Login)

//No need to dispatch, as it is already being dispatched from _app.tsx
//If needed, just in case, then dispatch the 'detectDeviceType' service that is imported above by using mapDispatchToProps, bindActionCreator and Dispatch
//example
<!-- const mapDispatchToProps = (dispatch: Dispatch): any => ({
  detectDeviceType: bindActionCreators(detectDeviceType(arg), dispatch)
}) -->
//detectDeviceType(arg) takes an argument of type 'any' which is object containing device information
//Don't forget to change the Props interface
<!-- interface Props {
  deviceInfo: any
  detectDeviceType: typeof detectDeviceType
} -->
//lastly add mapDispatchToProps in the connect argument.
```