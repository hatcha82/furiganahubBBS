<?php
if (!defined("_GNUBOARD_")) exit; // 개별 페이지 접근 불가
include_once(G5_LIB_PATH.'/thumbnail.lib.php');

// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$board_skin_url.'/style.css">', 0);
?>

<script src="<?php echo G5_JS_URL; ?>/viewimageresize.js"></script>

<!-- <div id="bo_v_table"><?php echo ($board['bo_mobile_subject'] ? $board['bo_mobile_subject'] : $board['bo_subject']); ?></div> -->
    <div class="btn_top top"> 
        <?php if ($reply_href) { ?><a href="<?php echo $reply_href ?>" class="btn_b01"><i class="fa fa-reply" aria-hidden="true"></i> 답변</a><?php } ?>
        <?php if ($write_href) { ?><a href="<?php echo $write_href ?>" class="btn_b02 btn"><i class="fa fa-pencil" aria-hidden="true"></i> 글쓰기</a><?php } ?>

    </div>
<article id="bo_v" style="width:<?php echo $width; ?>">
    <header>
        <h2 id="bo_v_title">
            <?php if ($category_name) { ?>
            <span class="bo_v_cate"><?php echo $view['ca_name']; // 분류 출력 끝 ?></span> 
            <?php } ?>
            <span class="bo_v_tit">
            <?php
            echo cut_str(get_text($view['wr_subject']) , 70); // 글제목 출력
            ?></span>
            <span class="bo_v_tit">
            <?= cut_str(get_text($view['wr_artist']) , 70); ?>            
            </span
        </h2>
        <p><span class="sound_only">작성일</span><i class="fa fa-clock-o" aria-hidden="true"></i> <?php echo date("y-m-d H:i", strtotime($view['wr_datetime'])) ?></p>
    </header>

    <section id="bo_v_info">
        <h2>페이지 정보</h2>
        <span class="sound_only">작성자 </span><?php echo $view['name'] ?><span class="ip"><?php if ($is_ip_view) { echo "&nbsp;($ip)"; } ?></span>
        <span class="sound_only">조회</span><strong><i class="fa fa-eye" aria-hidden="true"></i> <?php echo number_format($view['wr_hit']) ?>회</strong>
        <span class="sound_only">댓글</span><strong><i class="fa fa-commenting-o" aria-hidden="true"></i> <?php echo number_format($view['wr_comment']) ?>건</strong>
    </section>

    <div id="bo_v_top">
        <?php
        ob_start();
         ?>
        <ul class="bo_v_left">
            <?php if ($update_href) { ?><li><a href="<?php echo $update_href ?>" class="btn_b01 btn"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> 수정</a></li><?php } ?>
            <?php if ($delete_href) { ?><li><a href="<?php echo $delete_href ?>" class="btn_b01 btn" onclick="del(this.href); return false;"><i class="fa fa-trash-o" aria-hidden="true"></i> 삭제</a></li><?php } ?>
            <?php if ($copy_href) { ?><li><a href="<?php echo $copy_href ?>" class="btn_admin btn" onclick="board_move(this.href); return false;"><i class="fa fa-files-o" aria-hidden="true"></i> 복사</a></li><?php } ?>
            <?php if ($move_href) { ?><li><a href="<?php echo $move_href ?>" class="btn_admin btn" onclick="board_move(this.href); return false;"><i class="fa fa-arrows" aria-hidden="true"></i> 이동</a></li><?php } ?>
            <?php if ($search_href) { ?><li><a href="<?php echo $search_href ?>" class="btn_b01 btn">검색</a></li><?php } ?>

        </ul>

        <?php
        $link_buttons = ob_get_contents();
        ob_end_flush();
         ?>
    </div>

    <section id="bo_v_atc">
        <h2 id="bo_v_atc_title">본문</h2>

        <?php
        // 파일 출력
        $v_img_count = count($view['file']);
        if($v_img_count) {
            echo "<div id=\"bo_v_img\">\n";

            for ($i=0; $i<=count($view['file']); $i++) {
                if ($view['file'][$i]['view']) {
                    //echo $view['file'][$i]['view'];
                    echo get_view_thumbnail($view['file'][$i]['view']);
                }
            }

            echo "</div>\n";
        }
         ?>
    
        
        <div id="bo_v_song_meta">                
            
            <img class="bo_v_song_img" src="<?=get_view_thumbnail($view['wr_2']); ?>"/>              
            <br>
            
        </div>

        
        <div id="bo_v_furigana_song"><?php echo displayFuriganaSongWithTranslate($view['wr_9'],$view['wr_10']);?></div>        
        
        <div id="youtube_area"style="width:320px;margin:00px auto;margin-bottom:20px;">
            <a target="_blank" href="https://www.youtube.com/watch?v=<?=get_text($view['wr_1']);?>" > 
                <img style="height:20px" src="data:image/png;base64,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"/>
            </a>
            <br>
            <div style="position: relative; padding-bottom: 56.25%;">
            <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/<?=get_text($view['wr_youtube_id']);?>?autoplay=1&playsinline=1'" frameborder="0" gesture="media" allow="autoplay;encrypted-media" ></iframe>
            </div>
            저작권에 의한 플레이 불가능 할 경우 Youtube 이동 
            <a target="_blank" href="https://www.youtube.com/watch?v=<?=get_text($view['wr_1']);?>" ><?=get_text($view['wr_subject']);?> - <?=get_text($view['wr_artist']);?></a>       
        </div>         
        <!-- <div id="bo_v_con"><?php echo get_view_thumbnail($view['content']); ?></div> -->
        <?php //echo $view['rich_content']; // {이미지:0} 과 같은 코드를 사용할 경우 ?>
        
        <?=adfitBanner("DAN-1iaxnjnjggk12","320" ,"100")?>
        <br>
        <br>
        
        <?php if ($is_signature) { ?><p><?php echo $signature ?></p><?php } ?>

        <?php if ( $good_href || $nogood_href) { ?>
        <div id="bo_v_act">
            <?php if ($good_href) { ?>
            <span class="bo_v_act_gng">
                <a href="<?php echo $good_href.'&amp;'.$qstr ?>" id="good_button"  class="bo_v_good"><i class="fa fa-thumbs-o-up" aria-hidden="true"></i><br><span class="sound_only">추천</span><strong><?php echo number_format($view['wr_good']) ?></strong></a>
                <b id="bo_v_act_good">이 글을 추천하셨습니다</b>
            </span>
            <?php } ?>
            <?php if ($nogood_href) { ?>
            <span class="bo_v_act_gng">
                <a href="<?php echo $nogood_href.'&amp;'.$qstr ?>" id="nogood_button" class="bo_v_nogood"><i class="fa fa-thumbs-o-down" aria-hidden="true"></i><br><span class="sound_only">비추천</span><strong><?php echo number_format($view['wr_nogood']) ?></strong></a>
                <b id="bo_v_act_nogood"></b>
            </span>
            <?php } ?>
        </div>
        <?php } else {
            if($board['bo_use_good'] || $board['bo_use_nogood']) {
        ?>
        <div id="bo_v_act">
            <?php if($board['bo_use_good']) { ?><span class="bo_v_good"><i class="fa fa-thumbs-o-up" aria-hidden="true"></i><br><span class="sound_only">추천</span><strong><?php echo number_format($view['wr_good']) ?></strong></span><?php } ?>
            <?php if($board['bo_use_nogood']) { ?><span class="bo_v_nogood"><i class="fa fa-thumbs-o-down" aria-hidden="true"></i><br><span class="sound_only">비추천</span> <strong><?php echo number_format($view['wr_nogood']) ?></strong></span><?php } ?>
        </div>
        <?php
            }
        }
        ?>

        <div id="bo_v_share">
            <?php if ($scrap_href) { ?><a href="<?php echo $scrap_href;  ?>" target="_blank" class=" btn_scrap" onclick="win_scrap(this.href); return false;"><i class="fa fa-thumb-tack" aria-hidden="true"></i> 스크랩</a><?php } ?>

            <?php
            include_once(G5_SNS_PATH."/view.sns.skin.php");
            ?>
        </div>
    </section>


    
    <?php
    if ($view['file']['count']) {
        $cnt = 0;
        for ($i=0; $i<count($view['file']); $i++) {
            if (isset($view['file'][$i]['source']) && $view['file'][$i]['source'] && !$view['file'][$i]['view'])
                $cnt++;
        }
    }
     ?>

    <?php if($cnt) { ?>
    <section id="bo_v_file">
        <h2>첨부파일</h2>
        <ul>
        <?php
        // 가변 파일
        for ($i=0; $i<count($view['file']); $i++) {
            if (isset($view['file'][$i]['source']) && $view['file'][$i]['source'] && !$view['file'][$i]['view']) {
         ?>
            <li>
                <a href="<?php echo $view['file'][$i]['href'];  ?>" class="view_file_download">
                    <i class="fa fa-download" aria-hidden="true"></i>
                    <strong><?php echo $view['file'][$i]['source'] ?></strong>
                    <?php echo $view['file'][$i]['content'] ?> (<?php echo $view['file'][$i]['size'] ?>)
                </a>
                <span class="bo_v_file_cnt"><?php echo $view['file'][$i]['download'] ?>회 다운로드</span> |
                <span>DATE : <?php echo $view['file'][$i]['datetime'] ?></span>
            </li>
        <?php
            }
        }
         ?>
        </ul>
    </section>
    <?php } ?>

    <?php if(isset($view['link'][1]) && $view['link'][1]) { ?>
    <!-- 관련링크 시작 { -->
    <section id="bo_v_link">
        <h2>관련링크</h2>
        <ul>
        <?php
        // 링크
        $cnt = 0;
        for ($i=1; $i<=count($view['link']); $i++) {
            if ($view['link'][$i]) {
                $cnt++;
                $link = cut_str($view['link'][$i], 70);
         ?>
            <li>
                <a href="<?php echo $view['link_href'][$i] ?>" target="_blank">
                    <i class="fa fa-link" aria-hidden="true"></i>
                    <strong><?php echo $link ?></strong>
                </a>
                <span class="bo_v_link_cnt"><?php echo $view['link_hit'][$i] ?>회 연결</span>
            </li>
        <?php
            }
        }
         ?>
        </ul>
    </section>
    <!-- } 관련링크 끝 -->
    <?php } ?>

    <?php if ($prev_href || $next_href) { ?>
    <ul class="bo_v_nb">
        <?php if ($prev_href) { ?><li class="bo_v_prev"><a href="<?php echo $prev_href ?>"><i class="fa fa-caret-left" aria-hidden="true"></i> 이전글</a></li><?php } ?>
        <?php if ($next_href) { ?><li class="bo_v_next"><a href="<?php echo $next_href ?>">다음글 <i class="fa fa-caret-right" aria-hidden="true"></i></a></li><?php } ?>
        <li><a href="<?php echo $list_href ?>" class="btn_list"><i class="fa fa-list" aria-hidden="true"></i> 목록</a></li>

    </ul>
    <?php } ?>
    <?php
    // 코멘트 입출력
    include_once(G5_BBS_PATH.'/view_comment.php');
     ?>

</article>

<script>
<?php if ($board['bo_download_point'] < 0) { ?>
$(function() {
    $("a.view_file_download").click(function() {
        if(!g5_is_member) {
            alert("다운로드 권한이 없습니다.\n회원이시라면 로그인 후 이용해 보십시오.");
            return false;
        }

        var msg = "파일을 다운로드 하시면 포인트가 차감(<?php echo number_format($board['bo_download_point']) ?>점)됩니다.\n\n포인트는 게시물당 한번만 차감되며 다음에 다시 다운로드 하셔도 중복하여 차감하지 않습니다.\n\n그래도 다운로드 하시겠습니까?";

        if(confirm(msg)) {
            var href = $(this).attr("href")+"&js=on";
            $(this).attr("href", href);

            return true;
        } else {
            return false;
        }
    });
});
<?php } ?>

function board_move(href)
{
    window.open(href, "boardmove", "left=50, top=50, width=500, height=550, scrollbars=1");
}
</script>

<!-- 게시글 보기 끝 -->

<script>
$(function() {
    $("a.view_image").click(function() {
        window.open(this.href, "large_image", "location=yes,links=no,toolbar=no,top=10,left=10,width=10,height=10,resizable=yes,scrollbars=no,status=no");
        return false;
    });

    // 추천, 비추천
    $("#good_button, #nogood_button").click(function() {
        var $tx;
        if(this.id == "good_button")
            $tx = $("#bo_v_act_good");
        else
            $tx = $("#bo_v_act_nogood");

        excute_good(this.href, $(this), $tx);
        return false;
    });

    // 이미지 리사이즈
    $("#bo_v_atc").viewimageresize();
});

function excute_good(href, $el, $tx)
{
    $.post(
        href,
        { js: "on" },
        function(data) {
            if(data.error) {
                alert(data.error);
                return false;
            }

            if(data.count) {
                $el.find("strong").text(number_format(String(data.count)));
                if($tx.attr("id").search("nogood") > -1) {
                    $tx.text("이 글을 비추천하셨습니다.");
                    $tx.fadeIn(200).delay(2500).fadeOut(200);
                } else {
                    $tx.text("이 글을 추천하셨습니다.");
                    $tx.fadeIn(200).delay(2500).fadeOut(200);
                }
            }
        }, "json"
    );
}
</script>