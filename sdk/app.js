require("dotenv").config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const manufacturerRoutes = require('./routes/manufacturerRoutes');
const distributorRoutes = require('./routes/distributorRoutes');
const retailerRoutes = require('./routes/retailerRoutes');
const qaRoutes = require('./routes/qaRoutes');
const adminRoutes = require('./routes/adminRoutes');
//chaincode
const fabricEnrollment  = require('./services/fabric/enrollment');
//---------

const PORT = process.env.PORT || 3000;
const DBURI = process.env.dbURI;
const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/manufacturer/', manufacturerRoutes);
app.use('/distributor/', distributorRoutes);
app.use('/retailer/', retailerRoutes);
app.use('/qualityAnalyst/', qaRoutes);
app.use('/admin/', adminRoutes);

mongoose.connect(DBURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => console.log("connected to db"))
  .catch((err) => console.log(err));  


app.get('/', (req, res)=>{
  res.json("home");
})

app.get('/enroll', async(req, res)=>{
  let adminKeys = await fabricEnrollment.enrollAdmin();
  let userKeys = await fabricEnrollment.registerUser();

return res.json("enrolled user and admin");
});

app.listen(PORT, ()=>{
    console.log("app listening on port ", PORT);
});

