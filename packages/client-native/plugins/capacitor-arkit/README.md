# capacitor-arkit

## Supported Platforms

- iOS

## Installation

    cordova plugin add https://github.com/xr3ngine/capacitor-arkit

Add the following lines into your config.xml in the platform tag.
```xml
<platform name="ios">
  <preference name="UseSwiftLanguageVersion" value="4.2" />
</platform>
```

## Methods

- com.xr3ngine.arkit.addARView
- com.xr3ngine.arkit.removeARView
- com.xr3ngine.arkit.setListenerForArChanges
- com.xr3ngine.arkit.reloadSession

### addARView

Insert the camera view under the WebView

```js
com.xr3ngine.arkit.addARView();
```

### removeARView

Remove the camera view

```js
com.xr3ngine.arkit.removeARView();
```

### setListenerForArChanges

Set listener for event from ARKit

##### Parameters

| Parameter        | Type       | Description                                |
| ---------------- | ---------- | ------------------------------------------ |
| `arHandler`      | `Function` | Is called after initializing an AR session |

##### Callback parameters

`arHandler`

| Parameter  | Type      | Description                         |
| ---------- | --------- | ----------------------------------- |
|   `str`    | `String`  | Line with camera change information. <br> Format: `positionX, positionY, positionZ, quatirionX, quatirionY, quatirionZ, quatirionW` |


```js
com.xr3ngine.arkit.setListenerForArChanges((str) => {});
```

### reloadSession

Reload AR session

```js
com.xr3ngine.arkit.reloadSession();
```
