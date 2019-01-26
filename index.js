const config = require('./config')
const buttons = require('./buttons')
const token = require('./token.js')
const mongo = require('mongodb')
const Telegraf = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const bot = new Telegraf(token.tok)
const { leave } = Stage
let db


const stage = new Stage()

const getInfo = new Scene('getInfo')
stage.register(getInfo)

const chatting = new Scene('chatting')
stage.register(chatting)

const donate = new Scene('donate')
stage.register(donate)

bot.use(session())
bot.use(stage.middleware())

mongo.connect('mongodb://localhost:27017', {useNewUrlParser: true}, (err, client) => {
  if(err) console.log(err)
  db = client.db('users')

  bot.startPolling()
})


bot.start(async ctx => {
  const user = await db.collection('users').find({userId: ctx.from.id}).toArray()
  if (user.length !== 0 && user[0].name != undefined) {
    langer('firstHelloDef', user[0].lang, {name: user[0].name, ctx: ctx})
  } else {
    ctx.scene.enter('getInfo')
    langer('firstHelloUndef', ctx.from.language_code, {ctx: ctx})
  }
})

getInfo.start(ctx => {
  langer('unexpected start')
})

getInfo.on('text', ctx => {
  langer('coolName', undefined, {ctx: ctx})
  ctx.scene.leave('getInfo')
  db.collection('users').updateOne({userId: ctx.from.id}, {$set: {name: ctx.message.text}}, {upsert: true, new: true})
    .catch(err => sendError(err, ctx))
})

getInfo.action(/lang_*/, async ctx => {
  let lang = ctx.update.callback_query.data.substr(5) 
  langer('askName', lang, {ctx: ctx})
  db.collection('users').updateOne({userId: ctx.from.id}, {$set: {lang: await langFormater(lang)}}, {upsert: true, new: true})
    .catch(err => sendError(err, ctx))
})


bot.hears('📱 Chat', async ctx => {
  langer('begin chat', undefined, {ctx: ctx})
  ctx.scene.enter('chatting')
})

chatting.start(ctx => {
  langer('back to mm', undefined, {ctx: ctx})
  ctx.scene.leave('chatting')
})

chatting.hears('↩️ Main menu', ctx => {
  langer('back to mm', undefined, {ctx: ctx})
  ctx.scene.leave('chatting')
})

chatting.on('text', ctx => {
  bot.telegram.sendMessage(config.myId, '[' + ctx.from.first_name + '](tg://user?id=' + ctx.from.id + '):\n`' + ctx.message.text + '`', {parse_mode: 'markdown', reply_markup: {inline_keyboard: [[{text: '↩️ Reply', callback_data: 'reply_' + ctx.from.id}]]}})
})


bot.hears('💰 Donate', ctx => {
  langer('donate sum', undefined, {ctx: ctx})
  ctx.scene.enter('donate')
})

donate.on('text', ctx => {
  if (!isNaN(+ctx.message.text)) {
    langer('donate link', undefined, {ctx: ctx})
    ctx.scene.leave('donate')
  } else {
    langer('not correct sum', undefined, {ctx: ctx})
  }
})

let langFormater = async (lang, ctx) => {
  if(lang != undefined) {
    lang = lang.toLowerCase()
    if(lang.includes('-'))
      lang = lang.substr(0, 2)
  } else if(ctx != undefined) {
    try {
      temp = await db.collection('users').find({userId: ctx.from.id}).toArray()
      lang = temp[0].lang
    } catch (err) {
      sendError(err, ctx)
    }
  } 
  return lang
}

let langer = async (name, lang, object = {}) => {
  lang = await langFormater(lang, object.ctx)
  if(lang == 'en') {

    switch(name) {
      case 'firstHelloDef': 
        return object.ctx.reply('Welcome ' + object.name + '! Type your message.', {reply_markup: {keyboard: buttons.mainMenu.en, resize_keyboard: true, one_time_keyboard: true}})
      case 'firstHelloUndef':
        return object.ctx.reply('Hello! Is your language 🇬🇧 English? Confirm that or select another, please:', {reply_markup: {inline_keyboard: [[{text: '🇷🇺 Русский', callback_data: 'lang_ru'}, {text: '🇩🇪 Deutsch', callback_data: 'lang_de'}], [{text: '✅ Right. English', callback_data: 'lang_en'}]]}})
      case 'askName':
        return object.ctx.reply('Thanks! Now type your name:')
      case 'unexpected start':
        return object.ctx.reply('First end the signing up please.')
      case 'coolName':
        return object.ctx.reply('Cool name! Nice to meet, I`m Sardor`s assistant. Now you can choose what you wanna do here.', {reply_markup: {keyboard: buttons.mainMenu.en, resize_keyboard: true, one_time_keyboard: true}})
      case 'begin chat':
        return object.ctx.reply('Type your message:', {reply_markup: {keyboard: [['↩️ Main menu']], resize_keyboard: true}})
      case 'back to mm': 
        return object.ctx.reply('Where will go?', {reply_markup: {keyboard: buttons.mainMenu.en, resize_keyboard: true, one_time_keyboard: true}})
      case 'donate sum':
        return object.ctx.reply('How much are you ready to donate? Please input an integer number in russian rubles ($1 ~ 70 rubles).')  
      case 'donate link':
        return object.ctx.reply('Link to pay is below. Thanks!', {reply_markup: {inline_keyboard: [[{text: '➡️ Оплатить', url: 'https://money.yandex.ru/transfer?receiver=410012149459598&sum=' + object.ctx.message.text + '&successURL=&quickpay-back-url=&shop-host=&label=from_' + object.ctx.from.id + '&targets=Donate&comment=&origin=form&selectedPaymentType=pc&destination=Donate&form-comment=Donate&short-dest=&quickpay-form=shop'}]]}})
      case 'not correct sum':
        return object.ctx.reply('It doesn`t look like an integer number. Please, enter a correct value.')
      }

  } else if (lang == 'ru') {

    switch(name) {
      case 'firstHelloDef': 
        return 'Доброго времени суток, ' + object.name + '! Пишите Ваше сообщение.'
      case 'firstHelloUndef':
        return object.ctx.reply('Здравствуйте! Я думаю, Вам будет удобно говорить на  🇷🇺 русском. Подтвердите это или выберите другой язык:', {reply_markup: {inline_keyboard: [[{text: '🇷🇺 Русский', callback_data: 'lang_ru'}, {text: '🇩🇪 Deutsch', callback_data: 'lang_de'}], [{text: '✅ Right. English', callback_data: 'lang_en'}]]}})
      case 'askName':
        return object.ctx.reply('Спасибо! А теперь введите Ваше имя:')
      }

  }
}

function sendError(err, ctx) {
  console.log(err)
  if (ctx != undefined) 
    bot.telegram.sendMessage(config.myId, 'Ошибка у [' + ctx.from.first_name + '](tg://user?id=' + ctx.from.id + ')\nТекст ошибки: ' + err.toString(), {parse_mode: 'markdown'})
    else 
    bot.telegram.sendMessage(config.myId, 'Ошибка:' + err.toString())
}

bot.startPolling()