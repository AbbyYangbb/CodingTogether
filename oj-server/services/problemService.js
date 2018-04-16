// var Problems = [
//   {
//     id: 1,
//     name: "Two Sum",
//     desc: `Given an array of integers, find two numbers such that they add up to a specific target number.
//
// The function twoSum should return indices of the two numbers such that they add up to the target, where index1 must be less than index2. Please note that your returned answers (both index1 and index2) are NOT zero-based.`,
//     difficulty: "easy"
//   },
//   {
//     id: 2,
//     name: "3Sum",
//     desc: `Given an array S of n integers, are there elements a, b, c in S such that a + b + c = 0? Find all unique triplets in the array which gives the sum of zero.`,
//     difficulty: "medium"
//   },
//   {
//     id: 3,
//     name: "4Sum",
//     desc: `Given an array S of n integers, are there elements a, b, c, and d in S such that a + b + c + d = target?
//
// Find all unique quadruplets in the array which gives the sum of target.`,
//     difficulty: "medium"
//   },
//   {
//     id: 4,
//     name: "Triangle Count",
//     desc: `Given an array of integers, how many three numbers can be found in the array, so that we can build an triangle whose three edges length is the three numbers that we find?`,
//     difficulty: "hard"
//   },
//   {
//     id: 5,
//     name: "Sliding Window Maximum",
//     desc: `Given an array of n integer with duplicate number, and a moving window(size k), move the window at each iteration from the start of the array, find the maximum number inside the window at each moving.`,
//     difficulty: "super"
//   }
// ];

var ProblemModel = require("../models/problemModel");

// want to find a problem
var getProblems = function () {
  return new Promise((resolve,reject) => {
    ProblemModel.find({}, function (err, problems) {
      if (err) {
        reject(err);
      } else {
        resolve(problems);
      }
    });
  });
}

// find a problem according to the ID
var getProblem = function (id) {
  return new Promise((resolve,reject) => {
    ProblemModel.findOne({ id: id }, function (err, problem) {
      if (err) {
        reject(err);
      } else {
        resolve(problem);
      }
    });
  });
}

// find a problem according to the Name
// Add a problem to mongodb
var addProblem = function (newProblem) {
  return new Promise((resolve,reject) => {
    ProblemModel.findOne({ name: newProblem.name }, function (err, problem) {
      if (problem) {
        reject("Problem name already exists"); // error to rest.js
      } else {
        ProblemModel.count({}, function (err, num) {
          newProblem.id = num + 1;
          var mongoProblem = new ProblemModel(newProblem); // mongodb obj = javascript obj
          mongoProblem.save();
          resolve(newProblem);
        });
      }
    });
  })
}

module.exports = {
  getProblems: getProblems,
  getProblem: getProblem,
  addProblem: addProblem
}
