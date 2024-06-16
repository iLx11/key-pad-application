import axios from 'axios'

export const getLatestVersion = async (): Promise<any> => {
  return await axios.get('https://multi-p-version-pajlfpadoe.cn-hangzhou.fcapp.run')
  .then(response => {
    return new Promise((resolve) => resolve(response.data))
  })
  .catch(error => {
    return error
  })
}