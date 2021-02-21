//
//  ARViewController+ARSCNViewDelegate.swift
//  HelloWorld
//
//  Created by Eugene Bokhan on 27/12/2018.
//

import ARKit

extension ARViewController: ARSCNViewDelegate {
    
    func renderer(_ renderer: SCNSceneRenderer,
                  updateAtTime time: TimeInterval) {
        guard let camera = sceneView.pointOfView else { return }
        let cameraTransform = camera.simdWorldTransform
        delegate?.updateNodeTransform(transfrom: cameraTransform,
                                      nodeName: cameraNodeName)
    }
    
    // MARK: - Image detection results
    
    /// - Tag: ARImageAnchor-Visualizing
    func renderer(_ renderer: SCNSceneRenderer,
                  didAdd node: SCNNode,
                  for anchor: ARAnchor) {
        guard let _ = anchor as? ARImageAnchor,
            let qrNode = self.qrNode,
            delegate != nil else { return }
        
        // Add the plane visualization to the scene.
        node.addChildNode(qrNode)
        detectQR(qrWorldTransform: qrNode.simdWorldTransform,
               completionHandler: delegate!.sendDetectedQRInfo)
        
        DispatchQueue.main.async {
            self.statusViewController.showMessage("Detected QR marker")
        }    
    }
    
    func renderer(_ renderer: SCNSceneRenderer,
                  didUpdate node: SCNNode,
                  for anchor: ARAnchor) {
        guard let _ = anchor as? ARImageAnchor,
            let qrNode = self.qrNode,
            delegate != nil else { return }
        
        detectQR(qrWorldTransform: qrNode.simdWorldTransform,
                 completionHandler: delegate!.sendDetectedQRInfo)
        
        DispatchQueue.main.async {
            self.statusViewController.showMessage("Updated QR marker position")
        }
    }   
}