let Event = require('deploy-event').Event;

class CafeMemberChangedEvent extends Event {
    constructor(monitor) {
        super(false, __filename); //이벤트가 중지시킬 수 있는 것인지를 알립니다.
        this._monitor = monitor;

        this.oldMemberCount = null;
        this.newMemberCount = null;
        this.oldPreMemberCount = null;
        this.newPreMemberCount = null;
    }

    getMonitor() {
        return this._monitor;
    }
}

module.exports = CafeMemberChangedEvent;
