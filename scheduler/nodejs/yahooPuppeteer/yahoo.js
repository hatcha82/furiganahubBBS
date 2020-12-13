const puppeteer = require('puppeteer')
var moment = require('moment'); // require
var fs = require('fs');
const Kuroshiro = require('kuroshiro')
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji')
const kuroshiro = new Kuroshiro()
const Sequelize = require('sequelize')
const config = require('./config/config');
const { exit } = require('process');
var sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.options
)
var browser = {};
async function papagoTranslateKOR(article){

  var sourceText = `${article.wr_subject}\n${article.wr_content}`
  
  
  var papagoPage = await browser.newPage();
  papagoPage.setViewport({width:300,height:300})
  await papagoPage.goto('https://papago.naver.com', {waitUntil: 'networkidle2'});

  const param = {
    selector : '#txtSource',
    sourceText : sourceText
  }

  await papagoPage.evaluate(param => {
    
      document.querySelector(param.selector).value = param.sourceText
  
  }, param);
  
  await papagoPage.type(param.selector,'\n', {delay: 1000});
  
  await papagoPage.waitForSelector('#ddTargetLanguageButton', {timeout: 60000});
  await papagoPage.click("#ddTargetLanguageButton");

  await papagoPage.waitForSelector('#ddTargetLanguage > div.dropdown_menu___XsI_h.active___3VPGL > ul > li:nth-child(3) > a', {timeout: 60000});
  await papagoPage.click("#ddTargetLanguage > div.dropdown_menu___XsI_h.active___3VPGL > ul > li:nth-child(3) > a");
  
  await papagoPage.waitForSelector('#btnTranslate', {timeout: 60000});
  await papagoPage.click("#btnTranslate");
  console.log(`번역(KOR): ${article.wr_subject} 시작`);

  await papagoPage.on('response', async (response) => {
    var url = response.url()
    if(url === 'https://papago.naver.com/apis/n2mt/translate'){
      response.text().then( async function (textBody) {
        JSONObj = JSON.parse(textBody)
        var translatedText =  JSONObj.translatedText.split('\n')
       
        article['wr_8'] =translatedText.shift()        
        article['wr_10'] = translatedText.join('\n')    
        console.log(article)
        // var original = article.wr_content.split('\n');
        // var translated = article['wr_12'].split('\n');
        // var allText = '';
        // original.forEach((obj, idx) => {          
        //   console.log(translated[idx] + '\n' + original[idx])        
        //   allText +=translated[idx] + '\n' + original[idx] + '\n\n' 
        // })
        // article['allTextJPN'] = allText;
        
        // var fileName = article.link.split('a=').reverse()[0]
        // fs.writeFile(fileName + '.json', JSON.stringify(article,null,'\t') , function(err, result) {
        //   if(err) console.log('error', err);
        // });
       
       
        
             
        console.log(`번역(KOR): ${article.wr_subject} 완료`);
        papagoPage.close();  
        await addToDB(article);
        //updateArticle(article)
        
      })
    }
  })
  return article;
}





async function getNews(news){
    if(news == null){
      setTimeout(function(){
        browser.close();
      }, 10000)      
      return;
    } 
    try {
      console.log(`크롤링: ${news.wr_subject} 시작`);

      var newsPage = await browser.newPage()
      await newsPage.goto(news.link, {waitUntil: 'networkidle2', timeout: 0})  
      const contents = await newsPage.$$eval('#uamods > div.article_body', contents =>  { return contents.map(content => content.innerText) })
      console.log(contents)
      const newsPubllisherImageUrl =  await newsPage.$$eval('#uamods > header > div > div:nth-child(2) > a > img', contents =>  { return contents.map(content => content.src) }) 
      const newsPublisher =  await newsPage.$$eval('#uamods > header > div > div:nth-child(2) > a > img', contents =>  { return contents.map(content => content.alt) }) 
      const newsImageUrl =  await newsPage.$$eval('#uamods > div.article_body > div > div > div > a > div > picture > img', contents =>  { return contents.map(content => content.src) }) 
      
      const i_date = await newsPage.$$eval('#uamods > footer > div > time', contents =>  { return contents.map(content => content.innerText) })
      const m_date = await newsPage.$$eval('#uamods > header > div > div:nth-child(1) > div > p > time', contents =>  { return contents.map(content => content.innerText) })
      news['wr_content'] = contents[0].replace('연결 시간을 초과하였습니다.','').replace('새로 고침 후 이용해 주세요.','').replace('죄송합니다','');
      news['newsPublisher'] = newsPublisher[0] === undefined ? null : newsPublisher[0];
      news['titleFurigana'] = await kuroshiro.convert(news.wr_subject,{mode: 'furigana', to: 'hiragana', romajiSystem: 'passport'})
      news['furigana'] = await kuroshiro.convert(news['wr_content'] ,{mode: 'furigana', to: 'hiragana', romajiSystem: 'passport'})

      news['newsPubllisherImageUrl'] = newsPubllisherImageUrl[0] === undefined ? null : newsPubllisherImageUrl[0];
      news['newsImageUrl'] = newsImageUrl[0] === undefined ? null : newsImageUrl[0];
      var now = new Date();  
      moment.locale('ja')    
      news['newsPublishedDate'] =  m_date[0] === undefined ?  null : moment(now.getFullYear() +  m_date[0],'ll').format('YYYY-mm-DD HH:mm:ss' )
   
      newsPage.close(); 
      console.log(`크롤링: ${news.wr_subject} 종료`);     
    } catch (error) {
     console.log(error) 
    }    
  
    return await papagoTranslateKOR(news);    
}
async function checkRelease(news){
  var sequelize = new Sequelize(
    config.db.database,
    config.db.user,
    config.db.password,
    config.db.options
  ) 
  var article = null;
  if(news.link !== undefined){
    var sql = `SELECT * FROM g5_write_furigana_news WHERE  wr_link1 = '${news.link}' limit 1`
    article = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})    
   
    if(article.length == 1){
      console.log(`${news.wr_subject} 새로운 뉴스가 존재합니다.`)
    }else{
      console.log(`${news.wr_subject} : 새로운 뉴스가 있습니다. 본문을 찾습니다.`)
      article = await getNews(news)   
     
    } 
    sequelize.close(); 
  }
  return article;
}

var insertsql = `
INSERT INTO gnu5.g5_write_furigana_news
SELECT  null                      wr_id, 
        -1                        wr_num, 
        ''                        wr_reply, 
        0                         wr_parent, 
        0                         wr_is_comment, 
        0                         wr_comment, 
        ''                        wr_comment_reply, 
        :newsPublisher            ca_name, 
        'html2'                   wr_option, 
        :wr_subject               wr_subject,         
        :wr_content               wr_content, 
        :link                     wr_link1, 
        ''                        wr_link2, 
        0                         wr_link1_hit, 
        0                         wr_link2_hit, 
        0                         wr_hit, 
        0                         wr_good, 
        0                         wr_nogood, 
        'admin'                   mb_id, 
        '*08426AD968865464212B51178AB8555438F2DD95'                        wr_password, 
        :newsPublisher            wr_name, 
        'hatcha82@gmail.com'      wr_email, 
        ''                        wr_homepage, 
        now()                     wr_datetime, 
        0                         wr_file, 
        :newsPublishedDate        wr_last, 
        '172.17.0.1'              wr_ip, 
        ''                        wr_facebook_user, 
        ''                        wr_twitter_user, 
        :newsImageUrl             wr_1,  -- newsImageUrl
        :newsPublisher            wr_2,  -- newsPublisher
        :newsPubllisherImageUrl   wr_3,  -- newsPubllisherImageUrl
        :newsPublishedDate        wr_4,  -- newsPublishedDate
        'N'                       wr_5,  -- naverBlogUpload           
        ''                        wr_6,  -- naverBlogRefNo               
        :titleFurigana            wr_7, -- subject_furigana
        :wr_8                     wr_8, -- subject_translate
        :furigana                 wr_9 , -- furigana
        :wr_10                    wr_10 -- translate    
 
 `
async function addToDB(article){
  var sequelize = new Sequelize(
    config.db.database,
    config.db.user,
    config.db.password,
    config.db.options
  )  
  
  article.createdUserId = 3
  article.updatedUserId = 3
  try {
    const newArticle = await sequelize.query(insertsql,{replacements: article});
    console.log(newArticle);
    var sql = `update g5_write_furigana_news set wr_parent = wr_id where wr_id = ${newArticle[0]}`
    var result = await sequelize.query(sql);
    var sql = `update g5_board set bo_count_write = bo_count_write + 1 where bo_table = 'furigana_news'`
    result = await sequelize.query(sql);
    console.log(result);
    
    
   } catch (error) {
     console.log(error)
     process.exit(1);
   }
   sequelize.close(); 

}
var newsList = [];
(async () => {
  await kuroshiro.init(new KuromojiAnalyzer());
  var result = await kuroshiro.convert("感じ取れたら手を繋ごう、重なるのは人生のライン and レミリア最高！", { to: "hiragana" });
  console.log(`Kuroshiro Started... \n ${result}`)
  console.log(`DB Started...`)
  var sql = `SELECT count(*) count FROM g5_write_furigana_news `    
  var article = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})   
  console.log(`Article Count ${article[0].count}`)   

  browser = await puppeteer.launch({ headless: true,args: ['--no-sandbox',`--window-size=480,680`]})
  const page = await browser.newPage()
//   await page.tracing.start({
//     path: 'trace.json',
//     categories: ['devtools.timeline']
// })
  await page.goto('https://news.yahoo.co.jp', {waitUntil: 'networkidle2', timeout: 0})
  console.log(`크롤링 리스트 가져오기: 시작`);     

  
  // execute standard javascript in the context of the page.
  newsList = await page.$$eval('#newsFeed > ul.newsFeed_list > li> div > a.newsFeed_item_link', anchors => { 
    return anchors.map(anchor => { 
      return {wr_subject: anchor.innerText, link : anchor.href }
    })
  })    
  console.log(`크롤링 리스트 가져오기: 종료`);     

  for(var i = 0; i<newsList.length ; i++){
    var news = await checkRelease(newsList[i]);  
    //await addToDB(news);
  }
  setTimeout(function(){
    console.log('종료 30초')
    process.exit(1);
  },30000)

})()