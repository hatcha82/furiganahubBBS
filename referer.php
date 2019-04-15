<?php

$url =  "{$_SERVER['REQUEST_URI']}";
$rediect_url = checkFuriganaReferer($url);
if($rediect_url !== null){
	header("Location: $rediect_url");
}

function checkFuriganaReferer($url){
	$pos =  strpos($url, '/detail/');	
	if ($pos !== false){		
		$url_parse_array = explode( '/detail/', $url);		
		if(count($url_parse_array) == 2){	
			$table = substr( $url_parse_array[0], 1);
			$id = $url_parse_array[1];		

			if($table === 'article'){
				$table = 'news';
			}
			$rediect_url = "/bbs/board.php?bo_table=furigana_$table&wr_id=$id";
			echo $rediect_url;			
			return	$rediect_url;
		}else{
			return null;
		}		
	}else{
		return null;
	}	
}
