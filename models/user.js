var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    // id: { type: Integer, index: { unique: true } },
    username: String,
    email: String,
    password: String,
    roleIntID: Number,
    tenantID: String,
    achievements: [{ type: Schema.Types.ObjectId, ref: "achievements" }],
  },
  { timetamps: true }
);

// Export the model
module.exports = mongoose.model("User", userSchema);
