var scope = 'undefined' === typeof window ? require('..') : require('tower-scope')
  , assert = 'undefined' === typeof window ? require('assert') : require('component-assert');

describe('scope', function(){
  beforeEach(scope.clear);

  it('should create a new scope', function(){
    var ctx = scope('hello');
    assert(ctx instanceof Scope);
  });

  it('should create a new child scope', function(){
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
  });
});