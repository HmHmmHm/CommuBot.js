var events = require('./events.js'),
    dispatcher = require('./dispatcher.js'),
    logger = require('./logger.js'),
    readline = require('readline'),

    fs = require('fs'),
    path = require('path'),

    Discord = require('discord.js'),
    Gentleman = require('gentleman.js');

var discordClient = null;
let parsedChannels = {};

logger(`akobot 프로그램이 실행 되었습니다.`);
logger(`help 명령어로 사용가능한 명령어를 확인할 수 있습니다.\n`);

var line = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let botCommandMap = (args, isAdmin, id, userName) => {
    let returnedMessage = null;

    let addedMap = {};
    let deletedMap = {};
    let existMap = {};
    switch (args[0]) {
        case '/akobot':
            returnedMessage = "[관리자 명령어 목록]\n" +
                "/비속어테스트 <...시험할 내용>\n" +
                "/정상단어추가 <...추가할단어들>\n" +
                "/비속어단어추가 <...추가할단어들>\n" +
                "/정상단어삭제 <...삭제할단어들>\n" +
                "/비속어단어삭제 <...추가할단어들>\n"+
                "/영어비속어추가 <...추가할단어들>\n" +
                "/영어비속어삭제 <...추가할단어들>\n";
            break;
        case '/비속어테스트':
            if (!isAdmin) {
                returnedMessage = '[권한없음] 이 명령어는 관리자만 사용가능합니다.';
                break;
            }

            //명령어를 대화내용에서 제외합니다.
            args.splice(0, 1);

            returnedMessage = "[테스트결과] ";
            let needToCheckMessage = args.join(' ');

            let foundedBadWords = Gentleman.find(needToCheckMessage, true);
            if (foundedBadWords.length != 0) {
                let fixedMessage = Gentleman.fix(needToCheckMessage);
                returnedMessage += `비속어를 발견했습니다. 비속어:[${foundedBadWords.join()}] 수정된 메시지:'${fixedMessage}'`;
            } else {
                returnedMessage += "비속어를 발견하지 못했습니다.";
            }
            break;
        case '/정상단어추가':
            if (!isAdmin) {
                returnedMessage = '[권한없음] 이 명령어는 관리자만 사용가능합니다.';
                break;
            }

            //명령어를 대화내용에서 제외합니다.
            args.splice(0, 1);

            for (let argsIndex in args) {
                if (Gentleman.isExistNormalWord(args[argsIndex])) {
                    existMap[args[argsIndex]] = true;
                } else {
                    addedMap[args[argsIndex]] = true;
                }
            }
            returnedMessage = `[반영결과] 정상단어 추가됨 - [${Object.keys(addedMap).join()}] 단어 이미존재 - [${Object.keys(existMap).join()}]`;
            Gentleman.addNormalWords(args);
            break;
        case '/비속어단어추가':
            if (!isAdmin) {
                returnedMessage = '[권한없음] 이 명령어는 관리자만 사용가능합니다.';
                break;
            }

            //명령어를 대화내용에서 제외합니다.
            args.splice(0, 1);

            for (let argsIndex in args) {
                if (Gentleman.isExistBadWord(args[argsIndex])) {
                    existMap[args[argsIndex]] = true;
                } else {
                    addedMap[args[argsIndex]] = true;
                }
            }
            returnedMessage = `[반영결과] 비속어 추가됨 - [${Object.keys(addedMap).join()}] 단어 이미존재 - [${Object.keys(existMap).join()}]`;
            Gentleman.addBadWords(args);
            Gentleman.parse();
            break;
        case '/정상단어삭제':
            if (!isAdmin) {
                returnedMessage = '[권한없음] 이 명령어는 관리자만 사용가능합니다.';
                break;
            }

            //명령어를 대화내용에서 제외합니다.
            args.splice(0, 1);

            for (let argsIndex in args) {
                if (Gentleman.isExistNormalWord(args[argsIndex])) {
                    existMap[args[argsIndex]] = true;
                } else {
                    deletedMap[args[argsIndex]] = true;
                }
            }
            returnedMessage = `[반영결과] 정상단어 삭제됨 - [${Object.keys(deletedMap).join()}] 단어 이미존재 - [${Object.keys(existMap).join()}]`;
            Gentleman.deleteNormalWords(args);
            break;
        case '/비속어단어삭제':
            if (!isAdmin) {
                returnedMessage = '[권한없음] 이 명령어는 관리자만 사용가능합니다.';
                break;
            }

            //명령어를 대화내용에서 제외합니다.
            args.splice(0, 1);

            for (let argsIndex in args) {
                if (Gentleman.isExistBadWord(args[argsIndex])) {
                    existMap[args[argsIndex]] = true;
                } else {
                    deletedMap[args[argsIndex]] = true;
                }
            }

            returnedMessage = `[반영결과] 비속어 삭제됨 - [${Object.keys(deletedMap).join()}] 단어 이미존재 - [${Object.keys(existMap).join()}]`;
            Gentleman.deleteBadWords(args);
            Gentleman.parse();
            break;
            //
            //"/영어비속어추가 <...추가할단어들>\n" +
            //"/영어비속어삭제 <...추가할단어들>\n";
        case '/영어비속어추가':
            if (!isAdmin) {
                returnedMessage = '[권한없음] 이 명령어는 관리자만 사용가능합니다.';
                break;
            }

            //명령어를 대화내용에서 제외합니다.
            args.splice(0, 1);

            for (let argsIndex in args) {
                if (Gentleman.isExistNormalWord(args[argsIndex])) {
                    existMap[args[argsIndex]] = true;
                } else {
                    deletedMap[args[argsIndex]] = true;
                }
            }
            returnedMessage = `[반영결과] 영어 비속어 추가됨 - [${Object.keys(deletedMap).join()}] 단어 이미존재 - [${Object.keys(existMap).join()}]`;
            Gentleman.addSoftSearchWords(args);
            break;
        case '/영어비속어삭제':
            if (!isAdmin) {
                returnedMessage = '[권한없음] 이 명령어는 관리자만 사용가능합니다.';
                break;
            }

            //명령어를 대화내용에서 제외합니다.
            args.splice(0, 1);

            for (let argsIndex in args) {
                if (Gentleman.isExistBadWord(args[argsIndex])) {
                    existMap[args[argsIndex]] = true;
                } else {
                    deletedMap[args[argsIndex]] = true;
                }
            }

            returnedMessage = `[반영결과] 영어 비속어 삭제됨 - [${Object.keys(deletedMap).join()}] 단어 이미존재 - [${Object.keys(existMap).join()}]`;
            Gentleman.deleteSoftSearchWords(args);
            Gentleman.parse();
            break;
    }
    return returnedMessage;
};

class AKOBot {
    static info() {
        logger('프로그램에 필요한 정보를 입력해주세요!\n');
        logger('domain <카페도메인> - cafe.naver.com/*.cafe');
        logger('token <토큰값> - 디스코드 채팅봇의 비밀토큰을 넣어주세요.');
        logger('default <채널명> - 디스코드 채팅봇이 활동할 채널명을 넣어주세요.');
        logger('connect - 현재 입력한 정보로 연결을 시도합니다.\n');
    }

    static connect() {
        if (typeof(privates['cafeDomain']) === 'undefined' ||
            typeof(privates['token']) === 'undefined') {
            AKOBot.info();
            return;
        }

        var monitor = require('./monitor.js');
        var PlayIsletMonitor = new monitor(privates['cafeDomain']);

        const discordClient = new Discord.Client();

        discordClient.on('ready', () => {
            let iterator = discordClient.channels.entries();
            while (true) {
                let index = iterator.next();
                if (index.done) break;
                parsedChannels[index.value[1].name] = index.value[1];
            }
        });

        // 비속어 판단 및 삭제처리
        discordClient.on('message', message => {

            if (message.author.bot) return;

            //관리자권한을 가지고 있는 인원 목록을 얻어옵니다.
            let administratorMap = {};
            discordClient.guilds.map((guild) => {
                guild.members.map((member) => {
                    if (member.hasPermission("ADMINISTRATOR"))
                        administratorMap[member.id] = member.nickname;
                });
            });

            let isAdmin = typeof(administratorMap[message.author.id]) !== 'undefined';

            if (message.content.length != 0 && message.content[0] == '/') {
                let args = message.content.split(' ');
                let replyMessage = botCommandMap(args, isAdmin, message.author.id, message.author.username);
                if (replyMessage != null) message.reply(replyMessage);
            }

            if (true) {
                var fixedMessage = Gentleman.fix(message.content);
                if (message.content != fixedMessage) {
                    let needToChangeMessage = `[비속어필터작동] ${fixedMessage}`;
                    message.reply(needToChangeMessage);
                    message.delete();
                    //message.edit(needToChangeMessage).catch(console.error);;
                    logger(`[비속어필터작동] ${message.author.username}:${message}`);
                }
            }
        });

        discordClient.login(privates['token']);
    }

    static sendMessage(message) {
        for (var index in privates['default']) {
            parsedChannels[privates['default'][index]].sendMessage(message);
        }
    }
}

//명령어 처리단
let commandMap = (input) => {
    let args = input.split(' ');
    switch (args[0].toLowerCase()) {
        case 'domain':
            privates['cafeDomain'] = args[1];
            logger(`도메인 입력이 완료되었습니다.`);
            break;
        case 'token':
            privates['token'] = args[1];
            logger(`토큰 입력이 완료되었습니다.`);
            break;
        case 'default':
            if(typeof(privates['default']) == 'undefined') privates['default'] = [];
            privates['default'].push(args[1]);
            logger(`채널명 입력이 완료되었습니다.`);
            break;
        case 'connect':
            fs.writeFile('./data/privates.json', JSON.stringify(privates, null, 4));
            AKOBot.connect();
            break;
        case 'talk':
            args.splice(0, 1);
            AKOBot.sendMessage(args.join(''));
            break;
        case 'stop':
        case 'exit':
            logger(`프로그램 종료를 시도합니다...`);

            let shutdownEvent = new events.ShutdownEvent('STOP COMMAND HAS ACTIVATED');
            dispatcher.call(shutdownEvent);

            if (shutdownEvent.isCancelled()) {
                logger(`프로그램 종료가 중단되었습니다. 사유: [${shutdownEvent.getCancelReason()}]`);
            } else {
                logger(`프로그램을 종료합니다.`);
                process.exit();
            }
            break;
        case 'help':
            logger('stop||exit - 프로그램을 종료합니다.');
            break;
        default:
            logger('알 수 없는 명령어 입니다. help를 입력해서 명령어 확인이 가능합니다.');
            break;
    }
};

//명령어 처리 등록
line.on('line', commandMap);

//이벤트 처리단

//모니터가 마테리얼 크롤링을 수집하면 이를 알립니다.
dispatcher.on(events.InitializedEvent, (event) => {
    logger(`${event.getCafeDomain()} 커뮤니티 기반자료가 수집되었습니다!`);
}, dispatcher.LOW);

//종료이벤트가 발생되면 봇의 기능을 정지시킵니다.
dispatcher.on(events.ShutdownEvent, (event) => {
    if (line !== null) {
        line.close();
        line = null;
    }
    logger(`명령어 입력처리가 정지되었습니다.`);

    Gentleman.saveAllData('./data/bad-words.json', './data/normal-words.json', './data/soft-search-words.json');
    logger(`비속어 사전 정보가 저장되었습니다.`);
}, dispatcher.LOW);

var lengthLimit = (message, limit, dotLength) => {
    if (message.length <= limit) return message;

    let fixedMessage = [];
    for (var i = 0; i < limit; i++)
        fixedMessage[i] = message[i];

    return fixedMessage.join('') + '...';
};

//모니터가 새 게시글을 발견하면 해당 사항을 알립니다.
dispatcher.on(events.NewArticleEvent, (event) => {
    let message = `# 새 게시글이 있습니다! [${event.category}] 에, '${lengthLimit(event.title, 15)}' 라는 제목의 글이 작성되었습니다! ${event.prettyLink}`;
    logger(message);
    AKOBot.sendMessage(message);
}, dispatcher.LOW);

dispatcher.on(events.ArticleCommentChangedEvent, (event) => {
    if (event.oldCommentCount >= event.newCommentCount) return;
    let message = `# 새 댓글이 있습니다! [${event.category}] '${lengthLimit(event.title, 15)}'의 댓글 수가 ${event.oldCommentCount}개에서 ${event.newCommentCount}개로 변동되었습니다. ${event.prettyLink}`;
    logger(message);
    AKOBot.sendMessage(message);
}, dispatcher.LOW);

dispatcher.on(events.CafeMemberChangedEvent, (event) => {
    let message = `[새 회원] 회원 수:${event.oldMemberCount}명->${event.newMemberCount}명`;
    if (event.oldPreMemberCount !== event.newPreMemberCount)
        message += `승인 대기수:${event.oldPreMemberCount}명->${event.newPreMemberCount}명`;
    logger(message);
    AKOBot.sendMessage(message);
}, dispatcher.LOW);


// 인증에 필요한 정보들이 여기 담깁니다.
var privates = {};

// 봇 데이터가 담긴 폴더가 없으면 생성합니다.
if (!fs.existsSync('./data')) fs.mkdirSync('./data');

// 비속어 사전 파일을 불러옵니다.
if (!fs.existsSync('./data/bad-words.json') ||
    !fs.existsSync('./data/normal-words.json') ||
    !fs.existsSync('./data/soft-search-words.json')) {

    Gentleman.defaultLoad();
    Gentleman.saveAllData(path.join(__dirname, './data/bad-words.json'),
        path.join(__dirname, './data/normal-words.json'),
        path.join(__dirname, './data/soft-search-words.json'));
} else {
    Gentleman.loadFile(path.join(__dirname, './data/bad-words.json'),
        path.join(__dirname, './data/normal-words.json'),
        path.join(__dirname, './data/soft-search-words.json'));
}

// 봇 인증에 필요한 개인정보를 불러옵니다.
if (fs.existsSync('./data/privates.json')) {
    privates = require('./data/privates.json');
    AKOBot.connect();
} else {
    AKOBot.info();
}

module.exports = AKOBot;
