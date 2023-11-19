const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const manufacturerSchema = new mongoose.Schema({
  organizationName: {
      type: String,
      trim: true,
      required: [true, 'Please enter your organization name'],
      maxlength: [255, "Please enter a valid organization name"],
      minlength: [2, "Please enter a valid organization name"],
  },
  businessAddress: {

    streetNo: {
      type: String,
      trim: true,
      required: [true, 'Please enter your organization\'s street number'],
      maxlength: [255, "Please enter a valid street number"],
      minlength: [2, "Please enter a valid street number"]
    },
    state: {
      type: String,
      trim: true,
      required: [true, 'Please enter your organization\'s state'],
      maxlength: [255, "Please enter a valid state name"],
      minlength: [2, "Please enter a valid state name"]
    },
    city: {
      type: String,
      trim: true,
      required: [true, 'Please enter your organization\'s city'],
      maxlength: [255, "Please enter a valid city name"],
      minlength: [2, "Please enter a valid city name"],
    },
    pincode: {
      type: Number,
      min: 100000,
      max: 999999,
      required: [true, 'Please enter your pincode'],
    }
  },
  phone: {
      type: Number,
      required: [true, "Please enter your phone number"],
      min: [1000000000, "Please enter a valid number"],
      max: [9999999999, "Please enter a valid number"]
  },
  businessRegisterationNo: {
    type: String,
    trim: true,
    required: [true, "Please enter your business registeration number"],
    minlength: [21,"Please enter a valid business registeration number"],
    maxlength: [21,"Please enter a valid business registeration number"]
  },
  gstin: {
    type: String,
    trim: true,
    required: [true, "Please enter your gst no"],
    minlength: [15,"Please enter a valid gst no"],
    maxlength: [15,"Please enter a valid gst no"]
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: [true, 'This email is already registered'],
    lowercase: true,
    trim: true,
    validate: [isEmail, 'Please enter a valid email']
  },
  password: {
      type: String,
      trim: true,
      required: [true, 'Please enter a password'],
      minlength: [6, 'Minimum password length is 6 characters'],
      maxlength: [255, 'maximum password length is 255 characters'],
  },
  role: {
    type: String,
    trim: true,
    enum: ['manufacturer'],
    default: 'manufacturer'
  },
  profileStatus: {
      type: String,
      trim: true,
      enum: {
          values: ['inactive', 'active', 'deleted'],
          message: 'invalid status'
      },
      default: 'inactive'
  }

},{ timestamps: true });

// fire a function before doc saved to db
manufacturerSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  console.log(this);
  next();
});

const Manufacturer = mongoose.model('manufacturer', manufacturerSchema);

module.exports = Manufacturer;