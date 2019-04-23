require('dotenv').config()
var fs = require('fs');
var path = require("path");
var url = require("url");
const image2base64 = require('image-to-base64');
var express = require('express');
var app = express();
var client_id = 'w7FsuKKmd0_0nh3h_yIb';
var client_secret = 'ONSQVwlB8B';
var state = "RAMDOM_STATE";
var redirectURI = encodeURI("http://127.0.0.1:3000/callback");
var api_url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirectURI}`;
var request = require('request');
var access_token ='';
var refresh_token = '';
var {Song,Article} = require('./models')
const {sequelize} = require('./models')


async function test(){
  const Op = sequelize.Op
  
  var song = await Song.findOne({
    where :{
      naverBlogUpload : 'N',
      albumImageUrl : {[Op.ne]: null},
      lyricsKor : {[Op.ne]: null},
      youtubeId : {[Op.ne]: null},
    },
    order: ['youtubeId'],
    limit: 1,
  })
  console.log(song.title)

  var article = await Article.findOne({
    where :{
      $and: [
        {  
          translateText : {[Op.ne]: null},
          naverBlogUpload : 'N',
          [Op.or] : [ { newsPublisher: { [Op.like] : '%NEWS24' } }, { newsPublisher: {[Op.like] : 'TBS%'}  }]
        },
      ]
    },        
    limit: 1,
  })
  console.log(article)

 
}
// test();
// return;

var blogtemplate = fs.readFileSync('blogtemplate.html', 'utf-8');
var newsBlogtemplate = fs.readFileSync('newsBlogtemplate.html', 'utf-8');
async function uploadArticleBlog(){
  console.log("Upload Started...")
  const Op = sequelize.Op
  var sql = `
  SELECT  *
  FROM    g5_write_furigana_news 
  WHERE   wr_5 = 'N'   
  AND     wr_10 <> '' 
  AND     date(CURRENT_DATE()) = date(wr_4)
  AND 		( INSTR(ca_name ,'NEWS24') or INSTR(ca_name,'TBS News i'))
  ORDER
  BY      wr_4 DESC
  limit   1
  `
  //AND     (ca_name like '%NEWS24' or ca_name like  'TBS%')
  var article = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})    
  
  if(article.length == 1){
    article = article[0];
  }else{
    return ;
  }
  var newTemplate = newsBlogtemplate.replace('[[title]]', article.wr_subject)
  newTemplate = newTemplate.replace('[[title]]', article.wr_8)
  newTemplate = newTemplate.split("[[id]]").join(article.wr_id)
  newTemplate = newTemplate.split("[[newsUrl]]").join(article.wr_link1)
  newTemplate = newTemplate.split("[[newsImageUrl]]").join(article.wr_1)  
  newTemplate = newTemplate.split("[[newsPublishedDate]]").join(article.wr_4.toString())
  newTemplate = newTemplate.split("[[newsPubllisherImageUrl]]").join(article.wr_3)
  newTemplate = newTemplate.split("[[titleFurigana]]").join(article.wr_7)
  newTemplate = newTemplate.split("[[titleTranslate]]").join(article.wr_8)
  
  var furigana = article.wr_9;
  furigana =  furigana.replace(/\n/g,'<br>')
  newTemplate = newTemplate.replace('[[furigana]]',furigana)

  var translateText = article.wr_10;

  if(translateText){
    translateText =  translateText.replace(/\n/g,'<br>')
    newTemplate = newTemplate.replace('[[translateText]]',translateText)
  }
  
  var title = `[일본뉴스] ${article.wr_subject}-${article.wr_8}`;
  var contents = newTemplate;  
  var api_url = 'https://openapi.naver.com/blog/writePost.json';
  var request = require('request');
  var header = "Bearer " + access_token; // Bearer 다음에 공백 추가

  var formData =  {
    title: title
  , contents:contents
  , categoryNo : 14 // CATEGORY 14뉴스  : 13 test boad
 
  }
  var attachImageInfo = await getImageInfoForUpload(article.wr_1)
  if(attachImageInfo !== null){
    formData.image = [
      { value: attachImageInfo.image , options: { filename: attachImageInfo.basename,  contentType: `image/${attachImageInfo.extname}`}}
    ]
  }  
  var options = {
      url: api_url,
      formData: formData, 
      headers: {'Authorization': header}
   };

  request.post(options, async function (error, response, body) {
    var sql = `
    UPDATE  g5_write_furigana_news 
    SET     wr_5 =  :wr_5
    ,       wr_6 =  :wr_6
    WHERE   wr_id = :wr_id;
    `

    if (!error && response.statusCode == 200) {
      console.log('Blog Uploaded')
      var jsonBody
      var naverBlogRefNo = '';
      var naverBlogUpload = 'Y'
      try {
        jsonBody= JSON.parse(body);
        console.log(jsonBody.message)
        naverBlogRefNo = jsonBody.message.result.logNo;
        console.log(`naverBlogRefNo : ${naverBlogRefNo}`)
      } catch (error) {
        jsonBody= JSON.parse(body);
        console.log(error)
        console.log(jsonBody)
        naverBlogUpload = 'E'
        naverBlogRefNo = '';
      }
      console.log(naverBlogRefNo)
      article.wr_5 = naverBlogUpload
      article.wr_6 = naverBlogRefNo
     
      result = await sequelize.query(sql,{replacements: article});
      console.log(result);

     
    } else {
      naverBlogUpload = 'E'
      naverBlogRefNo = '';
      article.wr_5 = naverBlogUpload
      article.wr_6 = naverBlogRefNo
     
      result = await sequelize.query(sql,{replacements: article});
      console.log(result);     
    }
  });
}

async function getImageInfoForUpload(imgURL){
  try {
    
    var base64Image = await image2base64(imgURL)
    var parsed = url.parse(imgURL);
    
   
    var result = {
      basename : path.basename(parsed.pathname),
      extname : path.extname(parsed.pathname).replace('.',''),
      base64Image : base64Image,
      image: new Buffer(base64Image, 'base64')
    }
    console.log(result)  
    return result
  } catch (error) {
    return null;
  }  
}
async function uploadSongBlog(){
  console.log("Upload Started...")
  const Op = sequelize.Op
  var sql = `
  SELECT  *
  FROM    g5_write_furigana_song 
  WHERE   wr_5 = 'N'   
  AND     wr_10 <> '' 
  AND     wr_2 <> ''
  AND     wr_1 <> ''
  ORDER
  BY      wr_1
  limit   1
  `
  var song = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})    
  
  
  if(song.length == 1){
    song = song[0];
  }else{
    return ;
  }

  var newTemplate = blogtemplate.replace('[[title]]', song.wr_subject)
  newTemplate = newTemplate.replace('[[artist]]',song.wr_3)
  newTemplate = newTemplate.split("[[id]]").join(song.wr_id)
  newTemplate = newTemplate.split("[[albumImageUrl]]").join(song.wr_2)  
  newTemplate = newTemplate.replace('[[youtubeId]]',song.wr_1)


  var furigana = song.wr_9;
  furigana =  furigana.replace(/\n/g,'<br>')
  newTemplate = newTemplate.replace('[[furigana]]',furigana)
  
  var lyricsKor = song.wr_10;
  if(lyricsKor){
    lyricsKor =  lyricsKor.replace(/\n/g,'<br>')
    newTemplate = newTemplate.replace('[[lyricsKor]]',lyricsKor)
  }
  
  var title = `[J-pop : ${song.wr_3}] ${song.wr_subject}`;
  var contents = newTemplate;

  var api_url = 'https://openapi.naver.com/blog/writePost.json';
  var request = require('request');
  var header = "Bearer " + access_token; // Bearer 다음에 공백 추가

  var formData =  {
    title:title
  , contents:contents
  , categoryNo : 10 // CATEGORY 10가사  : 13 test boad
 
  }
  var attachImageInfo = await getImageInfoForUpload(song.wr_2)
  if(attachImageInfo !== null){
    formData.image = [
      { value: attachImageInfo.image , options: { filename: attachImageInfo.basename,  contentType: `image/${attachImageInfo.extname}`}}
    ]
  }  
  var options = {
      url: api_url,
      formData: formData, 
      headers: {'Authorization': header}
   };
   request.post(options, async function (error, response, body) {
    var sql = `
    UPDATE  g5_write_furigana_song 
    SET     wr_5 =  :wr_5
    ,       wr_6 =  :wr_6
    WHERE   wr_id = :wr_id;
    `

    if (!error && response.statusCode == 200) {
      console.log('Blog Uploaded')
      var jsonBody
      var naverBlogRefNo = '';
      var naverBlogUpload = 'Y'
      try {
        jsonBody= JSON.parse(body);
        console.log(jsonBody.message)
        naverBlogRefNo = jsonBody.message.result.logNo;
        console.log(`naverBlogRefNo : ${naverBlogRefNo}`)
      } catch (error) {
        jsonBody= JSON.parse(body);
        console.log(error)
        console.log(jsonBody)
        naverBlogUpload = 'E'
        naverBlogRefNo = '';
      }
      console.log(naverBlogRefNo)
      song.wr_5 = naverBlogUpload
      song.wr_6 = naverBlogRefNo
     
      result = await sequelize.query(sql,{replacements: song});
      console.log(result);

     
    } else {
      naverBlogUpload = 'E'
      naverBlogRefNo = '';
      song.wr_5 = naverBlogUpload
      song.wr_6 = naverBlogRefNo
     
      result = await sequelize.query(sql,{replacements: song});
      console.log(result);     
    }
  });
}

function refreshToken(){
  var api_url = `https://nid.naver.com/oauth2.0/token?grant_type=refresh_token&client_id=${client_id}&&client_secret=${client_secret}&refresh_token=${refresh_token}`
  console.log(api_url)
  var options = {
      url: api_url,
      headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
  };
  request.get(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {             
      var jsonBody = JSON.parse(body);
      access_token = jsonBody.access_token      
      console.log(jsonBody)
    } else {
      res.status(response.statusCode).end();
      console.log('error = ' + response.statusCode);
    }
  });
}

setInterval(refreshToken, 1000 * 60 * 10)

setInterval(function(){
  var ranTime = Math.floor((Math.random() * 10) + 1)
  setTimeout(() => {
    uploadArticleBlog()
  }, ranTime) 
}, 1000 * 60 * 3)
setInterval(function(){
  var ranTime = Math.floor((Math.random() * 10) + 1)
  setTimeout(() => {
    uploadSongBlog()
  }, ranTime) 
}, 1000 * 60 * 60)


app.get('/naverlogin', function (req, res) {
   res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
   res.end("<a href='"+ api_url + "'><img height='50' src='http://static.nid.naver.com/oauth/small_g_in.PNG'/></a>");
 });
 app.get('/callback', function (req, res) {
    code = req.query.code;
    state = req.query.state;
    // api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
    //  + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirectURI + '&code=' + code + '&state=' + state +'';

    api_url = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirectURI}&code=${code}&state=${state}`
    var request = require('request');
    var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
     };
    request.get(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
        jsonBody = JSON.parse(body);
        access_token = jsonBody.access_token
        refresh_token = jsonBody.refresh_token     
        uploadArticleBlog()   
        uploadSongBlog()
        res.end(body);
      } else {
        res.status(response.statusCode).end();
        console.log('error = ' + response.statusCode);
      }
    });
  });
  app.get('/blog/post', function (req, res) {
    var title = "네이버 블로그 api Test node js";
    var contents = "<span style='color:blue'>네이버 블로그 api로 글을 블로그에 올려봅니다.</span>";

    var api_url = 'https://openapi.naver.com/blog/writePost.json';
    var request = require('request');
    var header = "Bearer " + access_token; // Bearer 다음에 공백 추가
    var options = {
        url: api_url,
        form: {'title':title, 'contents':contents},
        headers: {'Authorization': header}
     };
    request.post(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
        res.end(body);
      } else {
        console.log('error');
        if(response != null) {
          res.status(response.statusCode).end();
          console.log('error = ' + response.statusCode);
        }
      }
    });
  });
  app.get('/blog/category', function (req, res) {
   
    var header = "Bearer " + access_token; 
    console.log(header)
    var api_url = 'https://openapi.naver.com/blog/listCategory.json';
    var request = require('request');
    var options = {
        url: api_url,
        headers: {'Authorization': header}
     };
    request.get(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
        res.end(body);
      } else {
        console.log('error');
        if(response != null) {
          res.status(response.statusCode).end();
          console.log('error = ' + response.statusCode);
        }
      }
    });
  });  
 app.listen(3000, function () {
   console.log('http://127.0.0.1:3000/naverlogin app listening on port 3000!');
 });
