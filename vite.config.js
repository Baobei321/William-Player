import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import UniComponents from "@uni-helper/vite-plugin-uni-components";
import { NutResolver } from "nutui-uniapp";
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

export default defineConfig({
  plugins: [
    uni(),
    UniComponents({
      resolvers: [
        NutResolver(),
      ]
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/static/svg')],
      symbolId: 'icon-[dir]-[name]',
      svgoOptions: true
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "nutui-uniapp/styles/variables.scss";`
      }
    }
  }
})