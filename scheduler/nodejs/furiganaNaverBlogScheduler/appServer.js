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
        sequelize.where(
           sequelize.fn('DATE', sequelize.col('createdAt')),
           sequelize.literal('CURRENT_DATE')
        )
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
  var article = await Article.findOne({
    where :{
      $and: [
        {  
          translateText : {[Op.ne]: null},
          naverBlogUpload : 'N',
          [Op.or] : [ { newsPublisher: { [Op.like] : '%NEWS24' } }, { newsPublisher: {[Op.like] : 'TBS%'}  }]
        },
        sequelize.where(
           sequelize.fn('DATE', sequelize.col('createdAt')),
           sequelize.literal('CURRENT_DATE')
        )
      ]
    },        
    limit: 1,
  })
  if(!article){
    return;
  }
  var newTemplate = newsBlogtemplate.replace('[[title]]', article.title)
  newTemplate = newTemplate.replace('[[title]]', article.titleTranslate)
  newTemplate = newTemplate.split("[[id]]").join(article.id)
  newTemplate = newTemplate.split("[[newsUrl]]").join(article.newsUrl)
  newTemplate = newTemplate.split("[[newsImageUrl]]").join(article.newsImageUrl)  
  newTemplate = newTemplate.split("[[newsPublishedDate]]").join(article.newsPublishedDate.toString())
  newTemplate = newTemplate.split("[[newsPubllisherImageUrl]]").join(article.newsPubllisherImageUrl)
  newTemplate = newTemplate.split("[[titleFurigana]]").join(article.titleFurigana)
  newTemplate = newTemplate.split("[[titleTranslate]]").join(article.titleTranslate)
  
  var furigana = article.furigana;
  furigana =  furigana.replace(/\n/g,'<br>')
  newTemplate = newTemplate.replace('[[furigana]]',furigana)

  var translateText = article.translateText;

  if(translateText){
    translateText =  translateText.replace(/\n/g,'<br>')
    newTemplate = newTemplate.replace('[[translateText]]',translateText)
  }
  
  var title = `[일본뉴스] ${article.title}-${article.titleTranslate}`;
  var contents = newTemplate;  
  var api_url = 'https://openapi.naver.com/blog/writePost.json';
  var request = require('request');
  var header = "Bearer " + access_token; // Bearer 다음에 공백 추가

  var formData =  {
    title:title
  , contents:contents
  , categoryNo : 14 // CATEGORY 14뉴스  : 13 test boad
 
  }
  var attachImageInfo = await getImageInfoForUpload(article.newsImageUrl)
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

 
  request.post(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log('Blog Uploaded')
      var jsonBody
      var naverBlogRefNo
      var naverBlogUpload = 'Y'
      try {
        jsonBody= JSON.parse(body);
        console.log(jsonBody.message)
        naverBlogRefNo = jsonBody.message.result.logNo;
        console.log(`naverBlogRefNo : ${naverBlogRefNo}`)
      } catch (error) {
        console.log(error)
        naverBlogUpload = 'E'
      }
      console.log(naverBlogRefNo)
      Article.update({
        naverBlogUpload: naverBlogUpload,
        naverBlogRefNo: naverBlogRefNo
      }, {
        where: { id: article.id }
      })
      .then(result =>{
        console.log(`result: ${result}  updated row article.id ${article.id} ,title ${article.title}` )
        
      })
      .catch(error =>{
        console.log(`result: ${error}  updated row article.id ${article.id} ,title ${article.title}` )
      })  
    } else {
      Article.update({
        naverBlogUpload: 'E',
      }, {
        where: { id: article.id }
      })
      .then(result =>{
        console.log(`result: ${result}  updated row article.id ${article.id} ,title ${article.title}` )
        
      })
      .catch(error =>{
        console.log(`result: ${error}  updated row article.id ${article.id} ,title ${article.title}` )
      })  
      if(response != null) {
        
      }
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
  if(!song){
    return;
  }
  var newTemplate = blogtemplate.replace('[[title]]', song.title)
  newTemplate = newTemplate.replace('[[artist]]',song.artist)
  newTemplate = newTemplate.split("[[id]]").join(song.id)
  newTemplate = newTemplate.split("[[albumImageUrl]]").join(song.albumImageUrl)  
  newTemplate = newTemplate.replace('[[youtubeId]]',song.youtubeId)


  var furigana = song.tab;
  furigana =  furigana.replace(/\n/g,'<br>')
  newTemplate = newTemplate.replace('[[furigana]]',furigana)
  
  var lyricsKor = song.lyricsKor;
  if(lyricsKor){
    lyricsKor =  lyricsKor.replace(/\n/g,'<br>')
    newTemplate = newTemplate.replace('[[lyricsKor]]',lyricsKor)
  }
  
  var title = `[J-pop : ${song.artist}] ${song.title}`;
  var contents = newTemplate;

  var api_url = 'https://openapi.naver.com/blog/writePost.json';
  var request = require('request');
  var header = "Bearer " + access_token; // Bearer 다음에 공백 추가

  var formData =  {
    title:title
  , contents:contents
  , categoryNo : 10 // CATEGORY 10가사  : 13 test boad
 
  }
  var attachImageInfo = await getImageInfoForUpload(song.albumImageUrl)
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
  request.post(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      
      var jsonBody
      var naverBlogRefNo
      var naverBlogUpload = 'Y'
      try {
        jsonBody= JSON.parse(body);
        console.log(jsonBody.message)
        naverBlogRefNo = jsonBody.message.result.logNo;
        console.log(`naverBlogRefNo : ${naverBlogRefNo}`)
      } catch (error) {
        console.log(error)
        naverBlogUpload = 'E'
      }
      console.log(naverBlogRefNo)
      Song.update({
        naverBlogUpload: naverBlogUpload,
        naverBlogRefNo: naverBlogRefNo
      }, {
        where: { id: song.id }
      })
      .then(result =>{
        console.log(`result: ${result}  updated row song.id ${song.id} ,title ${song.title}` )
        
      })
      .catch(error =>{
        console.log(`result: ${error}  updated row song.id ${song.id} ,title ${song.title}` )
      })  
    } else {
    
      Song.update({
        naverBlogUpload: 'E',
      }, {
        where: { id: song.id }
      })
      .then(result =>{
        console.log(`result: ${result}  updated row song.id ${song.id} ,title ${song.title}` )
        
      })
      .catch(error =>{
        console.log(`result: ${error}  updated row song.id ${song.id} ,title ${song.title}` )
      })  
      if(response != null) {
        
      }
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