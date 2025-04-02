import type { PluginOption } from 'vite'
import $ from 'gogocode'

/**
 * 将 sl 组件导入语法转为 导入具体的地址，让 sl 可以支持 Tree Shaking
 * @ref https://shoelace.style/frameworks/react#notes-about-tree-shaking
 */
export function transform_sl_import() {
  return {
    name: '转换 sl 组件',
    transform(code, id, _) {
      // return code;

      // 只处理自己的代码
      if (!id.includes('node_modules')) {
        return $(code, {
          parseOptions: { sourceType: 'module' },
        })
          .replace(
            `import { $$$components } from "@shoelace-style/shoelace/dist/react"`,
            (v) => {
              const ast = v.$$$components

              // @ts-expect-error 关掉 ts 检查
              const nameList: string[] = ast.map(v => v.imported.name)

              const ret: string[] = []

              nameList.forEach((v) => {
                // SlRelativeTime -> relative-time
                // 去掉开头的 Sl, 并转为横线命名规则
                const name = v
                  .replace(/^Sl/, '')
                  .replace(/([a-z])([A-Z])/g, '$1-$2')
                  .toLowerCase()

                ret.push(
                  `import ${v} from "@shoelace-style/shoelace/dist/react/${name}/index.js";`,
                )
              })

              return ret.join('\n')
            },
          )
          .generate()
      }

      return code
    },
  } satisfies PluginOption
}
