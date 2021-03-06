
/**
 * Module dependencies.
 */

// commented out by npm-component: var attr = require('tower-attr');

/**
 * Instantiate a new `Content`.
 *
 * @constructor Content
 * @param {Object} data The content's data to proxy.
 * @param {Parent} [parent] Parent content (defaults to the root content scope).
 * @return {Content} self
 * @api public
 */

exports.init = function(data, parent){
  return new this(data, parent);
};

/**
 * Go up the scope chain to the parent-defining scope.
 */

exports.parent = function(){
  return this._parent || this;
};

/**
 * Define attr with the given `name` and `options`.
 *
 * @constructor Content
 * @chainable
 * @param {String} name
 * @param {Object} options
 * @return {Function} exports The main `content` function.
 * @api public
 */

exports.attr = function(name, type, options){
  var obj = this.context = attr(name, type, options, this.id + '.' + name);
  this.attrs[name] = obj;
  this.attrs.push(obj);
  if (undefined !== obj.value) this.attrs.__default__[name] = obj;
  return this;
};

/**
 * Define a method.
 *
 * @constructor Content
 * @chainable
 * @param {String} name The action's name.
 * @param {Function} fn The action's function definition.
 * @return {Function} exports The main `content` function.
 * @api public
 */

exports.method = function(name, fn){
  this.methods[name] = fn;
  return this;
};

/**
 * Define an action.
 */

exports.action = exports.method;

/**
 * Define a helper.
 *
 * This exists purely to make code easier to separate/distinguish.
 */

exports.helper = exports.method;

/**
 * Returns the default model attributes with their values.
 *
 * @constructor Content
 * @return {Object} The default model attributes with their values.
 * @api private
 */

exports._defaultAttrs = function(attrs, binding){
  // XXX: this can be optimized further.
  var defaultAttrs = this.attrs.__default__;
  attrs || (attrs = {});
  for (var name in defaultAttrs) {
    if (null == attrs[name] || 'function' === defaultAttrs[name].valueType) {
      attrs[name] = defaultAttrs[name].apply(binding, attrs[name]);
    }
  }
  return attrs;
};