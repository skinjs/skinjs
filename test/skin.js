var pack    = { baseUrl: '../destination/scripts/' }
  , modules = ['adapter', 'hub']

QUnit.config.autostart = false
require(pack, modules, function() {
  QUnit.start()
})

$(document).ready(function() {

  module('skin')

  test('availability', 1, function() {
    ok(window.skin === skin && typeof skin === 'function', 'skin function is available');
  })

  test('avoiding conflicts', 3, function() {
    var newSkin = skin.noConflict()
    equal(window.skin, undefined, 'old skin was assigned back to global')
    ok(typeof newSkin === 'function', 'skin is available by a different name')
    window.skin = newSkin
    equal(window.skin, newSkin, 'skin assigned back to global')
  })

});
