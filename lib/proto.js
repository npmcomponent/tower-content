
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