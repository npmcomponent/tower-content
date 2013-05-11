var scope = 'undefined' === typeof window ? require('..') : require('tower-scope')
  , assert = 'undefined' === typeof window ? require('assert') : require('component-assert');

describe('scope', function(){
  beforeEach(scope.clear);

  it('should define', function(done){
    scope.on('define', function(Scope){
      assert('hello' === Scope.id);
      done();
    });

    scope('hello');
  });

  it('should init', function(done){
    scope('menu').on('init', function(instance){
      assert('menu' === instance.name);
      done();
    }).init();
  });

  describe('attrs', function(){
    it('should define attrs', function(){
      scope('menu')
        .attr('items', 'array', [])

      var ctx = scope('menu').init();
      console.log(ctx.get('items'));
    });

    it('should define actions', function(done){
      scope('menu')
        .action('select', function(index){
          assert('menu' === this.name);
          assert(2 === index);
          done();
        });

      scope('menu').init().select(2);
    });

    it('should allow passing attrs on `init`', function(){
      scope('menu')
        .attr('items', 'array');

      var ctx = scope('menu').init({ items: [1, 2] });
      assert('1,2' === ctx.get('items').join(','));
    });
  });

  /*it('should create a new child scope', function(){
    var child = scope('child');
    var ctx = scope('hello')
      .child('chx', child);

    console.log(ctx);
    assert(ctx.children['chx'] instanceof Scope);
  });

  it('should create multiple children scopes.', function(){
    var ctx = scope('ctx')
      .child('one')
      .child('two')
      .child('three');

    assert(ctx.children.length === 3);
  });

  it('should find the key in the current scope.', function(){
    var ctx = scope('ctx');

    ctx.data = {
      user: {
        username: 'DropDrop'
      }
    };

    assert(ctx.find('user').username === 'DropDrop');
  });

  it('should find the key in the parent scope.', function(){
    var parent = scope('parent')
      .child('ctx');

    parent.data = {
      user: 'Hello'
    };

    assert(scope('ctx').find('user') === 'Hello');
  });*/
});