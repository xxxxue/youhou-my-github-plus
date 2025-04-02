import type { IData } from './util'
import { GM_xmlhttpRequest } from '$'
import { checkStatus, checkStatus2, convertToBeijingTime, getRelativeTime, getRequestHeader, getSizeAndUnit, getUserNameWithRepoNameFromGithubURL, GithubApi, parseJSON, pathJoin } from './util'

export function getUserInfo() {
  // https://api.github.com/users/ant-design
  return new Promise<IData>((resolve, reject) => {
    const path = getUserNameWithRepoNameFromGithubURL()

    if (!path.user) {
      reject(new Error('在 URL 中没有找到 user'))
      return
    }

    window
      .fetch(pathJoin(GithubApi, 'users', path.user), {
        headers: getRequestHeader(),
      })
      .then(checkStatus)
      .then(parseJSON)
      .then((data: IData) => {
        delete data.gravatar_id
        delete data.node_id

        Object.keys(data)
          .filter(key => key.endsWith('url'))
          .forEach(key => delete data[key])

        resolve(data)
      })
      .catch((error) => {
        if (error) {
          console.error('Error in enhanced-github', error)
          reject(new Error(error))
        }
      })
  })
}

export function getRepoInfo() {
  // https://api.github.com/repos/ant-design/ant-design
  return new Promise<IData>((resolve, reject) => {
    const path = getUserNameWithRepoNameFromGithubURL()

    if (!path.user || !path.repo) {
      reject(new Error('在 URL 中没有找到 user/repo'))
      return
    }

    const repoPath = pathJoin(path.user, path.repo)

    window
      .fetch(pathJoin(GithubApi, 'repos', repoPath), {
        headers: getRequestHeader(),
      })
      .then(checkStatus)
      .then(parseJSON)
      .then((data) => {
        data.size = getSizeAndUnit(data.size)

        resolve({
          id: data.id,
          full_name: data.full_name,
          size: data.size,
          default_branch: data.default_branch,
          created_at: data.created_at,
          updated_at: data.updated_at,
          pushed_at: data.pushed_at,
        } as any)
      })
      .catch((error) => {
        if (error) {
          console.error('Error:', error)
          reject(error)
        }
      })
  })
}
export async function getPackageJson() {
  const repoInfo = await getRepoInfo()

  // https://raw.githubusercontent.com/ant-design/ant-design/refs/heads/master/package.json
  return new Promise<any>((resolve, reject) => {
    const path = getUserNameWithRepoNameFromGithubURL()

    if (!path.user || !path.repo) {
      reject(new Error('在 URL 中没有找到 user/repo'))
      return
    }

    const baseURL = 'https://raw.githubusercontent.com'
    const repoPath = pathJoin(path.user, path.repo)
    const serviceURL = pathJoin(baseURL, repoPath, 'refs/heads', repoInfo.default_branch, 'package.json')

    // GM_xmlhttpRequest 支持跨域，fetch 不支持跨域
    GM_xmlhttpRequest({
      method: 'GET',
      url: serviceURL,
      headers: {
        'Content-Type': 'application/json',
        ...getRequestHeader(),
      },
      onload: (response) => {
        if (!checkStatus2(response)) {
          reject(new Error(`GitHub returned a bad status: ${response.status}. Please set API token if Rate limiting is the cause(explained in README).`))
          return
        }

        const data = JSON.parse(response.responseText)

        resolve({
          name: data.name,
          version: data.version,
          dependencies: data.dependencies,
          devDependencies: data.devDependencies,
          peerDependencies: data.peerDependencies,
        } as any)
      },
      onerror: (error) => {
        if (error) {
          console.error('Error:', error)
          reject(error)
        }
      },
    })
  })
}
export function getReleaseInfo(pageIndex: number = 1, pageSize: number = 10) {
  // https://api.github.com/repos/gedoor/legado/releases?per_page=10&&page=1
  return new Promise<IData>((resolve, reject) => {
    const path = getUserNameWithRepoNameFromGithubURL()

    if (!path.user || !path.repo) {
      reject(new Error('在 URL 中没有找到 user/repo'))

      return
    }

    const repoPath = pathJoin(path.user, path.repo)
    const url = `${pathJoin(GithubApi, 'repos', repoPath, 'releases')}?per_page=${pageSize}&&page=${pageIndex}`
    fetch(url, {
      headers: getRequestHeader(),
    })
      .then(checkStatus)
      .then(parseJSON)
      .then((data: any[]) => {
        const ret: any[] = []

        data.forEach((v) => {
          if (v.draft === false && v.prerelease === false) {
            let total_download_count = 0

            const assets: any[] = []

            v.assets.forEach((a: any) => {
              total_download_count += a.download_count
              assets.push({
                name: a.name,
                download_count: a.download_count,
              })
            })

            const item = {
              name: v.name !== '' ? v.name : v.tag_name,
              relative_time: getRelativeTime(v.published_at),
              total_count: total_download_count,
              published_at: convertToBeijingTime(v.published_at),
              assets,
            }
            ret.push(item)
          }
        })
        resolve(ret)
      })
      .catch((error) => {
        if (error) {
          console.error('Error:', error)
          reject(error)
        }
      })
  })
}
