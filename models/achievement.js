var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var achievementSchema = new Schema(
  {
    title: String,
    description: String,
    criteria: String,
    points: Number,
    badge: { data: Buffer, contentType: String },
  },
  { timetamps: true }
);

// Export the model
module.exports = mongoose.model("Achievement", achievementSchema);
