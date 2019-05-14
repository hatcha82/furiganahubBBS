<style>

.writer{
	width:100%;
	margin:auto;
	position:relative;
}
.writer h1{
	font-size:18px;
}
.error{color:red}
.syncText{
	width:100%;
	min-height:300px;
	padding:10px;
	line-height:38px;
	font-size:1.5em;

}
#userArticle{
	width:100%;
}
#article{
	background:#eee;	
	color:#ddd;
}
#practice{	
	right:0;
	position:absolute;
	border:none;
	top:0px;
	background:none;
	
}
#article rt{
  color:red;
  font-size:0.5em;
}
</style>

<div class="writer">
	<p id="article" class="syncText"><?php echo $furiganaWriter;?></p>
	<textarea id="practice" class="syncText">
	</textarea>
	<div id="scoreBoard" class="error">
		Error: <span id="numberOfError"></span>
	</div>		
	<p id="debug"></p>
	<p id="hira"></p>
</div>

<script>
$( document ).ready(function() {

	
// $("#userArticle").on('paste', function(e){
//   var text = e.originalEvent.clipboardData.getData('text');
//   text = text.replace(/　/gi, ""); 
//   text = text.replace(/ 　/gi, ""); 
//   text = text.replace(/\n/gi, "<br>"); 
  
  
//   var url = "https://jlp.yahooapis.jp/FuriganaService/V1/furigana?appid=dj00aiZpPVVJcmZ3R3kzdTZEaiZzPWNvbnN1bWVyc2VjcmV0Jng9MWU-&grade=1&sentence=[sentence]";
//   url = url.replace("[sentence]", text);
  
//   $.ajax({
//     method: "GET",
//     url:url,		 
//   })
//   .done(function( msg ) {
//      console.log(msg)			 
//   });
  
//   $.ajax( url, function( data ) {
    
//   });
  
//   $("#article").html(text)
  
//   $("#practice").val('');
  
//   var height = $("#article").height()
//   $("#practice").height(height)
//   return false;
// })

$("#practice").on('keyup',function(e){
  var orgText = $("#article").text();
  var userText = $(this).val();
  var orgArry = orgText.split('');
  var userArry = userText.split('');
  var validText = '';
  var errorCnt = 0;
  $.map(orgArry, function(val,idx){
    if(userArry[idx] == val){
      validText += val;
    }else{
      errorCnt++;
      validText += "<span class='error'>" + val + "</span>";
    }
  })
  
  $("#numberOfError").html(errorCnt)
  $("#debug").html(validText)
})
});



</script>