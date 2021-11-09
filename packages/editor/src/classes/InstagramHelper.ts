// Native
import crypto from 'crypto'
import axios from 'axios'

const baseUrl = 'https://www.instagram.com'
const axiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    'Accept-Language': 'en-US',
    'X-Instagram-AJAX': '1',
    accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/x-www-form-urlencoded',
    referer: baseUrl
  }
})

class Instagram {
  credentials: { username: any; password: any; cookies: undefined | any; _sharedData: undefined | any }
  constructor({ username, password }) {
    this.credentials = {
      username,
      password,
      cookies: undefined,
      _sharedData: undefined
    }
  }

  async login({ username, password }: any = {}, { _sharedData = true } = {}) {
    username = username || this.credentials.username
    password = password || this.credentials.password

    // Get CSRFToken from cookie before login
    let value
    const resFromAxios = await axiosInstance({
      method: 'GET',
      url: '/'
    })

    const pattern = new RegExp(/(csrf_token":")\w+/)
    const resData: any = resFromAxios.data
    const matches = resData.match(pattern)
    value = matches[0].substring(13)

    // Provide CSRFToken for login or challenge request
    axiosInstance.defaults.headers['X-CSRFToken'] = value

    // Temporary work around for https://github.com/jlobos/instagram-web-api/issues/118
    const createEncPassword = (pwd) => {
      return `#PWD_INSTAGRAM_BROWSER:0:${Date.now()}:${pwd}`
    }

    // Login
    const params = new URLSearchParams()
    params.append('username', username)
    params.append('enc_password', createEncPassword(password))
    const loginResFromAxios = await axiosInstance({
      method: 'POST',
      url: '/accounts/login/ajax/',
      data: params
    })

    if (!loginResFromAxios.headers['set-cookie']) {
      throw new Error('No cookie')
    }

    const cookies = loginResFromAxios.headers['set-cookie']
    const csrftoken = cookies[0].slice(10, 42)
    axiosInstance.defaults.headers['X-CSRFToken'] = csrftoken
    axiosInstance.defaults.headers['Cookie'] = cookies

    this.credentials = {
      username,
      password,
      // Add cookies to credentials
      cookies: cookies,
      _sharedData: undefined
    }

    // Provide _sharedData
    this.credentials._sharedData = await this._getSharedData()

    return loginResFromAxios.data
  }

  async _getSharedData(url = '/') {
    const res: any = await axiosInstance({
      method: 'GET',
      url
    })
    const sharedData = res.data.split('window._sharedData = ')[1].split(';</script>')[0]
    return JSON.parse(sharedData)
  }

  async _getGis(path) {
    const { rhx_gis } = this.credentials._sharedData || (await this._getSharedData(path))

    return crypto.createHash('md5').update(`${rhx_gis}:${path}`).digest('hex')
  }

  async logout() {
    // return this.request('/accounts/logout/ajax/')
  }

  async getUserByUsername({ username }) {
    const res: any = await axiosInstance({
      url: `/${username}/?__a=1`,
      method: 'GET',
      headers: {
        referer: baseUrl + '/' + username + '/',
        'x-instagram-gis': await this._getGis(`/${username}/`)
      }
    })

    return res.data.graphql.user
  }

  async getUserIdPhotos({ id, first = 12, after = '' }: any = {}) {
    const params = new URLSearchParams()
    params.append('query_hash', '6305d415e36c0a5f0abb6daba312f2dd')
    params.append('variables', JSON.stringify({ id, first, after }))
    const res: any = await axiosInstance({
      url: `/graphql/query?${params.toString()}`,
      method: 'GET',
      data: params
    })
    return res.data.data
  }

  async getPhotosByUsername({ username, first, after }) {
    const user = await this.getUserByUsername({ username })
    return this.getUserIdPhotos({ id: user.id, first, after })
  }
}

export default Instagram
