let Event = require('deploy-event').Event;

class InitializedEvent extends Event {
    constructor(cafeDomain, monitor) {
        super(false, __filename); //이벤트가 중지시킬 수 있는 것인지를 알립니다.
        this._cafeDomain = cafeDomain;
        this._monitor = monitor;
    }

    getCafeDomain(cafeDomain) {
        return this._cafeDomain;
    }

    getMonitor() {
        return this._monitor;
    }

    setCafeDomain(cafeDomain) {
        this._cafeDomain = cafeDomain;
    }

}

module.exports = InitializedEvent;
