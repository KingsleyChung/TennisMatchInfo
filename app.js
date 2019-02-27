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
  result = await getMatchInfo(ctx.params.player)
  ctx.body = result
})

app.use(router.routes())

app.listen(3000, () => {
  console.log('Server is running at port 3000')
})

const getMatchInfo = async name => {
  let date = moment(new Date()).format('YYYY-MM-DD')
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
        var targetMatch
        
        $('.cResultMatch').toArray().forEach(match => {
          scoreBarArray = $(match).find('tbody').children().toArray()
          result = scoreBarArray.some(scoreBar => {
            return $(scoreBar).find('td').text().indexOf(name) != -1
          });
          if (result) {
            time = $(match).find('.cResultMatchTime').text()
            time = moment(parseInt(time) * 1000).format('MM-DD HH:mm')
            resolve(time)
          }
        })
        resolve('没有比赛')
      })
    })
  })
}

