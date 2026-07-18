const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookies = require("cookie-parser");

const registerRoute = require("./route/auth");
const productRoute = require("./route/productcrud");

const app = express();

app.use(cookies());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use("/api/auth", registerRoute);
app.use("/api/product", productRoute);

module.exports = app;