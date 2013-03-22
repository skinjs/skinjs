$(document).ready(function() {

  module("Hub");

  test('instantiation', 1, function() {
    var hub = new Skin.Hub();
    console.log(hub);
    ok (hub instanceof Object, 'object is instance of class');
  });


});
