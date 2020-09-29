var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var reportSchema = new Schema(
  {
    latitude: Number,
    longitude: Number,
    rainfall_rate: Number,
    flood_depth: Number,
    user: [{ type: Schema.Types.ObjectId, ref: "user" }],
  },
  { timetamps: true }
);

// Export the model
module.exports = mongoose.model("Report", reportSchema);
