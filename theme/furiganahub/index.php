<?php
define('_INDEX_', true);
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

if (G5_IS_MOBILE) {
    include_once(G5_THEME_MOBILE_PATH.'/index.php');
    return;
}

include_once(G5_THEME_PATH.'/head.php');
?>

<h2 class="sound_only">최신글</h2>
    
    
    
    <?php  echo latest('theme/basic','furigana_news', 5, 45);?>
    <!-- <div style="text-align: center; margin-bottom: 20px;"><?=adsenseBanner("6629063040",728, 90)?></div> -->
    <?php  echo latest('theme/basic','furigana_song', 5, 45);?>
    <!-- <div style="text-align: center;margin-bottom: 20px;"><?=adsenseBanner("1902338212",728, 90)?></div> -->
    <?php  echo latest('theme/basic','furigana_douwas', 5, 45);?>
    <!-- <div style="text-align: center;margin-bottom: 20px;"><?=adsenseBanner("2214163558",728, 90)?></div> -->
<div class="latest_wr">
    <!--  사진 최신글2 { -->
    <?php
    // 이 함수가 바로 최신글을 추출하는 역할을 합니다.
    // 사용방법 : latest(스킨, 게시판아이디, 출력라인, 글자수);
    // 테마의 스킨을 사용하려면 theme/basic 과 같이 지정
    echo latest('theme/pic_basic', 'gallery', 5, 23);
    ?>
    <!-- } 사진 최신글2 끝 -->
</div>
<div class="latest_wr">
    <!-- 최신글 시작 { -->
    <?php
    //  최신글    
    $sql = " select bo_table
                from `{$g5['board_table']}` a left join `{$g5['group_table']}` b on (a.gr_id=b.gr_id)
                where a.bo_device <> 'mobile' 
                and  a.bo_table not in ( 'furigana_song')  "; 
    if(!$is_admin){
        $sql .= " and a.bo_use_cert = '' ";
        $sql .= "  and b.gr_id <> 'issue'  ";
    }

    $sql .= " and a.bo_table in ('free','notice') ";     //공지사항과 갤러리 게시판은 제외
    $sql .= " order by b.gr_order, a.bo_order ";    
    $result = sql_query($sql);
    for ($i=0; $row=sql_fetch_array($result); $i++) {
        if ($i%2==1) $lt_style = "margin-left:2%";
        else $lt_style = "";
    ?>
     <div >
        <?php
        // 이 함수가 바로 최신글을 추출하는 역할을 합니다.
        // 사용방법 : latest(스킨, 게시판아이디, 출력라인, 글자수);
        // 테마의 스킨을 사용하려면 theme/basic 과 같이 지정
        echo latest('theme/basic', $row['bo_table'], 5, 45);
        ?>
    </div>
    <?php
    }
    ?>

   

    <!-- } 최신글 끝 -->
    </div>
<?php
include_once(G5_THEME_PATH.'/tail.php');
?>