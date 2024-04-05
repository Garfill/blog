import { defineConfig } from 'vitepress'
import { readRouteMap } from './loadRoute'
import path from 'path'

const docsPath = path.resolve('./docs')
let sidebar = readRouteMap(docsPath)
// 删除首页
sidebar = sidebar.filter(item => item.text !== 'index')


export default defineConfig({
  lang: 'zh-CN',
  title: "Garfill Blog",
  base: '/blog/',
  cleanUrls: 'without-subfolders',
  themeConfig: {
    sidebar
  }
})