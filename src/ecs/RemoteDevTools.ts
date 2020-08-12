import Peer from "peerjs"
import { hasWindow } from "./Utils"

export function generateId(length) {
  let result = ""
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

function hookConsoleAndErrors(connection) {
  const wrapFunctions = ["error", "warning", "log"]
  wrapFunctions.forEach(key => {
    if (typeof console[key] === "function") {
      const fn = console[key].bind(console)
      console[key] = (...args) => {
        connection.send({
          method: "console",
          type: key,
          args: JSON.stringify(args)
        })
        return fn(...args)
      }
    }
  })

  window.addEventListener("error", error => {
    connection.send({
      method: "error",
      error: JSON.stringify({
        message: error.error.message,
        stack: error.error.stack
      })
    })
  })
}

function includeRemoteIdHTML(remoteId) {
  const infoDiv = document.createElement("div")
  infoDiv.style.cssText = `
    align-items: center;
    background-color: #333;
    color: #aaa;
    display:flex;
    font-family: Arial;
    font-size: 1.1em;
    height: 40px;
    justify-content: center;
    left: 0;
    opacity: 0.9;
    position: absolute;
    right: 0;
    text-align: center;
    top: 0;
  `

  infoDiv.innerHTML = `Open ECSY devtools to connect to this page using the code:&nbsp;<b style="color: #fff">${remoteId}</b>&nbsp;<button onClick="generateNewCode()">Generate new code</button>`
  document.body.appendChild(infoDiv)

  return infoDiv
}

export function enableRemoteDevtools(remoteId?) {
  if (!hasWindow) {
    console.warn("Remote devtools not available outside the browser")
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-extra-semi
  ;(window as any).generateNewCode = () => {
    window.localStorage.clear()
    remoteId = generateId(6)
    window.localStorage.setItem("ecsyRemoteId", remoteId)
    window.location.reload(false)
  }

  remoteId = remoteId || window.localStorage.getItem("ecsyRemoteId")
  if (!remoteId) {
    remoteId = generateId(6)
    window.localStorage.setItem("ecsyRemoteId", remoteId)
  }

  const infoDiv = includeRemoteIdHTML(remoteId)
  ;(window as any).__ECSY_REMOTE_DEVTOOLS_INJECTED = true
  ;(window as any).__ECSY_REMOTE_DEVTOOLS = {}

  // This is used to collect the worlds created before the communication is being established
  const worldsBeforeLoading = []
  const onWorldCreated = e => {
    const world = e.detail.world
    worldsBeforeLoading.push(world)
  }
  window.addEventListener("ecsy-world-created", onWorldCreated)

  const onLoaded = () => {
    // var peer = new Peer(remoteId);
    const peer = new Peer(remoteId, {
      host: "peerjs.xr3ngine.io",
      secure: true,
      port: 443,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" }
        ]
      },
      debug: 3
    })

    peer.on("open", (/* id */) => {
      peer.on("connection", connection => {
        console.log("Connected")
        ;(window as any).__ECSY_REMOTE_DEVTOOLS.connection = connection
        connection.on("open", function() {
          // infoDiv.style.visibility = "hidden";
          infoDiv.innerHTML = "Connected"

          // Receive messages
          connection.on("data", function(data) {
            if (data.type === "init") {
              const script = document.createElement("script")
              script.setAttribute("type", "text/javascript")
              script.onload = () => {
                script.parentNode.removeChild(script)

                // Once the script is injected we don't need to listen
                window.removeEventListener("ecsy-world-created", onWorldCreated)
                worldsBeforeLoading.forEach(world => {
                  const event = new CustomEvent("ecsy-world-created", {
                    detail: { world: world }
                  })
                  window.dispatchEvent(event)
                })
              }
              script.innerHTML = data.script
              ;(document.head || document.documentElement).appendChild(script)
              script.onload(null)

              hookConsoleAndErrors(connection)
            } else if (data.type === "executeScript") {
              const value = eval(data.script)
              if (data.returnEval) {
                connection.send({
                  method: "evalReturn",
                  value: value
                })
              }
            }
          })
        })
      })
    })
  }
}

if (hasWindow) {
  const urlParams = new URLSearchParams(window.location.search)

  // @todo Provide a way to disable it if needed
  if (urlParams.has("enable-remote-devtools")) {
    enableRemoteDevtools()
  }
}
