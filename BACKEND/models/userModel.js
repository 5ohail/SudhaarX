import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['user', 'admin','superAdmin'], default: 'user' },
  phone: { type: String, minlength: 10, required: true },
  isBanned: { type: Boolean, default: false },
  otp: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  createdOn: { type: Date, default: Date.now },

});

const User = mongoose.model("User", userSchema);

export default User;
