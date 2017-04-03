var request = require("request");
var cheerio = require("cheerio");
var iconv = new require('iconv').Iconv('euc-kr', 'utf-8//translit//ignore');

var crawl = (cafeDomain, callback) => {
    let naverCafeDefaultDomain = 'http://cafe.naver.com';

    let options = {
        url: `${naverCafeDefaultDomain}/${cafeDomain}.cafe`,
        encoding: null
    };

    request.get(options, (error, response, body) => {
        if (error) throw error;

        let html = iconv.convert(new Buffer(body, 'binary')).toString('utf-8');
        let $ = cheerio.load(html);

        let cafeData = {
            cafeClubId: 0,
            menuHash: {},
            menuList: []
        };
        let boardData = {};

        let groupArea = $('div[id="group-area"]');

        //카페맴버수 및 가입대기자 숫자 크롤링
        groupArea.find('.mem-cnt-info').find('a').each((index, element) => {
            var text = $(element).text();

            (typeof(text.split(' ')[1]) !== 'undefined') ?
            cafeData['preMemberCount'] = text.split(' ')[1]: cafeData['memberCount'] = text;
        });

        //카페 카테고리 리스트 크롤링
        groupArea.find('.cafe-menu-list').find('a').each((index, element) => {
            let menuTitle = $(element).text();
            let menuId = Number($(element).attr('id').replace('menuLink', ''));

            cafeData['menuHash'][menuId] = menuTitle;
            cafeData['menuList'].push(menuId);
        });

        //카페번호 크롤링
        cafeData['cafeClubId'] = Number(groupArea.find('.ia-info-data').find('.thm').find('a').attr('href').replace('/CafeHistoryView.nhn?clubid=', ''));


        //게시판 iframe 크롤링시작
        let iframe_options = {
            url: `http://cafe.naver.com/ArticleList.nhn?&search.boardtype=L&search.clubid=${cafeData['cafeClubId']}`,
            encoding: null
        };

        request.get(iframe_options, (error, response, body) => {
            if (error) throw error;

            let iframeHtml = iconv.convert(new Buffer(body, 'binary')).toString('utf-8');
            $ = cheerio.load(iframeHtml);

            let mainArea = $('div[id="main-area"]');
            let boardListCount = 0;

            //게시글 링크/제목/댓글수 크롤링
            mainArea.find('.board-list').each((index, element) => {
                let link = $(element).find('a.m-tcol-c').attr('href');

                if (link === undefined) return;
                link = 'http://cafe.naver.com' + link;

                let title = $(element).find('a.m-tcol-c').text();
                let commentCount = Number(String($(element).find('span.m-tcol-p.num').text()).replace('[', '').replace(']', ''));

                if (typeof(boardData[boardListCount]) === 'undefined') boardData[boardListCount] = {};

                boardData[boardListCount]['link'] = link;
                boardData[boardListCount]['articleId'] = link.split('articleid=')[1].split('&')[0];
                boardData[boardListCount]['prettyLink'] = `${naverCafeDefaultDomain}/${cafeDomain}/${boardData[boardListCount]['articleId']}`;
                boardData[boardListCount]['title'] = title;
                boardData[boardListCount]['comment-count'] = commentCount;

                boardListCount++;
            });

            let pnickCount = 0;

            //게시글 작성자아이디/작성자닉네임/카테고리 크롤링
            mainArea.find('form[name="ArticleList"]').find('.p-nick').each((index, element) => {
                let link = $(element).find('a.m-tcol-c').attr('onclick');

                if (link === undefined) return;
                let linkParse = link.split('(event, ')[1].split(')')[0].replace(/, /gi, ',').replace(/'/gi, "").split(',');

                if (typeof(boardData[pnickCount]) === 'undefined') boardData[pnickCount] = {};

                boardData[pnickCount]['id'] = linkParse[0];
                boardData[pnickCount]['nick'] = linkParse[2];
                boardData[pnickCount]['menu-id'] = linkParse[9];
                pnickCount++;
            });

            callback(cafeData, boardData);
        });
    });
}

module.exports = {
    crawl: crawl
};
