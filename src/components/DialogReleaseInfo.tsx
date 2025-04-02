import type { CSSProperties } from 'react'
import NiceModal from '@ebay/nice-modal-react'
import { SlDialog } from '@shoelace-style/shoelace/dist/react'
import { useRequest } from 'ahooks'
import { useEffect, useMemo, useState } from 'react'
import { getReleaseInfo } from '../utils/api'
import { formatNumberToChinese, getUserNameWithRepoNameStr } from '../utils/util'

const tdStyle: CSSProperties = { border: '1px solid #eee', padding: '8px' }
const thStyle: CSSProperties = { border: '1px solid #333', padding: '8px' }
const tableStyle: CSSProperties = {
  border: '1px solid #333',
  borderCollapse: 'collapse',
  width: '100%',
}

const DialogReleaseAssetsInfo = NiceModal.create<{ data?: any }>((props) => {
  const modal = NiceModal.useModal()

  return (
    <SlDialog
      noHeader
      open={modal.visible}
      onSlRequestClose={modal.hide}
      onSlAfterHide={modal.remove}
    >
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>名称</th>
            <th style={thStyle}>下载数</th>
          </tr>
        </thead>
        <tbody>
          {props.data.map((v: any) => {
            return (
              <tr key={v.name}>
                <td style={tdStyle}>
                  {v.name}
                </td>
                <td
                  style={tdStyle}
                >
                  {formatNumberToChinese(v.download_count)}
                </td>

              </tr>
            )
          })}
        </tbody>
      </table>
    </SlDialog>
  )
})

export const DialogReleaseInfo = NiceModal.create(() => {
  const modal = NiceModal.useModal()
  const [pageIndex, setPageIndex] = useState<number>(1)
  const infoReq = useRequest((index: number) => getReleaseInfo(index), {
    cacheKey: `${getUserNameWithRepoNameStr()}/${pageIndex}`,
    staleTime: 300000, // 新鲜, 返回缓存, 不会发起请求 (一般设置较小, 这里是因为 github release 不长变化)
    cacheTime: 300000, // 缓存, 返回缓存, 并在后台发起请求,再返回新数据
    // loadingDelay 不能和 staleTime 同时开启,会出现无限 loading 的 bug
    // https://github.com/alibaba/hooks/issues/2142
    // loadingDelay: 300,
  })

  const [hasNextPage, setHasNextPage] = useState<boolean>(true)
  useEffect(() => {
    infoReq.runAsync(pageIndex)
  }, [pageIndex])

  const tableDataJsx = useMemo(() => {
    if (!infoReq.data && infoReq.loading) {
      return 'loading...'
    }

    if (!infoReq.data || infoReq.data.length === 0) {
      setHasNextPage(false)
      return '没有数据...'
    }

    return infoReq.data.map((v: any) => {
      return (
        <tr key={v.published_at}>
          <td style={tdStyle}>
            {v.name}
          </td>
          <td
            style={{
              ...tdStyle,
              cursor: 'pointer',
            }}
            onClick={() => {
              v.assets.sort((a: any, b: any) => b.download_count - a.download_count)
              NiceModal.show(DialogReleaseAssetsInfo, { data: v.assets })
            }}
          >
            {formatNumberToChinese(v.total_count)}
          </td>
          <td
            style={{
              ...tdStyle,
              cursor: 'pointer',
            }}
            onClick={() => alert(v.published_at)}
          >
            {v.relative_time}
          </td>
        </tr>
      )
    })
  }, [infoReq.data, infoReq.loading])

  return (
    <>
      <SlDialog
        noHeader
        open={modal.visible}
        onSlRequestClose={modal.hide}
        onSlAfterHide={modal.remove}
      >
        <div
          style={{
            display: 'flex',
            marginBottom: '10px',
          }}
        >
          <button
            disabled={pageIndex <= 1}
            type="button"
            onClick={() => {
              if (!hasNextPage) {
                setHasNextPage(true)
              }
              setPageIndex((p) => {
                if (p <= 1) {
                  return 1
                }
                return p - 1
              })
            }}
          >
            上一页
          </button>
          <div
            style={{
              flexGrow: 1,
              display: 'flex',
              gap: '5px',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={
              () => {
                if (confirm('关闭弹窗?')) {
                  modal.hide()
                }
              }
            }
          >
            <span>
              {getUserNameWithRepoNameStr()}
            </span>
            {infoReq.loading && <span style={{ color: 'red' }}>loading...</span>}
          </div>
          <button
            disabled={!hasNextPage}
            type="button"
            onClick={() => {
              setPageIndex((p) => {
                return p + 1
              })
            }}
          >
            下一页
          </button>

        </div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>名称</th>
              <th style={thStyle}>下载数</th>
              <th style={thStyle}>时间</th>
            </tr>
          </thead>
          <tbody>
            { tableDataJsx}
          </tbody>
        </table>

      </SlDialog>
    </>
  )
})
