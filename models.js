var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Mixed = Schema.Types.Mixed

if(!process.env.MONGODB_URI){
  console.log('something happened lol check ur env.sh')
}

mongoose.connect(process.env.MONGODB_URI)
mongoose.Promise = global.Promise


/**googletokens
accessToken: String,
idToken: String,
refreshToken: String,
tokenType: String,
expiration: Date
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
 slackDmIds: Array
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

var Reminder = mongoose.model('Reminder', ReminderSchema)
var User = mongoose.model('User', UserSchema)

module.exports = {
  Reminder: Reminder,
  User: User
}
