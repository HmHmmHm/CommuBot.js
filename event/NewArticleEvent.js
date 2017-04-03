let Event = require('deploy-event').Event;

class NewArticleEvent extends Event {
    constructor(monitor) {
        super(false, __filename); //이벤트가 중지시킬 수 있는 것인지를 알립니다.
        this._monitor = monitor;

        this.articleId = null;
        this.link = null;
        this.title = null;
        this.prettyLink = null;
        this.commentCount = null;
        this.writerId = null;
        this.writerName = null;
        this.category = null;
    }

    getMonitor() {
        return this._monitor;
    }
}

module.exports = NewArticleEvent;
