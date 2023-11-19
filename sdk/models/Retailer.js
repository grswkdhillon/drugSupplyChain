const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const retailerSchema = new mongoose.Schema({
  fullName: {
      type: String,
      trim: true,
      required: [true, 'Please enter your full name'],
      maxlength: [255, "Please enter a valid name"],
      minlength: [2, "Please enter a valid name"],
  },
  storeName: {
    type: String,
    trim: true,
    required: [true, 'Please enter your store name'],
    maxlength: [255, "Please enter a valid store number"],
    minlength: [2, "Please enter a valid store number"]
  },
  businessAddress:{
    streetNo: {
      type: String,
      trim: true,
      required: [true, 'Please enter your store\'s street number'],
      maxlength: [255, "Please enter a valid street number"],
      minlength: [2, "Please enter a valid street number"]
    },
    state: {
      type: String,
      trim: true,
      required: [true, 'Please enter state'],
      maxlength: [255, "Please enter a valid state name"],
      minlength: [2, "Please enter a valid state name"]
    },
    city: {
      type: String,
      trim: true,
      required: [true, 'Please enter your city'],
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
  aadhaar: {
    type: String,
    required: [true, "Please enter your aadhaar card number"],
    minlength: [12, "Please enter a valid aadhaar card number"],
    maxlength: [12, "Please enter a valid aadhaar card number"]
  },
  gstin: {
    type: String,
    trim: true,
    required: [true, "Please enter your gst no"],
    minlength: [15,"Please enter a valid gst no"],
    maxlength: [15,"Please enter a valid gst no"]
  },
  pancard: {
    type: String,
    trim: true,
    required: [true, "Please enter your PAN card number"],
    minlength: [10, "Please enter a valid PAN number"],
    maxlength: [10,"Please enter a valid PAN number"]
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
    enum: ['retailer'],
    default: 'retailer'
  },
  profileStatus: {
      type: String,
      trim: true,
      enum: {
          values: ['inactive', 'active', 'deleted'],
          message: 'invalid status'
      },
      default: "inactive"
  }

},{ timestamps: true });

// fire a function before doc saved to db
retailerSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  console.log(this);
  next();
});

// static method to login user
// manufacturerSchema.statics.login = async function(email, password) {
//   const teacher = await this.findOne({ email });
//   if (teacher) {
//     const auth = await bcrypt.compare(password, teacher.password);
//     if (auth) {
//       return teacher;
//     }
//     throw Error('incorrect password');
//   }
//   throw Error('incorrect email');
// };

const Retailer = mongoose.model('retailer', retailerSchema);

module.exports = Retailer;