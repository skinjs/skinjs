$(document).ready(function() {

  module("Hub");

  test('simple subscribe, unsubscribe and publish', 2, function() {
    var hub       = Skin.Hub.getInstance()
      , modified  = false
      , modify    = function() { modified = true; };
    hub.subscribe(this, 'foo.bar', modify);
    hub.publish('foo', 'bar');
    ok (modified, 'subscription created and published, callback was invoked');
    modified      = false;
    hub.unsubscribe(token);
    hub.publish('foo', 'bar');
    ok (!modified, 'subscription removed and published, callback was not invoked');
  });

});
