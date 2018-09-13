const telegraf = require('telegraf')
const data = require('./data')
const bot = new telegraf(data.token)

bot.start((ctx) => {
  if (ctx.chat.id == data.myid){
    ctx.reply(data.startMessageToMe)
  } else {
  ctx.reply(data.hello/*, {reply_markup: {inline_keyboard: [[{text: '🇬🇧 Change lang', callback_data: 'en'}]]}}*/)
  }
})

bot.on('text', (ctx) => {
  if (ctx.chat.id == data.myid){
    if(ctx.message) {
    if (ctx.message.reply_to_message && ctx.message.reply_to_message.forward_from) {
        if(!ctx.message.reply_to_message.forward_from.is_bot){
            data.lastID = ctx.message.reply_to_message.forward_from.id;
            ctx.telegram.sendMessage(data.lastID, ctx.message.text);
        }
    } else {
        if (data.lastID) ctx.telegram.sendMessage(data.lastID, ctx.message.text);
    }
} else {
  ctx.reply(data.emptyReciever)
}
} else {
    ctx.forwardMessage(data.myid, ctx.from.id, ctx.message.id)
  }
})

bot.startPolling()
