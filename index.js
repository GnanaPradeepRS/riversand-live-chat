const path = require('path');
const bodyParser = require('body-parser')
const express = require('express');
const { BotFrameworkAdapter, MessageFactory } = require('botbuilder');
const { RSNotification } = require('./resource/rsNotification');
const { Database } = require('./resource/database.js');

// Read botFilePath and botFileSecret from .env file.
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

// Create adapter.
const adapter = new BotFrameworkAdapter({
  appId: process.env.BotId,
  appPassword: process.env.BotPassword
});

adapter.onTurnError = async (context, error) => {
  console.error(`\n [onTurnError] unhandled error: ${error}`);
  await context.sendTraceActivity(
    'OnTurnError Trace',
    `${error}`,
    'https://www.botframework.com/schemas/error',
    'TurnError'
  );
  // Send a message to the user
  await context.sendActivity('The bot encountered an error or bug.');
  await context.sendActivity('To continue using the bot, send a message mentioning bot, if problem still persists contact admin.');
};

// Create bot handlers
const rsNotification = new RSNotification();

// Create HTTP server.
const server = express();
server.use(bodyParser.json())
const port = process.env.port || process.env.PORT || 3978;
server.listen(port, () =>
  console.log(`\Bot/ME service listening at http://localhost:${port}`)
);

// Listen for incoming requests.
// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    await rsNotification.run(context)
  });
});

// Listen for incoming notifications and send proactive messages to users.
server.post('/api/sendnotification', async (req, res) => {
  let users = req.body.users;
  let url = req.body.url;
  let displayText = req.body.message;
  let linkText = req.body.linkText;
  users = users.toLocaleLowerCase();
  users = users.split('||');

  res.setHeader('Content-Type', 'text/html');
  res.writeHead(200);
  res.write(`request recieved successfully validating your request for users ${req.body.users}, notification will be sent to all teams where user is added and bot is configured`);
  res.end();

  let userList = [];
  let query = {email : { $in : userList }};
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    userList.push(user.trim());    
  }
  console.log(query);
  let dbConnection = await new Database().connection();

  dbConnection.find(query).toArray((err , res) => {
    for (let i = 0; i < res.length; i++) {
      const element = res[i];
      SendNotification(element.convoRef , element.user , url , displayText , linkText);
    }
  })
});

const SendNotification = (ref , user , url , displayText , linkText) => {
  adapter.continueConversation(ref , context => {
    const mention = {
      mentioned : {
        id : user.id,
        name : user.name,
        aadObjectId : user.aadObjectId
      },
      text : `<at>${new TextEncoder().encode(user.name)}</at>`,
      type : 'mention'
    }

    const replyActivity = MessageFactory.text(`${mention.text} ${displayText} <a href="${url}">${linkText}</a>`);
    replyActivity.entities = [mention];
    context.sendActivity(replyActivity);
  })
}

// ngrok http 3978 --host-header=localhost:3978
