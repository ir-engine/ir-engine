import Foundation
import Capacitor
import ReplayKit
import UIKit

@objc(XRPlugin)
public class XRPlugin: CAPPlugin{

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.success([
            "value": value
        ])
    }
}
