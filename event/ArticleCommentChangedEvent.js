let Event = require('deploy-event').Event;

class ArticleCommentChangedEvent extends Event {
    constructor(monitor) {
        super(false, __filename); //이벤트가 중지시킬 수 있는 것인지를 알립니다.
        this._monitor = monitor;

        this.link = null;
        this.title = null;
        this.newCommentCount = null;
        this.oldCommentCount = null;
        this.writerId = null;
        this.writerName = null;
        this.category = null;
    }

    getMonitor() {
        return this._monitor;
    }
}

module.exports = ArticleCommentChangedEvent;
