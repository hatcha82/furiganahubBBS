require('dotenv').config()
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
var fs = require('fs');
var {WowServerStatus} = require('./models')
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
    WowServerStatus.sync({ force: true })
    //console.log(sourceTex)    
    wowServerStatus()       
  } catch (error) {
    console.log(`Error : ${error}` )
  }
})();
async function wowServerStatus(){
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox',`--window-size=1280,800 `]
  });
  const page = await browser.newPage();  
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto('https://worldofwarcraft.com/ko-kr/game/status/classic-kr', {waitUntil: 'networkidle2'});

  const html = await page.$eval('#realm-status-mount > div > div > div.Pane-content > div.SortTable--flex.Table > div.Table-body', el => el.innerText)
  var tableArray = html.split('\n');
  var updatedTime = new Date();
  WowServerStatus.destroy({
    where: {},
    truncate: true
  })
  for (const tr of tableArray) {
    trSplit = tr.split('\t');
    var serverName = trSplit[1];
    var serverType = trSplit[2];
    var serverStatus = trSplit[3];
    
    var serverStatusObj = {serverName : serverName, serverType: serverType ,serverStatus :serverStatus}
    console.log(serverStatusObj)

    await WowServerStatus.create(serverStatusObj).then(result => {
      console.log("Jane's auto-generated ID:", result);
    });
  }
  sequelize.close();
  
  await browser.close();
  console.log('done')
  process.exit(1);
}


