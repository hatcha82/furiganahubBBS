<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$latest_skin_url.'/style.css">', 0);
?>

<div class="lat">
    <h2 class="lat_title"><a href="<?php echo G5_BBS_URL ?>/board.php?bo_table=<?php echo $bo_table ?>"><?php echo $bo_subject ?></a></h2>
    <ul>
    <?php for ($i=0; $i<count($list); $i++) {  ?>
        
        <li class="borderBottom" style="line-height:30px;padding-right:0">
        <?php  $thumbImage = $list[$i]['wr_1']; echo "<img style='float:left;margin-right:10px;margin-bottom:5px;max-width:100px;' src='$thumbImage'/>"       ?>
            <?php
            $subject = $list[$i]['wr_7'];
            $subject_title =  $subject;            
            if ($list[$i]['icon_secret']) echo "<i class=\"fa fa-lock\" aria-hidden=\"true\"></i><span class=\"sound_only\">비밀글</span> ";
            if ($list[$i]['icon_new']) echo "<span class=\"new_icon\">N<span class=\"sound_only\">새글</span></span>";
            if ($list[$i]['icon_hot']) echo "<span class=\"hot_icon\">H<span class=\"sound_only\">인기글</span></span>";
            $translate =  $list[$i]['wr_8'] ;   
            $href = $list[$i]['href'];
            $subject_title = $subject_title;
            $translate = ($translate === '' ? '번역중' :  $translate);
            $subject = "<span class='furigana' style='line-height:40px;'><strong>$subject</strong></span><br><span style='color:#888'>$translate</span>";                        
                                 
            echo "<a href='$href' title='$subject_title' >$subject</a>";            
            echo "<span style='float:right;margin-top:-10px' class=\"lt_cmt\">조회수 ".$list[$i]['wr_hit']."</span>";
            echo "<div style='clear:both'>";
                
            ?>
            
           
        </span>
        </li>
    <?php }  ?>
    <?php if (count($list) == 0) { //게시물이 없을 때  ?>
    <li class="empty_li">게시물이 없습니다.</li>
    <?php }  ?>
    </ul>
    <a href="<?php echo G5_BBS_URL ?>/board.php?bo_table=<?php echo $bo_table ?>" class="lt_more"><span class="sound_only"><?php echo $bo_subject ?></span><i class="fa fa-plus" aria-hidden="true"></i><span class="sound_only"> 더보기</span></a>

</div>
