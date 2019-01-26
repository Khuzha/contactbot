const Telegraf = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const { leave } = Stage
const bot = new Telegraf('667423748:AAGLK0Wi-oRZy4wytQmfykgK701u-h7xFd8')

// Greeter scene
const greeter = new Scene('greeter')
greeter.enter((ctx) => ctx.reply('Hi'))
greeter.leave((ctx) => ctx.reply('Bye'))
greeter.hears(/hi/gi, leave())
greeter.on('message', (ctx) => ctx.reply('Send `hi`'))

// Create scene manager
const stage = new Stage()
stage.command('cancel', leave())

// Scene registration
stage.register(greeter)

bot.start(ctx => {
    ctx.reply('hey')
    ctx.scene.enter('greeter')
})

bot.use(session())
bot.use(stage.middleware())
bot.command('greeter', (ctx) => console.log(ctx.scene))
bot.startPolling()