/**
 * Module Dependencies
 */


/**
 * Module Export
 */

exports = module.exports = scope;

/**
 * Collection of Scopes
 */

exports.collection = [];

/**
 * Public API
 */

function scope(name, data, parent, viewName, el) {

  if (exports.collection[name])
    return exports.collection[name];

  if ('string' === typeof parent)
    parent = scope(parent);

  if (!el && viewName && 'string' !== viewName)
    el = viewName.el;

  var instance = new Scope(name, data, parent, view, el);

  exports.collection.push(instance);
  exports.collection[name] = instance;
  return instance;
}

/**
 * Expose `Scope`
 * @type {Function}
 */

exports.Scope = Scope;


/**
 * Clear the collections.
 *
 * Used for testing.
 */

exports.clear = function() {
  exports.collection = [];
}

/**
 * Constructor
 */

function Scope(name, data, parent, view, el) {
  this.name = name;
  this.el = el;
  this.data = data;
  this._parent = parent || null;
  this.view = view;
  this.children = [];
}

/**
 * Add a child
 */

Scope.prototype.child = function(name, ctx) {
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

Scope.prototype.parent = function(name, ctx) {

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

Scope.prototype.find = function(key) {

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

