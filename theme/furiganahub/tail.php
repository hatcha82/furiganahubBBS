<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

if (G5_IS_MOBILE) {
    include_once(G5_THEME_MOBILE_PATH.'/tail.php');
    return;
}
?>
    <div style="width:845px;float:left;text-align:center;margin-top:20px;"> 
        <?=adfitBanner("DAN-t4w6dr2ubfat","728" ,"100")?>   
        <a href="https://m.do.co/c/169ac3b5d427" target="_blank"><img style="margin:0 auto" src="/img/adv/digitalOcean.jpg"/></a>       
    </div>
    </div>
    <div id="aside2">
    <?=adfitBanner("DAN-s4p36zan3oz6","160" ,"600")?>     
    <div style="margin-top:10px">       
    <iframe width="160" height="600" allowtransparency="true" src="https://tab2.clickmon.co.kr/pop/wp_ad_160.php?PopAd=CM_M_1003067%7C%5E%7CCM_A_1054519%7C%5E%7CAdver_M_1046207&rt_ad_id_code=RTA_106090&mon_rf=REFERRER_URL" frameborder="0" scrolling="no"></iframe>
    </div>
    </div>
    <div id="aside3">
    <iframe width="160" height="600" allowtransparency="true" src="https://tab2.clickmon.co.kr/pop/wp_ad_160.php?PopAd=CM_M_1003067%7C%5E%7CCM_A_1054519%7C%5E%7CAdver_M_1046207&rt_ad_id_code=RTA_106091&mon_rf=REFERRER_URL" frameborder="0" scrolling="no"></iframe>
    </div>
    <div id="aside">
    
      
        <?php
        //공지사항
        // 이 함수가 바로 최신글을 추출하는 역할을 합니다.
        // 사용방법 : latest(스킨, 게시판아이디, 출력라인, 글자수);
        // 테마의 스킨을 사용하려면 theme/basic 과 같이 지정
        echo latest('theme/notice', 'notice', 4, 13);
        ?>
        <?php echo outlogin('theme/basic'); // 외부 로그인, 테마의 스킨을 사용하려면 스킨을 theme/basic 과 같이 지정 ?>
        <div style="width:298px;margin:0 auto;">
            <div id="youtube_area" style="width:298px;margin-top:10px;margin-bottom:20px;border:5px solid #fff">
                <div style="position: relative; padding-bottom: 56.25%;">
                <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/coYw-eVU0Ks?autoplay=0&playsinline=1'" frameborder="0" gesture="media" allow="autoplay;encrypted-media" ></iframe>
                </div>
                <!-- <a target="_blank" href="https://www.youtube.com/watch?v=<coYw-eVU0Ks" ></a>        -->
            </div>
        </div> 
        <?=adfitBanner("DAN-vbszomwzby2f","300" ,"250")?>   
        <div style="margin-top:20px;">
        <?=adfitBanner("DAN-1hbghscrx51kh","320" ,"100")?>    
        <?php echo poll('theme/basic'); // 설문조사, 테마의 스킨을 사용하려면 스킨을 theme/basic 과 같이 지정 ?>
        <?php echo visit('theme/basic'); // 접속자집계, 테마의 스킨을 사용하려면 스킨을 theme/basic 과 같이 지정 ?>
        </div>
        
    </div>
    
</div>

</div>
<!-- } 콘텐츠 끝 -->

<hr>

<!-- 하단 시작 { -->



<div id="ft">
    <div id="ft_wr">  
        <div id="ft_link">
            <a href="<?php echo G5_BBS_URL; ?>/content.php?co_id=company">회사소개</a>
            <a href="<?php echo G5_BBS_URL; ?>/content.php?co_id=privacy">개인정보처리방침</a>
            <a href="<?php echo G5_BBS_URL; ?>/content.php?co_id=provision">서비스이용약관</a>
            <a href="<?php echo get_device_change_url(); ?>">모바일버전</a>
        </div>
        <div id="ft_catch"><img src="<?php echo G5_IMG_URL; ?>/logo.jpg" alt="<?php echo G5_VERSION ?>"></div>
        <div id="ft_copy">Copyright &copy; <b>www.furiganahub.com</b> All rights reserved.</div>
    </div>
    
    <button type="button" id="top_btn"><i class="fa fa-arrow-up" aria-hidden="true"></i><span class="sound_only">상단으로</span></button>
        <script>
        
        $(function() {
            $("#top_btn").on("click", function() {
                $("html, body").animate({scrollTop:0}, '500');
                return false;
            });
        });
        </script>
</div>

<?php
if(G5_DEVICE_BUTTON_DISPLAY && !G5_IS_MOBILE) { ?>
<?php
}

if ($config['cf_analytics']) {
    echo $config['cf_analytics'];
}
?>

<!-- } 하단 끝 -->

<script>
$(function() {
    // 폰트 리사이즈 쿠키있으면 실행
    font_resize("container", get_cookie("ck_font_resize_rmv_class"), get_cookie("ck_font_resize_add_class"));
});
</script>

<?php
include_once(G5_THEME_PATH."/tail.sub.php");
?>