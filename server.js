const { RTMClient, WebClient } = require('@slack/client');
const { createMessageAdapter } = require('@slack/interactive-messages');
const slackInteractions = createMessageAdapter(process.env.SLACKBOT_USER_TOKEN)
const express = require('express');

const app = express();
app.use('/actions', slackInteractions.expressMiddleware());
// Get an API token by creating an app at <https://api.slack.com/apps?new_app=1>
// It's always a good idea to keep sensitive data like the token outside your source code. Prefer environment variables.
const token = process.env.SLACKBOT_USER_TOKEN || '';
if (!token) { console.log('You must specify a token to use this example'); process.exitCode = 1; throw 1; }

// Initialize an RTM API client
const rtm = new RTMClient(token);
const web = new WebClient(token);
// Start the connection to the platform
rtm.start();

// You can find your project ID in your Dialogflow agent settings
const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const sessionId = 'quickstart-session-id';
const languageCode = 'en-US';

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

// Define session path
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

// The text query request.

// button actions route
app.post('/actions', (req, res) => {
  console.log(req);
  res.send('ahhh');
})

// Log all incoming messages
rtm.on('message', (event) => {

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: event.text,
        languageCode: languageCode,
      },
    },
  };

  // Send request and log result
  sessionClient
  .detectIntent(request)
  .then(responses => {
    if(event.user !== "UBWEG21RD"){
      //rtm.sendMessage('Detected intent', event.channel);
      const result = responses[0].queryResult;
      console.log(responses)
      //rtm.sendMessage(`  Query: ${result.queryText}`, event.channel);
      rtm.sendMessage(`${result.fulfillmentText}`, event.channel);
      if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
        web.chat.postMessage({
          channel: event.channel,
          "text": "Please confirm.",
          "attachments": [
            {
              "text": "Remind you $subject on $day",
              "fallback": "I didn't get your reminder request. Try again.",
              "color": "#3AA3E3",
              "attachment_type": "default",
              "actions": [
                {
                  "name": "userConfirmation",
                  "text": "Confirm",
                  "type": "button",
                  "value": "confirm",
                  "style": "primary"
                },
                {
                  "name": "userConfirmation",
                  "text": "Cancel",
                  "style": "danger",
                  "type": "button",
                  "value": "cancel",
                  "confirm": {
                    "title": "Are you sure?",
                    "ok_text": "Yes",
                    "dismiss_text": "No"
                  }
                }
              ]
            }
          ]
        })
      } else {
        console.log(`  No intent matched.`);
      }
    }})
    .catch(err => {
      console.error('ERROR:', err);
    });
  })

  // Structure of `event`: <https://api.slack.com/events/message>
  // console.log(`Message from ${event.user}: ${event.text}`);
  // if(event.user !== "UBWEG21RD"){
  //     .then((res) => {
  //       // `res` contains information about the posted message
  //       console.log('Message sent: ', res.ts);
  //     })
  //     .catch(console.error);
  // }

  // Log all reactions
  rtm.on('reaction_added', (event) => {
    // Structure of `event`: <https://api.slack.com/events/reaction_added>
    console.log(`Reaction from ${event.user}: ${event.reaction}`);
  });
  rtm.on('reaction_removed', (event) => {
    // Structure of `event`: <https://api.slack.com/events/reaction_removed>
    console.log(`Reaction removed by ${event.user}: ${event.reaction}`);
  });

  // Send a message once the connection is ready
  rtm.on('ready', (event) => {

    // Getting a conversation ID is left as an exercise for the reader. It's usually available as the `channel` property
    // on incoming messages, or in responses to Web API requests.

    // const conversationId = '';
    // rtm.sendMessage('Hello, world!', conversationId);
  });





  //Google stuff
  app.post('/', (req, res) => {
    res.send('You are connected to Sassy Slacky!')
  })

  //gives permission to access Google Calendar
  app.get('/auth', (req, res) => {
    if(!req.query.auth_id) {return res.send('no id found!')}
    var auth = googleAuth.generateAuthUrl(req.query.auth_id)
    res.redirect(auth)
  })

  //if user is logged in with Google...
  app.get('/google/callback', (req, res) => {
    if(!req.query.code) {return res.send('no token found!')}
    googleAuth.getToken(req.query.code)
    .catch(err => console.log("error", error))
    .then(tokens => {
      var temp = JSON.parse(decodeURIComponent(req.query.state))
      var userId = temp.auth_id
      return User.findByIdAndUpdate(userId, {googleTokens: tokens}).exec()
    })
    .catch(err => {console.log("user update error", err)})
    .then(updated => {
      if(!updated) {return res.send('issue with finding user i think')}
      res.send('you are all set with Google!!!')
    })
  })
