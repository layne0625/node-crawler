const superagent= require('superagent')
const cheerio = require('cheerio')
const fs = require('fs')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const getCatergory = (content) => {
  const $ = cheerio.load(content)
  let index = 0;
  // 删除不必要的js，使js能执行到对应代码， 否则会报错。
  while(index < 14) {
    index++
    $('script').eq(0).remove()
  }
  try {
    const { window } = new JSDOM($.html(), {
      runScripts: 'dangerously',
      beforeParse(window) {
        window.bigpipe = {
          setConfig: (obj) => {
          },
          setData: async(key, { json }) => {
            fs.writeFile('jd-data/firstLevel.json', JSON.stringify(json, null, 2), (err) => {
              if (err) {
                console.log(err)
              } else {
                console.log('successfully')
              }
            })
          }
        }
      },
    })
    
  } catch (error) {
    
  }
  
}
const fetchCategory = () => {
  const url = 'https://so.m.jd.com/webportal/channel/m_category?searchFrom=home&_gotcookie_=1'
  superagent.get(url).end((err, res) => {
    if (err) {
      console.log('errr', err)
    } else {
      getCatergory(res.text)
    }
  })
}
fetchCategory()