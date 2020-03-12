const superagent= require('superagent')
const cheerio = require('cheerio')
const fs = require('fs')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { getSku } = require('./sku')
const category = require('../jd-data/category.json')


const formatContent = (content) => {
  const $ = cheerio.load(content)
  const items = []
  let i = 0
  while (i < 5) {
    const $ele = $('#itemList').children("[skuid]").eq(i)
    const itemId = $ele.attr('skuid')
    const img = $ele.find('.search_prolist_cover>img:first-child').attr('src')
    const name = $ele.find('.search_prolist_info div.search_prolist_title').eq(0).text().trim()
    items.push({ itemId, mainImage: `http:${img}`, name})
    i++
  }
  
  
  return Promise.all(items.map(async ({ itemId, ...rest }) => {
    const { skus, images } = await getSku(itemId)
    return { ...rest, skus, images, originItemId: itemId }
  }))
}
const getItem = async (keyword) => {
  try {
    const url = `https://wqsou.jd.com/search/searchn?key=${encodeURI(keyword)}`
    const res = await superagent.get(url)
    return await formatContent(res.text)  
  } catch (error) {
    return []
  }
  
}

let keywords = []

category.keywordAreas.slice(0, 10).forEach((item) => {
    item.level1words.forEach((level1, index) => {
      if (index < 2) {
        level1.level2words.forEach((level2, index2) => {
          if (index2 < 2) {
            keywords.push(level2.keyword)
          }
        })
      }
    })
})


const start = async() => {
  let i = 0
  while(i < keywords.length ) {
    let keyword = keywords[i]
    const items = await getItem(keyword)
    if (items.length > 0) {
      try {
        fs.writeFileSync(`jd-data/item/${keyword}.json`, JSON.stringify(items, null, 2))
        console.log(`${keyword} file successfully`)  
      } catch (error) {
      }
    }
    i++
    console.log('>>>>>>>>>>i:', i)
    console.log('>>>>>>>>>>>>>>>>progress:', `${((i/keywords.length) * 100).toFixed(2)}%`)
  }
}

start()