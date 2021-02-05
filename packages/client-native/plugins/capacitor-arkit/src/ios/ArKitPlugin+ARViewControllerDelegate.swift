//
//  ArKitPlugin+ARViewControllerDelegate.swift
//  HelloWorld
//
//  Created by Eugene Bokhan on 27/12/2018.
//

import simd

// MARK: - Sending Data Methods

extension ArKitPlugin: ARViewControllerDelegate {
    
    // MARK: - Public
    
    /// Update node's transform matrix
    ///
    /// - Parameter transfrom: float4x4 transform matrix
    func updateNodeTransform(transfrom: simd_float4x4,
                             nodeName: String) {
        let data = createData(from: transfrom)
        sendDataToCordova(data, callbackId: cameraListenerCallbackId)
    }
    
    /// Send detected QR info to JS
    ///
    /// - Parameters:
    ///   - transfrom: float4x4 transform matrix
    ///   - vumarkGUID: text encrypted in QR
    func sendDetectedQRInfo(transfrom: simd_float4x4,
                            vumarkGUID: String) {
        var data = createData(from: transfrom)
        data["qrData"] = vumarkGUID
        sendDataToCordova(data, callbackId: qrFoundedCallbackId)
    }
    
    // MARK: - Private
    
    private func createData(from transfrom: simd_float4x4) -> [String : Any] {
        var data: [String : Any] = [:]
        
        let position = float3(transfrom.columns.3.x,
                              transfrom.columns.3.y,
                              transfrom.columns.3.z)
        data["positionX"] = position.x
        data["positionY"] = position.y
        data["positionZ"] = position.z
        
        let quaternion = simd_quatf(transfrom)
        data["quaternionX"] = quaternion.vector.x
        data["quaternionY"] = quaternion.vector.y
        data["quaternionZ"] = quaternion.vector.z
        data["quaternionW"] = quaternion.vector.w
        
        return data
    }
    
    /// Send virtual node's position and quaternion to JS
    ///
    /// - Parameter data: dictionary with float4x4 transform matrix
    /// and node name
    private func sendDataToCordova(_ data: [String : Any], callbackId: String) {
        guard let result = CDVPluginResult(status: CDVCommandStatus_OK,
                                           messageAs: data) else { return }
        result.setKeepCallbackAs(true)
        commandDelegate!.send(result,
                              callbackId: callbackId)
    }
    
    /// Save Callback ID
    ///
    /// - Parameter command: cordova invoked URL command
    @objc func setCameraListener(_ command: CDVInvokedUrlCommand) {
        cameraListenerCallbackId = command.callbackId
    }
    
    @objc func setOnQrFounded(_ command: CDVInvokedUrlCommand) {
        qrFoundedCallbackId = command.callbackId
    }
}