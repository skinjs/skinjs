$(document).ready(function() {

  module("Skin");

  test('instantiation', 1, function() {
    var skin = new Skin({ pack: { baseUrl: '../destination/scripts' }});
    ok(skin instanceof Object, 'object is instance of class');
  });

  test('unique id generation', 6, function() {
    var firstId  = Skin.uid()
      , secondId = Skin.uid();
    notEqual(firstId, secondId, 'generated ids are unique');

    var thirdId = Skin.uid('prefix')
      , forthId = Skin.uid('prefix');
    notEqual(thirdId, forthId, 'generated ids with prefix are unique');

    var firstObject  = { uid: 'foo' }
      , secondObject = { alias: 'bar' }
      , thirdObject  = {};
    equal(Skin.uid(firstObject), 'foo', 'returned existing unique id');
    ok(/bar\d/.test(Skin.uid(secondObject)), 'returned unique id based on alias');
    ok(/\d/.test(Skin.uid(thirdObject)), 'returned bare unique id');
    ok(/\d/.test(thirdObject.uid), 'stored unique id in object');
  });

  test('avoid conflicts', 3, function() {
    var NewSkin = Skin.noConflict()
      , newSkin = new NewSkin({ pack: { baseUrl: '../destination/scripts' }});
    equal(window.Skin, undefined, 'old Skin assigned back');
    ok(newSkin instanceof Object, 'new object is instance of new class');
    window.Skin = NewSkin;
    equal(window.Skin, NewSkin, 'new Skin assigned back');
  });

  // test('alias for plugins', 2, function() {
  //   var foo = new Skin({ pack: { baseUrl: '../destination/scripts' }});
  //   equal(typeof($.fn.skin), 'function', 'new skin plugin name is "skin" by default');
  //   var bar = new Skin({ alias: 'bar', pack: { baseUrl: '../destination/scripts' }});
  //   equal(typeof($.fn.bar), 'function', 'new plugin name is the same as alias');
  // });

});
