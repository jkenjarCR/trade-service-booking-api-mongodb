// Imported libraries
require("dotenv").config();
const express = require("express");
const app = express();
const api_key = "26c24768-9de2-4787-a282-0e45fd498c9e";
const cors = require("cors");
const mongoose = require("mongoose");
let bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: ["http://localhost:8100", "http://localhost"] }));

// Database connection
const connect_to_database = () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
connect_to_database();

// Utility functions
const format_date = (date_time) => {
  return new Date(date_time).toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const is_equal = (date_from_api, date_from_db) => {
  return date_from_api.valueOf() == date_from_db.valueOf();
};

// Mongoose schema and model
var Schema = mongoose.Schema;

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true }, // Added city as required
  state: { type: String, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true },
  phone_number: { type: String, required: true },
  additional_info: { type: String, required: true },
  is_admin: { type: Boolean, required: true },
  password: { type: String, required: true },
});

const bookingSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  more_info: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  service: {
    type: String,
    required: true,
    trim: true,
  },
  is_consultation: {
    type: Boolean,
    default: false,
  },
  residence_type: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);
const Booking = mongoose.model("Booking", bookingSchema);

// Sign-in API
app.get("/api/sign-in", (req, res) => {
  const { email, password } = req.query;

  if (email && password && api_key) {
    User.findOne({ email, password }, function (err, data) {
      if (err) {
        res.json({ error: err });
      } else if (data && data._id && api_key) {
        res.json({
          success: true,
          user: data,
          message: "Login successful.",
        });
      } else {
        res.json({
          success: false,
          message: "Login failed. Check your username and password.",
        });
      }
    });
  } else {
    res.sendStatus(401);
  }
});

// User signup API
app.post("/api/user-signup", (req, res) => {
  const {
    first_name,
    last_name,
    address,
    city,
    state,
    country,
    email,
    phone_number,
    additional_info,
    is_admin,
    password,
  } = req.body;

  const u = {
    first_name,
    last_name,
    address,
    city,
    state,
    country,
    email,
    phone_number,
    additional_info,
    is_admin,
    password,
  };

  User.findOne({ email: req.body.email }, function (err, data) {
    if (err) {
      return res.json(err);
    } else if (data) {
      return res.send({
        success: false,
        message: "An account with this email address already exists.",
        existing_user: data,
      });
    } else {
      const newUser = new User(u);

      if (api_key) {
        newUser.save(function (err, data) {
          if (err) {
            res.send(err.message);
          } else {
            res.send({
              success: true,
              message: "You have signed up successfully.",
              user: data,
            });
          }
        });
      } else {
        res.sendStatus(401);
      }
    }
  });
});

// view user bookings api (testing)
app.get("/api/get-user-bookings/:_id", async (req, res) => {
  if (api_key && req.params._id) {
    try {
      var bookings = await Booking.findById(req.params._id).sort({ date: "1" });
      if (bookings && bookings.length) {
        res.json({
          success: true,
          bookings: data,
        });
      } else {
        res.json({
          success: false,
          error: "No user bookings found.",
        });
      }
    } catch(e) {
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(401);
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
