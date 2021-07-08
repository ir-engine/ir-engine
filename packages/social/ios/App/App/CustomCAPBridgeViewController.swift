import UIKit
import Capacitor

class CustomCAPBridgeViewController: CAPBridgeViewController {

     override func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
            let webViewConfiguration = WKWebViewConfiguration()
            if #available(iOS 14.0, *) {
                webViewConfiguration.limitsNavigationsToAppBoundDomains = true
            }
            webViewConfiguration.allowsInlineMediaPlayback = true
            webViewConfiguration.suppressesIncrementalRendering = false
            webViewConfiguration.allowsAirPlayForMediaPlayback = true
            webViewConfiguration.mediaTypesRequiringUserActionForPlayback = []
            if let appendUserAgent = instanceConfiguration.appendedUserAgentString {
                if let appName = webViewConfiguration.applicationNameForUserAgent {
                    webViewConfiguration.applicationNameForUserAgent = "\(appName)  \(appendUserAgent)"
                } else {
                    webViewConfiguration.applicationNameForUserAgent = appendUserAgent
                }
            }
            return webViewConfiguration
        }
}
