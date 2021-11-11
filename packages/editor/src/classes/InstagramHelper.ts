// Native
import crypto from 'crypto'
import axios from 'axios'

const baseUrl = 'https://www.instagram.com'
const axiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: {
    'Accept-Language': 'en-US',
    'X-Instagram-AJAX': '1',
    accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/x-www-form-urlencoded',
    referer: baseUrl,
    'Referrer-Policy': 'strict-origin-when-cross-origin'
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

    this.credentials = {
      username,
      password,
      // Add cookies to credentials
      cookies: cookies,
      _sharedData: undefined
    }

    return loginResFromAxios.data
  }
}

export default Instagram
