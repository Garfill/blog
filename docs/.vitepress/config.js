import { defineConfig } from 'vitepress'
import { readRouteMap } from './loadRoute'
import path from 'path'

const docsPath = path.resolve('./docs')
const sidebar = readRouteMap(docsPath)


export default defineConfig({
  lang: 'zh-CN',
  title: "Garfill Blog",
  base: '/blog/',
  cleanUrls: 'without-subfolders',
  lastUpdated: true,
  themeConfig: {
    sidebar
  }
})