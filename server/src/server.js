const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 8000;
const app = express();

app.listen(PORT, () => {
  console.log(`Express app listening at http://localhost:${PORT}`);
});
