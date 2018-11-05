const telegraf = require('telegraf')
const config = require('./config')
const bot = new telegraf(config.token)

bot.start((ctx) => {
  if (ctx.chat.id == config.myid){t
    ctx.reply(config.startMessageToMe)
  } else {
  ctx.reply(config.hello/*, {reply_markup: {inline_keyboard: [[{text: '🇬🇧 Change lang', callback_config: 'en'}]]}}*/)
  }
})

bot.on('text', (ctx) => {
  if (ctx.chat.id == config.myid){
    if(ctx.message) {
    if (ctx.message.reply_to_message && ctx.message.reply_to_message.forward_from) {
        if(!ctx.message.reply_to_message.forward_from.is_bot){
            config.lastID = ctx.message.reply_to_message.forward_from.id;
            ctx.telegram.sendMessage(config.lastID, ctx.message.text);
        }
    } else {
        if (config.lastID) ctx.telegram.sendMessage(config.lastID, ctx.message.text);
    }
} else {
  ctx.reply(config.emptyReciever)
}
} else {
    ctx.forwardMessage(config.myid, ctx.from.id, ctx.message.id)
  }
})

bot.startPolling()
