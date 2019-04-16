
<div id="tts" style="display:none">
  <select style="height:35px" id="voices"></select>
  <a class="btn_b02 btn" style="background:#82c13f;cursor:pointer" id="speak" class="waves-effect waves-light btn"><i class="fa fa-volume-up"></i> 듣기</a>

</div>
<br>



<div style="display:none">
    
    <div class="row">
      <div class="col s6">
        <label>Rate</label>
        <p class="range-field">
          <input type="range" id="rate" min="1" max="100" value="10" />
        </p>
      </div>
      <div class="col s6">
        <label>Pitch</label>
        <p class="range-field">
          <input type="range" id="pitch" min="0" max="2" value="1" />
        </p>
      </div>
      <div class="col s12">
        <p>N.B. Rate and Pitch only work with native voice.</p>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s12">
        <textarea id="message" ><?=$view['wr_content']?></textarea>
        <label>Write message</label>
      </div>
    </div>
   
</div>



<script>
  $(function(){
  if ('speechSynthesis' in window) {
    if(speechSynthesis.speaking){
        speechSynthesis.cancel();
    }
    
    speechSynthesis.onvoiceschanged = function() {
      var $voicelist = $('#voices');
      var voiceSet = false;
      if($voicelist.find('option').length == 0) {
        speechSynthesis.getVoices().forEach(function(voice, index) {
          var $option = $('<option>')
          .val(index)
          .html(voice.name + (voice.default ? ' (default)' :''));
          $voicelist.append($option);
          if(voice.lang == 'ja-JP' && voiceSet == false){
            voiceSet = true;
            $('#voices').val(index);
            $("#tts").show();
          } 
        });
        
      }
    }

    $('#speak').click(function(){
      if(speechSynthesis.speaking){
        speechSynthesis.cancel();
        return;
      }
      var text = $('#message').val();
      var msg = new SpeechSynthesisUtterance();
      var voices = window.speechSynthesis.getVoices();
      msg.voice = voices[$('#voices').val()];
      msg.rate = $('#rate').val() / 10;
      msg.pitch = $('#pitch').val();
      msg.text = text;

      msg.onend = function(e) {
        console.log('Finished in ' + event.elapsedTime + ' seconds.');
      };

      speechSynthesis.speak(msg);
    })
  } else {
    $('#modal1').openModal();
  }
});
</script>
