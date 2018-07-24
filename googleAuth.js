const {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2
var cal = google.calendar('v3');


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
  'https://www.googleapis.com/auth/calendar'
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


function createReminder(tokens, title, dateTime) {
  oauth2Client.setCredentials(tokens);
  return new Promise(function(resolve, reject) {
    cal.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      resource: {
        summary: title,
        start: {dateTime: dateTime},
        end: {dateTime: dateTime}
      }
    }, function(calErr, calResp) {
      if(calErr) {reject(calErr); return}
      resolve(calResp);
    });
  });
}

function createMeeting(tokens, title, start, end, invitees) {
  oauth2Client.setCredentials(tokens);
  return new Promise(function(resolve, reject) {
    cal.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      resource: {
        summary: title,
        start: {dateTime: start},
        end: {dateTime: end}
      }
    }, function(calErr, calResp) {
      if(calErr) {reject(calErr); return}
      resolve(calResp);
    });
  });
}


module.exports=({
  generateAuthUrl,
  getToken,
  createReminder,
  createMeeting
})
