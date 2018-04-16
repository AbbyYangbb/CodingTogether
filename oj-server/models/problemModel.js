var mongoose = require("mongoose");
var ProblemSchema = mongoose.Schema({ // How data looks like
  id: Number,
  name: String,
  desc: String,
  difficulty: String
});
var problemModel = mongoose.model("ProblemModel", ProblemSchema);

module.exports = problemModel;

// The expected Data Schema (data form)
