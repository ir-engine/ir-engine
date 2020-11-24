import axios from 'axios';
import getConfig from 'next/dist/next-server/lib/runtime-config';
const { publicRuntimeConfig } = getConfig();

export const apiUrl = process.env.NODE_ENV === 'production' ? publicRuntimeConfig.apiServer : 'https://localhost:3030';

export function getAuthHeader () {
  return {};
}

export function ajaxGet (url: string, noAuth: boolean) {
  if (noAuth) {
    return fetch(url, { method: 'GET' })
      .then(res => res.json());
  } else {
    const headers = getAuthHeader();
    return fetch(url, { method: 'GET', headers })
      .then(res => res.json());
  }
}

export function ajaxPost (url: string, data: any, noAuth: boolean, image: boolean) {
  if (noAuth) {
    return fetch(url, {
      method: 'POST',
      body: image ? data : JSON.stringify(data),
      headers: {
        Accept: 'application/json',
        'Content-Type': image ? 'multipart/form-data' : 'application/jsoncharset=UTF-8'
      }
    })
      .then(res => res.json());
  } else {
    const headers = getAuthHeader();
    return fetch(url, {
      method: 'POST',
      body: image ? data : JSON.stringify(data),
      headers: {
        ...headers,
        Accept: 'application/json',
        'Content-Type': image ? 'multipart/form-data' : 'application/jsoncharset=UTF-8'
      }
    })
      .then(res => res.json());
  }
}

export function axiosRequest (method: any, url: any, data?: any): any { axios({ method, url, data }); }
