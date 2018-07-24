var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Mixed = Schema.Types.Mixed

if(!process.env.MONGODB_URI){
  console.log('something happened lol check ur env.sh')
}

mongoose.connect(process.env.MONGODB_URI)
mongoose.Promise = global.Promise


/*googletokens
accessToken: String,
idToken: String,
refreshToken: String,
tokenType: String,
expiry_date: Date
*/

/*status
intent: String,
subject: String,
time: String,
date: Date
*/

var UserSchema = Schema({
  googleTokens:{
    type: Mixed,
  },
  defaultMeetingLength: {
    type: Number,
    default: 30,
  },
  slackId: String,
  slackUsername: String,
  slackEmail: String,
  slackDmIds: Array,
  status: {
    type: Mixed,
  },
  temp: {
    type: Mixed
  }
})

var ReminderSchema = Schema({
  subject: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  eventId: String,
  slackId: String,
})

var MeetingSchema = Schema({
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  invitees: {
    type: Array,
    required: true,
  },
  subject: String,
  location: String,
  calFields: Object,
  status: String,
  createdAt: Date,
  requesterId: String
})

var InviteSchema = Schema({
  eventId: String,
  inviteeId: {
    type: ObjectId,
    ref: 'User',
  },
  requesterId: {
    type: ObjectId,
    ref: 'User',
  },
  status: String
})

var Reminder = mongoose.model('Reminder', ReminderSchema)
var User = mongoose.model('User', UserSchema)
var Meeting = mongoose.model('Meeting', MeetingSchema)
var Invite = mongoose.model('Invite', InviteSchema)

module.exports = {
  Reminder: Reminder,
  User: User,
  Meeting: Meeting,
  Invite: Invite
}
