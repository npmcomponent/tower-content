
/**
 * Module dependencies.
 */

var accessor = require('tower-accessor');
var indexOf = require('indexof');
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
  return this.edge(str).get();
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
  return this.edge(name).set(val);
};

/**
 * Create an edge to an property in the scope tree.
 *
 * @api private
 */

exports.edge = function(str){
  if (this.edges[str]) return this.edges[str];

  var path = str.split('.');
  var name = path.shift();

  if (this.data.hasOwnProperty(name)) {
    return this.edges[str] = this.accessor.accessor(str);
  }

  // XXX: need to clean this up
  if (name === 'constructor') {
    return this.edges[str] = this.constructor.accessor.accessor(path.join('.'));
  }

  // XXX: this should be refactored too
  if (this.constructor.attrs.hasOwnProperty(name)) {
    this.data[name] = undefined;
    return this.edges[str] = this.accessor.accessor(str);
  }

  if (this.parent) {
    return this.edges[str] = this.parent.edge(str); 
  }

  error(this.constructor.id, 'attr', name);
};

exports.attr = function(path){
  if (this.edges[path]) return this.edges[path];
  return this.edges[path] = this.accessor.accessor(path);
};

/**
 * Traverse content tree to find action `fn`.
 *
 * @param {Content} content The starting content.
 * @param {String} name The action's name.
 * @return {Function} The named action.
 */

exports.method = function(name){
  if (this.constructor.methods[name])
    return this.constructor.methods[name];
  if (this.parent)
    return this.parent.method(name);

  error(this.constructor.id, 'method', name);
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
  this.data = data;
  //for (var key in data) {
  //  this.set(key, data[key]);
  //}
  return this;
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
 * Apply an action.
 *
 * @constructor Content
 * @param {String} name The action's name.
 * @param {Array} args The action's list of parameters.
 * @return {Function} The named action.
 * @api public
 */

exports.apply = function(name, args){
  return this.method(name).apply(this, args);
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
  return this.method(name).apply(this, slice.call(arguments, 1));
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
  if (i >= 0) this.constructor.instances.splice(i, 1);

  this.root = undefined;
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
 * Properly set the parent content.
 *
 * @api private
 */

exports.setParent = function(parent){
  if (!parent && 'root' !== this.name)
    this.parent = this.root;
  else
    this.parent = parent;
  
  if (this.parent)
    this.parent.children.push(this);
};

function error(id, type, name) {
  throw new Error("content('" + id + "') " + type + " [" + name + "] not found.");
}