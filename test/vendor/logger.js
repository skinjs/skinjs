QUnit.begin = function () {
  console.log('Starting Skin Test Suite')
  console.log('==================================================\n')
}

QUnit.moduleDone = function(options) {
  if (options.failed === 0) {
    console.log("\u2714 all tests passed in '" + options.name + "' module")
  } else {
    console.log("\u2716 " + options.failed + " tests failed in '" + options.name + "' module")
  }
}

QUnit.done = function (opts) {
  console.log("\n--------------------------------------------------")
  console.log("tests completed in " + opts.runtime + " milliseconds")
  console.log(opts.passed + " tests of " + opts.total + " passed, " + opts.failed + " failed")
}