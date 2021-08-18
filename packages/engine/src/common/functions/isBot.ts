
export function isBot(location : Location)  {
    const query = location.search
    const params = new URLSearchParams(query)
    const isBot = params.get('bot')
    return isBot
  }