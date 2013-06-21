
/**
 * Module dependencies.
 */

var indexOf = require('indexof')
var slice = [].slice;

/**
 * Get attr.
 *
 * Attributes can be functions.
 * However, an `action` can not be called through `get`.
 *
 * @constructor Content
 * @param {String} str A path delimited by periods `.`.
 * @return {Mixed} An attribute.
 * @api public
 */

exports.get = function(str){
  var path = str.split('.');
  var val = findAttr(this, path.shift());

  // XXX: refactor to more generic/better system.
  while (path.length && undefined !== val) {
    var name = path.shift();
    // XXX: should this be hasOwnProperty?
    //      doesn't allow you to do `.constructor` though.
    if (val[name]) {
      val = val[name];
    // XXX: unoptimized, but should work for the moment.
    } else if ('function' === typeof val.get) {
      val = val.get([name].concat(path).join('.'));
      path = [];
    } else {
      val = undefined;
    }
  }

  return val;
};

/**
 * Set attr.
 *
 * @constructor Content
 * @param {String} name The attribute's name.
 * @param {Mixed} val The attribute's value.
 * @return {Object} The attribute's value.
 * @api public
 */

exports.set = function(name, val){
  // XXX: set for `nested.path`.
  // XXX: make better comparator.
  if (this.attrs[name] !== val) {
    var prev = this.attrs[name];
    this.attrs[name] = val;
    // XXX: maybe it looks for `dependencies` on
    //      `this.constructor.attrs[name].dependencies`,
    //      to see if it should emit change events for computed props.
    this.changed(name, val, prev);
  }

  return val;
};

/**
 * Update attribute value.
 *
 * @constructor Content
 * @chainable
 * @param {Object} data The new attribute value.
 * @return {Function} exports The main `content` function.
 * @api public
 */

exports.update = function(data){
  for (var key in data) this.set(key, data[key]);
  return this;
};

/**
 * Trigger the `change` event on an attribute.
 *
 * @constructor Content
 * @param {String} name The attribute's name.
 * @param {Mixed} val The attribute's value.
 * @param {Object} prev The attribute's previous value.
 * @api public
 */

exports.changed = function(name, val, prev){
  this.emit('change ' + name, val, prev);
  this.emit('change', name, val, prev);
  if (this.parent) this.parent.changed(name, val, prev);
};

/**
 * Notify self and all children of event.
 *
 * @param {String} name The attribute's name.
 * @api public
 */

exports.broadcast = function(){
  this.emit.apply(this, arguments);
  if (!this.children.length) return this;

  for (var i = 0, n = this.children.length; i < n; i++)
    this.children[i].broadcast.apply(this.children[i], arguments);

  return this;
};

/**
 * Simple wrapper around `.on('change <attr>')`.
 *
 * @constructor Content
 * @param {String} attr The attribute's name.
 * @param {Function} fn The callback to trigger when on an attribute's change event.
 * @api public
 */

exports.watch = function(attr, fn){
  return this.on('change ' + attr, fn);
};

/**
 * Apply an action.
 *
 * @constructor Content
 * @param {String} name The action's name.
 * @param {Array} args The action's list of parameters.
 * @return {Function} The named action.
 * @api public
 */

exports.apply = function(name, args){
  return findAction(this, name).apply(this, args);
};

/**
 * Call an action.
 *
 * @constructor Content
 * @param {String} name The action's name.
 * @return {Function} The named action.
 * @api public
 */

exports.call = function(name){
  return findAction(this, name).apply(this, slice.call(arguments, 1));
};

/**
 * Emit `'remove'` event for directives
 * to teardown custom functionality for their element.
 *
 * @constructor Content
 * @chainable
 * @return {Function} exports The main `content` function.
 * @api public
 */

exports.remove = function(){
  for (var i = 0, n = this.children.length; i < n; i++) {
    this.children[i].remove();
  }
  this.emit('remove');
  // XXX: not sure this is necessary
  this.constructor.emit('remove', this);

  var i = indexOf(this.constructor.instances, this);
  if (i >= 0)
    this.constructor.instances.splice(i, 1);
  return this;
};

/**
 * Standard `toString`.
 *
 * @constructor Content
 * @see http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
 * @return {String} A specifically formatted String.
 * @api public
 */

exports.toString = function(){
  return '[object Content]';
};

/**
 * Traverse content tree to find attribute.
 *
 * @param {Content} content The starting content.
 * @param {String} name The attribute's name.
 * @return {Object} The named attribute.
 */

function findAttr(content, name) {
  while (content) {
    // the order of lookups:
    // this.attrs[name]
    // this.constructor.attrs[name].value // default
    // this.parent.get(name);
    if (undefined !== content.attrs[name]) return content.attrs[name];

    // try getting default value
    var attr = content.constructor.attrs[name];
    if (attr && attr.hasDefaultValue)
      return content.attrs[name] = attr.apply(content);
    // try getting value from parent
    // XXX: not sure if it should cache
    content = content.parent;
  }
}

/**
 * Traverse content tree to find action `fn`.
 *
 * @param {Content} content The starting content.
 * @param {String} name The action's name.
 * @return {Function} The named action.
 */

function findAction(content, name) {
  while (content) {
    if (content.constructor.actions[name])
      return content.constructor.actions[name];
    content = content.parent;
  }

  throw new Error('content action [' + name + '] not found.');
}