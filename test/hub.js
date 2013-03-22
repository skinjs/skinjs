$(document).ready(function() {

  module("Hub");

  test('simple subscribe, unsubscribe and publish', 2, function() {
    var hub       = Skin.Hub.getInstance();
    var modified  = false;
    var modify    = function() { modified = true; };
    var token     = hub.subscribe('foo', modify);
    hub.publish('foo', 'bar');
    ok (modified, 'subscription created and published, callback was invoked');
    modified      = false;
    hub.unsubscribe(token);
    hub.publish('foo', 'bar');
    ok (!modified, 'subscription removed and published, callback was not invoked');
  });

});
