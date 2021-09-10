import { client } from '../feathers'

async function waitForClientAuthenticated(): Promise<void> {
  //console.log('Client authenticated?', client.authentication?.authenticated)
  if (client.authentication?.authenticated === true) return Promise.resolve()
  else
    return await new Promise((resolve) =>
      setTimeout(async () => {
        await waitForClientAuthenticated()
        resolve()
      }, 100)
    )
}

export default waitForClientAuthenticated
