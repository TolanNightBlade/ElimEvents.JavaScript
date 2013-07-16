/*! @license
 * ElimSignals <https://github.com/TolanNightBlade/ElimEvents.JavaScript/>
 * Released under the MIT license
 * Author: Michael Wood
 * Version: 0.5.0 (2013/06/13 14:45)
*/
(function (global) {
    "use strict";

    var slice = Array.prototype.slice;

    /**
    * @constructor
    */
    function EventData(name, data) {
        this._cb = false;
        this.context = null;
        this.target = null;
        this.data = data;
        this.value =  null;
        this.name = name;
    }

    EventData.prototype = {
        isBubleCancelled: function () { return this._cb; },
        cancelBubble: function () { this._cb = true; }
    };

    /**
    * @constructor
    */
    function EventCallBackData(cb, isOnce, context) {
        this.cb = cb;
        this.isOnce = isOnce;
        this.context = context;
    }

    EventCallBackData.prototype = {
        destroy: function () {
            this.cb = null;
            this.context = null;
        }
    };

    /**
    * @constructor
    */
    function ElimEventItems(name, config, ctx) {
        this.name = null;
        this.context = ctx;
        this.listeners = [];
        this.active = true;
        this.lastEvent = null;
        this.hasRun = false;
        this.memorise = true;
        this.name = name;
        if (config) {
            this.memorise = config.memorise;
            this.active = config.active;
        }
    }

    ElimEventItems.prototype = {
        constructor: ElimEventItems,
        add: function (cb, isOnce, context) {
            var itm;
            if (this.findIndex(cb, context) === -1) {
                itm = new EventCallBackData(cb, isOnce, context || this.context);
                this.listeners.push(itm);
                if (this.memorise && this.hasRun) {
                    itm.cb.apply(context || this.lastEvent.context, [this.lastEvent].concat(this.lastEvent.data));
                }
            }
            return this;
        },
        remove: function (cb, context) {
            var ix = this.findIndex(cb, context);
            if (ix !== null && ix !== -1) {
                this.listeners[ix].destroy();
                this.listeners.splice(ix, 1);
            }
        },
        count: function () {
            return this.listeners.length;
        },
        find: function (cb, context, returnIndex) {
            var i, len = this.listeners.length, itm;
            for (i = 0; i < len; i = (i + 1)) {
                itm = this.listeners[i];
                if (itm.cb === cb && itm.context === context) {
                    if (returnIndex) { return i; }
                    else { return itm; }
                }
            }
            return returnIndex ? -1 : null;
        },
        findIndex: function (cb, context) {
            return this.find(cb, context, true);
        },
        execute: function () {
            if (this.active === false) { return; }
            var executeVal,
                items = this.listeners.slice(),
                i,
                len = items.length,
                itm,
                _ctx = arguments[0] || this.context,
                _args = arguments[2] || [],
                event = new EventData(this.name, _args);
            
            event.target = arguments[1] || _ctx;
            event.context = _ctx;

            for (i = 0; i < len; i = (i + 1)) {
                itm = items[i];
                executeVal = itm.cb.apply(itm.context || _ctx, [event].concat(_args));
                if (itm.isOnce) {
                    this.listeners.splice(i, 1);
                }
                if (executeVal === false || event.isBubleCancelled()) { break; }
            }

            this.hasRun = true;
            this.lastEvent = event;

            return event;
        },
        destroy: function () {
            this.listeners.length = 0;
            this.name = null;
            this.listeners = null;
            this.context = null;
        }
    };

    /**
    * @constructor
    */
    function ElimSignals(ctx, options) {
        if (options === null || options === undefined) { options = {};}
        this.handlers = [];
        this.context = ctx || this;
        this.memorise = typeof options.memorise === 'boolean' ? options.memorise : true;
    }

    ElimSignals.prototype = {
        setContext: function (v) { this.context = v; },
        setEnabled: function (name, isEnabled) {
            var h = this.getHandler(name);
            if (h === null) { throw new Error('No handler with the name {name} could be found.'.replace('{name}', name)); }
            h.active = isEnabled();
            return this;
        },
        isEnabled: function (name) {
            var h = this.getHandler(name);
            if (h === null) { return null; }
            return h.active;
        },
        getHandler: function (name) {
            var i, len = this.handlers.length;
            for (i = 0; i < len; i = (i + 1)) {
                if (this.handlers[i].name === name) { return this.handlers[i];}
            }
            return null;
        },
        setHandler: function (name, ctx) {
            var itm = new ElimEventItems(name, { memorise: this.memorise, active: true }, ctx || this.context);
            this.handlers.push(itm);
            return itm;
        },
        _trigger: function (name, target, context, args) {
            var handler = this.getHandler(name);
            if (!handler) { return; }
            return handler.execute(context || this.context, target, args);
        },
        trigger: function (name, context) {
            return this._trigger(name, null, context, slice.call(arguments, 2));
        },
        triggerWithTarget: function (name, target, context) {
            return this._trigger(name, target, context, slice.call(arguments, 3));
        },
        _on: function (name, cb, isOnce, context) {
            var handler = this.getHandler(name), ctx = context || this.context;
            if (typeof cb !== 'function') { throw new Error('Unable to register callback, typeof of cb is not a function.'); }
            if (!handler) { handler = this.setHandler(name, ctx); }
            handler.add(cb, isOnce, context || this.context);
            return handler;
        },
        on: function (name, cb, isOnce, context) {
            var names = name.split(' '), i, len = names.length, n = [];
            for (i = 0; i < len; i = (i + 1)) {
                n.push(this._on(names[i], cb, isOnce, context || this.context));
            }
            return len === 1 ? n[0] : n;
        },
        _off: function (name, cb, context) {
            var handler = this.getHandler(name);
            if (!handler) { return; }
            handler.remove(cb, context || this.context);
        },
        off: function (name, cb, context) {
            var names = name.split(' '), i, len = names.length, n = [];
            for (i = 0; i < len; i = (i + 1)) {
                n.push(this._off(names[i], cb, context));
            }
            return this;
        },
        destroy: function () {
            this.handlers.length = 0;
            this.handlers = null;
            this.context = null;
        }
    };

    /*jslint sub:true */
    global['ElimSignals'] = ElimSignals;
    global['ElimSignals']['util'] = {
        createOn: function (item) {
            var p;
            ElimSignals.constructor.apply(item, [arguments[1]]);
            for (p in ElimSignals.prototype) {
                if (ElimSignals.prototype.hasOwnProperty(p)) {
                    item[p] = ElimSignals.prototype[p];
                }
            }
        }
    };

})(this);