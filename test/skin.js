$(document).ready(function() {

  module("Skin");

  test('new', 1, function() {
    var skin = new Skin();
    ok(skin instanceof Object, 'object is instance of class');
  });

  test('noConflict', 3, function() {
    var NewSkin = Skin.noConflict();
    var newSkin = new NewSkin();
    equal(window.Skin, undefined, 'old Skin assigned back');
    ok(newSkin instanceof Object, 'new object is instance of new class');
    window.Skin = NewSkin;
    equal(window.Skin, NewSkin, 'new Skin assigned back');
  });

  test('alias', 2, function() {
    var foo = new Skin();
    equal(typeof($.fn.skin), 'function', 'new skin plugin name is "skin" by default');
    var bar = new Skin({ alias: 'bar' });
    equal(typeof($.fn.bar), 'function', 'new plugin name is the same as alias');
  });

});