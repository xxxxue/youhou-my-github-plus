import type { CSSProperties, JSX } from 'react'
import type { IData } from './utils/util'
import NiceModal from '@ebay/nice-modal-react'
import { SlDrawer, SlRelativeTime } from '@shoelace-style/shoelace/dist/react'
import { useRequest } from 'ahooks'
import { useMemo, useRef, useState } from 'react'
import { DialogReleaseInfo } from './components/DialogReleaseInfo'
import { getPackageJson, getRepoInfo, getUserInfo } from './utils/api'
import { convertToBeijingTime, getSizeAndUnit, getToken, setToken, showChineseDate } from './utils/util'

function App() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<IData | string>({})
  const tokenInputRefRef = useRef<HTMLInputElement>(null)

  /** 显示与隐藏 gitMaster 的侧边按钮，使其不遮挡 SlDrawer */
  const changeGitMasterDomDisplay = (display: 'block' | 'none') => {
    const gitMasterHoverDiv = document.querySelector<HTMLDivElement>('.gitmaster-toggle')

    if (gitMasterHoverDiv) {
      gitMasterHoverDiv.style.display = display
    }
  }

  const closeDrawer = () => {
    changeGitMasterDomDisplay('block')
    setOpen(false)
  }

  const openDrawer = () => {
    changeGitMasterDomDisplay('none')
    setOpen(true)
  }

  const convertKeyNameToCN = (keyName: string) => {
    const map: {
      [key: string]: string
    } = {
      type: '类型',
      public_repos: '公开仓库',
      public_gists: '公开 gists',
      private_gists: '私有 gists',
      total_private_repos: '私有仓库数量',
      owned_private_repos: '拥有的私有仓库数量',
      disk_usage: '硬盘占用',
      followers: '粉丝',
      following: '关注',
      created_at: '创建时间',
      updated_at: '更新时间',
      full_name: '完整名称',
      size: '大小',
      default_branch: '默认分支',
      pushed_at: '推送时间',
    }

    const value = map[keyName]

    if (value) {
      return value
    }
    else {
      return keyName
    }
  }

  const showDataJsx = useMemo(() => {
    if (typeof data === 'string') {
      return data
    }

    return Object.entries(data).map(([key, value]) => {
      if (typeof value != 'number' && typeof value != 'boolean' && !value) {
        return undefined
      }

      if (value === undefined || value === null
        || value.toString().trim().length === 0) {
        return undefined
      }

      const oldValue = value

      if (key.endsWith('_at')) {
        value = convertToBeijingTime(value)
      }

      if (key === 'disk_usage') {
        // disk_usage : 【 681527 】
        value = getSizeAndUnit(value)
      }

      let isObject = false

      if (typeof value == 'object') {
        isObject = true
        value = JSON.stringify(value, null, 2)
      }
      else {
        value = value.toString()
      }

      let relativeTimeJsx: JSX.Element | undefined

      if (key.endsWith('_at')) {
        relativeTimeJsx = (
          <SlRelativeTime
            date={oldValue}
            lang="zh-cn"
          />
        )
      }

      key = convertKeyNameToCN(key)

      return (
        <div key={key}>
          <span>{key}</span>
          <span> : </span>
          <span
            style={{
              color: 'purple',
            }}
          >
            {isObject ? <pre>{value}</pre> : `【 ${value} 】`}
          </span>
          {relativeTimeJsx}
        </div>
      )
    })
  }, [data])

  const infoReq = useRequest((p: () => Promise<IData>) => p(), {
    manual: true,
    loadingDelay: 300,
    onSuccess(data) {
      setData(data)
    },
    onError(e) {
      setData(e.message)
    },
  })

  const [showTokenBox, setShowTokenBox] = useState<boolean>(false)
  return (
    <>
      <SlDrawer
        noHeader
        placement="start"
        style={{
          '--size': 'fit-content',
          '--body-spacing': '10px',
          '--footer-spacing': '10px',
          'zIndex': 99999,
        } as CSSProperties}
        open={open}
        onSlAfterHide={() => setOpen(false)}
        onSlRequestClose={() => {
          changeGitMasterDomDisplay('block')
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '5px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setShowTokenBox(p => !p)
              }}
            >
              填写 token
            </button>

            <button
              type="button"
              onClick={() => {
                NiceModal.show(DialogReleaseInfo)
              }}
            >
              release 信息
            </button>
            <button
              type="button"
              onClick={() => {
                showChineseDate()
                closeDrawer()
              }}
            >
              中文日期
            </button>
          </div>
          {
            showTokenBox && (
              <div
                style={{
                  display: 'flex',
                  gap: '5px',
                }}
              >
                <input
                  ref={tokenInputRefRef}
                  defaultValue={getToken()}
                  placeholder="input github token"
                />
                <button
                  type="button"
                  onClick={() => {
                    const v = tokenInputRefRef.current?.value
                    if (v) {
                      setToken(v)
                      alert('保存')
                    }
                  }}
                >
                  保存 token
                </button>
              </div>
            )
          }
          <div
            style={{
              display: 'flex',
              gap: '5px',
            }}
          >
            <button
              type="button"
              onClick={async () => {
                infoReq.runAsync(getUserInfo)
              }}
            >
              用户信息
            </button>
            <button
              type="button"
              onClick={() => {
                infoReq.runAsync(getRepoInfo)
              }}
            >
              仓库信息
            </button>

            <button
              type="button"
              onClick={() => {
                infoReq.runAsync(getPackageJson)
              }}
            >
              package.json
            </button>

          </div>
        </div>
        <div style={{ marginTop: '10px' }}>
          {infoReq.loading ? 'loading...' : showDataJsx}
        </div>
        <div
          slot="footer"
          style={{ width: '100%', textAlign: 'left' }}
        >
          <button
            type="button"
            onClick={closeDrawer}
          >
            关闭
          </button>
        </div>
      </SlDrawer>
      <button
        type="button"
        onClick={openDrawer}
      >
        工具箱
      </button>
    </>
  )
}

export default App
