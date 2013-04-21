describe('Index Module', function () {


  var Index = Skin.Index, object, array, element;


  beforeEach(function() {
    object  = { key: 'value' };
    array   = [1, 2, 3];
    element = document.createElement('div');
  });


  afterEach(function() {
    object = array = element = null;
    Index.reset();
  });


  it('is available', function (){
    expect(Index).to.exist;
  });


  it('sets and gets unique index globally', function() {
    var i = Index.set(object)
      , j = Index.set(array)
      , k = Index.set(element);
    expect(Index.set(object)).to.equal(i);
    expect(Index.get(object)).to.equal(i);
    expect(Index.set(array)).to.equal(j);
    expect(Index.get(array)).to.equal(j);
    expect(Index.set(element)).to.equal(k);
    expect(Index.get(element)).to.equal(k);
  });


  it('returns specific value when index does not exist', function() {
    expect(Index.get(object)).to.equal(-1);
  });


  it('removes index for an item', function() {
    Index.set('string', 'namespace');
    expect(Index.get('string', 'namespace')).to.not.equal(-1);
    Index.remove('string', 'namespace');
    expect(Index.get('string', 'namespace')).to.equal(-1);
  });


  it('sets and gets unique index scoped to namespaces', function() {
    var i = Index.set(object)
      , j = Index.set(array)
      , k = Index.set(element)
      , x = Index.set(element, 'name')
      , y = Index.set(object, 'name')
      , z = Index.set(array, 'name');

      expect(Index.get(object)).to.not.equal(Index.get(object, 'name'));
      expect(Index.get(array)).to.not.equal(Index.get(array, 'name'));
      expect(Index.get(element)).to.not.equal(Index.get(element, 'name'));
  });


  it('sets, gets and removes unique index scoped to namespaces', function() {
    var i = Index.set(object)
      , j = Index.set(object, 'foo')
      , k = Index.set(object, 'bar');

      Index.remove(object, 'foo');
      expect(Index.get(object)).to.not.equal(-1);
      expect(Index.get(object, 'foo')).to.equal(-1);
      expect(Index.get(object, 'bar')).to.not.equal(-1);
  });


});