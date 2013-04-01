$(document).ready(function() {

  var pack = { baseUrl: '../destination/scripts/' }
    , adapter

  QUnit.config.autostart = false;
  require(pack, ['adapter'], function(module) {
    adapter = module
    QUnit.start();
    QUnit.config.autostart = true;
  })

  module('Adapter')

  test('availability', 1, function() {
    ok(adapter != undefined, 'skin adapter is available')
  })

  test('shortcuts', 4, function() {
    ok(adapter.Objects === Object.prototype, 'object prototype')
    ok(adapter.Arrays === Array.prototype, 'array prototype')
    ok(adapter.arraySlice === Array.prototype.slice, 'array slice')
    ok(adapter.objectHas === Object.prototype.hasOwnProperty, 'object has own property')
  })

});