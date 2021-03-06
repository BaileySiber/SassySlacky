const {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2
var cal = google.calendar('v3');
var axios = require('axios');


const clientId = process.env.GOOGLE_CLIENT_ID || '';
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
const redirect = process.env.REDIRECT_URL || '';

if (!clientId) { console.log('You must specify a client ID to use this example'); process.exitCode = 1; throw 1; }
if (!clientSecret) { console.log('You must specify a client secret to use this example'); process.exitCode = 1; throw 1; }
if (!redirect) { throw new Error( 'redirect domain not found' ); process.exit(1); throw 1; }

const oauth2Client = new OAuth2(
  clientId, clientSecret, redirect
)

const scopes = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.readonly'
];



function generateAuthUrl(auth_id) {
  var authObj = {
    access_type: 'offline',
    scope: scopes
  }
  if(auth_id) {
    authObj.state = encodeURIComponent(JSON.stringify({auth_id: auth_id}))
  }
  return oauth2Client.generateAuthUrl(authObj)
}


function getToken(code) {
  return new Promise(function(resolve, reject) {
    oauth2Client.getToken(code, function(error, tokens) {
      if(error) {reject(error); return; }
      resolve(tokens);
    });
  });
}


function createReminder(tokens, title, date) {
  oauth2Client.setCredentials(tokens);
  return new Promise(function(resolve, reject) {
    cal.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      resource: {
        summary: title,
        start: {date: date},
        end: {date: date}
      }
    }, function(calErr, calResp) {
      if(calErr) {reject(calErr); return}
      resolve(calResp);
    });
  });
}

function createMeeting(tokens, startDateTime) {
  oauth2Client.setCredentials(tokens);
  return new Promise(function(resolve, reject) {
    cal.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      resource: {
        summary: 'meeting',
        start: {dateTime: startDateTime},
        end: {dateTime: startDateTime}
      }
    }, function(calErr, calResp) {
      if(calErr) {reject(calErr); return}
      resolve(calResp);
    });
  });
}


function checkConflict(tokens, slackId, startDateTime, endDateTime) {
  console.log("getting the freebusy status! slackId is -------------" + slackId)
  console.log("time min is ---------------------------------" + startDateTime)
  console.log("time max is ---------------------------------" + endDateTime)
  oauth2Client.setCredentials(tokens);
  return new Promise(function(resolve, reject){
    cal.freebusy.query({
      auth: oauth2Client,
      resource: {
        items: [{id: "primary"}],
        timeMax: endDateTime,
        timeMin: startDateTime,
      }}, function(calErr, calResp) {
        if(calErr) {reject(calErr); return}
        resolve(calResp)
      })
    })

  }
  //     return axios("https://www.googleapis.com/calendar/v3/freeBusy", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": tokens.token_type + " " + tokens.access_token
  //       },
  //       body:{
  //               "timeMin": startDateTime,
  //               "timeMax": endDateTime,
  //               "items": [{"id": "primary"}]
  //           }
  //     })
  //     // .then((jsonFreeBusyResp) => {return jsonFreeBusyResp})
  //     // .catch((err) => console.log('Error getting freeBusy response from google', err.data))
  // }

  module.exports=({
    checkConflict,
    generateAuthUrl,
    getToken,
    createReminder,
    createMeeting
  })
