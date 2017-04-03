var events = require('./events.js');
var dispatcher = require('./dispatcher.js');
var logger = require('./logger.js');
var readline = require('readline');
var fs = require('fs');
var Discord = require('discord.js');

var hookedClient = null;

logger(`akobot 프로그램이 실행 되었습니다.`);
logger(`help 명령어로 사용가능한 명령어를 확인할 수 있습니다.\n`);

var line = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class AKOBot {
    static info() {
        logger('프로그램에 필요한 정보를 입력해주세요!\n');
        logger('domain <카페도메인> - cafe.naver.com/*.cafe');
        logger('id <웹훅ID> - 디스코드 채팅방의 웹훅ID를 넣어주세요.');
        logger('token <웹훅ID> - 디스코드 채팅방의 웹훅토큰을 넣어주세요.');
        logger('connect - 현재 입력한 정보로 연결을 시도합니다.\n');
    }

    static connect() {
        if (typeof(privates['cafeDomain']) === 'undefined' ||
            typeof(privates['webHookId']) === 'undefined' ||
            typeof(privates['webHookToken']) === 'undefined') {
            AKOBot.info();
            return;
        }

        var monitor = require('./monitor.js');
        var PlayIsletMonitor = new monitor(privates['cafeDomain']);

        hookedClient = new Discord.WebhookClient(privates['webHookId'], privates['webHookToken']);
    }

    static send(message){
        if(hookedClient !== null) hookedClient.sendMessage(message);
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
        case 'id':
            privates['webHookId'] = args[1];
            logger(`웹훅아이디 입력이 완료되었습니다.`);
            break;
        case 'token':
            privates['webHookToken'] = args[1];
            logger(`웹훅토큰 입력이 완료되었습니다.`);
            break;
        case 'connect':
            AKOBot.connect();
            fs.writeFile('./privates.json', JSON.stringify(privates, null, 4));
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
    let message = `[새 게시글] [${event.category}] '${lengthLimit(event.title, 15)}' ${event.prettyLink}`;
    logger(message);
    AKOBot.send(message);
}, dispatcher.LOW);

dispatcher.on(events.ArticleCommentChangedEvent, (event) => {
    if(event.oldCommentCount >= event.newCommentCount) return;
    let message = `[새 댓글] [${event.oldCommentCount}개->${event.newCommentCount}개] [${event.category}] '${lengthLimit(event.title, 15)}' ${event.prettyLink}`;
    logger(message);
    AKOBot.send(message);
}, dispatcher.LOW);

dispatcher.on(events.CafeMemberChangedEvent, (event) => {
    let message = `[새 회원] 회원수:${event.oldMemberCount}명->${event.newMemberCount}명, 승인대기수:${event.oldPreMemberCount}명->${event.newPreMemberCount}명`;
    logger(message);
    AKOBot.send(message);
}, dispatcher.LOW);



// 인증에 필요한 정보들이 여기 담깁니다.
var privates = {};

try {
    privates = require('./privates.json');
    AKOBot.connect();
} catch (error) {
logger(error);
    AKOBot.info();
}

module.exports = AKOBot;

/*
const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  if (message.content === 'ping') {
    message.reply('pong');
  }
});

client.login('');
*/


//const Discord = require('discord.js');
// create a new webhook
//const hook = new Discord.WebhookClient('', '');

// send a message using the webhook
//hook.sendMessage('webhook test!');
