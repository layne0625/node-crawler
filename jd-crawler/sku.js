const superagent= require('superagent')
const cheerio = require('cheerio')
const fs = require('fs')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const formatContent = (content) => {
  const $ = cheerio.load(content)
  try {
    const { window } = new JSDOM($.html(), {
      runScripts: 'dangerously',
    })
    const { item, price } = window._itemInfo
    const { category, image, saleProp, saleUnit, newColorSize, skuName } = item
    const { p, op, m } = price
    let images
    const skus = newColorSize.map(attrItem => {
      const attrs = Object.keys(saleProp).map(propKey => ({
        name: saleProp[propKey],
        value: attrItem[propKey]
      }))
      images = image.map(img => `https://m.360buyimg.com/mobilecms/s843x843_${img}`)
      return {
        initialSkuId: attrItem.skuId,
        initialCategory: category,
        attrs,
        attrsNameMap: saleProp,
        skuImage: images[0],
        skuName,
        unit: saleUnit,
        price: p,
        marketPrice: m,
        originPrice: op
      }
    })
    console.log('sku get successfully')
    return {
      skus, images
    }
    // callback(skus, images)
  } catch (error) {
    // console.log('>>>>>>>>>getSku error', error)
    return {}
  }
  
}
const getSku = async (skuId) => {
  try {
    const url = `https://item.m.jd.com/product/${skuId}.html`
    const res = await superagent.get(url)
    return formatContent(res.text)
  } catch (error) {
    return {}
  }
}

module.exports = {
  getSku
}