import { URL } from 'url'
import puppeteer from 'puppeteer'
import fs from 'fs'
import { getOS } from './utils/getOS'

class PageUtils {
  bot: XREngineBot
  constructor(bot) {
    this.bot = bot
  }
  async clickSelectorClassRegex(selector, classRegex) {
    if (this.bot.verbose) console.log(`Clicking for a ${selector} matching ${classRegex}`)

    await this.bot.page.evaluate(
      (selector, classRegex) => {
        classRegex = new RegExp(classRegex)
        let buttons = Array.from(document.querySelectorAll(selector))
        let enterButton = buttons.find((button) => Array.from(button.classList).some((c) => classRegex.test(c)))
        if (enterButton) enterButton.click()
      },
      selector,
      classRegex.toString().slice(1, -1)
    )
  }
  async clickSelectorId(selector, id) {
    if (this.bot.verbose) console.log(`Clicking for a ${selector} matching ${id}`)

    await this.bot.page.evaluate(
      (selector, id) => {
        let matches = Array.from(document.querySelectorAll(selector))
        let singleMatch = matches.find((button) => button.id === id)
        let result
        if (singleMatch && singleMatch.click) {
          console.log('normal click')
          result = singleMatch.click()
        }
        if (singleMatch && !singleMatch.click) {
          console.log('on click')
          result = singleMatch.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        }
        if (!singleMatch) {
          console.log('event click', matches.length)
          const m = matches[0]
          result = m.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        }
      },
      selector,
      id
    )
  }
  async clickSelectorFirstMatch(selector) {
    if (this.bot.verbose) console.log(`Clicking for first ${selector}`)

    await this.bot.page.evaluate((selector) => {
      let matches = Array.from(document.querySelectorAll(selector))
      let singleMatch = matches[0]
      if (singleMatch) singleMatch.click()
    }, selector)
  }
}

type BotProps = {
  verbose?: boolean
  headless?: boolean
  gpu?: boolean
  name?: string
  fakeMediaPath?: string
  windowSize?: { width: number; height: number }
}

/**
 * Main class for creating a bot.
 */
export class XREngineBot {
  activeChannel
  headless: boolean
  ci: boolean
  verbose: boolean
  name: string
  fakeMediaPath: string
  windowSize: {
    width: number
    height: number
  }
  browser: puppeteer.Browser
  page: puppeteer.Page
  pageUtils: PageUtils

  constructor(args: BotProps = {}) {
    this.verbose = args.verbose
    this.headless = args.headless ?? true
    this.ci = typeof process.env.CI === 'string' && process.env.CI === 'true'
    console.log('headless', this.headless)
    this.name = args.name ?? 'Bot'
    this.fakeMediaPath = args.fakeMediaPath ?? ''
    this.windowSize = args.windowSize ?? { width: 640, height: 480 }

    // for (let method of Object.getOwnPropertyNames(InBrowserBot.prototype))
    // {
    //     if (method in this) continue;

    //     this[method] = (...args) => this.evaluate(InBrowserBot.prototype[method], ...args)
    // }

    // const channelState = chatState.get('channels');
    // const channels = channelState.get('channels');
    // const activeChannelMatch = [...channels].find(([, channel]) => channel.channelType === 'instance');
    // if (activeChannelMatch && activeChannelMatch.length > 0) {
    //     this.activeChannel = activeChannelMatch[1];
    // }
  }

  async keyPress(key, numMilliSeconds) {
    console.log('Running with key ' + key)
    const interval = setInterval(() => {
      console.log('Pressing', key)
      this.pressKey(key)
    }, 100)
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        console.log('Clearing button press for ' + key, numMilliSeconds)
        this.releaseKey(key)
        clearInterval(interval)
        resolve()
      }, numMilliSeconds)
    )
  }

  async sendMessage(message) {
    console.log('send message: ' + message)
    await this.clickElementByClass('button', 'openChat')
    await this.clickElementById('input', 'newMessage')
    await this.typeMessage(message)
    await this.clickElementByClass('button', 'sendMessage')
  }

  async getInstanceMessages() {
    console.log('Getting messages from instance channel: ', this.activeChannel)
    return this.activeChannel && this.activeChannel.chatState
  }

  async sendAudio(duration) {
    console.log('Sending audio...')
    await this.clickElementById('button', 'UserAudio')
    await this.waitForTimeout(duration)
  }

  async stopAudio(bot) {
    console.log('Stop audio...')
    await this.clickElementById('button', 'UserAudio')
  }

  async recvAudio(duration) {
    console.log('Receiving audio...')
    await this.waitForSelector('[class*=PartyParticipantWindow]', duration)
  }

  async sendVideo(duration) {
    console.log('Sending video...')
    await this.clickElementById('button', 'UserVideo')
    await this.waitForTimeout(duration)
  }

  async stopVideo(bot) {
    console.log('Stop video...')
    await this.clickElementById('button', 'UserVideo')
  }

  async recvVideo(duration) {
    console.log('Receiving video...')
    await this.waitForSelector('[class*=PartyParticipantWindow]', duration)
  }

  async delay(timeout) {
    console.log(`Waiting for ${timeout} ms... `)
    await this.waitForTimeout(timeout)
  }

  async interactObject() {}

  /** Runs a function and takes a screenshot if it fails
   * @param {Function} fn Function to execut _in the node context._
   */
  async catchAndScreenShot(fn, path = 'botError.png') {
    try {
      await fn()
    } catch (e) {
      if (this.page) {
        console.warn('Caught error. Trying to screenshot')
        this.page.screenshot({ path })
      }
      throw e
    }
  }

  async addScript(path) {
    this.page.on('framenavigated', async (frame) => {
      if (frame !== this.page.mainFrame()) {
        return
      } else {
        const el = await this.page.addScriptTag({ path })
        console.log(el)
      }
    })
  }

  /**
   * Runs a funciton in the browser context
   * @param {Function} fn Function to evaluate in the browser context
   * @param args The arguments to be passed to fn. These will be serailized when passed through puppeteer
   */
  async evaluate(fn, ...args) {
    return await this.page.evaluate(fn, ...args)
  }

  async runHook(hook, ...args) {
    return await this.page.evaluate(
      async (hook, ...args) => {
        console.log('[XR-BOT]:', hook, ...args)
        if (!globalThis.botHooks) {
          return
        }
        return globalThis.botHooks[hook](...args)
      },
      hook,
      ...args
    )
  }

  async awaitPromise(fn, period = 100, ...args) {
    return await new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (await this.page.evaluate(fn, ...args)) {
          resolve()
          clearInterval(interval)
        }
      }, period)
    })
  }

  async awaitHookPromise(hook, period = 100, ...args) {
    console.log('[XR-BOT]: awaiting', hook, ...args)
    return await new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (
          await this.page.evaluate(
            async (hook, ...args) => {
              if (!globalThis.botHooks) {
                return
              }
              return globalThis.botHooks[hook](...args)
            },
            hook,
            ...args
          )
        ) {
          resolve()
          clearInterval(interval)
        }
      }, period)
    })
  }
  /**
   * A main-program type wrapper. Runs a function and quits the bot with a
   * screenshot if the function throws an exception
   * @param {Function} fn Function to evaluate in the node context
   */
  exec(fn) {
    this.catchAndScreenShot(() => fn(this)).catch((e) => {
      console.error('Failed to run. Check botError.png if it exists. Error:', e)
      process.exit(-1)
    })
  }

  /**
   * Detect OS platform and set google chrome path.
   */
  detectOsOption() {
    const os = getOS()
    const options: any = {}
    let chromePath = ''
    switch (os) {
      case 'macOS':
        chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        break
      case 'Windows':
        chromePath = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
        break
      case 'Linux':
        chromePath = '/usr/bin/google-chrome'
        break
      default:
        break
    }

    if (chromePath) {
      if (fs.existsSync(chromePath)) {
        options.executablePath = chromePath
      } else {
        console.warn('Warning! Please install Google Chrome to make bot workiing correctly in headless mode.\n')
      }
    }
    return options
  }

  /** Launches the puppeteer browser instance. It is not necessary to call this
   *  directly in most cases. It will be done automatically when needed.
   */
  async launchBrowser() {
    const options = {
      dumpio: this.verbose,
      headless: this.headless,
      devtools: !this.headless,
      ignoreHTTPSErrors: true,
      defaultViewport: this.windowSize,
      ignoreDefaultArgs: ['--mute-audio'],
      args: [
        this.headless ? '--headless' : '--enable-webgl',
        '--enable-features=NetworkService',
        '--ignore-certificate-errors',
        `--no-sandbox`,
        `--disable-dev-shm-usage`,
        '--shm-size=4gb',
        `--window-size=${this.windowSize.width},${this.windowSize.height}`,
        '--use-fake-ui-for-media-stream=1',
        '--use-fake-device-for-media-stream=1',
        '--disable-web-security=1',
        '--no-first-run',
        '--allow-file-access=1',
        '--mute-audio'
      ],
      ...this.detectOsOption()
    }

    this.browser = await puppeteer.launch(options)

    this.page = await this.browser.newPage()
    this.page.on('close', () => {
      console.log('[XRENGINE BOT]: page closed')
      this.page = undefined
    })

    if (this.verbose) {
      // this.page.on('console', (consoleObj) => console.log('>> ', consoleObj.text()))
    }

    // this.page
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
    )

    this.pageUtils = new PageUtils(this)
  }

  async pressKey(keycode) {
    await this.page.keyboard.down(keycode)
  }

  async releaseKey(keycode) {
    await this.page.keyboard.up(keycode)
  }

  async navigate(url) {
    if (!this.browser) {
      throw Error('Cannot navigate without a browser!')
    }

    let parsedUrl = new URL(url)
    const context = this.browser.defaultBrowserContext()
    console.log('permission allow for ', parsedUrl.origin)
    context.overridePermissions(parsedUrl.origin, ['microphone', 'camera'])

    console.log('Going to ' + url)
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60 * 1000 })

    const granted = await this.page.evaluate(async () => {
      // @ts-ignore
      return (await navigator.permissions.query({ name: 'camera' })).state
    })
    console.log('Granted:', granted)
  }

  /** Enters the room specified, enabling the first microphone and speaker found
   * @param {string} roomUrl The url of the room to join
   * @param {Object} opts
   * @param {string} opts.name Name to set as the bot name when joining the room
   */
  async enterRoom(roomUrl) {
    await this.navigate(roomUrl)
    await this.page.waitForSelector('div[class*="instance-chat-container"]', { timeout: 100000 })

    if (this.headless) {
      // Disable rendering for headless, otherwise chromium uses a LOT of CPU
    }

    await this.page.mouse.click(0, 0)
    // await new Promise(resolve => {setTimeout(async() => {
    //     // await this.pu.clickSelectorClassRegex("button", /join_world/);
    //     setTimeout(async() => {
    //         // await this.page.waitForSelector('button.openChat');
    //         resolve();
    //     }, 30000)
    // }, 2000) });
  }

  /** Enters the room specified, enabling the first microphone and speaker found
   * @param {string} roomUrl The url of the room to join
   * @param {Object} opts
   * @param {string} opts.name Name to set as the bot name when joining the room
   */
  async enterLocation(roomUrl) {
    await this.navigate(roomUrl)
    await this.page.waitForFunction("document.querySelector('canvas')", { timeout: 1000000 })
    console.log('selected sucessfully')
    await this.page.mouse.click(0, 0)
    await this.setFocus('canvas')
    await this.clickElementById('canvas', 'engine-renderer-canvas')
    // await new Promise(resolve => {setTimeout(async() => {
    //     // await this.pu.clickSelectorClassRegex("button", /join_world/);
    //     setTimeout(async() => {
    //         // await this.page.waitForSelector('button.openChat');
    //         resolve();
    //     }, 30000)
    // }, 2000) });
  }

  async waitForTimeout(timeout) {
    return await new Promise<void>((resolve) => setTimeout(() => resolve(), timeout))
  }

  async waitForSelector(selector, timeout) {
    return this.page.waitForSelector(selector, { timeout })
  }

  async clickElementByClass(elemType, classSelector) {
    await this.pageUtils.clickSelectorClassRegex(elemType || 'button', classSelector)
  }

  async clickElementById(elemType, id) {
    await this.pageUtils.clickSelectorId(elemType, id)
  }

  async typeMessage(message) {
    console.log('typing using keyboard')
    await this.page.keyboard.type(message)
  }

  async setFocus(selector) {
    await this.page.focus(selector)
  }

  /**
   * Leaves the room and closes the browser instance without exiting node
   */
  quit() {
    if (this.page) {
      this.page.close()
    }
    if (this.browser) {
      this.browser.close()
    }
  }
}
