<?php

function adfitBanner($unit, $width, $height){
  $html = join('', array(
    '<div style="margin:10px auto;width:[width]px;height:[height]px;margin-top:5px">'
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
  $html = str_replace("[unit]",$unit,$html);
  $html = str_replace("[width]",$width,$html);
  $html = str_replace("[height]",$height,$html);
  return $html;
}
?>