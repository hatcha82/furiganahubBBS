require('dotenv').config()
var fs = require('fs');
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
var {Song} = require('./models')
const {sequelize} = require('./models')




async function run() {  
  var blogObj = fs.readFileSync('refUpdate.json', 'utf-8');
  blogObj = JSON.parse(blogObj)  
  blogObj.items.forEach(blog => {
    var title = blog.title.split('] ')  
    title = title[1]
    var artist = blog.title.replace('[J-pop : ','')
    artist = artist.replace('] ','')
    artist = artist.replace(title,'')
    var naverBlogRefNo = blog.link.replace('http://blog.naver.com/hatcha82?Redirect=Log&amp;logNo=','')
    //"link": "http://blog.naver.com/hatcha82?Redirect=Log&amp;logNo=221382570612",
    console.log(
      `
      title : ${title}
      aritst:' ${ artist} 
      naverBlogRefNo : ${naverBlogRefNo}

      `
    )
    Song.update({
      naverBlogRefNo: naverBlogRefNo
    }, {
      where: { 
        title: title,
        artist : artist,
        naverBlogUpload : 'Y'
      }
    })
    .then(result =>{
      console.log(`result: ${result}  updated row title ${title}` )
      
    })
    .catch(error =>{
      console.log(`result: ${error}  updated row title ${title}` )
    })    

  });
}
run()

