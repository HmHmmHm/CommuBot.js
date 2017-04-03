var crawler = require('./crawler.js');
var dispatcher = require('./dispatcher');
var events = require('./events.js');

var checkedCafeData = {};
var checkedArticles = [];
var checkedArticlesMap = {};

var taskHandler = null;
var lastCheckedArticleId = 0;

class monitor {
    constructor(cafeDomain) {
        //최초 기동시 카페 최근글과 정보를 크롤링합니다.
        this.cafeDomain = cafeDomain;
        crawler.crawl(cafeDomain, (cafeData, boardData) => {
            checkedCafeData = cafeData;

            let boardDataLength = Object.keys(boardData).length == 0 ? 0 : Object.keys(boardData).length - 1;
            for (var index = boardDataLength; index >= 0; index--) {
                this.push(boardData[index]);
                if (index == 0) lastCheckedArticleId = boardData[index]['articleId'];
            }
        });

        this.on();

        //모니터가 켜졌다는 것을 알립니다.
        dispatcher.call(new events.InitializedEvent(cafeDomain, this));
    }

    on() {
        if (taskHandler === null) {
            let myMonitor = this;
            taskHandler = setInterval(() => {
                myMonitor.check()
            }, 10 * 1000);
        }
    }

    off() {
        clearInterval(taskHandler);
        taskHandler = null;
    }

    check() {
        crawler.crawl(this.cafeDomain, (cafeData, boardData) => {
            //게시판 내 게시글들을 비교합니다.
            let boardDataLength = Object.keys(boardData).length == 0 ? 0 : Object.keys(boardData).length - 1;
            for (var index = boardDataLength; index >= 0; index--) {
                if (this.push(boardData[index])) {
                    if (lastCheckedArticleId > boardData[index]['articleId']) continue;
                    lastCheckedArticleId = boardData[index]['articleId'];

                    let newArticleEvent = new events.NewArticleEvent(this);

                    newArticleEvent.articleId = boardData[index]['articleId'];
                    newArticleEvent.link = boardData[index]['link'];
                    newArticleEvent.prettyLink = boardData[index]['prettyLink'];
                    newArticleEvent.title = boardData[index]['title'];
                    newArticleEvent.commentCount = boardData[index]['comment-count'];
                    newArticleEvent.writerId = boardData[index]['id'];
                    newArticleEvent.writerName = boardData[index]['nick'];
                    newArticleEvent.category = checkedCafeData['menuHash'][String(boardData[index]['menu-id'])];

                    //새로운 게시글을 발견했다는 것을 알립니다.
                    dispatcher.call(newArticleEvent);
                }
            }

            //카페 내 회원 수 및 가입대기인원을 비교합니다.
            if (cafeData.memberCount != checkedCafeData.memberCount ||
                cafeData.preMemberCount != checkedCafeData.preMemberCount) {
                let cafeMemberChangedEvent = new events.CafeMemberChangedEvent(this);

                cafeMemberChangedEvent.oldMemberCount = checkedCafeData.memberCount;
                cafeMemberChangedEvent.newMemberCount = cafeData.memberCount;
                cafeMemberChangedEvent.oldPreMemberCount = checkedCafeData.preMemberCount;
                cafeMemberChangedEvent.newPreMemberCount = cafeData.preMemberCount;

                //카페 내 가입인원 수가 변경되었다는 것을 알립니다.
                dispatcher.call(cafeMemberChangedEvent);
            }
        });
    }

    push(item) {
        if (typeof(checkedArticlesMap[item.link]) !== 'undefined') {
            //게시글 댓글 수에 변동이 있는지를 확인합니다.
            if (item['comment-count'] != checkedArticlesMap[item.link]['comment-count']) {
                let articleCommentChangedEvent = new events.ArticleCommentChangedEvent(this);

                articleCommentChangedEvent.link = item['link'];
                articleCommentChangedEvent.prettyLink = item['prettyLink'];
                articleCommentChangedEvent.title = item['title'];
                articleCommentChangedEvent.oldCommentCount = checkedArticlesMap[item.link]['comment-count'];
                articleCommentChangedEvent.newCommentCount = item['comment-count'];
                articleCommentChangedEvent.writerId = item['id'];
                articleCommentChangedEvent.writerName = item['nick'];
                articleCommentChangedEvent.category = checkedCafeData['menuHash'][String(item['menu-id'])];

                //게시글내 댓글의 변동사항을 발견했다는 것을 알립니다.
                dispatcher.call(articleCommentChangedEvent);
                checkedArticlesMap[item.link]['comment-count'] = item['comment-count'];
            }
            return false;
        }

        checkedArticles.push(item);
        checkedArticlesMap[item.link] = item;

        if (checkedArticles.length > 50) {
            for (let i = 0; i <= checkedArticles.length - 50; i++) {
                let removeItem = checkedArticles.shift();
                if (typeof(checkedArticlesMap[removeItem.link]) !== 'undefined')
                    delete(checkedArticlesMap[removeItem.link]);
            }
        }

        return true;
    }
}

module.exports = monitor;
/*
 '0':
   { link: 'http://cafe.naver.com/ArticleRead.nhn?clubid=28950812&page=1&boardtype=L&articleid=509&referrerAllArt
icles=true',
     title: '소설',
     'comment-count': 0,
     id: 'rkdalswp111',
     nick: '쿠도난',
     'menu-id': '58' },
*/
