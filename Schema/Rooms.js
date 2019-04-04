const mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

var RoomSchema = new Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    capacity: {
        type: Number,
    },
    equipment: {
        type: [String],
    },
    updatedAt: {
        type: { type: Date, default: Date.now },
    },
    reservedFor: {
      type: Date,
    },
    reserved: {
        type: Boolean,
    },
    versionKey: false,
});
RoomSchema.plugin(timestamps);
module.exports = mongoose.model('room', RoomSchema);




