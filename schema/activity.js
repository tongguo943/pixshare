
const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for an activity.
 */
const activitySchema = new mongoose.Schema({
  // The date and time when the activity was created.
  date_time: { type: Date, default: Date.now },
  user_id: mongoose.Schema.Types.ObjectId,
  author_id: mongoose.Schema.Types.ObjectId,
  user_name: String,
  activity_type: String,
  photo_id: mongoose.Schema.Types.ObjectId,
  comment_id: mongoose.Schema.Types.ObjectId,
  file_name: String,


//   // The ID of the user who created the activity.
//   user_id: mongoose.Schema.Types.ObjectId,
//    // The ID of the user who posted the photo.
//   author_id: mongoose.Schema.Types.ObjectId,
//   // The date and time when the activity was created.
//   date_time: { type: Date, default: Date.now },
//   activity_type: String,
//   photo_id: mongoose.Schema.Types.ObjectId,
//   comment_id: mongoose.Schema.Types.ObjectId,


});

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
const Activity = mongoose.model("Activity", activitySchema);

/**
 * Make this available to our application.
 */
module.exports = Activity;