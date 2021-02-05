import SceneKit

@objc(ARKitPlugin) class ArKitPlugin : CDVPlugin {

    // MARK: - Properties
    
    /// Callback ID
    var cameraListenerCallbackId: String!
    var qrFoundedCallbackId: String!
    
    /// ARViewController
    var arViewController: ARViewController!
    
    // MARK: - Life Cycle
    
    /// Plugin init mehtod
    override func pluginInitialize() {
        setupWebView()
    }
    
    // MARK: - Setup Methods
    
    /// Make WebView transparent and non-clickable
    func setupWebView() {
        webView.backgroundColor = .clear
        webView.isOpaque = false
//        webView.isUserInteractionEnabled = false
    }
    
    // MARK: - ARView Life Cycle Management
    
    /// Init ARViewController from the Main storyboard
    func instantiateARViewController() {
        let storyboard = UIStoryboard(name: "Main",
                                      bundle: nil)
        guard let arViewController = storyboard.instantiateViewController(withIdentifier: "ARViewController") as? ARViewController else {
            fatalError("ARViewController is not set in storyboard")
        }
        self.arViewController = arViewController
        self.arViewController.delegate = self
    }

    /// Add AR View below WebView and start AR session
    @objc func addARView(_ command: CDVInvokedUrlCommand) {
        DispatchQueue.global(qos: .utility).async {
            self.instantiateARViewController()
            DispatchQueue.main.async {
                guard let superview = self.webView.superview else { return }
                superview.insertSubview(self.arViewController.view,
                                        belowSubview: self.webView)
                
                let options = command.arguments[0] as! NSMutableDictionary
                let qrRecognitionEnabled = options.object(forKey: "qrRecognitionEnabled") as! Bool;
                if (qrRecognitionEnabled) {
                    let qrDataArr = options.object(forKey: "qrData") as! [String]
                    self.setupQrRecognition(qrDataArr: qrDataArr);
                }
            }
        }
    }
    
    /// Stop AR session and remove AR View the from veiw stack
    @objc func removeARView(_ command: CDVInvokedUrlCommand) {
        arViewController.view.removeFromSuperview()
        self.arViewController = nil
    }
    
    @objc func restartArSession(_ command: CDVInvokedUrlCommand) {
        self.arViewController.restartExperience()
    }
    
    func startARSessionWithoutQRRecognition(_ command: CDVInvokedUrlCommand) {
        self.arViewController.vumarkGUIDs.removeAll()
        self.arViewController.qrNode = nil
        self.arViewController.restartExperience()
    }
    
    func setupQrRecognition(qrDataArr: [String]) {
        // Fill vumarkGUID array
        qrDataArr.forEach { qrData in
            self.arViewController.vumarkGUIDs.append(qrData)
        }
        // Create QR node
        self.arViewController.qrNode = SCNNode()
        
        // Restart AR session
        self.arViewController.restartExperience()
    }    
}
