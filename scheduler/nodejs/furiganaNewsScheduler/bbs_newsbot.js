﻿require('dotenv').config()
var Crawler = require("crawler")
const Kuroshiro = require('kuroshiro')
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji')
const kuroshiro = new Kuroshiro()
const Sequelize = require('sequelize')
var moment = require('moment'); // require
const config = require('./config/config')
var debug = true
var sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.options
)

var listCrawler = new Crawler({
  maxConnections : 1,
  rateLimit: 1000 * 10,    
  callback : listCrawlerCallBack
});
var detailCrawler = new Crawler({
  maxConnections : 1,
  rateLimit: 1000 * 10,  
  callback: detailCrawlerCallBack  
  
});

function listCrawlerCallBack(error, res, done) {
  if(error){
      console.log(error)
  }else{
      var $ = res.$;
      var newslogo =$('#contentsWrap > div > h2 > a > img').attr('src');
      var newsCompanyName = $('#contentsWrap > div > h2 > a > img').attr('alt');
      var newsLit = $('ul.newsFeed_list li');
      
      var dateTime = $(newsLit[0]).find('div.newsFeed_item_sub > div > time').text()  
      var date = new Date().getFullYear() + '/' + dateTime.split(' ')[0].split('(')[0]
      var time = dateTime.split(' ')[1];
      var dateTime = moment(`${date} ${time}`,'YYYY/M/D HH:mm');
      console.log(`${dateTime}`)
      newsLit.each(async function(){
        if(debug){
          
          var title = $(this).find('a > div.newsFeed_item_text > div.newsFeed_item_title').text()
          var newsURL = $(this).find('a').attr('href')
          var newsImagURL =$(this).find('img').attr('src')  
          var date = $(this).find('.newsFeed_item_date').text().replace('配信','')
          newsURL = newsURL;
          
          
          var param = {
            title: title,
            type: 'NEWS',
            newsUrl: newsURL,
            newsImageUrl: newsImagURL,
            newsPublisher: newsCompanyName,
            newsPubllisherImageUrl: newslogo,
            newsPublishedDate: new Date(dateTime.format()),
            article: null,
            furigana: null,
          }
          //console.log(param)
          var sequelize = new Sequelize(
            config.db.database,
            config.db.user,
           config.db.password,
            config.db.options
          )
          
          var sql = `SELECT * FROM g5_write_furigana_news WHERE  wr_link1 = '${newsURL}' limit 1`
          var article = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})    
            sequelize.close()

           if(article.length == 1){
            console.log(`${newsCompanyName} 새로운 뉴스가 없습니다.`)
          }else{
            console.log(`새로운 뉴스가 있습니다. 본문을 찾습니다.`)
            var crawlerparam = [{
              uri: newsURL,                        
              callback: detailCrawlerCallBack,
              param : param,
              preRequest: function(options, done) {
                  var ranTime = Math.floor((Math.random() * 10) + 1)
                  console.log(`본문 접속 ${ranTime}Sec 후에 진행... : ${newsURL} `)
                  setTimeout(function() {
                    done();
                  }, 1000)
              }
            }] 
            detailCrawler.queue(crawlerparam)   
          }
          debug = true
        }
    })
  }
  done();
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
        :title                    wr_subject,         
        :article                  wr_content, 
        :newsUrl                  wr_link1, 
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
        :newsPublishedDate        wr_datetime, 
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
        ''                        wr_8, -- subject_translate
        :furigana                 wr_9 , -- furigana
        ''                        wr_10 -- translate    
 
 `

async function detailCrawlerCallBack(error, res, done){

  if(error){
    console.log(error);
  }else{
    var $ = res.$;
    var param = res.options.param;
    var article = $("#uamods > div.article_body > div > p").text();
    console.log(`
    News Title : ${param.title}
    newsUrl: : ${param.newsUrl}
    newsPublishedDate: ${param.newsPublishedDate}    
    `)

    // Article
    // ${article}
        var sequelize = new Sequelize(
          config.db.database,
          config.db.user,
          config.db.password,
          config.db.options
        )
    param.title =param.title.replace(/・/g,' ')
    param.article = article.replace(/・/g,' ')  //・ error로 인한 furigana 컨버팅 실패
    param.titleFurigana = await kuroshiro.convert(param.title,{mode: 'furigana', to: 'hiragana', romajiSystem: 'passport'})
    param.furigana = await kuroshiro.convert(param.article,{mode: 'furigana', to: 'hiragana', romajiSystem: 'passport'})
    param.createdUserId = 3
    param.updatedUserId = 3
    ;

   try {
    const newArticle = await sequelize.query(insertsql,{replacements: param});
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
  done();
}
(async () => {

  await kuroshiro.init(new KuromojiAnalyzer());
    var result = await kuroshiro.convert("感じ取れたら手を繋ごう、重なるのは人生のライン and レミリア最高！", { to: "hiragana" });
    console.log(`Kuroshiro Started... \n ${result}`)
    console.log(`DB Started...`)
    var sql = `SELECT count(*) count FROM g5_write_furigana_news `    
    var article = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})   
    console.log(`Article Count ${article[0].count}`)   
    
    addQueue(nnn)
    addQueue(ann)
    addQueue(jnn)
    addQueue(fnn)
    sequelize.close();
})();


async function addQueue(page, param){   
  
  var crawlerparam = [{
    uri: page,                        
    callback: listCrawlerCallBack,
    param : param,
  }] 

  await listCrawler.queue(crawlerparam)
  
}
//start() 

var lasctCalledDate = new Date()
var nnn = `https://headlines.yahoo.co.jp/videonews/nnn` //니테레
var ann = `https://headlines.yahoo.co.jp/videonews/ann` //Nippon NewsNetwork(ANN)
var jnn = `https://headlines.yahoo.co.jp/videonews/jnn` //TBS
var fnn = `https://headlines.yahoo.co.jp/videonews/fnn` //fnn
