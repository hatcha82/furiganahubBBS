require('dotenv').config()
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
var fs = require('fs');
var escape = require('escape-html');
const Sequelize = require('sequelize')
const config = require('./config/config');
const { Console } = require('console');

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

   
    await blogUpload()       
  } catch (error) {
    console.log(`Error : ${error}` )
    process.exit(1);
  }
  process.exit(1);	
  
})();

async function getArticle(){
      
  const Op = sequelize.Op
  var sql = `
  SELECT * 
  FROM g5_write_furigana_news 
  WHERE wr_5 = 'N'
  AND   wr_8 <> ''
  AND   wr_10 <> ''
  AND   wr_datetime  BETWEEN DATE_SUB(NOW(),INTERVAL 3 hour) AND NOW()
  ORDER BY wr_datetime desc
  LIMIT 10
  `
  ;
  var article = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})  
  sequelize.close()  
  return article;
  
}
async function updateArticle(article){
  
  var sql = `
  UPDATE  g5_write_furigana_news 
  SET     wr_5 = 'Y'
  WHERE   wr_id = :wr_id;
  `
  sequelize = new Sequelize(
    config.db.database,
    config.db.user,
    config.db.password,
    config.db.options
  )
  result = await sequelize.query(sql,{replacements: article});
  console.log(`wr_id : ${article.wr_id}  subject : ${article.wr_subject}` ,result);
  sequelize.close();
  
}
async function createContents(articles){
  //var sourceText = `${article.wr_subject}\n${article.wr_content}` 
  articles.sort(() => (Math.random() > .5) ? 1 : -1);
  var templateMain = await fs.readFileSync(`${__dirname}/templateMain.html`, 'utf8')  
  var templateContent = await fs.readFileSync(`${__dirname}/templateContent.html`, 'utf8')
  var templateOtherList = await fs.readFileSync(`${__dirname}/templateOtherList.html`, 'utf8')  
  var body = templateMain;
  var contents = ''

  var article = articles[0];
  var otherList = '';

  templateMain = templateMain.split('wr_subject').join(escape(article.wr_subject));
  templateMain = templateMain.split('wr_8').join(escape(article.wr_8));
  templateMain = templateMain.split('[wr_id]').join(article.wr_id);
  templateMain = templateMain.split('[wr_1]').join(article.wr_1.split('?')[0]);
  templateMain = templateMain.split('[wr_link1]').join(article.wr_link1);



  /// create contents
  var furigana =  article.wr_9.split('\n');
  var translate =  article.wr_10.split('\n');
  translate.shift()
  translate.shift()
  

  furigana.forEach(function(row,index){
      var template = templateContent;
      template =  template.split('[furigana_line]').join(row);
      template =  template.split('[translate_line]').join(translate[index]);
      contents += template;
  });
  templateMain = templateMain.split('[contents]').join(contents)
  // create other list
  articles.forEach(row => {
    try {
      if(row.wr_id != article.wr_id){
        var list = templateOtherList;
        var wr_8 = row.wr_8
        var wr_subject = row.wr_subject;
        wr_8 = wr_8.split('"').join("'")
        wr_subject = wr_subject.split('"').join("'")
  
        list = list.split('[wr_8]').join(escape(wr_8));      
        list = list.replace('[wr_id]',row.wr_id);
        list = list.replace('[wr_3]',row.wr_3);
        list = list.replace('[wr_subject]', escape(wr_subject));
        //list = list.replace('[wr_8]',row.wr_8);
        otherList += list;
      }  
    } catch (error) {
      console.log(error, row)
    }    
  });
  
  templateMain = templateMain.split('[otherList]').join(otherList)
  body = templateMain
  //console.log(otherList, articles.length)
  return {subject : article.wr_8, body : body, articles:articles}
}
async function blogUpload(){
  var articles = await getArticle();

  if(articles.length < 5){
    console.log(`새로운 뉴스가 없습니다. ${articles.length}` )    
    return;
  }
  var news =  await createContents(articles)
  //console.log(news)
  //if(article == null) return;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox',`--window-size=1200,800`]
  });
  const page = await browser.newPage();
  page.setViewport({width:1200,height:800})
  var categoryNo = config.naver.categoryNo
  await page.goto(`https://blog.naver.com/hatcha82?Redirect=Write&categoryNo=${categoryNo}`, {waitUntil: 'networkidle2'});
  

  var param = {
    idselector : '#id',
    pwselector : '#pw',
    id :config.naver.id,
    pw : config.naver.pw
  }

  await page.evaluate(param => {
    document.querySelector(param.idselector).value = param.id
    document.querySelector(param.pwselector).value = param.pw    
    document.querySelector('#smart_LEVEL').value = -1
    
  }, param);

  await page.waitForSelector("#log\\.login");
  await page.waitFor(5000);

  await page.evaluate(param => {
    if(document.querySelector('#smart_LEVEL').value = 1  ){
      document.querySelector('#switch_blind').click()
    }
  }, param);
  await page.waitFor(2000);  
  await page.click("#log\\.login");
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  var frames = await page.frames();
  var editorFrame = frames.find(f =>f.url().indexOf("/PostWriteForm.naver?") > -1);
  
  await editorFrame.waitForSelector("#smart_editor2_content > div.se2_conversion_mode > ul > li:nth-child(2) > button");
  await editorFrame.click("#smart_editor2_content > div.se2_conversion_mode > ul > li:nth-child(2) > button");
  await editorFrame.click("#tagAutoInsertChk");
  
  await editorFrame.evaluate(news => {
      var subjectSelector = '#subject';  
      var contentsSelector = '#smart_editor2_content > div.se2_input_area.husky_seditor_editing_area_container > textarea.se2_input_syntax.se2_input_htmlsrc';
      var tags = news.subject.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
      document.querySelector(subjectSelector).value = news.subject
      document.querySelector(contentsSelector).value =  news.body
      tags = tags.split(' ');
      var newsTag = ''
      tags.forEach( async (tag,idx) => {
        if(idx < 30){
          newsTag += '#' + tag + ',';
        }
      });

      document.querySelector('#tagList').value =  newsTag
     
  }, news);

  

  var randomSec = Math.floor(Math.random() * 4 ) + 6;
  await page.waitFor(randomSec * 1000);  

  await editorFrame.click("#btn_submit");


  news.articles.forEach( async (article) => {
   await updateArticle(article)  
  });
  
  
  console.log("종료합니다.")
  await page.waitFor(10 * 1000);  
  await browser.close();

}

