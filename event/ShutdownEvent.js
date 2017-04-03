let Event = require('deploy-event').Event;

class ShutdownEvent extends Event {
    constructor(reason) {
        super(true, __filename); //이벤트가 중지시킬 수 있는 것인지를 알립니다.
        this._stopReason = (reason !== undefined) ? reason : '';
        this._cancelReason = '';
    }

    getReason() {
        return this._stopReason;
    }

    getCancelReason() {
        return this._cancelReason;
    }

    setCancelReason(reason) {
        this._stopReason = reason;
    }
}

module.exports = ShutdownEvent;
