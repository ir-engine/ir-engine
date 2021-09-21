import React from "react";

function Component() {

  window.bbgmVersion = "2021.09.03.0537";
  window.useSharedWorker = typeof SharedWorker !== 'undefined';
  window.mobile = window.screen.width < 768 || window.screen.height < 768;

  function loadCSS(filename) {
    var el = document.createElement("link");
    el.setAttribute("rel", "stylesheet");
    el.setAttribute("href", "/" + filename);
    document.getElementsByTagName("head")[0].appendChild(el);
    return el;
  }
  function getTheme() {
    var dark = "dark";
    var light = "light";
    try {
      var local = localStorage.getItem("theme");
      if (local !== null) {
        return local === "dark" ? dark : light;
      }
      return matchMedia("(prefers-color-scheme: dark)").matches ? dark : light;
    } catch (err) {
      return light;
    }
  }
  window.themeCSSLink = loadCSS("./src/ui/assets/css/" + getTheme() + ".css");

  window.enableLogging = location.host.indexOf("basketball-gm.com") >= 0;

  if (window.enableLogging) {
    window.googleAnalyticsID = "UA-38759330-1";

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=UA-38759330-1";
    s.type = "text/javascript";
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'UA-38759330-1', {
      'cookie_domain': 'basketball-gm.com'
    });

    // Google Consumer Surveys
    var TriggerPrompt = function (articleUrl, contentId) {
      var ARTICLE_URL = articleUrl;
      var CONTENT_ID = contentId || '';
      var el = document.createElement('script');
      var url = 'https://survey.g.doubleclick.net/survey?site=_5lgefwumzxr6qxsbcz46dpx624' +
        '&url=' + encodeURIComponent(ARTICLE_URL) +
        (CONTENT_ID ? '&cid=' + encodeURIComponent(CONTENT_ID) : '') +
        '&random=' + (new Date).getTime() +
        '&after=1';
      el.setAttribute('src', url);
      var head = document.getElementsByTagName('head')[0] ||
        document.getElementsByTagName('body')[0];
      head.appendChild(el);
    };
  }

  window.releaseStage = "unknown";
  if (location.host.indexOf("localhost") === 0) {
    window.releaseStage = "development";
  } else if (location.host.indexOf("beta.basketball-gm.com") === 0) {
    window.releaseStage = "beta";
  } else if (location.host.indexOf("play.basketball-gm.com") === 0) {
    window.releaseStage = "production";
  }

  window.bugsnagKey = "c10b95290070cb8888a7a79cc5408555";


  (function () {
    var host = 'basketball-gm.com';
    var element = document.createElement('script');
    var firstScript = document.getElementsByTagName('script')[0];
    var url = 'https://quantcast.mgr.consensu.org'
      .concat('/choice/', 'M1Q1fpfqa7Vk4', '/', host, '/choice.js')
    var uspTries = 0;
    var uspTriesLimit = 3;
    element.async = true;
    element.type = 'text/javascript';
    element.src = url;

    firstScript.parentNode.insertBefore(element, firstScript);

    function makeStub() {
      var TCF_LOCATOR_NAME = '__tcfapiLocator';
      var queue = [];
      var win = window;
      var cmpFrame;

      function addFrame() {
        var doc = win.document;
        var otherCMP = !!(win.frames[TCF_LOCATOR_NAME]);

        if (!otherCMP) {
          if (doc.body) {
            var iframe = doc.createElement('iframe');

            iframe.style.cssText = 'display:none';
            iframe.name = TCF_LOCATOR_NAME;
            doc.body.appendChild(iframe);
          } else {
            setTimeout(addFrame, 5);
          }
        }
        return !otherCMP;
      }

      function tcfAPIHandler() {
        var gdprApplies;
        var args = arguments;

        if (!args.length) {
          return queue;
        } else if (args[0] === 'setGdprApplies') {
          if (
            args.length > 3 &&
            args[2] === 2 &&
            typeof args[3] === 'boolean'
          ) {
            gdprApplies = args[3];
            if (typeof args[2] === 'function') {
              args[2]('set', true);
            }
          }
        } else if (args[0] === 'ping') {
          var retr = {
            gdprApplies: gdprApplies,
            cmpLoaded: false,
            cmpStatus: 'stub'
          };

          if (typeof args[2] === 'function') {
            args[2](retr);
          }
        } else {
          queue.push(args);
        }
      }

      function postMessageEventHandler(event) {
        var msgIsString = typeof event.data === 'string';
        var json = {};

        try {
          if (msgIsString) {
            json = JSON.parse(event.data);
          } else {
            json = event.data;
          }
        } catch (ignore) { }

        var payload = json.__tcfapiCall;

        if (payload && window.__tcfapi) {
          window.__tcfapi(
            payload.command,
            payload.version,
            function (retValue, success) {
              var returnMsg = {
                __tcfapiReturn: {
                  returnValue: retValue,
                  success: success,
                  callId: payload.callId
                }
              };
              if (msgIsString) {
                returnMsg = JSON.stringify(returnMsg);
              }
              if (event.source) {
                event.source.postMessage(returnMsg, '*');
              }
            },
            payload.parameter
          );
        }
      }

      while (win) {
        try {
          if (win.frames[TCF_LOCATOR_NAME]) {
            cmpFrame = win;
            break;
          }
        } catch (ignore) { }

        if (win === window.top) {
          break;
        }
        win = win.parent;
      }
      if (!cmpFrame) {
        addFrame();
        win.__tcfapi = tcfAPIHandler;
        win.addEventListener('message', postMessageEventHandler, false);
      }
    };

    makeStub();

    var uspStubFunction = function () {
      var arg = arguments;
      if (typeof window.__uspapi !== uspStubFunction) {
        setTimeout(function () {
          if (typeof window.__uspapi !== 'undefined') {
            window.__uspapi.apply(window.__uspapi, arg);
          }
        }, 500);
      }
    };

    var checkIfUspIsReady = function () {
      uspTries++;
      if (window.__uspapi === uspStubFunction && uspTries < uspTriesLimit) {
        console.warn('USP is not accessible');
      } else {
        clearInterval(uspInterval);
      }
    };

    if (typeof window.__uspapi === 'undefined') {
      window.__uspapi = uspStubFunction;
      var uspInterval = setInterval(checkIfUspIsReady, 6000);
    }
  })();

  var startupUI = document.getElementById("startup-ui");
  var startupWorker = document.getElementById("startup-worker");

  var timeoutID = setTimeout(function () {
    document.getElementById("startup-error-unknown").style.display = "block";
  }, 6000);

  function checkModern() {
    try {
      eval("var x = {}; x ?? x?.y;");
      return true;
    } catch (err) {
      return false;
    }
  };

  function withGoodBrowser() {
    document.getElementById("startup-browser").innerHTML += " done!";
    startupUI.innerHTML = "Loading UI...";
    startupWorker.innerHTML = "Loading backend...";
  }

  var count = 0;
  function withGoodUI() {
    startupUI.innerHTML += " done!";
    count += 1;
    if (count === 2) {
      clearTimeout(timeoutID);
    }
  }
  function withGoodWorker() {
    startupWorker.innerHTML += " done!";
    count += 1;
    if (count === 2) {
      clearTimeout(timeoutID);
    }
  }

  // Browser compatibility checks! https://gist.github.com/jensarps/15f270874889e1717b3d
  function goodIDB(cb) {
    try {
      if (typeof window.indexedDB === "undefined") {
        cb("bad");
        return;
      }
    } catch (err) {
      console.error(err);
      cb("open-failed");
      return;
    }

    if (localStorage.getItem("goodIDB")) {
      cb("good");
      return;
    }

    try {
      window.IDBKeyRange.only([1]);
    } catch (e) {
      cb("bad");
      return;
    }

    var openRequest = window.indexedDB.open('__detectIDB_test2', 1);

    openRequest.onerror = function (evt) {
      console.error(evt.target.error);
      if (evt.target.error.message.indexOf("aborted") >= 0 || evt.target.error.message.indexOf("full") >= 0) {
        // Error like "Version change transaction was aborted in upgradeneeded event handler." is probably quota error - try to continue loading BBGM and hope for the best
        cb("good");
      } else {
        cb("open-failed");
      }
    }

    openRequest.onupgradeneeded = function (evt) {
      var db = evt.target.result;
      var one = db.createObjectStore('one', {
        autoIncrement: true,
        keyPath: 'key'
      });
      one.createIndex('one', 'one');
      one.add({ one: 1 });
      var two = db.createObjectStore('two', {
        autoIncrement: true,
        keyPath: 'key'
      });
      two.createIndex('two', 'two');
      two.add({ two: 2 });
    };

    openRequest.onsuccess = function (evt) {
      var db = evt.target.result;
      var transaction;
      try {
        transaction = db.transaction(['one', 'two'], 'readwrite');
      } catch (e) {
        cb("bad");
        return;
      }

      var count = 0;
      transaction.objectStore('one').index('one').openCursor().onsuccess = function (evt) {
        cursor = evt.target.result;
        if (cursor) {
          count += 1;
          cursor.continue();
        }
      };

      transaction.oncomplete = function () {
        db.close();
        cb(count === 1 ? "good" : "bad"); // Will be 2 in Safari 10 https://bugs.webkit.org/show_bug.cgi?id=158833
      };
    };
  };

  function checkBrowser() {
    try {
      eval("const s = Symbol(); let f = x => 1");
      return true;
    } catch (err) {
      return false;
    }
  };

  goodIDB(function (idbResult) {
    if (idbResult !== "good" || !checkBrowser()) {
      var errorMsg;
      if (idbResult === "open-failed") {
        errorMsg = '<p><b>Error!</b> Cannot store data.</p><p>If you have disabled cookies in your browser, you must enable them to play Basketball GM.</p><p>If you\'re using Firefox\'s Private Browsing mode, there is currently a bug in Firefox that prevents Basketball GM from running. Either load Basketball GM outside of Private Browsing mode, or try using <a href="https://www.google.com/chrome/">Google Chrome</a> instead.</p>';
      } else {
        errorMsg = '<p><b>Error!</b> Your browser is not modern enough to run Basketball GM. The latest versions of <a href="https://www.google.com/chrome/">Google Chrome</a> and <a href="https://www.mozilla.org/en-US/firefox/">Mozilla Firefox</a> work best.</p>';
      }

      // Special error for Apple's mobile devices, as that's the only platform that is totally unsupported (no alternative browser to install)
      if (/(iPad|iPhone|iPod)/.test(navigator.userAgent)) {
        errorMsg += '<p>If you\'re on an iPhone/iPad, upgrade to iOS 10.3 or higher to play Basketball GM. If you can\'t do that, then please come back on a desktop/laptop or a non-Apple mobile device!</p>';
      }

      var startupError = document.getElementById("startup-error");
      startupError.innerHTML = errorMsg;
      startupError.style.display = "block";

      document.getElementById("loading-icon").style.animationPlayState = "paused";

      clearTimeout(timeoutID);
    } else {
      localStorage.setItem("goodIDB", "1")

      withGoodBrowser();
    }
  });

  return (
    <div id="content" class="h-100 d-flex flex-column">
      <div style="margin: 0 15px">
        <div style="max-width: 360px; margin: 0 auto">
          <div style="text-align: center; margin: 48px 0 100px 0">
            <img id="loading-icon" src="/src/ui/assets/ico/icon.svg" width="48" height="48" class="spin"
              style="animation-play-state: runnung" alt="" />
          </div>

          <p>Basketball GM v2021.09.03.0537</p>
          <div id="startup-browser">Checking browser...</div>
          <noscript>
            <p><b>Error!</b> JavaScript is disabled in your browser. Please enable JavaScript to play Basketball GM.</p>
          </noscript>
          <div id="startup-ui"></div>
          <div id="startup-worker"></div>

          <div class="alert alert-danger mt-3" id="startup-error" style="display: none"></div>

          <div class="alert alert-danger mt-3" id="startup-error-unknown" style="display: none">
            <p>This should only take a few seconds on a fast connection.</p>
            <p>If it gets stuck for a while, read <a href="https://basketball-gm.com/manual/debugging/">the debugging
              instructions</a> and <a href="https://basketball-gm.com/contact/">ask for help</a> if it still isn't
              working.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

