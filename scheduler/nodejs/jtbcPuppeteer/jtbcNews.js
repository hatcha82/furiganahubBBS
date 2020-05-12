const puppeteer = require('puppeteer')
var fs = require('fs');
var browser = {};
async function papagoTranslateJPN(article){

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
  console.log(`번역(JPN): ${article.wr_subject} 시작`);

  await papagoPage.on('response', async (response) => {
    var url = response.url()
    if(url === 'https://papago.naver.com/apis/n2mt/translate'){
      response.text().then( async function (textBody) {
        JSONObj = JSON.parse(textBody)
        var translatedText =  JSONObj.translatedText.split('\n')
        
        article['wr_11'] =translatedText.shift()        
        article['wr_12'] = translatedText.join('\n')    
        
        var original = article.wr_content.split('\n');
        var translated = article['wr_12'].split('\n');
        var allText = '';
        original.forEach((obj, idx) => {          
          console.log(translated[idx] + '\n' + original[idx])        
          allText +=translated[idx] + '\n' + original[idx] + '\n\n' 
        })
        article['allTextJPN'] = allText;
        
        var fileName = article.link.split('/').reverse()[0]
        fs.writeFile(fileName.replace('.html','.json'), JSON.stringify(article,null,'\t') , function(err, result) {
          if(err) console.log('error', err);
        });
        getNews(newsList.pop());
        papagoPage.close();
        console.log(`번역(JPN): ${article.wr_subject} 완료`);
        //updateArticle(article)
        
      })
    }
  })
  return article;
}


async function papagoTranslateENG(article){

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

  await papagoPage.waitForSelector('#ddTargetLanguage > div.dropdown_menu___XsI_h.active___3VPGL > ul > li:nth-child(1) > a', {timeout: 60000});
  await papagoPage.click("#ddTargetLanguage > div.dropdown_menu___XsI_h.active___3VPGL > ul > li:nth-child(1) > a");
  
  await papagoPage.waitForSelector('#btnTranslate', {timeout: 60000});
  await papagoPage.click("#btnTranslate");
  console.log(`번역(ENG): ${article.wr_subject} 시작`);

  await papagoPage.on('response', async (response) => {
    var url = response.url()
    if(url === 'https://papago.naver.com/apis/n2mt/translate'){
      response.text().then( async function (textBody) {
        JSONObj = JSON.parse(textBody)
        var translatedText =  JSONObj.translatedText.split('\n')
        
        article['wr_8'] =translatedText.shift()        
        article['wr_10'] = translatedText.join('\n')    
        
        var original = article.wr_content.split('\n');
        var translated = article['wr_10'].split('\n');
        var allText = '';
        original.forEach((obj, idx) => {          
          console.log(translated[idx] + '\n' + original[idx])        
          allText +=translated[idx] + '\n' + original[idx] + '\n\n' 
        })
        article['allTextENG'] = allText;
        
        // var fileName = article.link.split('/').reverse()[0]
        // fs.writeFile(fileName.replace('.html','.json'), JSON.stringify(article,null,'\t') , function(err, result) {
        //   if(err) console.log('error', err);
        // });
        papagoTranslateJPN(article);
        papagoPage.close();
        console.log(`번역(ENG): ${article.wr_subject} 완료`);
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
      const contents = await newsPage.$$eval('#articlebody .article_content', contents =>  { return contents.map(content => content.innerText) })
      const i_date = await newsPage.$$eval('#articletitle > div > span > span.i_date', contents =>  { return contents.map(content => content.innerText) })
      const m_date = await newsPage.$$eval('#articletitle > div > span > span.m_date', contents =>  { return contents.map(content => content.innerText) })
      news['wr_content'] = contents[0].replace('연결 시간을 초과하였습니다.','').replace('새로 고침 후 이용해 주세요.','').replace('죄송합니다','');

      news['i_date'] = i_date[0] === undefined ?  null : i_date[0].replace('입력 ','');
      news['m_date'] =  m_date[0] === undefined ?  null : m_date[0].replace('수정 ','');
      newsPage.close(); 
      console.log(`크롤링: ${news.wr_subject} 종료`);     
    } catch (error) {
     console.log(error) 
    }    
    await papagoTranslateENG(news);    
}
var newsList = [];
(async () => {

  browser = await puppeteer.launch({ headless: true,args: ['--no-sandbox',`--window-size=480,680`]})
  const page = await browser.newPage()
//   await page.tracing.start({
//     path: 'trace.json',
//     categories: ['devtools.timeline']
// })
  await page.goto('http://news.jtbc.joins.com/section/list.aspx?scode=')
  console.log(`크롤링 리스트 가져오기: 시작`);     
  // execute standard javascript in the context of the page.
  newsList = await page.$$eval('#section_list > li > dl > dt > a', anchors => { 
    return anchors.map(anchor => { 
      return {wr_subject: anchor.innerText, link : anchor.href }
    })//.slice(0,2)
  })    
  console.log(`크롤링 리스트 가져오기: 종료`);     
  await getNews(newsList.pop())  
})()