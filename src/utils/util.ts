import { GM_getValue, GM_setValue } from '$'

export interface IData {
  [key: string]: any
}

const TokenKeyName = 'my-github-plus:token'

export const GithubApi = 'https://api.github.com'

export function getToken() {
  return GM_getValue(TokenKeyName, '')
}

export function setToken(data: string) {
  GM_setValue(TokenKeyName, data)
}

export function getRequestHeader() {
  let headers = {}

  // github token
  const token = getToken()

  if (token) {
    headers = {
      'Authorization': `token ${token}`,
      'User-Agent': 'Awesome-Octocat-App',
    }
  }

  return headers
}
/** 用来发起 http 请求 */
export function getUserNameWithRepoNameFromGithubURL() {
  const pathnames = window.location.pathname.split('/')

  const user = pathnames[1]
  const repo = pathnames[2]

  return {
    user,
    repo,
  }
}
/** 用来显示 */
export function getUserNameWithRepoNameStr() {
  const data = getUserNameWithRepoNameFromGithubURL()
  return `${data.user} / ${data.repo}`
}

export function checkStatus(response: { status: number }) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  throw new Error(`GitHub returned a bad status: ${response.status}. Please set API token if Rate limiting is the cause(explained in README).`)
}
export function checkStatus2(response: { status: number }) {
  return response.status >= 200 && response.status < 300
}
export function parseJSON(response: any) {
  return response === null ? null : response.json()
}

export function convertToBeijingTime(utcTime: string) {
  // const utcTime = "2025-02-01T10:34:52Z";
  // 创建一个 Date 对象
  const date = new Date(utcTime)

  // 转换为北京时间（UTC+8）
  const beijingTime = date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true, // 使用 24 小时制
  })

  return beijingTime
}

/**
 * byte 转 大单位
 * @param bytes 单位 bytes , 如果是 kb 请先 *1024, 再调用这个函数
 */
export function convertSizeToHumanReadableFormat(bytes: number) {
  if (bytes === 0) {
    return {
      size: 0,
      measure: 'Bytes',
    }
  }

  bytes = bytes * 1024

  const K = 1024
  const MEASURE = ['', 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(K))

  return {
    size: Number.parseFloat((bytes / K ** i).toFixed(2)),
    measure: MEASURE[i],
  }
}

/**
 * @param sizeKb 单位：kb
 */
export function getSizeAndUnit(sizeKb: number) {
  // github 接口返回的是 kb
  // kb 转为 bytes
  const sizeBytes = sizeKb * 1024
  const formatBytes = convertSizeToHumanReadableFormat(sizeBytes)
  const size = formatBytes.size
  const unit = formatBytes.measure

  return `${size} ${unit}`
}

export function showChineseDate() {
  const yearNumber = new Date().getFullYear()
  const yearStr = String(yearNumber)
  const lastYearStr = String(yearNumber - 1)
  const times = document.querySelectorAll('relative-time') as unknown as any[]

  for (const item of times) {
    let title = item.title

    title = title.replace('Jan', '1 月')
    title = title.replace('Feb', '2 月')
    title = title.replace('Mar', '3 月')
    title = title.replace('Apr', '4 月')
    title = title.replace('May', '5 月')
    title = title.replace('Jun', '6 月')
    title = title.replace('Jul', '7 月')
    title = title.replace('Aug', '8 月')
    title = title.replace('Sep', '9 月')
    title = title.replace('Oct', '10 月')
    title = title.replace('Nov', '11 月')
    title = title.replace('Dec', '12 月')
    title = title.replace(' GMT+8', '')
    title = title.replace(`${yearStr},`, '')
    title = title.replace(`${lastYearStr},`, '去年,')

    // title = title.replace("AM", "上午");
    // title = title.replace("PM", "下午");
    item.shadowRoot.textContent = title

    // 不喜欢样式可以去掉,使用 github 默认的 style
    item.style = `
      position: relative;
      background-color: yellow;
      border: 1px solid red;
      z-index: 99999;
      padding: 1px 5px;
    `
  }
}
export function pathJoin(...pathArr: any[]) {
  return pathArr.join('/')
}

/** 获取相对时间 (eg: 1分钟前, 2年前) */
export function getRelativeTime(timeStr: string) {
  const now = new Date()
  const target = new Date(timeStr)
  // @ts-expect-error 两个日期相减
  const diffMs = now - target // 时间差（毫秒）

  // 时间单位换算
  const units = [
    { label: '年', ms: 31536000000 },
    { label: '个月', ms: 2628000000 },
    { label: '天', ms: 86400000 },
    { label: '小时', ms: 3600000 },
    { label: '分钟', ms: 60000 },
  ]

  for (const unit of units) {
    const value = Math.floor(diffMs / unit.ms)
    if (value >= 1)
      return `${value}${unit.label}前`
  }
  return '刚刚'
}

export function formatNumberToChinese(num: number) {
  if (typeof num !== 'number' || num < 0)
    return num.toString()
  if (num < 10000)
    return num.toString()

  let result = ''
  let remaining = num

  // 处理亿级单位
  const yi = Math.floor(remaining / 100000000)
  if (yi > 0) {
    result += `${yi} 亿`
    remaining %= 100000000
  }

  // 处理万级单位
  const wan = Math.floor(remaining / 10000)
  if (wan > 0) {
    result += `${wan} 万`
    remaining %= 10000
  }

  // 处理千级单位
  const qian = Math.floor(remaining / 1000)
  if (qian > 0) {
    result += `${qian} 千`
    remaining %= 1000 // 此处不再处理余数
  }

  return result.replace(/(\D)(\d)/g, '$1 $2')
}
