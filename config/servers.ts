require('dotenv')

export default class ServerConfig {
    apiServer : any = (process.env.API_SERVER_URL ? process.env.API_SERVER_URL : 'http://localhost:3030')
}