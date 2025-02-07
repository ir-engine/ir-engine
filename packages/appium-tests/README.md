### Appium setup

1. Install Appium

```
npm i --location=global appium
```

2. Install the xcuitest driver for Appium

This allows Appium to run tests on an iOS device

```
appium driver install xcuitest
```

3. Run appium driver doctor to ensure that all dependencies are installed

```
appium driver doctor xcuitest
```

4. (Optional) Install the uiautomator2 driver for Appium

This allows Appium to run tests on an Android device. Android is not fully supported, but there is only iOS specific appium code in the xcode instruments profiling benchmarks.

```
appium driver install uiautomator2
appium driver doctor uiautomator2
```

5. Run appium

Run appium with the desired capabilities. the `udid` option can be omitted if using a simulator.

```
appium --relaxed-security --base-path=/wd/hub --default-capabilities \
  "{\"appium:deviceName\": \"<Your device name here>\", \
  \"platformName\": \"iOS\", \
  \"appium:app\": \"com.ir-engine.reactapp\", \
  \"appium:udid\":\"<Your device's udid>\", \
  \"appium:automationName\": \"XCUITest\"}"
```
