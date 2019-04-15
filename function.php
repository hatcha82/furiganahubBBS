<?php
function displayNewsImage($url){
  $image_info = @getimagesize($url);
  //var_dump($image_info);
  
  if($image_info){
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
function displayFuriganaWithTranslateSearchResult($furiganaText,$translateText,$searchWord){
  $furigana = explode( "\n", $furiganaText);
  $translate = explode( "\n",$translateText);
  $html = "";
  $foundIndex = 0;
  $lintCount = 0;
  for ($i=0; $i<=count($translate); $i++) {               
    if( strpos($furigana[$i],$searchWord) !== false ){                           
      $foundIndex =$i;
    } else if( strpos($translate[$i],$searchWord) !== false ){                       
      $foundIndex = $i;
    }

    if( $foundIndex > 0 && $lintCount <=10){
      $html.="$furigana[$i] $translate[$i]";            
    }
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
function furiganaSearchString($boradInfo, $searchStr){
  
  $sql_search =" ";
  for ($i=1; $i<=10; $i++) {
    $bo_search_flag = "bo_". $i ."_search_flag";    
    if($boradInfo[$bo_search_flag] == 'Y'){
      $sql_search .= "or INSTR(LOWER(wr_$i) , '{$searchStr}')";
    }
  } 
  
  return $sql_search;
}
function debugToWeb($var){
  echo "<pre style='overflow:auto'>". var_dump($var) ."</pre>" ;
}
?>