insert into g5_write_furigana_douwas
SELECT  a.id                      wr_id, 
        -1                        wr_num, 
        ''                        wr_reply, 
        a.id                      wr_parent, 
        0                         wr_is_comment, 
        0                         wr_comment, 
        ''                        wr_comment_reply, 
        case 
            when a.articleType = 'JPN01' then '일본동화'
            when a.articleType = 'JPN02' then '세계동화'
            when a.articleType = 'JPN03' then '세계동화'
            when a.articleType = 'JPN04' then '이솝우화'
            else ''
        end                        ca_name, 
        'html2'                   wr_option,
        a.title                   wr_subject, 
        a.articelOnlyText         wr_content, 
        a.linkUrl                 wr_link1, 
        a.audioUrl                wr_link2, 
        0                         wr_link1_hit, 
        0                         wr_link2_hit, 
        0                         wr_hit, 
        0                         wr_good, 
        0                         wr_nogood, 
        'admin'                   mb_id, 
        '*08426AD968865464212B51178AB8555438F2DD95'                        wr_password, 
         'admin'          		  wr_name, 
        'hatcha82@gmail.com'      wr_email, 
        ''                        wr_homepage, 
        a.createdAt               wr_datetime, 
        0                         wr_file, 
        a.updatedAt               wr_last, 
        '172.17.0.1'              wr_ip, 
        ''                        wr_facebook_user, 
        ''                        wr_twitter_user, 
        a.imageUrl  	          wr_1,  -- imageUrl
        a.audioUrl                wr_2,  -- audioUrl
        a.articleType             wr_3,  -- articleType
        a.episod                  wr_4,  -- episod
        ''                        wr_5,  
        ''                        wr_6, 
        a.titleFurigana           wr_7,         
		case when a.titleTranslate is null then '' else   a.titleTranslate   end      wr_8,
        a.furigana      	      wr_9,
        case when a.translateText is null then '' else a.translateText	end      wr_10 
FROM   jpn_tuto.Douwas          a
               