const Koa = require('koa')
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const https = require('https')
const cheerio = require('cheerio')
const moment = require('moment')
const paramsParser = require('./paramsParser')

const app = new Koa()

app.use(bodyParser())
app.use(paramsParser())

router.get('/matchInfo', async ctx => {
  console.log(ctx.params.player)
  result = await getRecentMatchInfo(ctx.params.player)
  ctx.body = result
})

app.use(router.routes())

app.listen(3000, () => {
  console.log('Server is running at port 3000')
})


const getRecentMatchInfo = async name => {
  let date = new Date()
  let timeOffset = date.getTimezoneOffset() / 60
  date = convertToBeijingTime(date.getTime(), timeOffset, 'YYYY-MM-DD')
  let today = moment(date).format('YYYY-MM-DD')
  let todayMatchTime = moment(convertToBeijingTime(await getMatchInfoOfDate(name, today), timeOffset)).format('MM-DD HH:mm')
  if (date.getHours() >= 18) {
    let tomorrow = moment(date.getTime() + 24 * 3600 * 1000).format('YYYY-MM-DD')
    let tomorrowMatchTime = moment(convertToBeijingTime(await getMatchInfoOfDate(name, tomorrow), timeOffset)).format('MM-DD HH:mm')
    return todayMatchTime + '; ' + tomorrowMatchTime
  } else {
    let yesterday = moment(date.getTime() - 24 * 3600 * 1000).format('YYYY-MM-DD')
    let yesterdayMatchTime = moment(convertToBeijingTime(await getMatchInfoOfDate(name, yesterday), timeOffset)).format('MM-DD HH:mm')
    return yesterdayMatchTime + '\n' + todayMatchTime
  }
}

const getMatchInfoOfDate = async (name, date) => {
  let url = `https://coric.top/zh/result/${date}`

  return new Promise((resolve, reject) => {
    https.get(url, res => {
      var chunks = [];
      var size = 0;

      res.on('data', chunk => {   //监听事件 传输
        chunks.push(chunk);
        size += chunk.length;
      });

      res.on('end', () => {  //数据传输完
        var data = Buffer.concat(chunks, size);  
        var html = data.toString();
        var $ = cheerio.load(html); //cheerio模块开始处理 DOM处理
        
        $('.cResultMatch').toArray().forEach(match => {
          scoreBarArray = $(match).find('tbody').children().toArray()
          result = scoreBarArray.some(scoreBar => {
            return $(scoreBar).find('td').text().indexOf(name) != -1
          });
          if (result) {
            time = $(match).find('.cResultMatchTime').text()
            resolve(parseInt(time) * 1000)
          }
        })
        resolve('没有比赛')
      })
    })
  })
}

const convertToBeijingTime = (time, timeOffset) => {
  return new Date(time + (timeOffset + 8) * 3600 * 1000)
}