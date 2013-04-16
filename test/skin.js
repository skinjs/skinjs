describe('Skin Module', function () {

  it('is available', function (){
    expect(window.Skin).to.be.a('function');
  });

  it('can avoid conflicts', function (){
    var NewSkin = Skin.noConflict();
    expect(window.Skin).to.be.undefined;
    expect(NewSkin).to.be.a('function');
    window.Skin = NewSkin;
    expect(window.Skin === NewSkin).to.be.true;
  });

  it('is configurable', function() {
    Skin({ pack: { baseUrl: '../destination/scripts/' }});
    expect(Skin.pack.baseUrl).to.equal('../destination/scripts/');
  });

});