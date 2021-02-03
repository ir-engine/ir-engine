const InBrowserBot = require('./in-browser-bot');

/**
 Converts a {@link HubsBot} into an {@link InBrowserBot}. This should not be
 used directly, but rather accessed through {@link HubsBot.asBrowserBot}
 */
class InBrowserBotBuilder {
    constructor(baseBot, fn, ...args) {
        this.actions = []
        this.botProxy = {}

        this.fn = fn
        this.baseBot = baseBot
        this.args = args
    }

    /**
     Create a string suiteable for copying and pasting into the developer console
     which can create and run the the associated bot.
     */
    toString({
                 includeClassDefinition = true,
                 closure = true
             } = {})
    {
        let lines = []
        if (includeClassDefinition)
        {
            lines.push(InBrowserBot.toString())
        }

        lines.push (`var Xr3ngineBot = InBrowserBot;`)

        let botClassName = this.baseBot.constructor.name

        let botClass = this.baseBot.constructor

        while (botClass.name !== 'InBrowserBot' && botClass.name !== 'XR3ngineBot')
        {
            lines.push(botClass.toString())
            botClass = Object.getPrototypeOf(botClass)
        }

        lines.push(`var _fn = ${this.fn.toString()};`)

        lines.push(`var _args = ${JSON.stringify(this.args)}`)

        lines.push(`window.bot = new ${botClassName}(); _fn(window.bot, ..._args);`)

        return lines.join("\n")
    }
}

module.exports = InBrowserBotBuilder