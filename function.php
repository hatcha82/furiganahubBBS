<?php
function onePixcelImageCheck($url){
  $image_info = @getimagesize($url);
  if(is_array($image_info) && $image_info[0] == 1){
    return true;
  }else{
    return false;
  }
}
function adfitBanner($unit, $width, $height){
  $html = join('', array(
    '<div style="margin:0px auto;width:[width]px;height:[height]px;">'
    ,  '<ins class="kakao_ad_area" style="display:none;" '
    ,  'data-ad-unit    = "[unit]"'
    ,  'data-ad-width   = "[width]"'
    ,  'data-ad-height  = "[height]"></ins>'
    ,  '<script type="text/javascript" src="//t1.daumcdn.net/adfit/static/ad.min.js" async></script>'
    ,'</div>'
  ));
  // ,  'data-ad-unit    = "DAN-1h7zrmefbegc0"'
  // ,  'data-ad-width   = "728"'
  // ,  'data-ad-height  = "90"></ins>'
  //adfitBanner("DAN-1h7zrmefbegc0","728" ,"90")
  if(true){
    $html = str_replace("[unit]",$unit,$html);
    $html = str_replace("[width]",$width,$html);
    $html = str_replace("[height]",$height,$html);
  }
  
  return $html;
}
function displayFuriganaSongWithTranslate($furiganaText,$translateText){
  $furigana = explode( "\n", $furiganaText);
  $translate = explode( "\n",$translateText);
  $html = "";
  for ($i=0; $i<=count($translate); $i++) {               
          $html.="$furigana[$i]<br>$translate[$i]<br><br>";            
  }            
  return $html;
}
?>