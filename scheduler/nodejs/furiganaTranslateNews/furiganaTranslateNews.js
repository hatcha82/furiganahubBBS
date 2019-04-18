require('dotenv').config()
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
var fs = require('fs');
const Sequelize = require('sequelize')
const config = require('./config/config')

var sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.options
)
console.log(config);

const sourceText = '';

(async () => {

  try {
   
    //console.log(sourceTex)    
    await papagoTranslate()       
  } catch (error) {
    console.log(`Error : ${error}` )
    process.exit(1);
  }
})();

async function getArticle(){
      
  const Op = sequelize.Op
  var sql = `SELECT * FROM g5_write_furigana_news WHERE  wr_10 = '' limit 1`
  var article = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})    
  sequelize.close()

   if(article.length == 1){
    return article[0];
  }else{
    return null
  }
}
async function updateArticle(article){
  
  var sql = `
  UPDATE  g5_write_furigana_news 
  SET     wr_8 = :wr_8
  ,       wr_10 = :wr_10
  WHERE   wr_id = :wr_id;
  `
  sequelize = new Sequelize(
    config.db.database,
    config.db.user,
    config.db.password,
    config.db.options
  )
  result = await sequelize.query(sql,{replacements: article});
  console.log(result);
  sequelize.close();
  
}
async function papagoTranslate(){

  var article = await getArticle();
    
  if(article == null) return;
  var sourceText = `${article.wr_subject}\n${article.wr_content}`
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox',`--window-size=300,300`]
  });
  const page = await browser.newPage();
  page.setViewport({width:300,height:300})
  await page.goto('https://papago.naver.com', {waitUntil: 'networkidle2'});

  const param = {
    selector : '#txtSource',
    sourceText : sourceText
  }

  await page.evaluate(param => {
      document.querySelector(param.selector).value = param.sourceText
  }, param);
  await page.type(param.selector,'\n', {delay: 1000});
  await page.click("#btnTranslate");

  page.on('response', response => {
    var url = response.url()
    if(url === 'https://papago.naver.com/apis/n2mt/translate'){
      response.text().then( async function (textBody) {
        JSONObj = JSON.parse(textBody)
        var translatedText =  JSONObj.translatedText.split('\n')
      
        article.wr_8 =translatedText.shift()        
        article.wr_10 = translatedText.join('\n')
       
        updateArticle(article)
        //fs.writeFile('myjsonfile.text', textBody); 
        browser.close()
      })
    }
  })
}
async function furiganaLyrics(){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.emulate(devices['iPhone 6']);
  await page.goto('http://www.furiganahub.com/music/detail/700');
  const resultsSelector = '#undefined > div > div > div';
  await page.waitForSelector(resultsSelector);
  const lyrics = await page.evaluate(resultsSelector => {
    const elems = Array.from(document.querySelectorAll(resultsSelector));
    return elems.map(elem => {
      const title = elem.textContent;
      return `${title}`;
    });
  }, resultsSelector);
  console.log(lyrics[0]);

  // await page.screenshot({path: 'full.png', fullPage: true});
  await browser.close();
}
