
/**
 * Get attr.
 */

exports.get = function(name){
  if ('function' === typeof this[name]) return this[name]();
  if (undefined !== this[name]) return this[name];

  // try getting default value
  var attr = this.constructor.attrs[name];
  if (attr && attr.hasOwnProperty('value'))
    return this[name] = attr.value;

  // try getting value from parent
  // XXX: not sure if it should cache
  if (this.parent) return this.parent.get(name);
};

/**
 * Set attr.
 */

exports.set = function(name, val){
  return this[name] = val;
};

/**
 * Add a child
 */

exports.child = function(name, ctx){
  if (!name) return false;
  if (!ctx) ctx = scope(name);
  this.children.push(ctx);
  this.children[name] = ctx;
  ctx.parent(this);
  return this;
};

/**
 * Attach a parent to the current scope
 */

exports.parent = function(name, ctx){
  if ('string' !== typeof name && !ctx) {
    ctx = name;
    name = null;
  }

  this._parent = ctx;
  return this;
};

/**
 * Find key within the scopes
 */

exports.find = function(key){
  if (this.data && this.data[key]) {
    return this.data[key];
  } else {
    if (!_parent) {
      // Look at the parent view's scope
      this.view.parent.scope.find(key);
    } else {
      // Look at the parent scope
      return this._parent.find(key);
    }
  }
};

/**
 * Emit `'remove'` event for directives
 * to teardown custom functionality for their element.
 */

exports.remove = function(){
  for (var i = 0, n = this.children.length; i < n; i++) {
    this.children[i].remove();
  }
  this.emit('remove');
  // XXX: not sure this is necessary
  this.constructor.emit('remove', this);
  return this;
}

/**
 * Standard `toString`.
 *
 * @see http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
 */

exports.toString = function(){
  return '[object Scope]';
}