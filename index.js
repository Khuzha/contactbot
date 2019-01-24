const config = require('./config')
const token = require('./token.js')
const mongo = require('mongodb')
const Telegraf = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const { leave } = Stage
const bot = new Telegraf(token.tok)

const mainScene = new Scene('mainScene')
const stage = new Stage()
// stage.command('cancel', leave())
stage.register(mainScene)

mongo.connect('mongodb://localhost:27017', {useNewUrlParser: true}, (err, client) => {
  if(err) console.log(err)
  db = client.db('users')

  bot.use(session())
  bot.use(stage.middleware())
  bot.startPolling()
})



bot.start(ctx => {
  (async () => {
    const user = await db.collection('users').find({userId: ctx.from.id}).toArray()
    if (user.length !== 0) {
      ctx.reply(langer('firstHelloDef', user[0].lang, {name: user[0].name}))
    } else {
      langer('firstHelloUndef', ctx.from.language_code, {ctx: ctx})
    }
  })()
})

mainScene.action(/lang_*/, ctx => {
  langer('askName', ctx.update.callback_query.data.substr(5), {ctx: ctx})
})

bot.on('text', ctx => {

})

function langer(name, lang, object) {
  lang = lang.toLowerCase()
  if(lang.includes('-'))
    lang = lang.substr(0, 2)

  if(lang == 'en') {

    switch(name) {
      case 'firstHelloDef': 
        ctx.scene.enter('mainScene')
        return 'Welcome ' + object.name + '! Type your message.'
      case 'firstHelloUndef':
        return object.ctx.reply('Hello! Is your language 🇬🇧 English? Confirm that or select another, please:', {reply_markup: {inline_keyboard: [[{text: '🇷🇺 Русский', callback_data: 'lang_ru'}, {text: '🇩🇪 Deutsch', callback_data: 'lang_de'}], [{text: '✅ Right. English', callback_data: 'lang_en'}]]}})
      case 'askName':
        return object.ctx.reply('Thanks! Now type your name:')
      }

  }
}

bot.startPolling()