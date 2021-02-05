import ReplayKit
import UIKit

@available(iOS 10.0, *)
class BroadcastController : RPBroadcastController {
    // using this singleton to store a single instance of a broadcastcontroller
    static let controller = BroadcastController()
}

@objc(ScreenRecord) class ScreenRecord : CDVPlugin, RPScreenRecorderDelegate, RPPreviewViewControllerDelegate, RPBroadcastActivityViewControllerDelegate {
    
    weak var previewViewController: RPPreviewViewController?
    var CDVWebview:UIWebView;

    // This is just called if <param name="onload" value="true" /> in plugin.xml.
    init(webView: UIWebView) {
        self.CDVWebview = webView
        //super.init(webView: webView)
    }
    
    @objc(isAvailable:)
    func isAvailable(_ command: CDVInvokedUrlCommand) {
        let recorder = RPScreenRecorder.shared()
        if #available(iOS 10.0, *) {
            let available = recorder.isAvailable;
            let pluginResult = CDVPluginResult(status:CDVCommandStatus_OK, messageAs: available)
            self.commandDelegate!.send(pluginResult, callbackId:command.callbackId)
        } else {
            let pluginResult = CDVPluginResult(status:CDVCommandStatus_OK, messageAs: false)
            self.commandDelegate!.send(pluginResult, callbackId:command.callbackId)
        }
    }
    
    @objc(isRecording:)
    func isRecording(_ command: CDVInvokedUrlCommand) {
        let recorder = RPScreenRecorder.shared()
        let recording = recorder.isRecording;
        let pluginResult = CDVPluginResult(status:CDVCommandStatus_OK, messageAs: recording)
        self.commandDelegate!.send(pluginResult, callbackId:command.callbackId)
    }
    
    @objc(startRecording:)
    func startRecording(_ command: CDVInvokedUrlCommand) {
        let recorder = RPScreenRecorder.shared()
        recorder.delegate = self
        // just turn on the microphone, the user will have the option to record with microphone
        recorder.isMicrophoneEnabled = true
        // camera is an iOS10 feature
        if #available(iOS 10.0, *) {
            // for camera usage, we'd also need to recorder.cameraPreviewView somewhere?
            //recorder.isCameraEnabled = command.argumentAtIndex(0) as! Bool
        }
        if #available(iOS 10.0, *) {
            recorder.startRecording() { [unowned self] (error) in
                var pluginResult:CDVPluginResult
                if let unwrappedError = error {
                    print(error?.localizedDescription as Any);
                    pluginResult = CDVPluginResult(status:CDVCommandStatus_ERROR, messageAs: unwrappedError.localizedDescription)
                    self.commandDelegate!.send(pluginResult, callbackId:command.callbackId)
                } else {
                    pluginResult = CDVPluginResult(status:CDVCommandStatus_OK)
                    self.commandDelegate!.send(pluginResult, callbackId:command.callbackId)
                }
            }
        } else {
            // recorder not available iOS <10.0
            var pluginResult:CDVPluginResult
            pluginResult = CDVPluginResult(status:CDVCommandStatus_ERROR)
            self.commandDelegate!.send(pluginResult, callbackId:command.callbackId)
        }
    }
    
    @objc(stopRecording:)
    func stopRecording(_ command: CDVInvokedUrlCommand) {
        let recorder = RPScreenRecorder.shared()
        recorder.stopRecording { [unowned self] (preview, error) in
            var pluginResult:CDVPluginResult
            if let unwrappedPreview = preview {
                unwrappedPreview.previewControllerDelegate = self
                self.previewViewController = unwrappedPreview
                self.previewViewController!.modalPresentationStyle = UIModalPresentationStyle.fullScreen;
                self.viewController.present(unwrappedPreview, animated: true, completion: nil);
                pluginResult = CDVPluginResult(status:CDVCommandStatus_OK)
                pluginResult.setKeepCallbackAs(true)
                self.commandDelegate!.send(pluginResult, callbackId:command.callbackId)
            }
            if let unwrappedError = error {
                pluginResult = CDVPluginResult(status:CDVCommandStatus_ERROR, messageAs: unwrappedError.localizedDescription)
                pluginResult.setKeepCallbackAs(true)
                self.commandDelegate!.send(pluginResult, callbackId:command.callbackId)
            }
        }
    }
    
    func previewControllerDidFinish(_ previewController: RPPreviewViewController) {
        previewViewController?.dismiss(animated: true)
    }

    /* https://www.appcoda.com/replaykit-live-broadcast/ */
    @objc(isBroadcastAvailable:)
    func isBroadcastAvailable(_ command: CDVInvokedUrlCommand) {
        var available = false;
        // Note: there is no isAvailable property, so we only check if we're on iOS10
        if #available(iOS 10.0, *) {
            available = true;
        }
        let pluginResult = CDVPluginResult(status:CDVCommandStatus_OK, messageAs: available)
        self.commandDelegate!.send(pluginResult, callbackId:command.callbackId)
    }
    
    @objc(isBroadcasting:)
    func isBroadcasting(_ command: CDVInvokedUrlCommand) {
        var recording = false;
        if #available(iOS 10.0, *) {
            recording = BroadcastController.controller.isBroadcasting
        }
        let pluginResult = CDVPluginResult(status:CDVCommandStatus_OK, messageAs: recording)
        self.commandDelegate!.send(pluginResult, callbackId:command.callbackId)
    }
    
    weak var broadcastCommand:CDVInvokedUrlCommand?
    @objc(startBroadcast:)
    func startBroadcast(_ command: CDVInvokedUrlCommand) {
        if #available(iOS 10.0, *) {
            // pass the cordova command to broadcastactivityviewcontroller
            self.broadcastCommand = command;
            RPBroadcastActivityViewController.load { broadcastAVC, error in
                guard error == nil else {
                    print("Cannot load Broadcast Activity View Controller.")
                    var pluginResult:CDVPluginResult
                    pluginResult = CDVPluginResult(status:CDVCommandStatus_ERROR, messageAs: error?.localizedDescription)
                    self.commandDelegate!.send(pluginResult, callbackId:command.callbackId)
                    return
                }
                if let broadcastAVC = broadcastAVC {
                    broadcastAVC.delegate = self
                    self.viewController.present(broadcastAVC, animated: true, completion: {
                        // broadcastactivityviewcontroller will perform the callback when the broadcast starts (or fails)
                    })
                }
            }
        }
    }
    
    @available(iOS 10.0, *)
    func broadcastActivityViewController(_ broadcastActivityViewController: RPBroadcastActivityViewController,
                                         didFinishWith broadcastController: RPBroadcastController?,
                                         error: Error?)
    {
        let command = self.broadcastCommand;
        guard error == nil else {
            broadcastActivityViewController.dismiss(animated: true)
            print(error?.localizedDescription ?? "Broadcast Activity Controller is not available.")
            var pluginResult:CDVPluginResult
            pluginResult = CDVPluginResult(status:CDVCommandStatus_ERROR, messageAs: error?.localizedDescription)
            self.commandDelegate!.send(pluginResult, callbackId:command?.callbackId)
            return
        }
        broadcastActivityViewController.dismiss(animated: true) {
            broadcastController?.startBroadcast { error in
                if error == nil {
                    print("Broadcast started successfully!")
                    var pluginResult:CDVPluginResult
                    pluginResult = CDVPluginResult(status:CDVCommandStatus_OK)
                    self.commandDelegate!.send(pluginResult, callbackId:command?.callbackId)
                } else {
                    var pluginResult:CDVPluginResult
                    pluginResult = CDVPluginResult(status:CDVCommandStatus_ERROR, messageAs: error?.localizedDescription)
                    self.commandDelegate!.send(pluginResult, callbackId:command?.callbackId)
                }
            }
        }
    }

    @objc(stopBroadcast:)
    func stopBroadcast(_ command: CDVInvokedUrlCommand) {
        if #available(iOS 10.0, *) {
            let controller = BroadcastController.controller;
            controller.finishBroadcast { error in
                if error == nil {
                    print("Broadcast ended")
                    var pluginResult:CDVPluginResult
                    pluginResult = CDVPluginResult(status:CDVCommandStatus_OK)
                    pluginResult.setKeepCallbackAs(true)
                    self.commandDelegate!.send(pluginResult, callbackId:command.callbackId)
                } else {
                    var pluginResult:CDVPluginResult
                    pluginResult = CDVPluginResult(status:CDVCommandStatus_ERROR, messageAs: error?.localizedDescription)
                    pluginResult.setKeepCallbackAs(true)
                    self.commandDelegate!.send(pluginResult, callbackId:command.callbackId)
                }
            }
        }
    }
}

