import { readdirSync } from 'fs'
import path from 'path'

const excludeFileReg = /^\.|test|node_modules|\.(jpg|png|js|css)$/i

export function readRouteMap(prevPath, prev = '', list = []) {
  const result = readdirSync(prevPath, { withFileTypes: true })
  for (let i = 0; i < result.length; i++) {
    const direct = result[i];
    if (direct.name.match(excludeFileReg)) continue
    
    const {item: dirItem, itemLink} = generateItem(direct, prev, direct.isDirectory())
    if (direct.isDirectory()) {
      const dirPath = path.resolve(prevPath, dirItem.text)
      readRouteMap(dirPath, itemLink, dirItem.items)
      list.push(dirItem)
    } else {
      if (dirItem.text === 'index') {
        list.unshift(dirItem)
      } else {
        list.push(dirItem)
      }
    }
  }

  return list
}

function generateItem(dir, prevLink = '', idDir) {
  let itemName = dir.name.replace(/.md$/i,  '')
  let itemLink = itemName === 'index' ? `${prevLink}/` : `${prevLink}/${itemName}`
  const item = {
    text: itemName,
  }
  if (!idDir) {
    item.link = itemLink
  }
  item.items = []
  return {item, itemLink}
}
