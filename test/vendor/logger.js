QUnit.begin = function () {
  console.log('Starting Skin Tests Suite')
  console.log('==================================================\n')
}

QUnit.moduleDone = function(options) {
  if (options.failed === 0) {
    console.log("\u2714 All tests passed in '" + options.name + "' module")
  } else {
    console.log("\u2716 " + options.failed + " tests failed in '" + options.name + "' module")
  }
}

QUnit.done = function (opts) {
  console.log("\n==================================================")
  console.log("Tests Completed in " + opts.runtime + " Milliseconds")
  console.log(opts.passed + " tests of " + opts.total + " passed, " + opts.failed + " failed.")
}