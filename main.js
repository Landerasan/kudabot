const TelegramBot = require('node-telegram-bot-api')
const DbModelMysql = require('./app/models/dbModelMysql.js');
const token = '1864611758:AAGEID-3b04HO96jsr0YdpC5KcSHjbUtIqg'

const bot = new TelegramBot(token, {polling: true})

let db = new DbModelMysql('localhost', 'main_user', 'root', 'telebot_kudago').getConnection();

bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id
    // Create user
    db.query(`SELECT chat_id FROM users where chat_id = ${chatId}`, function (err, rows, fields) {
        if (rows.length === 0) {
            db.query(`INSERT INTO users (chat_id) values (${chatId})`,function (err, rows, fields) {
                if (err){
                    console.log(`Error : ${err.message}`)
                }
            })
        }
    })
    bot.sendMessage(chatId, "Starting....", {
        "reply_markup": {
            "keyboard": [["Throw path"], ["visited"]]
        }
    });
})

//ЕБУЧИЙ КОСТЫЛЬ
/*
В целом то как тут сделано - сделано неверно, нужно написать /visited и посмотреть последний маршрут который человек спрашивал,
Переспросить "его ли посетил", получить ответ да/нет, если да, то самому узнать последний, если нет, то просто спросить номер
Как это сделать адекватно - хз, но именно для таких вещей я и хочу монГОД использовать
*/
bot.onText(/visited.{0,5}/, (msg, match) => {
    const chatId = msg.chat.id
    let clear = msg.text.replace(/[visited]/g,"").replace(/[ ]/g, "")
    if(clear == ""){
        db.query(`SELECT * FROM tram_list tl where id in (SELECT tram_id FROM visited_trams vt where user_id = (SELECT user_id FROM users where chat_id = ${chatId}))`,function (err, rows) {
            bot.sendMessage(chatId,`Вы посетили:`)
            for(let i = 0; i < rows.length; i++){
                bot.sendMessage(chatId,`Маршрут ${rows[i].name} ${rows[i].path}`)
            }
        })
    }
    //Тут еще можно вставить 2 одинаковых маршрута, нет проверки на одинаковость, лохпидрнетдрузей
    else{
        db.query(`SELECT id from tram_list tl WHERE name = "${clear}";`, function (err, rows) {
            let tramId = rows[0].id
            db.query(`SELECT id from users WHERE chat_id = "${chatId}";`, function (err, rows) {
                let userId = rows[0].id
                db.query(`INSERT into visited_trams(user_id, tram_id) values (${userId}, ${tramId});`, function (err, rows) {
                    bot.sendMessage(chatId, `Маршрут: ${clear} добавлен в список посещенных`)
                })
            })
        })
    }
})
//КОНЕЦ ЕБУЧЕГО КОСТЫЛЯ

bot.onText(/Throw path/, (msg, match) => {
    console.log(msg.chat.id)
    const chatId = msg.chat.id
    db.query(`SELECT * FROM tram_list tl where id not in (SELECT tram_id FROM visited_trams vt where user_id = (SELECT user_id FROM users where chat_id = ${chatId}))`,function(err,rows){
        rand = getRandomInt(0,rows.length - 1)
        console.log(rows[rand])
        if (getRandomInt(0, 1) == 0) {
            bot.sendMessage(chatId, `Маршрут: ${rows[rand].name} Начало маршрута: ${rows[rand].finish}`);
        } else {
            bot.sendMessage(chatId, `Маршрут: ${rows[rand].name} Начало маршрута: ${rows[rand].start}`);
        }
    })
})

bot.on("location", (msg) => {
    console.log(msg);
    bot.sendMessage(msg.chat.id, msg.chat.id);
})

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
