$(document).ready(function() {

  module('Skin')

  test('availability', 1, function() {
    ok(window.Skin === Skin && typeof Skin === 'function', 'Skin is available');
  })

  test('avoiding conflicts', 3, function() {
    var NewSkin = Skin.noConflict()
    equal(window.Skin, undefined, 'old Skin was assigned back to global')
    ok(typeof NewSkin === 'function', 'Skin is available by a different name')
    window.Skin = NewSkin
    equal(window.Skin, NewSkin, 'Skin assigned back to global')
  })

  test('configuration', 1, function() {
    Skin({ pack: { baseUrl: '../destination/scripts/' }})
    equal(Skin.pack.baseUrl, '../destination/scripts/', 'configured settings through Skin call')
  })

});
