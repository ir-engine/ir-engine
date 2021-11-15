import { Application } from '../../../declarations'
import express from 'express'
import axios from 'axios'
import crypto from 'crypto'

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
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/x-www-form-urlencoded',
    referer: baseUrl
  }
})

const getGis = (path, sharedData) => {
  const { rhx_gis } = sharedData

  return crypto.createHash('md5').update(`${rhx_gis}:${path}`).digest('hex')
}

const getUserByUsername = async (username, csrfToken, cookies, sharedData) => {
  const gis = getGis(`/${username}/`, sharedData)
  const res: any = await axiosInstance({
    url: `/${username}/?__a=1`,
    method: 'GET',
    headers: {
      'X-CSRFToken': csrfToken,
      referer: baseUrl + '/' + username + '/',
      'x-instagram-gis': gis,
      Cookie: cookies
    }
  })

  return res.data.graphql.user
}

const getUserIdPhotos = async ({ id, first = 12, after = '' }, csrfToken, cookies) => {
  const params = new URLSearchParams()
  params.append('query_hash', '6305d415e36c0a5f0abb6daba312f2dd')
  params.append('variables', JSON.stringify({ id, first, after }))
  const res: any = await axiosInstance({
    url: `/graphql/query?${params.toString()}`,
    method: 'GET',
    data: params,
    headers: {
      'X-CSRFToken': csrfToken,
      Cookie: cookies
    }
  })
  return res.data.data
}

export const login = (app: Application): any => {
  return async (req: express.Request, res: express.Response) => {
    const { username, password } = req.body
    const resFromAxios: any = await axiosInstance({
      method: 'GET',
      url: '/'
    })

    const pattern = new RegExp(/(csrf_token":")\w+/)
    const matches = resFromAxios.data.match(pattern)
    const value = matches[0].substring(13)

    const createEncPassword = (pwd) => {
      return `#PWD_INSTAGRAM_BROWSER:0:${Date.now()}:${pwd}`
    }

    const params = new URLSearchParams()
    params.append('username', username)
    params.append('enc_password', createEncPassword(password))
    const loginResFromAxios: any = await axiosInstance({
      method: 'POST',
      url: '/accounts/login/ajax/',
      data: params,
      headers: {
        'X-CSRFToken': value
      }
    })

    if (!loginResFromAxios.headers['set-cookie']) {
      throw new Error('No cookie')
    }

    const cookies = loginResFromAxios.headers['set-cookie']
    const csrfToken = cookies[0].slice(10, 42)

    const getSharedData = async (url = '/') => {
      const res: any = await axiosInstance({
        method: 'GET',
        url,
        headers: {
          'X-CSRFToken': csrfToken,
          Cookie: cookies
        }
      })
      const sharedData = res.data.split('window._sharedData = ')[1].split(';</script>')[0]
      return JSON.parse(sharedData)
    }

    const sharedData = await getSharedData()

    res.json({ body: loginResFromAxios.data, csrfToken, cookies, sharedData })
  }
}

export const getPhotosByUsername = (app: Application): any => {
  return async (req: express.Request, res: express.Response) => {
    const { username, csrfToken, cookies, sharedData } = req.body

    const user = await getUserByUsername(username, csrfToken, cookies, sharedData)
    const photos = await getUserIdPhotos({ id: user.id }, csrfToken, cookies)

    res.json(photos)
  }
}
