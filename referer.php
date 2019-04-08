<?php

$url =  "{$_SERVER['REQUEST_URI']}";
var_dump(checkFuriganaReferer($url,"/article/detail/" ,'article'));

exit(1);

function checkFuriganaReferer($url, $test, $type){
	$pos =  strpos($url, $test);	
	if ($pos !== false){		
		$url_parse_array = explode( $test, $url);
		if(count($url_parse_array) == 2){
			$obj = new StdClass;
			$id = $url_parse_array[1];
			$obj->id = $id;
			$obj->type= $type;
			return	$obj;
		}else{
			return null;
		}		
	}else{
		return null;
	}	
}
