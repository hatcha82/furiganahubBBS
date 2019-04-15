INSERT INTO gnu5.g5_write_furigana_news(
   wr_id
  ,wr_num
  ,wr_reply
  ,wr_parent
  ,wr_is_comment
  ,wr_comment
  ,wr_comment_reply
  ,ca_name
  ,wr_option
  ,wr_subject
  ,wr_subject_furigana
  ,wr_subject_translate
  ,wr_content
  ,wr_furigana
  ,wr_translate
  ,wr_link1
  ,wr_link2
  ,wr_link1_hit
  ,wr_link2_hit
  ,wr_hit
  ,wr_good
  ,wr_nogood
  ,mb_id
  ,wr_password
  ,wr_name
  ,wr_email
  ,wr_homepage
  ,wr_datetime
  ,wr_file
  ,wr_last
  ,wr_ip
  ,wr_facebook_user
  ,wr_twitter_user
  ,wr_1
  ,wr_2
  ,wr_3
  ,wr_4
  ,wr_5
  ,wr_6
  ,wr_7
  ,wr_8
  ,wr_9
  ,wr_10
)
SELECT  a.id                      wr_id, 
        -1                        wr_num, 
        ''                        wr_reply, 
        a.id                      wr_parent, 
        0                         wr_is_comment, 
        0                         wr_comment, 
        ''                        wr_comment_reply, 
        ''                        ca_name, 
        'html2'                   wr_option, 
        a.title                   wr_subject, 
        ''                        wr_subject_furigana, 
        ''                        wr_subject_translate, 
        a.article                 wr_content, 
        a.furigana                wr_furigana, 
        a.translateText           wr_translate, 
        a.newsUrl                 wr_link1, 
        ''                        wr_link2, 
        0                         wr_link1_hit, 
        0                         wr_link2_hit, 
        0                         wr_hit, 
        0                         wr_good, 
        0                         wr_nogood, 
        'admin'                   mb_id, 
        '*08426AD968865464212B51178AB8555438F2DD95'                        wr_password, 
        a.newsPublisher           wr_name, 
        'hatcha82@gmail.com'      wr_email, 
        ''                        wr_homepage, 
        a.createdAt               wr_datetime, 
        0                         wr_file, 
        a.updatedAt               wr_last, 
        '172.17.0.1'              wr_ip, 
        ''                        wr_facebook_user, 
        ''                        wr_twitter_user, 
        a.newsImageUrl            wr_1,  -- newsImageUrl
        a.newsPublisher           wr_2,  -- newsPublisher
        a.newsPubllisherImageUrl  wr_3,  -- newsPubllisherImageUrl
        a.newsPublishedDate       wr_4,  -- newsPublishedDate
        a.naverBlogUpload         wr_5,  -- naverBlogUpload
        case when a.naverBlogRefNo is null then '' else  a.naverBlogRefNo end       
                                  wr_6,  -- naverBlogRefNo
        ''                        wr_7,         
        a.titleFurigana           wr_8,
        a.titleTranslate          wr_9,
        ''                        wr_10 
FROM   jpn_tuto.Articles          a
order   
by      a.updatedAt                 desc
limit   100                      