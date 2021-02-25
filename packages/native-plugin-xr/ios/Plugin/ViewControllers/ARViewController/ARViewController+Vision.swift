//
//  ARViewController+Vision.swift
//  HelloWorld
//
//  Created by Eugene Bokhan on 21/01/2019.
//

import Vision

extension ARViewController {

    // MARK: - Setup Vision
    
    func setupVision() {
        
    }
    
    // MARK: - Vision Methods
    
    func detectQR(qrWorldTransform: simd_float4x4,
                  completionHandler: @escaping (simd_float4x4, String) -> Void) {
        guard let pixelBuffer = session.currentFrame?.capturedImage else { return }
        let requestOptions: [VNImageOption: Any] = [.cameraIntrinsics: session.currentFrame?.camera.intrinsics as Any]
        
        let imageRequestHandler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer,
                                                        options: requestOptions)
        func barcodeDetectionHandler(request: VNRequest, error: Error?) {
            guard let requestResults = request.results else { return }
            for reuestResults in requestResults {
                guard let barcodeObservation = reuestResults as? VNBarcodeObservation,
                    barcodeObservation.symbology == .QR,
                    let barcodeStringValue = barcodeObservation.payloadStringValue,
                    barcodeStringValue != "" else { continue }
                completionHandler(qrWorldTransform, barcodeStringValue)
                break
            }
        }
        
        let detectBarcodesRequest = VNDetectBarcodesRequest(completionHandler: barcodeDetectionHandler)
        detectBarcodesRequest.symbologies = [.QR]
        
        
        do {
            try imageRequestHandler.perform([detectBarcodesRequest])
        } catch {
            print(error)
        }
    }
}
