describe('Tools Module', function () {

  var Tools = Skin.Tools;

  it('is available', function (){
    expect(Tools).to.exist;
  });

  describe('Shortcuts', function() {
    it('has basic types', function() {
      expect(Tools.Objects).to.equal(Object.prototype);
      expect(Tools.Arrays).to.equal(Array.prototype);
      expect(Tools.arraySlice).to.equal(Array.prototype.slice);
      expect(Tools.objectHas).to.equal(Object.prototype.hasOwnProperty);
    })
  });

  describe('Type Checks', function() {
    var array = [1, 2, 3], object = { key: 'value' }, string = 'string';

    it('detects plain objects', function() {
      expect(Tools.isObject(object)).to.be.true;
      expect(Tools.isObject({})).to.be.true;
      expect(Tools.isObject(array)).to.be.false;
      expect(Tools.isObject(string)).to.be.false;
      expect(Tools.isObject(null)).to.be.false;
      expect(Tools.isObject()).to.be.false;
    });

    it('detects functions', function() {
      expect(Tools.isFunction(function() {})).to.be.true;
      expect(Tools.isFunction(object)).to.be.false;
      expect(Tools.isFunction(null)).to.be.false;
      expect(Tools.isFunction()).to.be.false;
    });

    it('detects arrays', function() {
      expect(Tools.isArray(array)).to.be.true;
      expect(Tools.isArray([])).to.be.true;
      expect(Tools.isArray(object)).to.be.false;
      expect(Tools.isArray(string)).to.be.false;
      expect(Tools.isArray(null)).to.be.false;
      expect(Tools.isArray()).to.be.false;
    });

    it('detects strings', function() {
      expect(Tools.isString(string)).to.be.true;
      expect(Tools.isString('')).to.be.true;
      expect(Tools.isString(array)).to.be.false;
      expect(Tools.isString(object)).to.be.false;
      expect(Tools.isString(null)).to.be.false;
      expect(Tools.isString()).to.be.false;
    });

    it('detects boolean', function() {
      expect(Tools.isBoolean(true)).to.be.true;
      expect(Tools.isBoolean(object)).to.be.false;
      expect(Tools.isBoolean(null)).to.be.false;
      expect(Tools.isBoolean()).to.be.false;
    });

    it('detects undefined', function() {
      expect(Tools.isUndefined()).to.be.true;
      expect(Tools.isUndefined(null)).to.be.false;
      expect(Tools.isUndefined(object)).to.be.false;
    });

    it('detects DOM elements', function() {
      expect(Tools.isElement(document.body)).to.be.true;
      expect(Tools.isElement(object)).to.be.false;
      expect(Tools.isElement(null)).to.be.false;
      expect(Tools.isElement()).to.be.false;
    });
  });

  describe('Utilities & Helpers', function() {
    describe('Each Iterator', function() {
      var array  = [1, 2, 3, null, 4]
        , object = { a: 1, b: { c: true }, d: undefined, e: null, f: 'foo', g: [1, 2, 3] }
        , count  = 0;
      it('iterates through arrays', function() {
        Tools.each(array, function(item) { if (item) count += item });
        expect(count).to.equal(10);
      });
      it('iterates through objects', function() {
        Tools.each(object, function(item) { count++ });
        expect(count).to.equal(16);
      });
    });

    describe('Basic Filter & Reject', function() {
      var array  = [1, 2, 3, 4, 5, 'a', 'b', 'c', 'foo', 'bar', 'z'];
      it('filters array items', function() {
        Tools.filter(array, function(item) { return typeof item === 'string' });
        expect(array).to.have.length(6);
        expect(array).to.include('a');
        expect(array).to.not.include(1);
      });
      it('rejects array items', function() {
        Tools.reject(array, function(item) { return item.length > 1 });
        expect(array).to.have.length(4);
        expect(array).to.include('a');
        expect(array).to.not.include('foo');
      });
    });

    describe('Object Keys', function() {
      var full  = { a: 1, b: { c: true }, d: undefined, e: null, f: 'foo', g: [1, 2, 3] }
        , empty = {};
      it('returns array of object keys', function() {
        expect(Tools.keys(full)).to.have.length(6);
        expect(Tools.keys(empty)).to.be.empty;
      });
    });

  });

});
