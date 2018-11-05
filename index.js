const telegraf = require('telegraf')
const config = require('./config')
const token = require('./token')
const bot = new telegraf(token.tok)
let lastId

bot.start((ctx) => {
  if (ctx.chat.id == config.myid){
    ctx.reply(config.startMessageToMe)
  } else {
  ctx.reply(config.hello/*, {reply_markup: {inline_keyboard: [[{text: '🇬🇧 Change lang', callback_config: 'en'}]]}}*/)
  }
})

bot.on('text', (ctx) => {
  if (config.myid == ctx.chat.id) {
    if ('reply_to_message' in ctx.message) {
      bot.telegram.sendMessage(ctx.message.reply_to_message.forward_from.id, ctx.message.text)
        .catch((err) => sendError(err, ctx))
      lastId = ctx.message.reply_to_message.forward_from.id
    } else {
      console.log(lastId)
      if (lastId != undefined) {
        bot.telegram.sendMessage(lastId, ctx.message.text)
          .catch((err) => sendError(err, ctx))
      } else {
        ctx.reply('Выбери, кому отвечать.')
      }
    }
  } else {
    ctx.forwardMessage(config.myid, ctx.from.id, ctx.message.id)
  }
})

bot.on('sticker', (ctx) => {
  if (config.myid == ctx.chat.id) {
    if ('reply_to_message' in ctx.message) {
      bot.telegram.sendSticker(ctx.message.reply_to_message.forward_from.id, ctx.message.sticker.file_id)
        .catch((err) => sendError(err, ctx))
      lastId = ctx.message.reply_to_message.forward_from.id
    } else {
      if (lastId != undefined) {
        bot.telegram.sendSticker(lastId, ctx.message.sticker.file_id)
          .catch((err) => sendError(err, ctx))
      } else {
        ctx.reply('Выбери, кому отвечать.')
      }
    }
  } else {
    ctx.forwardMessage(config.myid, ctx.from.id, ctx.message.id)
  }
})

bot.on('photo', (ctx) => {
  if (config.myid == ctx.chat.id) {
    if ('reply_to_message' in ctx.message) {
      bot.telegram.sendPhoto(ctx.message.reply_to_message.forward_from.id, ctx.message.photo[3].file_id)
        .catch((err) => sendError(err, ctx))
      lastId = ctx.message.reply_to_message.forward_from.id
    } else {
      if (lastId != undefined) {
        bot.telegram.sendPhoto()(lastId, ctx.message.photo[3].file_id)
          .catch((err) => sendError(err, ctx))
      } else {
        ctx.reply('Выбери, кому отвечать.')
      }
    }
  } else {
    ctx.forwardMessage(config.myid, ctx.from.id, ctx.message.id)
  }
})

bot.on('voice', (ctx) => {
  if (config.myid == ctx.chat.id) {
    if ('reply_to_message' in ctx.message) {
      bot.telegram.sendVoice(ctx.message.reply_to_message.forward_from.id, ctx.message.voice.file_id)
        .catch((err) => sendError(err, ctx))
      lastId = ctx.message.reply_to_message.forward_from.id
    } else {
      if (lastId != undefined) {
        bot.telegram.sendVoice(lastId, ctx.message.voice.file_id)
          .catch((err) => sendError(err, ctx))
      } else {
        ctx.reply('Выбери, кому отвечать.')
      }
    }
  } else {
    ctx.forwardMessage(config.myid, ctx.from.id, ctx.message.id)
  }
})

bot.on('video', (ctx) => {
  if (config.myid == ctx.chat.id) {
    if ('reply_to_message' in ctx.message) {
      bot.telegram.sendVideo(ctx.message.reply_to_message.forward_from.id, ctx.message.video.file_id)
        .catch((err) => sendError(err, ctx))
      lastId = ctx.message.reply_to_message.forward_from.id
    } else {
      if (lastId != undefined) {
        bot.telegram.sendVideo(lastId, ctx.message.video.file_id)
          .catch((err) => sendError(err, ctx))
      } else {
        ctx.reply('Выбери, кому отвечать.')
      }
    }
  } else {
    ctx.forwardMessage(config.myid, ctx.from.id, ctx.message.id)
  }
})

bot.on('contact', (ctx) => {
  if (config.myid == ctx.chat.id) {
    if ('reply_to_message' in ctx.message) {
      bot.telegram.sendContact(ctx.message.reply_to_message.forward_from.id, ctx.message.contact.phone_number, ctx.message.contact.first_name)
        .catch((err) => sendError(err, ctx))
      lastId = ctx.message.reply_to_message.forward_from.id
    } else {
      if (lastId != undefined) {
        bot.telegram.sendContact(lastId, ctx.message.contact.phone_number, ctx.message.contact.first_name)
          .catch((err) => sendError(err, ctx))
      } else {
        ctx.reply('Выбери, кому отвечать.')
      }
    }
  } else {
    ctx.forwardMessage(config.myid, ctx.from.id, ctx.message.id)
  }
})

function sendError (err, ctx) {
  console.log(err)
  if (err.response.description != 'Forbidden: bot was blocked by the user') {
    if (err != undefined && err != null)
      if (ctx != undefined) {
        bot.telegram.sendMessage(62253745, 'Ошибка у [' + ctx.chat.first_name + '](tg://user?id=' + ctx.chat.id + ')\nТекст ошибки:\n ' + err.toString(), {parse_mode: 'markdown'})
          .catch((err) => console.log(err))
      } else {
        bot.telegram.sendMessage(62253745, 'Ошибка!\nТекст ошибки:\n ' + JSON.stringify(err), {parse_mode: 'markdown'})
          .catch((err) => console.log(err))
      }
  } else {
    bot.telegram.sendMessage(config.myid, 'Пользователь заблокировал бота.')
  }

}

bot.catch((err) => {
  console.log(err)
})


bot.startPolling()
