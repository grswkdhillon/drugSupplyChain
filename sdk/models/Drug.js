const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
  drugName: {
      type: String,
      trim: true,
      required: [true, 'Please enter your drug name'],
      maxlength: [255, "Please enter a valid drug name"],
      minlength: [2, "Please enter a valid drug name"],
  },
  drugDesc: {
    type: String,
    trim: true,
    required: [true, 'Please enter your drug Description'],
    maxlength: [255, "Please enter a valid drug Desription"],
    minlength: [2, "Please enter a valid drug Description"],
  },
  activeIngredients: [{
    ingredient: {
        type: String,
        trim: true,
        required: [true, "Please specify the ingredients"]
    },
    quantity: {
        type: Number,
        required: [true, "please specify the quantity"]
    }
  }],
  formulation: {
    type: String,
    trim: true,
    required: [true, "Please specify the formulation"]
  },
  manufacturingProcess: {
    type: String,
    trim: true,
    required: [true, 'Please specify the manufacturing process'],
    maxlength: [2000, "Specification should be shorter than 2000 characters"],
    minlength: [10, "Specification should be longer than 10 characters "] 
  },
  clinicalTrials: {
    type: String,
    trim: true,
    required: [true, 'Please specify the clinical trials'],
    maxlength: [2000, "Specification should be shorter than 2000 characters"],
    minlength: [10, "Specification should be longer than 10 characters"]
  },
  pharmacokinetics: {
    type: String,
    trim: true,
    required: [true, 'Please specify the Pharmacokinetics'],
    maxlength: [2000, "Specification should be shorter than 2000 characters"],
    minlength: [2, "Specification should be longer than 10 characters"]
  },
  pharmacodynamics: {
    type: String,
    trim: true,
    required: [true, 'Please specify the Pharmacokinetics'],
    maxlength: [2000, "Specification should be shorter than 2000 characters"],
    minlength: [2, "Specification should be longer than 10 characters"]
  },
  adverseReactions: {
    type: String,
    trim: true,
    required: [true, 'Please specify the Adverse Reactions'],
    maxlength: [2000, "Specification should be shorter than 2000 characters"],
    minlength: [2, "Specification should be longer than 10 characters"]
  },
  shelfLife:{
    type: Number,
    required: [true, "Please enter the shelfLife"]
  },
  packaging: {
    unit: {
      type: String,
      required: [true, "please specify the unit"],
      enum: {
        values: ['mg', 'ml'],
        message: "invalid unit type"
      }
    },
    quantity: {
      type: Number,
      required: [true, "please specify the quantity"]
    }
  },
  fdaRegulations: {
    type: Boolean,
    required: [true, "Please specify if it is compliant with FDA regulations"]
  },
  gmpGuidlines: {
    type: Boolean,
    required: [true, "Please specify if it is compliant with GMP regulations"]
  },
  status: {
      type: String,
      trim: true,
      enum: {
          values: ['pending', 'approved', 'deleted'],
          message: 'invalid status'
      },
      default: "pending"
  }

},{ timestamps: true });

// fire a function before doc saved to db
// distributorSchema.pre('save', async function(next) {
//   const salt = await bcrypt.genSalt();
//   this.password = await bcrypt.hash(this.password, salt);
//   console.log(this);
//   next();
// });

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

const Drug = mongoose.model('drug', drugSchema);

module.exports = Drug;