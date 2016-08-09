/**
 * craftyjs 0.7.1
 * http://craftyjs.com/
 *
 * Copyright 2016, Louis Stowasser
 * Dual licensed under the MIT or GPL licenses.
 */


(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){="" shim="" for="" using="" process="" in="" browser="" var="" =="" {};="" queue="[];" draining="false;" currentqueue;="" queueindex="-1;" function="" cleanupnexttick()="" {="" if="" (currentqueue.length)="" }="" else="" (queue.length)="" drainqueue();="" drainqueue()="" (draining)="" return;="" timeout="setTimeout(cleanUpNextTick);" len="queue.length;" while(len)="" currentqueue="queue;" while="" (++queueindex="" <="" len)="" (currentqueue)="" currentqueue[queueindex].run();="" cleartimeout(timeout);="" process.nexttick="function" (fun)="" args="new" array(arguments.length="" -="" 1);="" (arguments.length=""> 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
var Crafty = require('../core/core.js');

/**@
 * #Draggable
 * @category Controls
 * Enable drag and drop of the entity. Listens to events from `MouseDrag` and moves entity accordingly.
 *
 * @see MouseDrag
 */
Crafty.c("Draggable", {
    _origX: null,
    _origY: null,
    _oldX: null,
    _oldY: null,
    _dir: null,

    init: function () {
        this.requires("MouseDrag");
        this.bind("StartDrag", this._startDrag)
            .bind("Dragging", this._drag);
    },

    remove: function() {
        this.unbind("StartDrag", this._startDrag)
            .unbind("Dragging", this._drag);
    },

    /**@
     * #.enableDrag
     * @comp Draggable
     * @sign public this .enableDrag(void)
     *
     * Reenable dragging of entity. Use if `.disableDrag` has been called.
     *
     * @see .disableDrag
     */
    enableDrag: function () {
        this.uniqueBind("Dragging", this._drag);
        return this;
    },

    /**@
     * #.disableDrag
     * @comp Draggable
     * @sign public this .disableDrag(void)
     *
     * Disables entity dragging. Reenable with `.enableDrag()`.
     *
     * @see .enableDrag
     */
    disableDrag: function () {
        this.unbind("Dragging", this._drag);
        return this;
    },

    /**@
     * #.dragDirection
     * @comp Draggable
     * Method used for modifying the drag direction.
     * If direction is set, the entity being dragged will only move along the specified direction.
     * If direction is not set, the entity being dragged will move along any direction.
     *
     * @sign public this .dragDirection()
     * Remove any previously specified direction.
     *
     * @sign public this .dragDirection(vector)
     * @param vector - Of the form of {x: valx, y: valy}, the vector (valx, valy) denotes the move direction.
     *
     * @sign public this .dragDirection(degree)
     * @param degree - A number, the degree (clockwise) of the move direction with respect to the x axis.
     *
     * Specify the dragging direction.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* this.dragDirection()&#10;* this.dragDirection(&#123;x:1, y:0&#125;) //Horizontal&#10;* this.dragDirection(&#123;x:0, y:1&#125;) //Vertical&#10;* // Note: because of the orientation of x and y axis,&#10;* // this is 45 degree clockwise with respect to the x axis.&#10;* this.dragDirection(&#123;x:1, y:1&#125;) //45 degree.&#10;* this.dragDirection(60) //60 degree.&#10;*</span><br></pre></td></tr></table></figure>

     */
    dragDirection: function (dir) {
        if (typeof dir === 'undefined') {
            this._dir = null;
        } else if (("" + parseInt(dir, 10)) == dir) { //dir is a number
            this._dir = {
                x: Math.cos(dir / 180 * Math.PI),
                y: Math.sin(dir / 180 * Math.PI)
            };
        } else {
            if (dir.x === 0 && dir.y === 0) {
                this._dir = { x: 0, y: 0 };
            } else {
                var r = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
                this._dir = {
                    x: dir.x / r,
                    y: dir.y / r
                };
            }
        }
        return this;
    },

    _startDrag: function (e) {
        this._origX = e.realX;
        this._origY = e.realY;
        this._oldX = this._x;
        this._oldY = this._y;
    },

    _drag: function(e) {
        if (this._dir) {
            if (this._dir.x !== 0 || this._dir.y !== 0) {
                var len = (e.realX - this._origX) * this._dir.x + (e.realY - this._origY) * this._dir.y;
                this.x = this._oldX + len * this._dir.x;
                this.y = this._oldY + len * this._dir.y;
            }
        } else {
            this.x = this._oldX + (e.realX - this._origX);
            this.y = this._oldY + (e.realY - this._origY);
        }
    }
});

/**@
 * #Multiway
 * @category Controls
 * @trigger NewDirection - When entity has changed direction due to velocity on either x or y axis a NewDirection event is triggered. The event is triggered once, if direction is different from last frame. - { x: -1 | 0 | 1, y: -1 | 0 | 1 } - New direction
 * @trigger Moved - When entity has moved due to velocity/acceleration on either x or y axis a Moved event is triggered. If the entity has moved on both axes for diagonal movement the event is triggered twice. - { axis: 'x' | 'y', oldValue: Number } - Old position
 *
 * Used to bind keys to directions and have the entity move accordingly.
 *
 * @see Motion, Keyboard
 */
Crafty.c("Multiway", {
    _speed: null,
    
    init: function () {
        this.requires("Motion, Keyboard");

        this._keyDirection = {}; // keyCode -> direction
        this._activeDirections = {}; // direction -> # of keys pressed for that direction
        this._directionSpeed = {}; // direction -> {x: x_speed, y: y_speed}
        this._speed = { x: 150, y: 150 };

        this.bind("KeyDown", this._keydown)
            .bind("KeyUp", this._keyup);
    },

    remove: function() {
        this.unbind("KeyDown", this._keydown)
            .unbind("KeyUp", this._keyup);

        // unapply movement of pressed keys
        this.__unapplyActiveDirections();
    },

    _keydown: function (e) {
        var direction = this._keyDirection[e.key];
        if (direction !== undefined) { // if this is a key we are interested in
            if (this._activeDirections[direction] === 0 && !this.disableControls) { // if key is first one pressed for this direction
                this.vx += this._directionSpeed[direction].x;
                this.vy += this._directionSpeed[direction].y;
            }
            this._activeDirections[direction]++;
        }
    },

    _keyup: function (e) {
        var direction = this._keyDirection[e.key];
        if (direction !== undefined) { // if this is a key we are interested in
            this._activeDirections[direction]--;
            if (this._activeDirections[direction] === 0 && !this.disableControls) { // if key is last one unpressed for this direction
                this.vx -= this._directionSpeed[direction].x;
                this.vy -= this._directionSpeed[direction].y;
            }
        }
    },


    /**@
     * #.multiway
     * @comp Multiway
     * @sign public this .multiway([Number speed,] Object keyBindings)
     * @param speed - A speed in pixels per second
     * @param keyBindings - What keys should make the entity go in which direction. Direction is specified in degrees
     *
     * Constructor to initialize the speed and keyBindings. Component will listen to key events and move the entity appropriately.
     * Can be called while a key is pressed to change direction & speed on the fly.
     *
     * Multiway acts by adding a velocity on key press and removing the same velocity when the respective key is released.
     * This works well in most cases, but can cause undesired behavior if you manipulate velocities by yourself while this component is in effect.
     * If you need to resolve collisions, it's advised to correct the position directly rather than to manipulate the velocity. If you still need to reset the velocity once a collision happens, make sure to re-add the previous velocity once the collision is resolved.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* this.multiway(150, &#123;UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180&#125;);&#10;* this.multiway(&#123;x:150,y:75&#125;, &#123;UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180&#125;);&#10;* this.multiway(&#123;W: -90, S: 90, D: 0, A: 180&#125;);&#10;*</span><br></pre></td></tr></table></figure>

     *
     * @see Motion, Keyboard
     */
    multiway: function (speed, keys) {
        if (keys) {
            if (speed.x !== undefined && speed.y !== undefined) {
                this._speed.x = speed.x;
                this._speed.y = speed.y;
            } else {
                this._speed.x = speed;
                this._speed.y = speed;
            }
        } else {
            keys = speed;
        }


        if (!this.disableControls) {
            this.__unapplyActiveDirections();
        }

        this._updateKeys(keys);
        this._updateSpeed(this._speed);

        if (!this.disableControls) {
            this.__applyActiveDirections();
        }

        return this;
    },

    /**@
     * #.speed
     * @comp Multiway
     * @sign public this .speed(Object speed)
     * @param speed - New speed the entity has, for x and y axis.
     *
     * Change the speed that the entity moves with, in units of pixels per second.
     *
     * Can be called while a key is pressed to change speed on the fly.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* this.speed(&#123; x: 150, y: 50 &#125;);&#10;*</span><br></pre></td></tr></table></figure>

     */
    speed: function (speed) {
        if (!this.disableControls) {
            this.__unapplyActiveDirections();
        }

        this._updateSpeed(speed);

        if (!this.disableControls) {
            this.__applyActiveDirections();
        }

        return this;
    },

    _updateKeys: function(keys) {
        // reset data
        this._keyDirection = {};
        this._activeDirections = {};

        for (var k in keys) {
            var keyCode = Crafty.keys[k] || k;
            // add new data
            var direction = this._keyDirection[keyCode] = keys[k];
            this._activeDirections[direction] = this._activeDirections[direction] || 0;
            if (this.isDown(keyCode)) // add directions of already pressed keys
                this._activeDirections[direction]++;
        }
    },

    _updateSpeed: function(speed) {
        // reset data
        this._directionSpeed = {};

        var direction;
        for (var keyCode in this._keyDirection) {
            direction = this._keyDirection[keyCode];
            // add new data
            this._directionSpeed[direction] = {
                x: Math.round(Math.cos(direction * (Math.PI / 180)) * 1000 * speed.x) / 1000,
                y: Math.round(Math.sin(direction * (Math.PI / 180)) * 1000 * speed.y) / 1000
            };
        }
    },

    __applyActiveDirections: function() {
        for (var direction in this._activeDirections) {
            if (this._activeDirections[direction] > 0) {
                this.vx += this._directionSpeed[direction].x;
                this.vy += this._directionSpeed[direction].y;
            }
        }
    },

    __unapplyActiveDirections: function() {
        for (var direction in this._activeDirections) {
            if (this._activeDirections[direction] > 0) {
                this.vx -= this._directionSpeed[direction].x;
                this.vy -= this._directionSpeed[direction].y;
            }
        }
    },

    /**@
     * #.enableControl
     * @comp Multiway
     * @sign public this .enableControl()
     *
     * Enable the component to listen to key events.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* this.enableControl();&#10;*</span><br></pre></td></tr></table></figure>

     */
    enableControl: function () {
        if (this.disableControls) {
            this.__applyActiveDirections();
        }
        this.disableControls = false;

        return this;
    },

    /**@
     * #.disableControl
     * @comp Multiway
     * @sign public this .disableControl()
     *
     * Disable the component to listen to key events.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* this.disableControl();&#10;*</span><br></pre></td></tr></table></figure>

     */
    disableControl: function () {
        if (!this.disableControls) {
            this.__unapplyActiveDirections();
        }
        this.disableControls = true;

        return this;
    }
});


/**@
 * #Jumper
 * @category Controls
 * @trigger NewDirection - When entity has changed direction due to velocity on either x or y axis a NewDirection event is triggered. The event is triggered once, if direction is different from last frame. - { x: -1 | 0 | 1, y: -1 | 0 | 1 } - New direction
 * @trigger Moved - When entity has moved due to velocity/acceleration on either x or y axis a Moved event is triggered. If the entity has moved on both axes for diagonal movement the event is triggered twice. - { axis: 'x' | 'y', oldValue: Number } - Old position
 * @trigger CheckJumping - When entity is about to jump. This event is triggered with the object the entity is about to jump from (if it exists). Third parties can respond to this event and enable the entity to jump.
 *
 * Make an entity jump in response to key events.
 *
 * @see Supportable, Motion, Keyboard, Gravity
 */
Crafty.c("Jumper", {
    _jumpSpeed: 300,

    /**@
     * #.canJump
     * @comp Jumper
     *
     * The canJump function determines if the entity is allowed to jump or not (e.g. perhaps the entity should be able to double jump).
     * The Jumper component will trigger a "CheckJumping" event.
     * Interested parties can listen to this event and enable the entity to jump by setting `canJump` to true.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* var player = Crafty.e(&#34;2D, Jumper&#34;);&#10;* player.hasDoubleJumpPowerUp = true; // allow player to double jump by granting him a powerup&#10;* player.bind(&#34;CheckJumping&#34;, function(ground) &#123;&#10;*     if (!ground &#38;&#38; player.hasDoubleJumpPowerUp) &#123; // allow player to double jump by using up his double jump powerup&#10;*         player.canJump = true;&#10;*         player.hasDoubleJumpPowerUp = false;&#10;*     &#125;&#10;* &#125;);&#10;* player.bind(&#34;LandedOnGround&#34;, function(ground) &#123;&#10;*     player.hasDoubleJumpPowerUp = true; // give player new double jump powerup upon landing&#10;* &#125;);&#10;*</span><br></pre></td></tr></table></figure>

     */
    canJump: true,

    /**@
     * #.enableControl
     * @comp Jumper
     * @sign public this .enableControl()
     *
     * Enable the component to listen to key events.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* this.enableControl();&#10;*</span><br></pre></td></tr></table></figure>

     */

    /**@
     * #.disableControl
     * @comp Jumper
     * @sign public this .disableControl()
     *
     * Disable the component to listen to key events.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* this.disableControl();&#10;*</span><br></pre></td></tr></table></figure>

     */

    init: function () {
        this.requires("Supportable, Motion, Keyboard");
        // don't overwrite methods from Multiway if they exist
        this.enableControl = this.enableControl || function() { this.disableControls = false; };
        this.disableControl = this.disableControl || function() { this.disableControls = true; };
    },

    remove: function() {
        this.unbind("KeyDown", this._keydown_jumper);
    },

    _keydown_jumper: function (e) {
        if (this.disableControls) return;

        if (this._jumpKeys[e.key]) {
            var ground = this.ground;
            this.canJump = !!ground;
            this.trigger("CheckJumping", ground);
            if (this.canJump) {
                this.vy = -this._jumpSpeed;
            }
        }
    },

    /**@
     * #.jumper
     * @comp Jumper
     * @sign public this .jumper([Number jumpSpeed,] Array jumpKeys)
     * @param jumpSpeed - Vertical jump speed in pixels per second
     * @param jumpKeys - Keys to listen for and make entity jump in response
     *
     * Constructor to initialize the power of jump and keys to listen to. Component will
     * listen for key events and move the entity appropriately. Used with the
     * `gravity` component will simulate jumping.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* this.jumper(300, [&#39;UP_ARROW&#39;, &#39;W&#39;]);&#10;* this.jumper([&#39;UP_ARROW&#39;, &#39;W&#39;]);&#10;*</span><br></pre></td></tr></table></figure>

     *
     * @see Supportable, Motion, Keyboard, Gravity
     */
    jumper: function (jumpSpeed, jumpKeys) {
        if (jumpKeys) {
            this._jumpSpeed = jumpSpeed;
        } else {
            jumpKeys = jumpSpeed;
        }

        this._jumpKeys = {};
        for (var i = 0; i < jumpKeys.length; ++i) {
            var key = jumpKeys[i];
            var keyCode = Crafty.keys[key] || key;
            this._jumpKeys[keyCode] = true;
        }

        this.uniqueBind("KeyDown", this._keydown_jumper);

        return this;
    },

    /**@
     * #.jumpSpeed
     * @comp Jumper
     * @sign public this .jumpSpeed(Number jumpSpeed)
     * @param jumpSpeed - new vertical jump speed
     *
     * Change the vertical jump speed.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* this.jumpSpeed(300);&#10;*</span><br></pre></td></tr></table></figure>

     */
    jumpSpeed: function (jumpSpeed) {
        this._jumpSpeed = jumpSpeed;
        return this;
    }
});

/**@
 * #Fourway
 * @category Controls
 * @trigger NewDirection - When entity has changed direction due to velocity on either x or y axis a NewDirection event is triggered. The event is triggered once, if direction is different from last frame. - { x: -1 | 0 | 1, y: -1 | 0 | 1 } - New direction
 * @trigger Moved - When entity has moved due to velocity/acceleration on either x or y axis a Moved event is triggered. If the entity has moved on both axes for diagonal movement the event is triggered twice. - { axis: 'x' | 'y', oldValue: Number } - Old position
 *
 * Move an entity in four directions by using the
 * arrow keys or `W`, `A`, `S`, `D`.
 *
 * @see Multiway
 */
Crafty.c("Fourway", {

    init: function () {
        this.requires("Multiway");
    },

    /**@
     * #.fourway
     * @comp Fourway
     * @sign public this .fourway([Number speed])
     * @param speed - The speed of motion in pixels per second.
     *
     * Constructor to initialize the speed. Component will listen for key events and move the entity appropriately.
     * This includes `Up Arrow`, `Right Arrow`, `Down Arrow`, `Left Arrow` as well as `W`, `A`, `S`, `D`.
     *
     * The key presses will move the entity in that direction by the speed passed in the argument.
     *
     * @see Multiway
     */
    fourway: function (speed) {
        this.multiway(speed || this._speed, {
            UP_ARROW: -90,
            DOWN_ARROW: 90,
            RIGHT_ARROW: 0,
            LEFT_ARROW: 180,
            W: -90,
            S: 90,
            D: 0,
            A: 180,
            Z: -90,
            Q: 180
        });

        return this;
    }
});

/**@
 * #Twoway
 * @category Controls
 * @trigger NewDirection - When entity has changed direction due to velocity on either x or y axis a NewDirection event is triggered. The event is triggered once, if direction is different from last frame. - { x: -1 | 0 | 1, y: -1 | 0 | 1 } - New direction
 * @trigger Moved - When entity has moved due to velocity/acceleration on either x or y axis a Moved event is triggered. If the entity has moved on both axes for diagonal movement the event is triggered twice. - { axis: 'x' | 'y', oldValue: Number } - Old position
 * @trigger CheckJumping - When entity is about to jump. This event is triggered with the object the entity is about to jump from (if it exists). Third parties can respond to this event and enable the entity to jump.
 *
 * Move an entity left or right using the arrow keys or `D` and `A` and jump using up arrow or `W`.
 *
 * @see Multiway, Jumper
 */
Crafty.c("Twoway", {

    init: function () {
        this.requires("Multiway, Jumper");
    },

    /**@
     * #.twoway
     * @comp Twoway
     * @sign public this .twoway([Number speed[, Number jumpSpeed]])
     * @param speed - A speed in pixels per second
     * @param jumpSpeed - Vertical jump speed in pixels per second
     *
     * Constructor to initialize the speed and power of jump. Component will
     * listen for key events and move the entity appropriately. This includes
     * `Up Arrow`, `Right Arrow`, `Left Arrow` as well as `W`, `A`, `D`. Used with the
     * `gravity` component to simulate jumping.
     *
     * The key presses will move the entity in that direction by the speed passed in
     * the argument. Pressing the `Up Arrow` or `W` will cause the entity to jump.
     *
     * @see Multiway, Jumper
     */
    twoway: function (speed, jumpSpeed) {

        this.multiway(speed || this._speed, {
            RIGHT_ARROW: 0,
            LEFT_ARROW: 180,
            D: 0,
            A: 180,
            Q: 180
        });

        this.jumper(jumpSpeed || speed * 2 || this._jumpSpeed, [
            Crafty.keys.UP_ARROW,
            Crafty.keys.W,
            Crafty.keys.Z
        ]);

        return this;
    }
});

},{"../core/core.js":7}],3:[function(require,module,exports){
var Crafty = require('../core/core.js');


Crafty.extend({
    /**@
     * #Crafty.device
     * @category Misc
     *
     * Methods relating to devices such as tablets or phones
     */
    device: {
        _deviceOrientationCallback: false,
        _deviceMotionCallback: false,

        /**
         * The HTML5 DeviceOrientation event returns three pieces of data:
         *  * alpha the direction the device is facing according to the compass
         *  * beta the angle in degrees the device is tilted front-to-back
         *  * gamma the angle in degrees the device is tilted left-to-right.
         *  * The angles values increase as you tilt the device to the right or towards you.
         *
         * Since Firefox uses the MozOrientationEvent which returns similar data but
         * using different parameters and a different measurement system, we want to
         * normalize that before we pass it to our _deviceOrientationCallback function.
         *
         * @param eventData HTML5 DeviceOrientation event
         */
        _normalizeDeviceOrientation: function (eventData) {
            var data;
            if (window.DeviceOrientationEvent) {
                data = {
                    // gamma is the left-to-right tilt in degrees, where right is positive
                    'tiltLR': eventData.gamma,
                    // beta is the front-to-back tilt in degrees, where front is positive
                    'tiltFB': eventData.beta,
                    // alpha is the compass direction the device is facing in degrees
                    'dir': eventData.alpha,
                    // deviceorientation does not provide this data
                    'motUD': null
                };
            } else if (window.OrientationEvent) {
                data = {
                    // x is the left-to-right tilt from -1 to +1, so we need to convert to degrees
                    'tiltLR': eventData.x * 90,
                    // y is the front-to-back tilt from -1 to +1, so we need to convert to degrees
                    // We also need to invert the value so tilting the device towards us (forward)
                    // results in a positive value.
                    'tiltFB': eventData.y * -90,
                    // MozOrientation does not provide this data
                    'dir': null,
                    // z is the vertical acceleration of the device
                    'motUD': eventData.z
                };
            }

            Crafty.device._deviceOrientationCallback(data);
        },

        /**
         * @param eventData HTML5 DeviceMotion event
         */
        _normalizeDeviceMotion: function (eventData) {
            var acceleration = eventData.accelerationIncludingGravity,
                facingUp = (acceleration.z > 0) ? +1 : -1;

            var data = {
                // Grab the acceleration including gravity from the results
                'acceleration': acceleration,
                'rawAcceleration': "[" + Math.round(acceleration.x) + ", " + Math.round(acceleration.y) + ", " + Math.round(acceleration.z) + "]",
                // Z is the acceleration in the Z axis, and if the device is facing up or down
                'facingUp': facingUp,
                // Convert the value from acceleration to degrees acceleration.x|y is the
                // acceleration according to gravity, we'll assume we're on Earth and divide
                // by 9.81 (earth gravity) to get a percentage value, and then multiply that
                // by 90 to convert to degrees.
                'tiltLR': Math.round(((acceleration.x) / 9.81) * -90),
                'tiltFB': Math.round(((acceleration.y + 9.81) / 9.81) * 90 * facingUp)
            };

            Crafty.device._deviceMotionCallback(data);
        },

        /**@
         * #Crafty.device.deviceOrientation
         * @comp Crafty.device
         * @sign public Crafty.device.deviceOrientation(Function callback)
         * @param callback - Callback method executed once as soon as device orientation is change
         *
         * Do something with normalized device orientation data:
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* &#123;&#10;*   tiltLR    :   &#39;gamma -- the angle in degrees the device is tilted left-to-right.&#39;,&#10;*   tiltFB    :   &#39;beta -- the angle in degrees the device is tilted front-to-back&#39;,&#10;*   dir       :   &#39;alpha -- the direction the device is facing according to the compass&#39;,&#10;*   motUD     :   &#39;The angle&#39;s values increase as you tilt the device to the right or towards you.&#39;&#10;* &#125;&#10;*</span><br></pre></td></tr></table></figure>

         *
         * @example
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* // Get DeviceOrientation event normalized data.&#10;* Crafty.device.deviceOrientation(function(data)&#123;&#10;*     Crafty.log(&#39;data.tiltLR : &#39;+Math.round(data.tiltLR)+&#39;, data.tiltFB : &#39;+Math.round(data.tiltFB)+&#39;, data.dir : &#39;+Math.round(data.dir)+&#39;, data.motUD : &#39;+data.motUD+&#39;&#39;);&#10;* &#125;);&#10;*</span><br></pre></td></tr></table></figure>

         *
         * See browser support at http://caniuse.com/#search=device orientation.
         */
        deviceOrientation: function (func) {
            this._deviceOrientationCallback = func;
            if (Crafty.support.deviceorientation) {
                if (window.DeviceOrientationEvent) {
                    // Listen for the deviceorientation event and handle DeviceOrientationEvent object
                    Crafty.addEvent(this, window, 'deviceorientation', this._normalizeDeviceOrientation);
                } else if (window.OrientationEvent) {
                    // Listen for the MozOrientation event and handle OrientationData object
                    Crafty.addEvent(this, window, 'MozOrientation', this._normalizeDeviceOrientation);
                }
            }
        },

        /**@
         * #Crafty.device.deviceMotion
         * @comp Crafty.device
         * @sign public Crafty.device.deviceMotion(Function callback)
         * @param callback - Callback method executed once as soon as device motion is change
         *
         * Do something with normalized device motion data:
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* &#123;&#10;*     acceleration : &#39;Grab the acceleration including gravity from the results&#39;,&#10;*     rawAcceleration : &#39;Display the raw acceleration data&#39;,&#10;*     facingUp : &#39;Z is the acceleration in the Z axis, and if the device is facing up or down&#39;,&#10;*     tiltLR : &#39;Convert the value from acceleration to degrees. acceleration.x is the acceleration according to gravity, we&#39;ll assume we&#39;re on Earth and divide by 9.81 (earth gravity) to get a percentage value, and then multiply that by 90 to convert to degrees.&#39;,&#10;*     tiltFB : &#39;Convert the value from acceleration to degrees.&#39;&#10;* &#125;&#10;*</span><br></pre></td></tr></table></figure>

         *
         * @example
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* // Get DeviceMotion event normalized data.&#10;* Crafty.device.deviceMotion(function(data)&#123;&#10;*     Crafty.log(&#39;data.moAccel : &#39;+data.rawAcceleration+&#39;, data.moCalcTiltLR : &#39;+Math.round(data.tiltLR)+&#39;, data.moCalcTiltFB : &#39;+Math.round(data.tiltFB)+&#39;&#39;);&#10;* &#125;);&#10;*</span><br></pre></td></tr></table></figure>

         *
         * See browser support at http://caniuse.com/#search=motion.
         */
        deviceMotion: function (func) {
            this._deviceMotionCallback = func;
            if (Crafty.support.devicemotion) {
                if (window.DeviceMotionEvent) {
                    // Listen for the devicemotion event and handle DeviceMotionEvent object
                    Crafty.addEvent(this, window, 'devicemotion', this._normalizeDeviceMotion);
                }
            }
        }
    }
});

},{"../core/core.js":7}],4:[function(require,module,exports){
var Crafty = require('../core/core.js'),
    document = window.document;

Crafty.extend({
    over: null, //object mouseover, waiting for out
    mouseObjs: 0,
    mousePos: {},
    lastEvent: null,
    touchObjs: 0,
    selected: false,

    /**@
     * #Crafty.keydown
     * @category Input
     * Check which keys (referred by Unicode values) are currently down.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Crafty.c(&#34;Keyboard&#34;, &#123;&#10;*   isDown: function (key) &#123;&#10;*     if (typeof key === &#34;string&#34;) &#123;&#10;*       key = Crafty.keys[key];&#10;*     &#125;&#10;*     return !!Crafty.keydown[key];&#10;*   &#125;&#10;* &#125;);&#10;*</span><br></pre></td></tr></table></figure>

     * @see Keyboard, Crafty.keys
     */
     keydown: {},

    detectBlur: function (e) {
        var selected = ((e.clientX > Crafty.stage.x && e.clientX < Crafty.stage.x + Crafty.viewport.width) &&
            (e.clientY > Crafty.stage.y && e.clientY < Crafty.stage.y + Crafty.viewport.height));

        if (!Crafty.selected && selected) {
            Crafty.trigger("CraftyFocus");
        }
        
        if (Crafty.selected && !selected) {
            Crafty.trigger("CraftyBlur");
        }
        
        Crafty.selected = selected;
    },

    /**@
     * #Crafty.multitouch
     * @category Input
     * @sign public this .multitouch(Boolean bool)
     * @param bool - Turns multitouch on and off.  The initial state is off (false).
     *
     * @sign public Boolean .multitouch()
     * @returns Whether multitouch is currently enabled;
     *
     * Enables/disables support for multitouch feature.
     * 
     * If this is set to true, it is expected that your entities have the Touch component instead of Mouse component.
     * If false (default), then only entities with the Mouse component will respond to touch.
     *
     * If no boolean is passed to the function call, it will just return whether multitouch is on or not.
     * 
     * @note The Touch component (and thus the multitouch feature) is currently incompatible with the Draggable component.
     * 
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Crafty.multitouch(true);&#10;* &#10;* var myEntity1 = Crafty.e(&#39;2D, Canvas, Color, Touch&#39;)&#10;*    .attr(&#123;x: 100, y: 100, w:200, h:200, z:1 &#125;)&#10;*    .color(&#39;black&#39;)&#10;*    .bind(&#39;TouchStart&#39;,function(e)&#123; alert(&#39;big black box was touched&#39;, e); &#125;),&#10;*  myEntity2 = Crafty.e(&#39;2D, Canvas, Color, Touch&#39;)&#10;*    .attr(&#123;x: 40, y: 150, w:90, h:300, z:2 &#125;)&#10;*    .color(&#39;green&#39;)&#10;*    .bind(&#39;TouchStart&#39;,function(e)&#123; alert(&#39;big GREEN box was touched&#39;, e); &#125;);&#10;* &#10;* Crafty.log(&#34;multitouch is &#34;+Crafty.multitouch());&#10;*</span><br></pre></td></tr></table></figure>

     * @see Crafty.touchDispatch
     */
    multitouch: function (bool) {
        if (typeof bool !== "boolean") return this._touchHandler.multitouch;
        this._touchHandler.multitouch = bool;
    },
    
    resetKeyDown: function() {
        // Tell all the keys they're no longer held down
        for (var k in Crafty.keys) {
             if (Crafty.keydown[Crafty.keys[k]]) {
                 this.trigger("KeyUp", {
                     key: Crafty.keys[k]
                 });
             }
        }
		
        Crafty.keydown = {};
    },
    
    /**@
     * #Crafty.mouseDispatch
     * @category Input
     *
     * Internal method which dispatches mouse events received by Crafty (crafty.stage.elem).
     * The mouse events get dispatched to the closest entity to the source of the event (if available).
     *
     * You can read more about the MouseEvent, which is the parameter passed to the callback.
     * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
     *
     * This method also sets a global property Crafty.lastEvent, which holds the most recent event that
     * occured (useful for determining mouse position in every frame).
     * 
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* @example&#10;*</span><br></pre></td></tr></table></figure>

     * var newestX = Crafty.lastEvent.realX,
     *     newestY = Crafty.lastEvent.realY;
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* &#10;* Notable properties of a MouseEvent e:&#10;*</span><br></pre></td></tr></table></figure>

     * //(x,y) coordinates of mouse event in web browser screen space
     * e.clientX, e.clientY
     * //(x,y) coordinates of mouse event in world/viewport space
     * e.realX, e.realY
     * // Normalized mouse button according to Crafty.mouseButtons
     * e.mouseButton
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> * @see Crafty.touchDispatch&#10; * @see Crafty.multitouch&#10; */&#10;mouseDispatch: function (e) &#123;&#10;    if (!Crafty.mouseObjs) return;&#10;    Crafty.lastEvent = e;&#10;&#10;    var maxz = -1,&#10;        tar = e.target ? e.target : e.srcElement,&#10;        closest,&#10;        q,&#10;        i = 0,&#10;        l,&#10;        pos = Crafty.domHelper.translate(e.clientX, e.clientY),&#10;        x, y,&#10;        dupes = &#123;&#125;,&#10;        type = e.type;     &#10;&#10;    //Normalize button according to http://unixpapa.com/js/mouse.html&#10;    if (typeof e.which === &#39;undefined&#39;) &#123;&#10;        e.mouseButton = (e.button &#60; 2) ? Crafty.mouseButtons.LEFT : ((e.button == 4) ? Crafty.mouseButtons.MIDDLE : Crafty.mouseButtons.RIGHT);&#10;    &#125; else &#123;&#10;        e.mouseButton = (e.which &#60; 2) ? Crafty.mouseButtons.LEFT : ((e.which == 2) ? Crafty.mouseButtons.MIDDLE : Crafty.mouseButtons.RIGHT);&#10;    &#125;&#10;&#10;    e.realX = x = Crafty.mousePos.x = pos.x;&#10;    e.realY = y = Crafty.mousePos.y = pos.y;&#10;&#10;    closest = Crafty.findClosestEntityByComponent(&#34;Mouse&#34;, x, y, tar);&#10;&#10;    //found closest object to mouse&#10;    if (closest) &#123;&#10;        //click must mousedown and out on tile&#10;        if (type === &#34;mousedown&#34;) &#123;&#10;            closest.trigger(&#34;MouseDown&#34;, e);&#10;        &#125; else if (type === &#34;mouseup&#34;) &#123;&#10;            closest.trigger(&#34;MouseUp&#34;, e);&#10;        &#125; else if (type == &#34;dblclick&#34;) &#123;&#10;            closest.trigger(&#34;DoubleClick&#34;, e);&#10;        &#125; else if (type == &#34;click&#34;) &#123;&#10;            closest.trigger(&#34;Click&#34;, e);&#10;        &#125; else if (type === &#34;mousemove&#34;) &#123;&#10;            closest.trigger(&#34;MouseMove&#34;, e);&#10;            if (this.over !== closest) &#123; //if new mousemove, it is over&#10;                if (this.over) &#123;&#10;                    this.over.trigger(&#34;MouseOut&#34;, e); //if over wasn&#39;t null, send mouseout&#10;                    this.over = null;&#10;                &#125;&#10;                this.over = closest;&#10;                closest.trigger(&#34;MouseOver&#34;, e);&#10;            &#125;&#10;        &#125; else closest.trigger(type, e); //trigger whatever it is&#10;    &#125; else &#123;&#10;        if (type === &#34;mousemove&#34; &#38;&#38; this.over) &#123;&#10;            this.over.trigger(&#34;MouseOut&#34;, e);&#10;            this.over = null;&#10;        &#125;&#10;        if (type === &#34;mousedown&#34;) &#123;&#10;            Crafty.viewport.mouselook(&#39;start&#39;, e);&#10;        &#125; else if (type === &#34;mousemove&#34;) &#123;&#10;            Crafty.viewport.mouselook(&#39;drag&#39;, e);&#10;        &#125; else if (type == &#34;mouseup&#34;) &#123;&#10;            Crafty.viewport.mouselook(&#39;stop&#39;);&#10;        &#125;&#10;    &#125;&#10;&#10;    if (type === &#34;mousemove&#34;) &#123;&#10;        this.lastEvent = e;&#10;    &#125;&#10;&#10;&#125;,&#10;&#10;&#10;/**@&#10; * #Crafty.touchDispatch&#10; * @category Input&#10; *&#10; * Internal method which dispatches touch events received by Crafty (crafty.stage.elem).&#10; * The touch events get dispatched to the closest entity to the source of the event (if available).&#10; * &#10; * By default, touch events are treated as mouse events. To change this behaviour (and enable multitouch)&#10; * you must use Crafty.multitouch.&#10; * &#10; * If using multitouch feature, this method sets the array Crafty.touchHandler.fingers, which holds data &#10; * of the most recent touches that occured (useful for determining positions of fingers in every frame) &#10; * as well as last entity touched by each finger. Data is lost as soon as the finger is raised.&#10; * &#10; * You can read about the MouseEvent, which is the parameter passed to the Mouse entity&#39;s callback.&#10; * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent&#10; *&#10; * You can also read about the TouchEvent.&#10; * https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent&#10; * &#10; * And about the touch point interface, which is the parameter passed to the Touch entity&#39;s callback.&#10; * http://www.w3.org/TR/touch-events/#dfn-active-touch-point&#10; * &#10; * @see Crafty.multitouch&#10; * @see Crafty.mouseDispatch&#10; */&#10;touchDispatch: function (e) &#123;&#10;    if (!Crafty.touchObjs &#38;&#38; !Crafty.mouseObjs) return;&#10;    &#10;    if (this._touchHandler.multitouch)&#10;        switch (e.type) &#123;&#10;            case &#34;touchstart&#34;:&#10;                this._touchHandler.handleStart(e);&#10;                break;&#10;            case &#34;touchmove&#34;:&#10;                this._touchHandler.handleMove(e);&#10;                break;&#10;            case &#34;touchleave&#34;: // touchleave is treated as touchend&#10;            case &#34;touchcancel&#34;: // touchcancel is treated as touchend, but triggers a TouchCancel event&#10;            case &#34;touchend&#34;:&#10;                this._touchHandler.handleEnd(e);&#10;                break;&#10;        &#125;&#10;    else&#10;        this._touchHandler.mimicMouse(e);&#10;&#10;    //Don&#39;t prevent default actions if target node is input or textarea.&#10;    if (e.target &#38;&#38; e.target.nodeName !== &#39;INPUT&#39; &#38;&#38; e.target.nodeName !== &#39;TEXTAREA&#39;)&#10;        if (e.preventDefault) &#123;&#10;            e.preventDefault();&#10;        &#125; else &#123;&#10;            e.returnValue = false;&#10;        &#125;&#10;&#125;,&#10;&#10;_touchHandler: &#123;&#10;    fingers: [], // keeps track of touching fingers&#10;    multitouch: false,&#10;    &#10;    handleStart: function (e) &#123;&#10;        var touches = e.changedTouches;&#10;        for (var i = 0, l = touches.length; i &#60; l; i++) &#123;&#10;            var idx = false,&#10;              pos = Crafty.domHelper.translate(touches[i].clientX, touches[i].clientY),&#10;              tar = e.target ? e.target : e.srcElement,&#10;              x, y, closest;&#10;            touches[i].realX = x = pos.x;&#10;            touches[i].realY = y = pos.y;&#10;            closest = this.findClosestTouchEntity(x, y, tar);&#10;            &#10;            if (closest) &#123;&#10;                closest.trigger(&#34;TouchStart&#34;, touches[i]);&#10;                // In case the entity was already being pressed, get the finger index&#10;                idx = this.fingerDownIndexByEntity(closest);&#10;            &#125;&#10;            var touch = this.setTouch(touches[i], closest);&#10;            if (idx !== false &#38;&#38; idx &#62;= 0) &#123;&#10;                // Recycling finger...&#10;                this.fingers[idx] = touch;&#10;            &#125; else &#123;&#10;                this.fingers.push(touch);&#10;            &#125;&#10;        &#125;&#10;    &#125;,&#10;        &#10;    handleMove: function (e) &#123;&#10;        var touches = e.changedTouches;&#10;        for (var i = 0, l = touches.length; i &#60; l; i++) &#123;&#10;            var idx = this.fingerDownIndexById(touches[i].identifier),&#10;              pos = Crafty.domHelper.translate(touches[i].clientX, touches[i].clientY),&#10;              tar = e.target ? e.target : e.srcElement,&#10;              x, y, closest;&#10;            touches[i].realX = x = pos.x;&#10;            touches[i].realY = y = pos.y;&#10;            closest = this.findClosestTouchEntity(x, y, tar);&#10;        &#10;            if (idx &#62;= 0) &#123;&#10;                if(typeof this.fingers[idx].entity !== &#34;undefined&#34;)&#10;                    if (this.fingers[idx].entity == closest) &#123;&#10;                        this.fingers[idx].entity.trigger(&#34;TouchMove&#34;, touches[i]);&#10;                    &#125; else &#123;&#10;                        if (typeof closest === &#34;object&#34;) closest.trigger(&#34;TouchStart&#34;, touches[i]);&#10;                        this.fingers[idx].entity.trigger(&#34;TouchEnd&#34;);&#10;                    &#125;&#10;                this.fingers[idx].entity = closest;&#10;                this.fingers[idx].realX = x;&#10;                this.fingers[idx].realY = y;&#10;            &#125;&#10;        &#125;&#10;    &#125;,&#10;    &#10;    handleEnd: function (e) &#123;&#10;        var touches = e.changedTouches, &#10;            eventName = e.type == &#34;touchcancel&#34; ? &#34;TouchCancel&#34; : &#34;TouchEnd&#34;;&#10;        for (var i = 0, l = touches.length; i &#60; l; i++) &#123;&#10;            var idx = this.fingerDownIndexById(touches[i].identifier);&#10;        &#10;            if (idx &#62;= 0) &#123;&#10;                    if (this.fingers[idx].entity)&#10;                        this.fingers[idx].entity.trigger(eventName);&#10;                    this.fingers.splice(idx, 1);&#10;            &#125;&#10;        &#125;&#10;    &#125;,&#10;        &#10;    setTouch: function (touch, entity) &#123;&#10;        return &#123; identifier: touch.identifier, realX: touch.realX, realY: touch.realY, entity: entity &#125;;&#10;    &#125;,&#10;        &#10;    findClosestTouchEntity: function (x, y, tar) &#123;&#10;        return Crafty.findClosestEntityByComponent(&#34;Touch&#34;, x, y, tar);&#10;    &#125;,&#10;       &#10;    fingerDownIndexById: function(idToFind) &#123;&#10;        for (var i = 0, l = this.fingers.length; i &#60; l; i++) &#123;&#10;            var id = this.fingers[i].identifier;&#10;            &#10;               if (id == idToFind) &#123;&#10;                   return i;&#10;               &#125;&#10;            &#125;&#10;        return -1;&#10;    &#125;,&#10;        &#10;    fingerDownIndexByEntity: function(entityToFind) &#123;&#10;        for (var i = 0, l = this.fingers.length; i &#60; l; i++) &#123;&#10;            var ent = this.fingers[i].entity;&#10;            &#10;            if (ent == entityToFind) &#123;&#10;                return i;&#10;            &#125;&#10;        &#125;&#10;        return -1;&#10;    &#125;,&#10;&#10;    mimicMouse: function (e) &#123;&#10;        var type,&#10;            lastEvent = Crafty.lastEvent;&#10;        if (e.type === &#34;touchstart&#34;) type = &#34;mousedown&#34;;&#10;        else if (e.type === &#34;touchmove&#34;) type = &#34;mousemove&#34;;&#10;        else if (e.type === &#34;touchend&#34;) type = &#34;mouseup&#34;;&#10;        else if (e.type === &#34;touchcancel&#34;) type = &#34;mouseup&#34;;&#10;        else if (e.type === &#34;touchleave&#34;) type = &#34;mouseup&#34;;&#10;        if (e.touches &#38;&#38; e.touches.length) &#123;&#10;            first = e.touches[0];&#10;        &#125; else if (e.changedTouches &#38;&#38; e.changedTouches.length) &#123;&#10;            first = e.changedTouches[0];&#10;        &#125;&#10;        var simulatedEvent = document.createEvent(&#34;MouseEvent&#34;);&#10;        simulatedEvent.initMouseEvent(type, true, true, window, 1,&#10;          first.screenX,&#10;          first.screenY,&#10;          first.clientX,&#10;          first.clientY,&#10;          false, false, false, false, 0, e.relatedTarget&#10;        );&#10;        first.target.dispatchEvent(simulatedEvent);&#10;        // trigger click when it should be triggered&#10;        if (lastEvent !== null &#38;&#38; lastEvent.type == &#39;mousedown&#39; &#38;&#38; type == &#39;mouseup&#39;) &#123;&#10;            type = &#39;click&#39;;&#10;            simulatedEvent = document.createEvent(&#34;MouseEvent&#34;);&#10;            simulatedEvent.initMouseEvent(type, true, true, window, 1,&#10;              first.screenX,&#10;              first.screenY,&#10;              first.clientX,&#10;              first.clientY,&#10;              false, false, false, false, 0, e.relatedTarget&#10;            );&#10;            first.target.dispatchEvent(simulatedEvent);&#10;        &#125;&#10;    &#125;,&#10;&#125;,&#10;&#10;/**@&#10; * #Crafty.findClosestEntityByComponent&#10; * @category Input&#10; * &#10; * @sign public this .findClosestEntityByComponent(String comp, Number x, Number y[, Object target])&#10; * Finds closest entity with certain component at given coordinates.&#10; * @param comp - Component name&#10; * @param x - `x` position where to look for entities&#10; * @param y - `y` position where to look for entities&#10; * @param target - Target element wherein to look for entities &#10; * &#10; * This method is used internally by the .mouseDispatch and .touchDispatch methods, but can be used otherwise for &#10; * Canvas entities.&#10; * &#10; * Finds the top most entity (with the highest z) with a given component at a given point (x, y).&#10; * For having a detection area specified for the enity, add the AreaMap component to the entity expected to be found.&#10; * &#10; * The &#39;target&#39; argument is only meant to be used by .mouseDispatch and touchDispatch; defaults to Crafty.stage.elem, &#10; * thus using this function directly is only worth anything for canvas entities.&#10; * &#10; * Returns the found entity, or undefined if no entity was found.&#10; * &#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var coords = { x: 455, y: 267 },
     *     closestText = Crafty.findClosestEntityByComponent("Text", coords.x, coords.y);
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;findClosestEntityByComponent: function (comp, x, y, target) &#123; &#10;    var tar = target ? target : Crafty.stage.elem,&#10;        closest, q, l, i = 0, maxz = -1, dupes = &#123;&#125;;&#10;        &#10;    //if it&#39;s a DOM element with component we are done&#10;    if (tar.nodeName != &#34;CANVAS&#34;) &#123;&#10;        while (typeof (tar.id) != &#39;string&#39; &#38;&#38; tar.id.indexOf(&#39;ent&#39;) == -1) &#123;&#10;            tar = tar.parentNode;&#10;        &#125;&#10;        var ent = Crafty(parseInt(tar.id.replace(&#39;ent&#39;, &#39;&#39;), 10));&#10;        if (ent.__c[comp] &#38;&#38; ent.isAt(x, y))&#123;&#10;            closest = ent;&#10;        &#125;&#10;    &#125;&#10;        //else we search for an entity with component&#10;    if (!closest) &#123;&#10;        q = Crafty.map.search(&#123;&#10;            _x: x,&#10;            _y: y,&#10;            _w: 1,&#10;            _h: 1&#10;        &#125;, false);&#10;&#10;        for (l = q.length; i &#60; l; ++i) &#123;&#10;            &#10;            if (!q[i].__c[comp] || !q[i]._visible)&#123; continue; &#125;&#10;&#10;                var current = q[i],&#10;                    flag = false;&#10;&#10;                //weed out duplicates&#10;                if (dupes[current[0]])&#123;  continue; &#125;&#10;                else dupes[current[0]] = true;&#10;&#10;                if (current.mapArea) &#123;&#10;                    if (current.mapArea.containsPoint(x, y)) &#123;&#10;                        flag = true;&#10;                    &#125;&#10;                &#125; else if (current.isAt(x, y)) flag = true;&#10;&#10;                if (flag &#38;&#38; (current._z &#62;= maxz || maxz === -1)) &#123;&#10;                    //if the Z is the same, select the closest GUID&#10;                    if (current._z === maxz &#38;&#38; current[0] &#60; closest[0]) &#123;&#10;                        continue; &#10;                &#125;&#10;                maxz = current._z;&#10;                closest = current;&#10;            &#125;&#10;        &#125;&#10;    &#125;&#10;        &#10;    return closest;&#10;&#125;,&#10;&#10;/**@&#10; * #Crafty.mouseWheelDispatch&#10; * @category Input&#10; * Mouse wheel event triggered by Crafty.&#10; *&#10; * @trigger MouseWheelScroll - is triggered when mouse is scrolled on stage - &#123; direction: +1 | -1&#125; - Scroll direction (up | down)&#10; *&#10; * Internal method which dispatches mouse wheel events received by Crafty (crafty.stage.elem).&#10; * The mouse wheel events get dispatched to Crafty, as well as all entities.&#10; *&#10; * The native event parameter is passed to the callback.&#10; * You can read more about the native `mousewheel` event (all browsers except Firefox) https://developer.mozilla.org/en-US/docs/Web/Events/mousewheel&#10; * or the native `DOMMouseScroll` event (Firefox only) https://developer.mozilla.org/en-US/docs/Web/Events/DOMMouseScroll .&#10; *&#10; * Note that the wheel delta properties of the event vary in magnitude across browsers, thus it is recommended to check for `.direction` instead.&#10; * The `.direction` equals `+1` if wheel was scrolled up, `-1` if wheel was scrolled down.&#10; * See http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers .&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * Crafty.bind("MouseWheelScroll", function(evt) {
     *     Crafty.viewport.scale(Crafty.viewport._scale * (1 + evt.direction * 0.1));
     * });
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10; mouseWheelDispatch: function(e) &#123;&#10;    e.direction = (e.detail &#60; 0 || e.wheelDelta &#62; 0) ? 1 : -1;&#10;    Crafty.trigger(&#34;MouseWheelScroll&#34;, e);&#10; &#125;,&#10;&#10;/**@&#10; * #KeyboardEvent&#10; * @category Input&#10; * Keyboard Event triggered by Crafty Core&#10; * @trigger KeyDown - is triggered for each entity when the DOM &#39;keydown&#39; event is triggered.&#10; * @trigger KeyUp - is triggered for each entity when the DOM &#39;keyup&#39; event is triggered.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * Crafty.e("2D, DOM, Color")
     *   .attr({x: 100, y: 100, w: 50, h: 50})
     *   .color("red")
     *   .bind('KeyDown', function(e) {
     *     if(e.key == Crafty.keys.LEFT_ARROW) {
     *       this.x = this.x-1;
     *     } else if (e.key == Crafty.keys.RIGHT_ARROW) {
     *       this.x = this.x+1;
     *     } else if (e.key == Crafty.keys.UP_ARROW) {
     *       this.y = this.y-1;
     *     } else if (e.key == Crafty.keys.DOWN_ARROW) {
     *       this.y = this.y+1;
     *     }
     *   });
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     *&#10;     * @see Crafty.keys&#10;     */&#10;&#10;    /**@&#10;     * #Crafty.eventObject&#10;     * @category Input&#10;     *&#10;     * Event Object used in Crafty for cross browser compatibility&#10;     */&#10;&#10;    /**@&#10;     * #.key&#10;     * @comp Crafty.eventObject&#10;     *&#10;     * Unicode of the key pressed&#10;     */&#10;    keyboardDispatch: function (e) &#123;&#10;        // Use a Crafty-standard event object to avoid cross-browser issues&#10;        var original = e,&#10;            evnt = &#123;&#125;,&#10;            props = &#34;char charCode keyCode type shiftKey ctrlKey metaKey timestamp&#34;.split(&#34; &#34;);&#10;        for (var i = props.length; i;) &#123;&#10;            var prop = props[--i];&#10;            evnt[prop] = original[prop];&#10;        &#125;&#10;        evnt.which = original.charCode !== null ? original.charCode : original.keyCode;&#10;        evnt.key = original.keyCode || original.which;&#10;        evnt.originalEvent = original;&#10;        e = evnt;&#10;&#10;        if (e.type === &#34;keydown&#34;) &#123;&#10;            if (Crafty.keydown[e.key] !== true) &#123;&#10;                Crafty.keydown[e.key] = true;&#10;                Crafty.trigger(&#34;KeyDown&#34;, e);&#10;            &#125;&#10;        &#125; else if (e.type === &#34;keyup&#34;) &#123;&#10;            delete Crafty.keydown[e.key];&#10;            Crafty.trigger(&#34;KeyUp&#34;, e);&#10;        &#125;&#10;&#10;        //prevent default actions for all keys except backspace and F1-F12 and except actions in INPUT and TEXTAREA.&#10;        //prevent bubbling up for all keys except backspace and F1-F12.&#10;        //Among others this prevent the arrow keys from scrolling the parent page&#10;        //of an iframe hosting the game&#10;        if (Crafty.selected &#38;&#38; !(e.key == 8 || e.key &#62;= 112 &#38;&#38; e.key &#60;= 135)) &#123;&#10;            if (original.stopPropagation) original.stopPropagation();&#10;            else original.cancelBubble = true;&#10;&#10;            //Don&#39;t prevent default actions if target node is input or textarea.&#10;            if (original.target &#38;&#38; original.target.nodeName !== &#39;INPUT&#39; &#38;&#38; original.target.nodeName !== &#39;TEXTAREA&#39;) &#123;&#10;                if (original.preventDefault) &#123;&#10;                    original.preventDefault();&#10;                &#125; else &#123;&#10;                    original.returnValue = false;&#10;                &#125;&#10;            &#125;&#10;            return false;&#10;        &#125;&#10;    &#125;&#10;&#125;);&#10;&#10;//initialize the input events onload&#10;Crafty._preBind(&#34;Load&#34;, function () &#123;&#10;    Crafty.addEvent(this, &#34;keydown&#34;, Crafty.keyboardDispatch);&#10;    Crafty.addEvent(this, &#34;keyup&#34;, Crafty.keyboardDispatch);&#10;&#10;    Crafty.addEvent(this, Crafty.stage.elem, &#34;mousedown&#34;, Crafty.mouseDispatch);&#10;    Crafty.addEvent(this, Crafty.stage.elem, &#34;mouseup&#34;, Crafty.mouseDispatch);&#10;    Crafty.addEvent(this, document.body, &#34;mouseup&#34;, Crafty.detectBlur);&#10;    Crafty.addEvent(this, window, &#34;blur&#34;, Crafty.resetKeyDown);&#10;    Crafty.addEvent(this, Crafty.stage.elem, &#34;mousemove&#34;, Crafty.mouseDispatch);&#10;    Crafty.addEvent(this, Crafty.stage.elem, &#34;click&#34;, Crafty.mouseDispatch);&#10;    Crafty.addEvent(this, Crafty.stage.elem, &#34;dblclick&#34;, Crafty.mouseDispatch);&#10;&#10;    Crafty.addEvent(this, Crafty.stage.elem, &#34;touchstart&#34;, Crafty.touchDispatch);&#10;    Crafty.addEvent(this, Crafty.stage.elem, &#34;touchmove&#34;, Crafty.touchDispatch);&#10;    Crafty.addEvent(this, Crafty.stage.elem, &#34;touchend&#34;, Crafty.touchDispatch);&#10;    Crafty.addEvent(this, Crafty.stage.elem, &#34;touchcancel&#34;, Crafty.touchDispatch);&#10;    Crafty.addEvent(this, Crafty.stage.elem, &#34;touchleave&#34;, Crafty.touchDispatch);&#10;&#10;    if (Crafty.support.prefix === &#34;Moz&#34;) // mouse wheel event for firefox&#10;        Crafty.addEvent(this, Crafty.stage.elem, &#34;DOMMouseScroll&#34;, Crafty.mouseWheelDispatch);&#10;    else // mouse wheel event for rest of browsers&#10;        Crafty.addEvent(this, Crafty.stage.elem, &#34;mousewheel&#34;, Crafty.mouseWheelDispatch);&#10;&#125;);&#10;&#10;Crafty._preBind(&#34;CraftyStop&#34;, function () &#123;&#10;    Crafty.removeEvent(this, &#34;keydown&#34;, Crafty.keyboardDispatch);&#10;    Crafty.removeEvent(this, &#34;keyup&#34;, Crafty.keyboardDispatch);&#10;&#10;    if (Crafty.stage) &#123;&#10;        Crafty.removeEvent(this, Crafty.stage.elem, &#34;mousedown&#34;, Crafty.mouseDispatch);&#10;        Crafty.removeEvent(this, Crafty.stage.elem, &#34;mouseup&#34;, Crafty.mouseDispatch);&#10;        Crafty.removeEvent(this, Crafty.stage.elem, &#34;mousemove&#34;, Crafty.mouseDispatch);&#10;        Crafty.removeEvent(this, Crafty.stage.elem, &#34;click&#34;, Crafty.mouseDispatch);&#10;        Crafty.removeEvent(this, Crafty.stage.elem, &#34;dblclick&#34;, Crafty.mouseDispatch);&#10;&#10;        Crafty.removeEvent(this, Crafty.stage.elem, &#34;touchstart&#34;, Crafty.touchDispatch);&#10;        Crafty.removeEvent(this, Crafty.stage.elem, &#34;touchmove&#34;, Crafty.touchDispatch);&#10;        Crafty.removeEvent(this, Crafty.stage.elem, &#34;touchend&#34;, Crafty.touchDispatch);&#10;        Crafty.removeEvent(this, Crafty.stage.elem, &#34;touchcancel&#34;, Crafty.touchDispatch);&#10;        Crafty.removeEvent(this, Crafty.stage.elem, &#34;touchleave&#34;, Crafty.touchDispatch);&#10;&#10;        if (Crafty.support.prefix === &#34;Moz&#34;) // mouse wheel event for firefox&#10;            Crafty.removeEvent(this, Crafty.stage.elem, &#34;DOMMouseScroll&#34;, Crafty.mouseWheelDispatch);&#10;        else // mouse wheel event for rest of browsers&#10;            Crafty.removeEvent(this, Crafty.stage.elem, &#34;mousewheel&#34;, Crafty.mouseWheelDispatch);&#10;    &#125;&#10;&#10;    Crafty.removeEvent(this, document.body, &#34;mouseup&#34;, Crafty.detectBlur);&#10;    Crafty.removeEvent(this, window, &#34;blur&#34;, Crafty.resetKeyDown);&#10;&#125;);&#10;&#10;/**@&#10; * #Mouse&#10; * @category Input&#10; *&#10; * Provides the entity with mouse related events&#10; *&#10; * @trigger MouseOver - when the mouse enters - MouseEvent&#10; * @trigger MouseOut - when the mouse leaves - MouseEvent&#10; * @trigger MouseDown - when the mouse button is pressed on - MouseEvent&#10; * @trigger MouseUp - when the mouse button is released on - MouseEvent&#10; * @trigger Click - when the user clicks - MouseEvent&#10; * @trigger DoubleClick - when the user double clicks - MouseEvent&#10; * @trigger MouseMove - when the mouse is over and moves - MouseEvent&#10; *&#10; * If you do not add this component, mouse events will not be triggered on an entity.&#10; *&#10; * You can read more about the MouseEvent, which is the parameter passed to the callback.&#10; * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent&#10; *&#10; * Crafty will add the mouseButton property to MouseEvents that match one of&#10; *&#10; * - Crafty.mouseButtons.LEFT&#10; * - Crafty.mouseButtons.RIGHT&#10; * - Crafty.mouseButtons.MIDDLE&#10; *&#10; * @note If you&#39;re targeting mobile, you should know that by default Crafty turns touch events into mouse events, &#10; * making mouse dependent components work with touch. However, if you need multitouch, you&#39;ll have &#10; * to make use of the Touch component instead, which can break compatibility with things which directly interact with the Mouse component.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

 * var myEntity = Crafty.e('2D, Canvas, Color, Mouse')
 * .attr({x: 10, y: 10, w: 40, h: 40})
 * .color('red')
 * .bind('Click', function(MouseEvent){
 *   alert('clicked', MouseEvent);
 * });
 *
 * myEntity.bind('MouseUp', function(e) {
 *    if( e.mouseButton == Crafty.mouseButtons.RIGHT )
 *        Crafty.log("Clicked right button");
 * })
 * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> * @see Crafty.mouseDispatch&#10; * @see Crafty.multitouch&#10; * @see Crafty.touchDispatch&#10; * @see Crafty.mouseButtons&#10; */&#10;Crafty.c(&#34;Mouse&#34;, &#123;&#10;    init: function () &#123;&#10;        Crafty.mouseObjs++;&#10;        this.requires(&#34;AreaMap&#34;)&#10;            .bind(&#34;Remove&#34;, function () &#123;&#10;                Crafty.mouseObjs--;&#10;            &#125;);&#10;    &#125;&#10;&#125;);&#10;&#10;/**@&#10; * #Touch&#10; * @category Input&#10; * Provides the entity with touch related events&#10; * @trigger TouchStart - when entity is touched - TouchPoint&#10; * @trigger TouchMove - when finger is moved over entity - TouchPoint&#10; * @trigger TouchCancel - when a touch event has been disrupted in some way - TouchPoint&#10; * @trigger TouchEnd - when the finger is raised over the entity, or when finger leaves entity.  (Passes no data) - null&#10; *&#10; * To be able to use multitouch, you must enable it with  `Crafty.multitouch(true)`.&#10; *&#10; * If you don&#39;t need multitouch, you can probably use the Mouse component instead, since by default Crafty will trigger mouse events for touch input.&#10; *&#10; * You can read more about the TouchEvent.&#10; * - [TouchEvent.touches and TouchEvent.changedTouches](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent)&#10; * - [TouchPoint](http://www.w3.org/TR/touch-events/#dfn-active-touch-point) is the parameter passed to the event callback in the related touch.&#10; * &#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

 * Crafty.multitouch(true);
 * 
 * var myEntity = Crafty.e('2D, Canvas, Color, Touch')
 * .attr({x: 10, y: 10, w: 40, h: 40})
 * .color('green')
 * .bind('TouchStart', function(TouchPoint){
 *   Crafty.log('myEntity has been touched', TouchPoint);
 * }).bind('TouchMove', function(TouchPoint) {
 *   Crafty.log('Finger moved over myEntity at the { x: ' + TouchPoint.realX + ', y: ' + TouchPoint.realY + ' } coordinates.');
 * }).bind('TouchEnd', function() {
 *   Crafty.log('Touch over myEntity has finished.');
 * });
 * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> * @see Crafty.multitouch&#10; * @see Crafty.touchDispatch&#10; * @see Crafty.mouseDispatch&#10; * @see Crafty.mouseButtons&#10; */&#10;Crafty.c(&#34;Touch&#34;, &#123;&#10;    init: function () &#123;&#10;        Crafty.touchObjs++;&#10;        this.requires(&#34;AreaMap&#34;)&#10;            .bind(&#34;Remove&#34;, function () &#123;&#10;                Crafty.touchObjs--;&#10;            &#125;);&#10;    &#125;&#10;&#125;);&#10;&#10;/**@&#10; * #AreaMap&#10; * @category Input&#10; * Component used by Mouse and Touch.&#10; * Can be added to other entities for use with the Crafty.findClosestEntityByComponent method.&#10; * &#10; * @see Crafty.mouseDispatch&#10; * @see Crafty.touchDispatch&#10; * @see Crafty.mouseButtons&#10; * @see Crafty.polygon&#10; */&#10;Crafty.c(&#34;AreaMap&#34;, &#123;&#10;    init: function () &#123;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.areaMap&#10;     * @comp AreaMap&#10;     *&#10;     * @trigger NewAreaMap - when a new areaMap is assigned - Crafty.polygon&#10;     *&#10;     * @sign public this .areaMap(Crafty.polygon polygon)&#10;     * @param polygon - Instance of Crafty.polygon used to check if the mouse coordinates are inside this region&#10;     *&#10;     * @sign public this .areaMap(Array coordinatePairs)&#10;     * @param coordinatePairs - Array of `x`, `y` coordinate pairs to generate a polygon&#10;     *&#10;     * @sign public this .areaMap(x1, y1,.., xN, yN)&#10;     * @param point# - List of `x`, `y` coordinate pairs to generate a polygon&#10;     *&#10;     * Assign a polygon to the entity so that pointer (mouse or touch) events will only be triggered if&#10;     * the coordinates are inside the given polygon.&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * Crafty.e("2D, DOM, Color, Mouse")
     *     .color("red")
     *     .attr({ w: 100, h: 100 })
     *     .bind('MouseOver', function() {Crafty.log("over")})
     *     .areaMap(0, 0, 50, 0, 50, 50, 0, 50);
     *
     * Crafty.e("2D, Mouse")
     *     .areaMap([0, 0, 50, 0, 50, 50, 0, 50]);
     *
     * Crafty.e("2D, Mouse").areaMap(
     *     new Crafty.polygon([0, 0, 50, 0, 50, 50, 0, 50])
     * );
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     *&#10;     * @see Crafty.polygon&#10;     */&#10;    areaMap: function (poly) &#123;&#10;        //create polygon&#10;        if (arguments.length &#62; 1) &#123;&#10;            //convert args to array to create polygon&#10;            var args = Array.prototype.slice.call(arguments, 0);&#10;            poly = new Crafty.polygon(args);&#10;        &#125; else if (poly.constructor === Array) &#123;&#10;            poly = new Crafty.polygon(poly.slice());&#10;        &#125; else &#123;&#10;            poly = poly.clone();&#10;        &#125;&#10;&#10;        poly.shift(this._x, this._y);&#10;        this.mapArea = poly;&#10;        this.attach(this.mapArea);&#10;        this.trigger(&#34;NewAreaMap&#34;, poly);&#10;        return this;&#10;    &#125;&#10;&#125;);&#10;&#10;/**@&#10; * #Button&#10; * @category Input&#10; * Provides the entity with touch or mouse functionality, depending on whether this is a pc &#10; * or mobile device, and also on multitouch configuration.&#10; * &#10; * @see Crafty.multitouch&#10; */&#10;Crafty.c(&#34;Button&#34;, &#123;&#10;    init: function () &#123;&#10;        var req = (!Crafty.mobile || (Crafty.mobile &#38;&#38; !Crafty.multitouch())) ? &#34;Mouse&#34; : &#34;Touch&#34;;&#10;        this.requires(req);&#10;    &#125;&#10;&#125;);&#10;&#10;/**@&#10; * #MouseDrag&#10; * @category Input&#10; * Provides the entity with drag and drop mouse events.&#10; * @trigger Dragging - is triggered each frame the entity is being dragged - MouseEvent&#10; * @trigger StartDrag - is triggered when dragging begins - MouseEvent&#10; * @trigger StopDrag - is triggered when dragging ends - MouseEvent&#10; *&#10; * @see Mouse&#10; */&#10;Crafty.c(&#34;MouseDrag&#34;, &#123;&#10;    _dragging: false,&#10;&#10;    //Note: the code is not tested with zoom, etc., that may distort the direction between the viewport and the coordinate on the canvas.&#10;    init: function () &#123;&#10;        this.requires(&#34;Mouse&#34;);&#10;        this.bind(&#34;MouseDown&#34;, this._ondown);&#10;    &#125;,&#10;&#10;    remove: function() &#123;&#10;        this.unbind(&#34;MouseDown&#34;, this._ondown);&#10;    &#125;,&#10;&#10;    // When dragging is enabled, this method is bound to the MouseDown crafty event&#10;    _ondown: function (e) &#123;&#10;        if (e.mouseButton !== Crafty.mouseButtons.LEFT) return;&#10;        this.startDrag(e);&#10;    &#125;,&#10;&#10;    // While a drag is occurring, this method is bound to the mousemove DOM event&#10;    _ondrag: function (e) &#123;&#10;        // ignore invalid 0 position - strange problem on ipad&#10;        if (!this._dragging || e.realX === 0 || e.realY === 0) return false;&#10;        this.trigger(&#34;Dragging&#34;, e);&#10;    &#125;,&#10;&#10;    // While a drag is occurring, this method is bound to mouseup DOM event&#10;    _onup: function (e) &#123;&#10;        if (e.mouseButton !== Crafty.mouseButtons.LEFT) return;&#10;        this.stopDrag(e);&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.startDrag&#10;     * @comp MouseDrag&#10;     * @sign public this .startDrag(void)&#10;     *&#10;     * Make the entity produce drag events, essentially making the entity follow the mouse positions.&#10;     *&#10;     * @see .stopDrag&#10;     */&#10;    startDrag: function (e) &#123;&#10;        if (this._dragging) return;&#10;        this._dragging = true;&#10;&#10;        Crafty.addEvent(this, Crafty.stage.elem, &#34;mousemove&#34;, this._ondrag);&#10;        Crafty.addEvent(this, Crafty.stage.elem, &#34;mouseup&#34;, this._onup);&#10;&#10;        // if event undefined, use the last known position of the mouse&#10;        this.trigger(&#34;StartDrag&#34;, e || Crafty.lastEvent);&#10;        return this;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.stopDrag&#10;     * @comp MouseDrag&#10;     * @sign public this .stopDrag(void)&#10;     *&#10;     * Stop the entity from producing drag events, essentially reproducing the drop.&#10;     *&#10;     * @see .startDrag&#10;     */&#10;    stopDrag: function (e) &#123;&#10;        if (!this._dragging) return;&#10;        this._dragging = false;&#10;&#10;        Crafty.removeEvent(this, Crafty.stage.elem, &#34;mousemove&#34;, this._ondrag);&#10;        Crafty.removeEvent(this, Crafty.stage.elem, &#34;mouseup&#34;, this._onup);&#10;&#10;        // if event undefined, use the last known position of the mouse&#10;        this.trigger(&#34;StopDrag&#34;, e || Crafty.lastEvent);&#10;        return this;&#10;    &#125;&#10;&#125;);&#10;&#10;/**@&#10; * #Keyboard&#10; * @category Input&#10; *&#10; * Give entities keyboard events (`Keydown` and `Keyup`).&#10; *&#10; * In particular, changes to the key state are broadcasted by `KeyboardEvent`s; interested entities can bind to these events.&#10; *&#10; * The current state (pressed/released) of a key can also be queried using the `.isDown` method.&#10; *&#10; * All available key codes are described in `Crafty.keys`.&#10; *&#10; * @see KeyboardEvent&#10; * @see Crafty.keys&#10; */&#10;Crafty.c(&#34;Keyboard&#34;, &#123;&#10;    /**@&#10;     * #.isDown&#10;     * @comp Keyboard&#10;     * @sign public Boolean isDown(String keyName)&#10;     * @param keyName - Name of the key to check. See `Crafty.keys`.&#10;     * @sign public Boolean isDown(Number keyCode)&#10;     * @param keyCode - Key code in `Crafty.keys`.&#10;     *&#10;     * Determine if a certain key is currently down.&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * entity.requires('Keyboard').bind('KeyDown', function () { if (this.isDown('SPACE')) jump(); });
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     *&#10;     * @see Crafty.keys&#10;     */&#10;    isDown: function (key) &#123;&#10;        if (typeof key === &#34;string&#34;) &#123;&#10;            key = Crafty.keys[key];&#10;        &#125;&#10;        return !!Crafty.keydown[key];&#10;    &#125;&#10;&#125;);&#10;&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],5:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;&#10;Crafty.extend(&#123;&#10;    /**@&#10;     * #Crafty.keys&#10;     * @category Input&#10;     * Object of key names and the corresponding key code.&#10;     *&#10;     *</span><br></pre></td></tr></table></figure>

     * BACKSPACE: 8,
     * TAB: 9,
     * ENTER: 13,
     * PAUSE: 19,
     * CAPS: 20,
     * ESC: 27,
     * SPACE: 32,
     * PAGE_UP: 33,
     * PAGE_DOWN: 34,
     * END: 35,
     * HOME: 36,
     * LEFT_ARROW: 37,
     * UP_ARROW: 38,
     * RIGHT_ARROW: 39,
     * DOWN_ARROW: 40,
     * INSERT: 45,
     * DELETE: 46,
     * 0: 48,
     * 1: 49,
     * 2: 50,
     * 3: 51,
     * 4: 52,
     * 5: 53,
     * 6: 54,
     * 7: 55,
     * 8: 56,
     * 9: 57,
     * A: 65,
     * B: 66,
     * C: 67,
     * D: 68,
     * E: 69,
     * F: 70,
     * G: 71,
     * H: 72,
     * I: 73,
     * J: 74,
     * K: 75,
     * L: 76,
     * M: 77,
     * N: 78,
     * O: 79,
     * P: 80,
     * Q: 81,
     * R: 82,
     * S: 83,
     * T: 84,
     * U: 85,
     * V: 86,
     * W: 87,
     * X: 88,
     * Y: 89,
     * Z: 90,
     * NUMPAD_0: 96,
     * NUMPAD_1: 97,
     * NUMPAD_2: 98,
     * NUMPAD_3: 99,
     * NUMPAD_4: 100,
     * NUMPAD_5: 101,
     * NUMPAD_6: 102,
     * NUMPAD_7: 103,
     * NUMPAD_8: 104,
     * NUMPAD_9: 105,
     * MULTIPLY: 106,
     * ADD: 107,
     * SUBSTRACT: 109,
     * DECIMAL: 110,
     * DIVIDE: 111,
     * F1: 112,
     * F2: 113,
     * F3: 114,
     * F4: 115,
     * F5: 116,
     * F6: 117,
     * F7: 118,
     * F8: 119,
     * F9: 120,
     * F10: 121,
     * F11: 122,
     * F12: 123,
     * SHIFT: 16,
     * CTRL: 17,
     * ALT: 18,
     * PLUS: 187,
     * COMMA: 188,
     * MINUS: 189,
     * PERIOD: 190,
     * PULT_UP: 29460,
     * PULT_DOWN: 29461,
     * PULT_LEFT: 4,
     * PULT_RIGHT': 5
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;keys: &#123;&#10;    &#39;BACKSPACE&#39;: 8,&#10;    &#39;TAB&#39;: 9,&#10;    &#39;ENTER&#39;: 13,&#10;    &#39;PAUSE&#39;: 19,&#10;    &#39;CAPS&#39;: 20,&#10;    &#39;ESC&#39;: 27,&#10;    &#39;SPACE&#39;: 32,&#10;    &#39;PAGE_UP&#39;: 33,&#10;    &#39;PAGE_DOWN&#39;: 34,&#10;    &#39;END&#39;: 35,&#10;    &#39;HOME&#39;: 36,&#10;    &#39;LEFT_ARROW&#39;: 37,&#10;    &#39;UP_ARROW&#39;: 38,&#10;    &#39;RIGHT_ARROW&#39;: 39,&#10;    &#39;DOWN_ARROW&#39;: 40,&#10;    &#39;INSERT&#39;: 45,&#10;    &#39;DELETE&#39;: 46,&#10;    &#39;0&#39;: 48,&#10;    &#39;1&#39;: 49,&#10;    &#39;2&#39;: 50,&#10;    &#39;3&#39;: 51,&#10;    &#39;4&#39;: 52,&#10;    &#39;5&#39;: 53,&#10;    &#39;6&#39;: 54,&#10;    &#39;7&#39;: 55,&#10;    &#39;8&#39;: 56,&#10;    &#39;9&#39;: 57,&#10;    &#39;A&#39;: 65,&#10;    &#39;B&#39;: 66,&#10;    &#39;C&#39;: 67,&#10;    &#39;D&#39;: 68,&#10;    &#39;E&#39;: 69,&#10;    &#39;F&#39;: 70,&#10;    &#39;G&#39;: 71,&#10;    &#39;H&#39;: 72,&#10;    &#39;I&#39;: 73,&#10;    &#39;J&#39;: 74,&#10;    &#39;K&#39;: 75,&#10;    &#39;L&#39;: 76,&#10;    &#39;M&#39;: 77,&#10;    &#39;N&#39;: 78,&#10;    &#39;O&#39;: 79,&#10;    &#39;P&#39;: 80,&#10;    &#39;Q&#39;: 81,&#10;    &#39;R&#39;: 82,&#10;    &#39;S&#39;: 83,&#10;    &#39;T&#39;: 84,&#10;    &#39;U&#39;: 85,&#10;    &#39;V&#39;: 86,&#10;    &#39;W&#39;: 87,&#10;    &#39;X&#39;: 88,&#10;    &#39;Y&#39;: 89,&#10;    &#39;Z&#39;: 90,&#10;    &#39;NUMPAD_0&#39;: 96,&#10;    &#39;NUMPAD_1&#39;: 97,&#10;    &#39;NUMPAD_2&#39;: 98,&#10;    &#39;NUMPAD_3&#39;: 99,&#10;    &#39;NUMPAD_4&#39;: 100,&#10;    &#39;NUMPAD_5&#39;: 101,&#10;    &#39;NUMPAD_6&#39;: 102,&#10;    &#39;NUMPAD_7&#39;: 103,&#10;    &#39;NUMPAD_8&#39;: 104,&#10;    &#39;NUMPAD_9&#39;: 105,&#10;    &#39;MULTIPLY&#39;: 106,&#10;    &#39;ADD&#39;: 107,&#10;    &#39;SUBSTRACT&#39;: 109,&#10;    &#39;DECIMAL&#39;: 110,&#10;    &#39;DIVIDE&#39;: 111,&#10;    &#39;F1&#39;: 112,&#10;    &#39;F2&#39;: 113,&#10;    &#39;F3&#39;: 114,&#10;    &#39;F4&#39;: 115,&#10;    &#39;F5&#39;: 116,&#10;    &#39;F6&#39;: 117,&#10;    &#39;F7&#39;: 118,&#10;    &#39;F8&#39;: 119,&#10;    &#39;F9&#39;: 120,&#10;    &#39;F10&#39;: 121,&#10;    &#39;F11&#39;: 122,&#10;    &#39;F12&#39;: 123,&#10;    &#39;SHIFT&#39;: 16,&#10;    &#39;CTRL&#39;: 17,&#10;    &#39;ALT&#39;: 18,&#10;    &#39;PLUS&#39;: 187,&#10;    &#39;COMMA&#39;: 188,&#10;    &#39;MINUS&#39;: 189,&#10;    &#39;PERIOD&#39;: 190,&#10;    &#39;PULT_UP&#39;: 29460,&#10;    &#39;PULT_DOWN&#39;: 29461,&#10;    &#39;PULT_LEFT&#39;: 4,&#10;    &#39;PULT_RIGHT&#39;: 5&#10;&#10;&#125;,&#10;&#10;/**@&#10; * #Crafty.mouseButtons&#10; * @category Input&#10; * An object mapping mouseButton names to the corresponding button ID.&#10; * In all mouseEvents, we add the `e.mouseButton` property with a value normalized to match e.button of modern webkit browsers:&#10; *&#10; *</span><br></pre></td></tr></table></figure>

     * LEFT: 0,
     * MIDDLE: 1,
     * RIGHT: 2
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    mouseButtons: &#123;&#10;        LEFT: 0,&#10;        MIDDLE: 1,&#10;        RIGHT: 2&#10;    &#125;&#10;&#125;);&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],6:[function(require,module,exports)&#123;&#10;/**@&#10; * #Crafty.easing&#10; * @category Animation&#10; * &#10; *&#10; * An object for tracking transitions.  Typically used indirectly through &#34;SpriteAnimation&#34;, &#34;Tween&#34;, or viewport animations.&#10; * &#10; * If a method allows you to specify the type of easing, you can do so by providing a custom function or a string corresponding to the name of a built-in method.&#10; *&#10; * Built-in easing functions are &#34;linear&#34;, &#34;smoothStep&#34;, &#34;smootherStep&#34;, &#34;easeInQuad&#34;, &#34;easeOutQuad&#34;, and &#34;easeInOutQuad&#34;.&#10; *&#10; * A custom function will be passed a parameter `t` which will vary between 0 and 1, and should return the progress of the animation between 0 and 1.&#10; * @example&#10; * Here is how you might use easing functions with the &#34;Tween&#34; component.&#10; * ~</span><br></pre></td></tr></table></figure>

 * var e = Crafty.e("2D, Tween");
 * // Use built-in easing functions
 * e.tween({x:100}, 1000, "smoothStep");
 * e.tween({y:100}, 1000, "easeInQuad");
 * // Define a custom easing function: 2t^2 - t
 * e.tween({w:0}, 1000, function(t){return 2*t*t - t;});
 * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> * @see Tween, SpriteAnimation&#10; */&#10;var easing = function(duration, easingFn) &#123;&#10;&#9;this.timePerFrame = 1000 / Crafty.timer.FPS();&#10;&#9;this.duration = duration;   //default duration given in ms&#10;&#9;if (typeof easingFn === &#34;function&#34;)&#123;&#10;&#9;&#9;this.easing_function = easingFn;&#10;&#9;&#125; else if (typeof easingFn === &#34;string&#34; &#38;&#38; this.standardEasingFunctions[easingFn])&#123;&#10;&#9;&#9;this.easing_function = this.standardEasingFunctions[easingFn];&#10;&#9;&#125; else &#123;&#10;&#9;&#9;this.easing_function = this.standardEasingFunctions.linear;&#10;&#9;&#125;&#10;&#9;this.reset();&#10;&#125;;&#10;&#10;&#10;easing.prototype = &#123;&#10;&#9;duration: 0,&#10;&#9;clock:0,&#10;&#9;steps: null,&#10;&#9;complete: false,&#10;&#9;paused: false,&#10;&#10;&#9;// init values&#10;&#9;reset: function()&#123;&#10;&#9;&#9;this.loops = 1;&#10;&#9;&#9;this.clock = 0;&#10;&#9;&#9;this.complete = false;&#10;&#9;&#9;this.paused = false;&#10;&#9;&#125;,&#10;&#10;&#9;repeat: function(loopCount)&#123;&#10;&#9;&#9;this.loops = loopCount;&#10;&#9;&#125;,&#10;&#10;&#9;setProgress: function(progress, loopCount)&#123;&#10;&#9;&#9;this.clock = this.duration * progress;&#10;&#9;&#9;if (typeof loopCount !== &#34;undefined&#34;)&#10;&#9;&#9;&#9;this.loops = loopCount;&#10;&#10;&#9;&#125;,&#10;&#10;&#9;pause: function()&#123;&#10;&#9;&#9;this.paused = true;&#10;&#9;&#125;,&#10;&#10;&#9;resume: function()&#123;&#10;&#9;&#9;this.paused = false;&#10;&#9;&#9;this.complete = false;&#10;&#9;&#125;,&#10;&#10;&#9;// Increment the clock by some amount dt&#10;&#9;// Handles looping and sets a flag on completion&#10;&#9;tick: function(dt)&#123;&#10;&#9;&#9;if (this.paused || this.complete) return;&#10;&#9;&#9;this.clock += dt;&#10;&#9;&#9;this.frames = Math.floor(this.clock/this.timePerFrame);&#10;&#9;&#9;while (this.clock &#62;= this.duration &#38;&#38; this.complete === false)&#123;&#10;&#9;&#9;&#9;this.loops--;&#10;&#9;&#9;&#9;if (this.loops &#62; 0)&#10;&#9;&#9;&#9;&#9;this.clock -= this.duration;&#10;&#9;&#9;&#9;else&#10;&#9;&#9;&#9;&#9;this.complete = true;&#10;&#9;&#9;&#125;&#10;&#9;&#125;,&#10;&#10;&#9;// same as value for now; with other time value functions would be more useful&#10;&#9;time: function()&#123;&#10;&#9;&#9;return ( Math.min(this.clock/this.duration, 1) );&#10;&#10;&#9;&#125;,&#10;&#10;&#9;// Value is where along the tweening curve we are&#10;&#9;value: function()&#123;&#10;&#9;&#9;return this.easing_function(this.time());&#10;&#9;&#125;,&#10;&#10;&#9;// Easing functions, formulas taken from https://gist.github.com/gre/1650294&#10;&#9;//&#9;and https://en.wikipedia.org/wiki/Smoothstep&#10;&#9;standardEasingFunctions: &#123;&#10;&#9;&#9;// no easing, no acceleration&#10;&#9;&#9;linear: function (t) &#123; return t; &#125;,&#10;&#9;&#9;// smooth step; starts and ends with v=0&#10;&#9;&#9;smoothStep: function(t)&#123; return (3-2*t)*t*t; &#125;,&#10;&#9;&#9;// smootherstep; starts and ends with v, a=0&#10;&#9;&#9;smootherStep: function(t)&#123; return (6*t*t-15*t+10)*t*t*t; &#125;,&#10;&#9;&#9;// quadratic curve; starts with v=0&#10;&#9;&#9;easeInQuad: function (t) &#123; return t*t; &#125;,&#10;&#9;&#9;// quadratic curve; ends with v=0&#10;&#9;&#9;easeOutQuad: function (t) &#123; return t*(2-t); &#125;,&#10;&#9;&#9;// quadratic curve; starts and ends with v=0&#10;&#9;&#9;easeInOutQuad: function (t) &#123; return t&#60;0.5 ? 2*t*t : (4-2*t)*t-1; &#125;&#10;&#9;&#125;&#10;&#125;;&#10;&#10;module.exports = easing;&#10;&#125;,&#123;&#125;],7:[function(require,module,exports)&#123;&#10;var version = require(&#39;./version&#39;);&#10;&#10;/**@&#10; * #Crafty&#10; * @category Core&#10; *&#10; * `Crafty` is both an object, and a function for selecting entities.&#10; * Its many methods and properties are discussed individually.&#10; * Below is the documentation for use as a selector.&#10; *&#10; * @sign public EntitySelection Crafty( String selector)&#10; * @param selector - A string representing which entities to select&#10; *&#10; * @sign public Entity Crafty( Number selector )&#10; * @param selector - An entity&#39;s id&#10; *&#10; * Select a set of or single entities by components or an entity&#39;s ID.&#10; *&#10; * Crafty uses syntax similar to jQuery by having a selector engine to select entities by their components.&#10; *&#10; * If there is more than one match, the return value is an Array-like object listing the ID numbers of each matching entity. If there is exactly one match, the entity itself is returned. If you&#39;re not sure how many matches to expect, check the number of matches via Crafty(...).length. Alternatively, use Crafty(...).each(...), which works in all cases.&#10; *&#10; * @note You can treat an entity as if it was a selection of length 1 -- it implements all the same methods.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

 *    Crafty("MyComponent")
 *    Crafty("Hello 2D Component")
 *    Crafty("Hello, 2D, Component")
 * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">*&#10;* The first selector will return all entities that have the component `MyComponent`. The second will return all entities that have `Hello` and `2D` and `Component` whereas the last will return all entities that have at least one of those components (or).&#10;*&#10;*</span><br></pre></td></tr></table></figure>

 *   Crafty("*")
 * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Passing `*` will select all entities.&#10;*&#10;*</span><br></pre></td></tr></table></figure>

 *   Crafty(1)
 * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> * Passing an integer will select the entity with that `ID`.&#10; *&#10; * To work directly with an array of entities, use the `get()` method on a selection.&#10; * To call a function in the context of each entity, use the `.each()` method.&#10; *&#10; * The event related methods such as `bind` and `trigger` will work on selections of entities.&#10; *&#10; * @see Crafty Core#.get&#10; * @see Crafty Core#.each&#10; */&#10;&#10;var Crafty = function (selector) &#123;&#10;    return new Crafty.fn.init(selector);&#10;&#125;;&#10;    // Internal variables&#10;var GUID, frame, components, entities, handlers, onloads,&#10;slice, rlist, rspace, milliSecPerFrame;&#10;&#10;&#10;components  = &#123;&#125;; // Map of components and their functions&#10;slice       = Array.prototype.slice;&#10;rlist       = /\s*,\s*/;&#10;rspace      = /\s+/;&#10;&#10;var initState = function () &#123;&#10;    GUID        = 1; // GUID for entity IDs&#10;    frame       = 0;&#10;&#10;    entities    = &#123;&#125;; // Map of entities and their data&#10;    handlers    = &#123;&#125;; // Global event handlers&#10;    onloads     = []; // Temporary storage of onload handlers&#10;&#125;;&#10;&#10;initState();&#10;&#10;/**@&#10; * #Crafty Core&#10; * @category Core&#10; * @trigger NewEntityName - After setting new name for entity - String - entity name&#10; * @trigger NewComponent - when a new component is added to the entity - String - Component&#10; * @trigger RemoveComponent - when a component is removed from the entity - String - Component&#10; * @trigger Remove - when the entity is removed by calling .destroy()&#10; *&#10; * A set of methods added to every single entity.&#10; */&#10;Crafty.fn = Crafty.prototype = &#123;&#10;&#10;    init: function (selector) &#123;&#10;        //select entities by component&#10;        if (typeof selector === &#34;string&#34;) &#123;&#10;            var elem = 0, //index elements&#10;                e, //entity forEach&#10;                current,&#10;                and = false, //flags for multiple&#10;                or = false,&#10;                del,&#10;                comps,&#10;                score,&#10;                i, l;&#10;&#10;            if (selector === &#39;*&#39;) &#123;&#10;                i = 0;&#10;                for (e in entities) &#123;&#10;                    // entities is something like &#123;2:entity2, 3:entity3, 11:entity11, ...&#125;&#10;                    // The for...in loop sets e to &#34;2&#34;, &#34;3&#34;, &#34;11&#34;, ... i.e. all&#10;                    // the entity ID numbers. e is a string, so +e converts to number type.&#10;                    this[i] = +e;&#10;                    i++;&#10;                &#125;&#10;                this.length = i;&#10;                // if there&#39;s only one entity, return the actual entity&#10;                if (i === 1) &#123;&#10;                    return entities[this[0]];&#10;                &#125;&#10;                return this;&#10;            &#125;&#10;&#10;            //multiple components OR&#10;            if (selector.indexOf(&#39;,&#39;) !== -1) &#123;&#10;                or = true;&#10;                del = rlist;&#10;                //deal with multiple components AND&#10;            &#125; else if (selector.indexOf(&#39; &#39;) !== -1) &#123;&#10;                and = true;&#10;                del = rspace;&#10;            &#125;&#10;&#10;            //loop over entities&#10;            for (e in entities) &#123;&#10;                if (!entities.hasOwnProperty(e)) continue; //skip&#10;                current = entities[e];&#10;&#10;                if (and || or) &#123; //multiple components&#10;                    comps = selector.split(del);&#10;                    i = 0;&#10;                    l = comps.length;&#10;                    score = 0;&#10;&#10;                    for (; i &#60; l; i++) //loop over components&#10;                        if (current.__c[comps[i]]) score++; //if component exists add to score&#10;&#10;                        //if anded comps and has all OR ored comps and at least 1&#10;                    if (and &#38;&#38; score === l || or &#38;&#38; score &#62; 0) this[elem++] = +e;&#10;&#10;                &#125; else if (current.__c[selector]) this[elem++] = +e; //convert to int&#10;            &#125;&#10;&#10;            //extend all common components&#10;            if (elem &#62; 0 &#38;&#38; !and &#38;&#38; !or) this.extend(components[selector]);&#10;            if (comps &#38;&#38; and)&#10;                for (i = 0; i &#60; l; i++) this.extend(components[comps[i]]);&#10;&#10;            this.length = elem; //length is the last index (already incremented)&#10;&#10;            // if there&#39;s only one entity, return the actual entity&#10;            if (elem === 1) &#123;&#10;                return entities[this[elem - 1]];&#10;            &#125;&#10;&#10;        &#125; else &#123; //Select a specific entity&#10;&#10;            if (!selector) &#123; //nothin passed creates God entity&#10;                selector = 0;&#10;                if (!(selector in entities)) entities[selector] = this;&#10;            &#125;&#10;&#10;            //if not exists, return undefined&#10;            if (!(selector in entities)) &#123;&#10;                this.length = 0;&#10;                return this;&#10;            &#125;&#10;&#10;            this[0] = selector;&#10;            this.length = 1;&#10;&#10;            //update from the cache&#10;            if (!this.__c) this.__c = &#123;&#125;;&#10;            if (!this._callbacks) Crafty._addCallbackMethods(this);&#10;&#10;            //update to the cache if NULL&#10;            if (!entities[selector]) entities[selector] = this;&#10;            return entities[selector]; //return the cached selector&#10;        &#125;&#10;&#10;        Crafty._addCallbackMethods(this);&#10;        return this;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.setName&#10;     * @comp Crafty Core&#10;     * @sign public this .setName(String name)&#10;     * @param name - A human readable name for debugging purposes.&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * this.setName("Player");
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;setName: function (name) &#123;&#10;    var entityName = String(name);&#10;&#10;    this._entityName = entityName;&#10;&#10;    this.trigger(&#34;NewEntityName&#34;, entityName);&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.addComponent&#10; * @comp Crafty Core&#10; * @sign public this .addComponent(String componentList)&#10; * @param componentList - A string of components to add separated by a comma `,`&#10; * @sign public this .addComponent(String Component1[, .., String ComponentN])&#10; * @param Component# - Component ID to add.&#10; *&#10; * Adds a component to the selected entities or entity.&#10; *&#10; * Components are used to extend the functionality of entities.&#10; * This means it will copy properties and assign methods to&#10; * augment the functionality of the entity.&#10; *&#10; * For adding multiple components, you can either pass a string with&#10; * all the component names (separated by commas), or pass each component name as&#10; * an argument.&#10; *&#10; * If the component has a function named `init` it will be called.&#10; *&#10; * If the entity already has the component, the component is skipped (nothing happens).&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * this.addComponent("2D, Canvas");
     * this.addComponent("2D", "Canvas");
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;addComponent: function (id) &#123;&#10;    var comps,&#10;        comp, c = 0;&#10;&#10;    //add multiple arguments&#10;    if (arguments.length === 1 &#38;&#38; id.indexOf(&#39;,&#39;) !== -1) &#123;&#10;        comps = id.split(rlist);&#10;    &#125; else &#123;&#10;        comps = arguments;&#10;    &#125;&#10;&#10;    //extend the components&#10;    for (; c &#60; comps.length; c++) &#123;&#10;        // If component already exists, continue&#10;        if (this.__c[comps[c]] === true) &#123;&#10;            continue;&#10;        &#125;&#10;        this.__c[comps[c]] = true;&#10;        comp = components[comps[c]];&#10;        // Copy all methods of the component&#10;        this.extend(comp);&#10;        // Add any required components&#10;        if (comp &#38;&#38; &#34;required&#34; in comp) &#123;&#10;            this.requires( comp.required );&#10;        &#125;&#10;        // Call constructor function&#10;        if (comp &#38;&#38; &#34;init&#34; in comp) &#123;&#10;            comp.init.call(this);&#10;        &#125;&#10;        // Bind events&#10;        if (comp &#38;&#38; &#34;events&#34; in comp)&#123;&#10;            var auto = comp.events;&#10;            for (var eventName in auto)&#123;&#10;                var fn = typeof auto[eventName] === &#34;function&#34; ? auto[eventName] : comp[auto[eventName]];&#10;                this.bind(eventName, fn);&#10;            &#125;&#10;        &#125;&#10;    &#125;&#10;&#10;    this.trigger(&#34;NewComponent&#34;, comps);&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.toggleComponent&#10; * @comp Crafty Core&#10; * @sign public this .toggleComponent(String ComponentList)&#10; * @param ComponentList - A string of components to add or remove separated by a comma `,`&#10; * @sign public this .toggleComponent(String Component1[, .., String componentN])&#10; * @param Component# - Component ID to add or remove.&#10; * &#10; * Add or Remove Components from an entity.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var e = Crafty.e("2D,DOM,Test");
     * e.toggleComponent("Test,Test2"); //Remove Test, add Test2
     * e.toggleComponent("Test,Test2"); //Add Test, remove Test2
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">*&#10;*</span><br></pre></td></tr></table></figure>

     * var e = Crafty.e("2D,DOM,Test");
     * e.toggleComponent("Test","Test2"); //Remove Test, add Test2
     * e.toggleComponent("Test","Test2"); //Add Test, remove Test2
     * e.toggleComponent("Test");         //Remove Test
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;toggleComponent: function (toggle) &#123;&#10;    var i = 0,&#10;        l, comps;&#10;    if (arguments.length &#62; 1) &#123;&#10;        l = arguments.length;&#10;&#10;        for (; i &#60; l; i++) &#123;&#10;            if (this.has(arguments[i])) &#123;&#10;                this.removeComponent(arguments[i]);&#10;            &#125; else &#123;&#10;                this.addComponent(arguments[i]);&#10;            &#125;&#10;        &#125;&#10;        //split components if contains comma&#10;    &#125; else if (toggle.indexOf(&#39;,&#39;) !== -1) &#123;&#10;        comps = toggle.split(rlist);&#10;        l = comps.length;&#10;        for (; i &#60; l; i++) &#123;&#10;            if (this.has(comps[i])) &#123;&#10;                this.removeComponent(comps[i]);&#10;            &#125; else &#123;&#10;                this.addComponent(comps[i]);&#10;            &#125;&#10;        &#125;&#10;&#10;        //single component passed&#10;    &#125; else &#123;&#10;        if (this.has(toggle)) &#123;&#10;            this.removeComponent(toggle);&#10;        &#125; else &#123;&#10;            this.addComponent(toggle);&#10;        &#125;&#10;    &#125;&#10;&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.requires&#10; * @comp Crafty Core&#10; * @sign public this .requires(String componentList)&#10; * @param componentList - List of components that must be added&#10; *&#10; * Makes sure the entity has the components listed. If the entity does not&#10; * have the component, it will add it.&#10; *&#10; * (In the current version of Crafty, this function behaves exactly the same&#10; * as `addComponent`. By convention, developers have used `requires` for&#10; * component dependencies -- i.e. to indicate specifically that one component&#10; * will only work properly if another component is present -- and used&#10; * `addComponent` in all other situations.)&#10; *&#10; * @see .addComponent&#10; */&#10;requires: function (list) &#123;&#10;    return this.addComponent(list);&#10;&#125;,&#10;&#10;/**@&#10; * #.removeComponent&#10; * @comp Crafty Core&#10; * @sign public this .removeComponent(String Component[, soft])&#10; * @param component - Component to remove&#10; * @param soft - Whether to soft remove it (defaults to `true`)&#10; *&#10; * Removes a component from an entity. A soft remove (the default) will only&#10; * refrain `.has()` from returning true. Hard will remove all&#10; * associated properties and methods.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var e = Crafty.e("2D,DOM,Test");
     * e.removeComponent("Test");        //Soft remove Test component
     * e.removeComponent("Test", false); //Hard remove Test component
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;removeComponent: function (id, soft) &#123;&#10;    var comp = components[id];&#10;    this.trigger(&#34;RemoveComponent&#34;, id);&#10;    if (comp &#38;&#38; &#34;events&#34; in comp)&#123;&#10;        var auto = comp.events;&#10;        for (var eventName in auto)&#123;&#10;            var fn = typeof auto[eventName] === &#34;function&#34; ? auto[eventName] : comp[auto[eventName]];&#10;            this.unbind(eventName, fn);&#10;        &#125;&#10;    &#125;&#10;    if (comp &#38;&#38; &#34;remove&#34; in comp) &#123;&#10;        comp.remove.call(this, false);&#10;    &#125;&#10;    if (soft === false &#38;&#38; comp) &#123;&#10;        for (var prop in comp) &#123;&#10;            delete this[prop];&#10;        &#125;&#10;    &#125;&#10;    delete this.__c[id];&#10;&#10;&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.getId&#10; * @comp Crafty Core&#10; * @sign public Number .getId(void)&#10; * @returns the ID of this entity.&#10; *&#10; * For better performance, simply use the this[0] property.&#10; *&#10; * @example&#10; * Finding out the `ID` of an entity can be done by returning the property `0`.&#10; *</span><br></pre></td></tr></table></figure>

     *    var ent = Crafty.e("2D");
     *    ent[0]; //ID
     *    ent.getId(); //also ID
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;getId: function () &#123;&#10;    return this[0];&#10;&#125;,&#10;&#10;/**@&#10; * #.has&#10; * @comp Crafty Core&#10; * @sign public Boolean .has(String component)&#10; * @param component - The name of the component to check&#10; * @returns `true` or `false` depending on if the&#10; * entity has the given component.&#10; *&#10; * For better performance, simply use the `.__c` object&#10; * which will be `true` if the entity has the component or&#10; * will not exist (or be `false`).&#10; */&#10;has: function (id) &#123;&#10;    return !!this.__c[id];&#10;&#125;,&#10;&#10;/**@&#10; * #.attr&#10; * @comp Crafty Core&#10; * @trigger Change - when properties change - &#123;key: value&#125;&#10; *&#10; * @sign public this .attr(String property, Any value[, Boolean silent[, Boolean recursive]])&#10; * @param property - Property of the entity to modify&#10; * @param value - Value to set the property to&#10; * @param silent - If you would like to supress events&#10; * @param recursive - If you would like merge recursively&#10; *&#10; * Use this method to set any property of the entity.&#10; *&#10; * @sign public this .attr(Object map[, Boolean silent[, Boolean recursive]])&#10; * @param map - Object where each key is the property to modify and the value as the property value&#10; * @param silent - If you would like to supress events&#10; * @param recursive - If you would like merge recursively&#10; *&#10; * Use this method to set multiple properties of the entity.&#10; *&#10; * Setter options:&#10; * - `silent`: If you want to prevent it from firing events.&#10; * - `recursive`: If you pass in an object you could overwrite sibling keys, this recursively merges instead of just merging it. This is `false` by default, unless you are using dot notation `name.first`.&#10; *&#10; * @sign public Any .attr(String property)&#10; * @param property - Property of the entity to modify&#10; * @returns Value - the value of the property&#10; *&#10; * Use this method to get any property of the entity. You can also retrieve the property using `this.property`.&#10; * &#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * this.attr({key: "value", prop: 5});
     * this.attr("key"); // returns "value"
     * this.attr("prop"); // returns 5
     * this.key; // "value"
     * this.prop; // 5
     *
     * this.attr("key", "newvalue");
     * this.attr("key"); // returns "newvalue"
     * this.key; // "newvalue"
     *
     * this.attr("parent.child", "newvalue");
     * this.parent; // {child: "newvalue"};
     * this.attr('parent.child'); // "newvalue"
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;attr: function (key, value, silent, recursive) &#123;&#10;    if (arguments.length === 1 &#38;&#38; typeof arguments[0] === &#39;string&#39;) &#123;&#10;        return this._attr_get(key);&#10;    &#125; else &#123;&#10;        return this._attr_set(key, value, silent, recursive);&#10;    &#125;&#10;&#125;,&#10;&#10;/**&#10; * Internal getter method for data on the entity. Called by `.attr`.&#10; *&#10; * example&#10; *</span><br></pre></td></tr></table></figure>

     * person._attr_get('name'); // Foxxy
     * person._attr_get('contact'); // {email: 'fox_at_example.com'}
     * person._attr_get('contact.email'); // fox_at_example.com
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;_attr_get: function(key, context) &#123;&#10;    var first, keys, subkey;&#10;    if (typeof context === &#34;undefined&#34; || context === null) &#123;&#10;        context = this;&#10;    &#125;&#10;    if (key.indexOf(&#39;.&#39;) &#62; -1) &#123;&#10;        keys = key.split(&#39;.&#39;);&#10;        first = keys.shift();&#10;        subkey = keys.join(&#39;.&#39;);&#10;        return this._attr_get(keys.join(&#39;.&#39;), context[first]);&#10;    &#125; else &#123;&#10;        return context[key];&#10;    &#125;&#10;&#125;,&#10;&#10;/**&#10; * Internal setter method for attributes on the component. Called by `.attr`.&#10; *&#10; * Options:&#10; *&#10; * `silent`: If you want to prevent it from firing events.&#10; *&#10; * `recursive`: If you pass in an object you could overwrite&#10; * sibling keys, this recursively merges instead of just&#10; * merging it. This is `false` by default, unless you are&#10; * using dot notation `name.first`.&#10; *&#10; * example&#10; *</span><br></pre></td></tr></table></figure>

     * person._attr_set('name', 'Foxxy', true);
     * person._attr_set('name', 'Foxxy');
     * person._attr_set({name: 'Foxxy'}, true);
     * person._attr_set({name: 'Foxxy'});
     * person._attr_set('name.first', 'Foxxy');
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;_attr_set: function() &#123;&#10;    var data, silent, recursive;&#10;    if (typeof arguments[0] === &#39;string&#39;) &#123;&#10;        data = this._set_create_object(arguments[0], arguments[1]);&#10;        silent = !!arguments[2];&#10;        recursive = arguments[3] || arguments[0].indexOf(&#39;.&#39;) &#62; -1;&#10;    &#125; else &#123;&#10;        data = arguments[0];&#10;        silent = !!arguments[1];&#10;        recursive = !!arguments[2];&#10;    &#125;&#10;&#10;    if (!silent) &#123;&#10;        this.trigger(&#39;Change&#39;, data);&#10;    &#125;&#10;&#10;    if (recursive) &#123;&#10;        this._recursive_extend(data, this);&#10;    &#125; else &#123;&#10;        this.extend.call(this, data);&#10;    &#125;&#10;    return this;&#10;&#125;,&#10;&#10;/**&#10; * If you are setting a key of &#39;foo.bar&#39; or &#39;bar&#39;, this creates&#10; * the appropriate object for you to recursively merge with the&#10; * current attributes.&#10; */&#10;_set_create_object: function(key, value) &#123;&#10;    var data = &#123;&#125;, keys, first, subkey;&#10;    if (key.indexOf(&#39;.&#39;) &#62; -1) &#123;&#10;        keys = key.split(&#39;.&#39;);&#10;        first = keys.shift();&#10;        subkey = keys.join(&#39;.&#39;);&#10;        data[first] = this._set_create_object(subkey, value);&#10;    &#125; else &#123;&#10;        data[key] = value;&#10;    &#125;&#10;    return data;&#10;&#125;,&#10;&#10;/**&#10; * Recursively puts `new_data` into `original_data`.&#10; */&#10;_recursive_extend: function(new_data, original_data) &#123;&#10;    var key;&#10;    for (key in new_data) &#123;&#10;        if (new_data[key].constructor === Object) &#123;&#10;            original_data[key] = this._recursive_extend(new_data[key], original_data[key]);&#10;        &#125; else &#123;&#10;            original_data[key] = new_data[key];&#10;        &#125;&#10;    &#125;&#10;    return original_data;&#10;&#125;,&#10;&#10;/**@&#10; * #.toArray&#10; * @comp Crafty Core&#10; * @sign public this .toArray(void)&#10; *&#10; * This method will simply return the found entities as an array of ids.  To get an array of the actual entities, use `get()`.&#10; * @see .get&#10; */&#10;toArray: function () &#123;&#10;    return slice.call(this, 0);&#10;&#125;,&#10;&#10;/**@&#10;* #.timeout&#10;* @comp Crafty Core&#10;* @sign public this .timeout(Function callback, Number delay)&#10;* @param callback - Method to execute after given amount of milliseconds&#10;* @param delay - Amount of milliseconds to execute the method&#10;*&#10;* The delay method will execute a function after a given amount of time in milliseconds.&#10;*&#10;* Essentially a wrapper for `setTimeout`.&#10;*&#10;* @example&#10;* Destroy itself after 100 milliseconds&#10;*</span><br></pre></td></tr></table></figure>

    * this.timeout(function() {
         this.destroy();
    * }, 100);
    * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">*/&#10;timeout: function (callback, duration) &#123;&#10;    this.each(function () &#123;&#10;        var self = this;&#10;        setTimeout(function () &#123;&#10;            callback.call(self);&#10;        &#125;, duration);&#10;    &#125;);&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.bind&#10; * @comp Crafty Core&#10; * @sign public this .bind(String eventName, Function callback)&#10; * @param eventName - Name of the event to bind to&#10; * @param callback - Method to execute when the event is triggered&#10; *&#10; * Attach the current entity (or entities) to listen for an event.&#10; *&#10; * Callback will be invoked when an event with the event name passed&#10; * is triggered. Depending on the event, some data may be passed&#10; * via an argument to the callback function.&#10; *&#10; * The first argument is the event name (can be anything) whilst the&#10; * second argument is the callback. If the event has data, the&#10; * callback should have an argument.&#10; *&#10; * Events are arbitrary and provide communication between components.&#10; * You can trigger or bind an event even if it doesn&#39;t exist yet.&#10; *&#10; * Unlike DOM events, Crafty events are executed synchronously.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * this.attr("triggers", 0); //set a trigger count
     * this.bind("myevent", function() {
     *     this.triggers++; //whenever myevent is triggered, increment
     * });
     * this.bind("EnterFrame", function() {
     *     this.trigger("myevent"); //trigger myevent on every frame
     * });
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; * @see .trigger, .unbind&#10; */&#10;bind: function (event, callback) &#123;&#10;    //  To learn how the event system functions, see the comments for Crafty._callbackMethods&#10;    //optimization for 1 entity&#10;    if (this.length === 1) &#123;&#10;        this._bindCallback(event, callback);&#10;    &#125; else &#123;&#10;        for (var i = 0; i &#60; this.length; i++) &#123;&#10;            var e = entities[this[i]];&#10;            if (e) &#123;&#10;                e._bindCallback(event, callback);&#10;            &#125;&#10;        &#125;&#10;    &#125;&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.uniqueBind&#10; * @comp Crafty Core&#10; * @sign public Number .uniqueBind(String eventName, Function callback)&#10; * @param eventName - Name of the event to bind to&#10; * @param callback - Method to execute upon event triggered&#10; * @returns ID of the current callback used to unbind&#10; *&#10; * Works like Crafty.bind, but prevents a callback from being bound multiple times.&#10; *&#10; * @see .bind&#10; */&#10;uniqueBind: function (event, callback) &#123;&#10;    this.unbind(event, callback);&#10;    this.bind(event, callback);&#10;&#10;&#125;,&#10;&#10;/**@&#10; * #.one&#10; * @comp Crafty Core&#10; * @sign public Number one(String eventName, Function callback)&#10; * @param eventName - Name of the event to bind to&#10; * @param callback - Method to execute upon event triggered&#10; * @returns ID of the current callback used to unbind&#10; *&#10; * Works like Crafty.bind, but will be unbound once the event triggers.&#10; *&#10; * @see .bind&#10; */&#10;one: function (event, callback) &#123;&#10;    var self = this;&#10;    var oneHandler = function (data) &#123;&#10;        callback.call(self, data);&#10;        self.unbind(event, oneHandler);&#10;    &#125;;&#10;    return self.bind(event, oneHandler);&#10;&#10;&#125;,&#10;&#10;/**@&#10; * #.unbind&#10; * @comp Crafty Core&#10; * @sign public this .unbind(String eventName[, Function callback])&#10; * @param eventName - Name of the event to unbind&#10; * @param callback - Function to unbind&#10; *&#10; * Removes binding with an event from current entity.&#10; *&#10; * Passing an event name will remove all events bound to&#10; * that event. Passing a reference to the callback will&#10; * unbind only that callback.&#10; * @see .bind, .trigger&#10; */&#10;unbind: function (event, callback) &#123;&#10;    //  To learn how the event system functions, see the comments for Crafty._callbackMethods&#10;    var i, e;&#10;    for (i = 0; i &#60; this.length; i++) &#123;&#10;        e = entities[this[i]];&#10;        if (e) &#123;&#10;            e._unbindCallbacks(event, callback);&#10;        &#125;&#10;    &#125;&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.trigger&#10; * @comp Crafty Core&#10; * @sign public this .trigger(String eventName[, Object data])&#10; * @param eventName - Event to trigger&#10; * @param data - Arbitrary data that will be passed into every callback as an argument&#10; *&#10; * Trigger an event with arbitrary data. Will invoke all callbacks with&#10; * the context (value of `this`) of the current entity object.&#10; *&#10; * *Note: This will only execute callbacks within the current entity, no other entity.*&#10; *&#10; * The first argument is the event name to trigger and the optional&#10; * second argument is the arbitrary event data. This can be absolutely anything.&#10; *&#10; * Unlike DOM events, Crafty events are exectued synchronously.&#10; */&#10;trigger: function (event, data) &#123;&#10;    //  To learn how the event system functions, see the comments for Crafty._callbackMethods&#10;    if (this.length === 1) &#123;&#10;        //find the handlers assigned to the entity&#10;        this._runCallbacks(event, data);&#10;     &#125; else &#123;&#10;        for (var i = 0; i &#60; this.length; i++) &#123;&#10;            var e = entities[this[i]];&#10;            if (e) &#123;&#10;                e._runCallbacks(event, data);&#10;            &#125;&#10;        &#125;&#10;    &#125;&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.each&#10; * @comp Crafty Core&#10; * @sign public this .each(Function method)&#10; * @param method - Method to call on each iteration&#10; *&#10; * Iterates over found entities, calling a function for every entity.&#10; *&#10; * The function will be called for every entity and will pass the index&#10; * in the iteration as an argument. The context (value of `this`) of the&#10; * function will be the current entity in the iteration.&#10; *&#10; * @example&#10; * Destroy every second 2D entity&#10; *</span><br></pre></td></tr></table></figure>

     * Crafty("2D").each(function(i) {
     *     if(i % 2 === 0) {
     *         this.destroy();
     *     }
     * });
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;each: function (func) &#123;&#10;    var i = 0,&#10;        l = this.length;&#10;    for (; i &#60; l; i++) &#123;&#10;        //skip if not exists&#10;        if (!entities[this[i]]) continue;&#10;        func.call(entities[this[i]], i);&#10;    &#125;&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.get&#10; * @comp Crafty Core&#10; * @sign public Array .get()&#10; * @returns An array of entities corresponding to the active selector&#10; *&#10; * @sign public Entity .get(Number index)&#10; * @returns an entity belonging to the current selection&#10; * @param index - The index of the entity to return.  If negative, counts back from the end of the array.&#10; *&#10; *&#10; * @example&#10; * Get an array containing every &#34;2D&#34; entity&#10; *</span><br></pre></td></tr></table></figure>

     * var arr = Crafty("2D").get()
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Get the first entity matching the selector&#10;*</span><br></pre></td></tr></table></figure>

     * // equivalent to Crafty("2D").get()[0], but doesn't create a new array
     * var e = Crafty("2D").get(0)
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Get the last &#34;2D&#34; entity matching the selector&#10;*</span><br></pre></td></tr></table></figure>

     * var e = Crafty("2D").get(-1)
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; */&#10;get: function(index) &#123;&#10;    var l = this.length;&#10;    if (typeof index !== &#34;undefined&#34;) &#123;&#10;        if (index &#62;= l || index+l &#60; 0)&#10;            return undefined;&#10;        if (index&#62;=0)&#10;            return entities[this[index]];&#10;        else&#10;            return entities[this[index+l]];&#10;    &#125; else &#123;&#10;        var i=0, result = [];&#10;        for (; i &#60; l; i++) &#123;&#10;            //skip if not exists&#10;            if (!entities[this[i]]) continue;&#10;            result.push( entities[this[i]] );&#10;        &#125;&#10;        return result;&#10;    &#125;&#10;&#125;,&#10;&#10;/**@&#10; * #.clone&#10; * @comp Crafty Core&#10; * @sign public Entity .clone(void)&#10; * @returns Cloned entity of the current entity&#10; *&#10; * Method will create another entity with the exact same&#10; * properties, components and methods as the current entity.&#10; */&#10;clone: function () &#123;&#10;    var comps = this.__c,&#10;        comp,&#10;        prop,&#10;        clone = Crafty.e();&#10;&#10;    for (comp in comps) &#123;&#10;        clone.addComponent(comp);&#10;    &#125;&#10;    for (prop in this) &#123;&#10;        if (prop != &#34;0&#34; &#38;&#38; prop != &#34;_global&#34; &#38;&#38; prop != &#34;_changed&#34; &#38;&#38; typeof this[prop] != &#34;function&#34; &#38;&#38; typeof this[prop] != &#34;object&#34;) &#123;&#10;            clone[prop] = this[prop];&#10;        &#125;&#10;    &#125;&#10;&#10;    return clone;&#10;&#125;,&#10;&#10;&#10;/**@&#10; * #.setter&#10; * @comp Crafty Core&#10; * @sign public this .setter(String property, Function callback)&#10; * @param property - Property to watch for modification&#10; * @param callback - Method to execute if the property is modified&#10; *&#10; * Will watch a property waiting for modification and will then invoke the&#10; * given callback when attempting to modify.&#10; *&#10; * This feature is deprecated; use .defineField() instead.&#10; * @see .defineField&#10; */&#10;setter: function (prop, callback) &#123;&#10;    return this.defineField(prop, function()&#123;&#125;, callback);&#10;&#125;,&#10;&#10;/**@&#10; * #.defineField&#10; * @comp Crafty Core&#10; * @sign public this .defineField(String property, Function getCallback, Function setCallback)&#10; * @param property - Property name to assign getter &#38; setter to&#10; * @param getCallback - Method to execute if the property is accessed&#10; * @param setCallback - Method to execute if the property is mutated&#10; *&#10; * Assigns getters and setters to the property. &#10; * A getter will watch a property waiting for access and will then invoke the&#10; * given getCallback when attempting to retrieve.&#10; * A setter will watch a property waiting for mutation and will then invoke the&#10; * given setCallback when attempting to modify.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var ent = Crafty.e("2D");
     * ent.defineField("customData", function() { 
     *    return this._customData; 
     * }, function(newValue) { 
     *    this._customData = newValue;
     * });
     *
     * ent.customData = "2" // set customData to 2
     * Crafty.log(ent.customData) // prints 2
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    defineField: function (prop, getCallback, setCallback) &#123;&#10;        Crafty.defineField(this, prop, getCallback, setCallback);&#10;        return this;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.destroy&#10;     * @comp Crafty Core&#10;     * @sign public this .destroy(void)&#10;     * Will remove all event listeners and delete all properties as well as removing from the stage&#10;     */&#10;    destroy: function () &#123;&#10;        //remove all event handlers, delete from entities&#10;        this.each(function () &#123;&#10;            var comp;&#10;            this.trigger(&#34;Remove&#34;);&#10;            for (var compName in this.__c) &#123;&#10;                comp = components[compName];&#10;                if (comp &#38;&#38; &#34;remove&#34; in comp)&#10;                    comp.remove.call(this, true);&#10;            &#125;&#10;            this._unbindAll();&#10;            delete entities[this[0]];&#10;        &#125;);&#10;    &#125;&#10;&#125;;&#10;&#10;//give the init instances the Crafty prototype&#10;Crafty.fn.init.prototype = Crafty.fn;&#10;&#10;&#10;/**@&#10; * #Crafty.extend&#10; * @category Core&#10; * @sign public this Crafty.extend(Object obj)&#10; * @param obj - An object whose fields will be copied onto Crafty.  This is a shallow copy.&#10; *&#10; * Used to extend the Crafty namespace by passing in an object of properties and methods to add.&#10; *&#10; * @example&#10; * ~~~ * &#10; * Crafty.extend(&#123;&#10; *   isArray: function(arg)&#123;&#10; *     return Object.prototype.toString.call(arg) === &#39;[object Array]&#39;&#10; *   &#125;&#10; * &#125;);&#10; * &#10; * Crafty.isArray([4, 5, 6]);  // returns true&#10; * Crafty.isArray(&#39;hi&#39;);       // returns false&#10; *</span><br></pre></td></tr></table></figure>

 */
Crafty.extend = Crafty.fn.extend = function (obj) {
    var target = this,
        key;

    //don't bother with nulls
    if (!obj) return target;

    for (key in obj) {
        if (target === obj[key]) continue; //handle circular reference
        target[key] = obj[key];
    }

    return target;
};




// How Crafty handles events and callbacks
// -----------------------------------------
// Callbacks are stored in the global object `handlers`, which has properties for each event.  
// These properties point to an object which has a property for each entity listening to the event.
// These in turn are arrays containing the callbacks to be triggered.
// 
// Here is an example of what "handlers" can look like:
//     handlers ===
//         { Move:  {5:[fnA], 6:[fnB, fnC], global:[fnD]},
//         Change: {6:[fnE]}
//         }
// In this example, when the 'Move' event is triggered on entity #6 (e.g.
// entity6.trigger('Move')), it causes the execution of fnB() and fnC(). When
// the Move event is triggered globally (i.e. Crafty.trigger('Move')), it
// will execute fnA, fnB, fnC, fnD.
//
// In this example, "this" is bound to entity #6 whenever fnB() is executed, and
// "this" is bound to Crafty whenever fnD() is executed.
//
// In other words, the structure of "handlers" is:
//
//     handlers[event][objID] === (Array of callback functions)
//
// In addition to the global object, each object participating in the event system has a `_callbacks` property 
// which lists the events that object is listening to.  It allows access to the object's callbacks like this:
//     obj._callbacks[event] === (Array of callback functions)
//
// Objects, which can listen to events (or collections of such objects) have varying logic 
// on how the events are bound/triggered/unbound.  Since the underlying operations on the callback array are the same,
// the single-object operations are implemented in the following object.  
// Calling `Crafty._addCallbackMethods(obj)` on an object will extend that object with these methods.


 
Crafty._callbackMethods = {
    // Add a function to the list of callbacks for an event
    _bindCallback: function(event, fn) {
        // Get handle to event, creating it if necessary
        var callbacks = this._callbacks[event];
        if (!callbacks) {
            callbacks = this._callbacks[event] = ( handlers[event] || ( handlers[event] = {} ) )[this[0]] = [];
            callbacks.context = this;
            callbacks.depth = 0;
        }
        // Push to callback array
        callbacks.push(fn);
    },

    // Process for running all callbacks for the given event
    _runCallbacks: function(event, data) {
        if (!this._callbacks[event]) {
            return;
        }
        var callbacks = this._callbacks[event];

        // Callback loop; deletes dead callbacks, but only when it is safe to do so
        var i, l = callbacks.length;
        // callbacks.depth tracks whether this function was invoked in the middle of a previous iteration through the same callback array
        callbacks.depth++;
        for (i = 0; i < l; i++) {
            if (typeof callbacks[i] === "undefined") {
                if (callbacks.depth <= 1)="" {="" callbacks.splice(i,="" 1);="" i--;="" l--;="" delete="" callbacks="" object="" if="" there="" are="" no="" remaining="" bound="" events="" (callbacks.length="==" 0)="" this._callbacks[event];="" handlers[event][this[0]];="" }="" else="" callbacks[i].call(this,="" data);="" callbacks.depth--;="" },="" unbind="" for="" the="" given="" event="" fn="" is="" specified,="" only="" it="" will="" be="" removed;="" otherwise="" all="" _unbindcallbacks:="" function(event,="" fn)="" (!this._callbacks[event])="" return;="" var="" iterate="" through="" and="" callback="" functions="" that="" match="" they="" spliced="" out="" when="" _runcallbacks="" invoked,="" not="" here="" (this="" function="" might="" called="" in="" middle="" of="" a="" callback,="" which="" complicates="" logic)="" (var="" i="0;" <="" callbacks.length;="" i++)="" (!fn="" ||="" callbacks[i]="=" callbacks[i];="" completely="" every="" event,="" such="" as="" on="" destruction="" _unbindall:="" function()="" (!this._callbacks)="" this._callbacks)="" (this._callbacks[event])="" remove="" normal="" way,="" case="" we've="" got="" nested="" loop this._unbindcallbacks(event);="" also="" registered="" from="" handlers="" };="" helper="" to="" add="" methods="" above="" an="" object,="" well="" initializing="" provies="" "low="" level"="" operations;="" bind,="" unbind,="" trigger="" still="" need="" implemented="" crafty._addcallbackmethods="function(context)" context.extend(crafty._callbackmethods);="" context._callbacks="{};" crafty._addcallbackmethods(crafty);="" crafty.extend({="" define="" crafty's="" id="" 0:="" "global",="" **@="" *="" #crafty.init="" @category="" core="" @trigger="" load="" -="" just="" after="" viewport="" initialised.="" before="" enterframe="" loops="" started="" @sign="" public="" this="" crafty.init([number="" width,="" number="" height,="" string="" stage_elem])="" htmlelement="" @param="" width="" stage="" height="" or="" stage_elem="" element="" use="" sets="" stage,="" creating="" necessary.="" by="" default div="" with="" 'cr-stage'="" used,="" but="" 'stage_elem'="" argument="" provided="" used="" instead.="" (see="" `crafty.viewport.init`)="" starts="" `enterframe`="" interval.="" call="" frame.="" can="" pass="" values="" window="" size.="" `load`="" executed.="" uses="" `requestanimationframe`="" sync="" drawing="" browser="" `setinterval`="" does="" support="" it.="" @see="" crafty.stop,="" crafty.viewport="" init:="" (w,="" h,="" stage_elem)="" necessary,="" attach="" any="" crafty="" (!this._prebinddone)="" for(var="" this._bindoninit.length;="" prebind="this._bindOnInit[i];" crafty.bind(prebind.event,="" prebind.handler);="" crafty.viewport.init(w,="" stage_elem);="" arbitrary="" attached="" onload="" this.trigger("load");="" this.timer.init();="" return="" this;="" some="" it's="" restarted,="" so="" store="" them="" switching="" internals="" new="" system="" idiom="" should="" allow="" removing="" hack="" _bindoninit:="" [],="" _prebinddone:="" false,="" _prebind:="" handler)="" this._bindoninit.push({="" event:="" handler:="" handler="" });="" #crafty.getversion="" crafty.getversion()="" @returns="" current="" version="" @example="" <figure="" class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Crafty.getVersion(); //&#39;0.5.2&#39;&#10;*</span><br></pre></td></tr></table>

     */
    getVersion: function () {
        return version;
    },

    /**@
     * #Crafty.stop
     * @category Core
     * @trigger CraftyStop - when the game is stopped  - {bool clearState}
     * @sign public this Crafty.stop([bool clearState])
     * @param clearState - if true the stage and all game state is cleared.
     *
     * Stops the EnterFrame interval and removes the stage element.
     *
     * To restart, use `Crafty.init()`.
     * @see Crafty.init
     */
    stop: function (clearState) {
        Crafty.trigger("CraftyStop", clearState);

        this.timer.stop();
        if (clearState) {
            // Remove audio
            Crafty.audio.remove();

            // Remove the stage element, and re-add a div with the same id
            if (Crafty.stage && Crafty.stage.elem.parentNode) {
                var newCrStage = document.createElement('div');
                newCrStage.id = Crafty.stage.elem.id;
                Crafty.stage.elem.parentNode.replaceChild(newCrStage, Crafty.stage.elem);
            }

            // Reset references to the now destroyed graphics layers
            delete Crafty.canvasLayer.context;
            delete Crafty.domLayer._div;
            delete Crafty.webgl.context;

            // reset callbacks, and indicate that prebound functions need to be bound on init again
            Crafty._unbindAll();
            Crafty._addCallbackMethods(Crafty);
            this._preBindDone = false;

            initState();
        }
        return this;
    },

    /**@
     * #Crafty.pause
     * @category Core
     * @trigger Pause - when the game is paused
     * @trigger Unpause - when the game is unpaused
     * @sign public this Crafty.pause(void)
     *
     * Pauses the game by stopping the EnterFrame event from firing. If the game is already paused it is unpaused.
     * You can pass a boolean parameter if you want to pause or unpause no matter what the current state is.
     * Modern browsers pauses the game when the page is not visible to the user. If you want the Pause event
     * to be triggered when that happens you can enable autoPause in `Crafty.settings`.
     *
     * @example
     * Have an entity pause the game when it is clicked.
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* button.bind(&#34;click&#34;, function() &#123;&#10;*     Crafty.pause();&#10;* &#125;);&#10;*</span><br></pre></td></tr></table></figure>

     */
    pause: function (toggle) {
        if (arguments.length === 1 ? toggle : !this._paused) {
            this.trigger('Pause');
            this._paused = true;
            setTimeout(function () {
                Crafty.timer.stop();
            }, 0);
            Crafty.keydown = {};
        } else {
            this.trigger('Unpause');
            this._paused = false;
            setTimeout(function () {
                Crafty.timer.init();
            }, 0);
        }
        return this;
    },

    /**@
     * #Crafty.isPaused
     * @category Core
     * @sign public Boolean Crafty.isPaused()
     * @returns Whether the game is currently paused.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Crafty.isPaused();&#10;*</span><br></pre></td></tr></table></figure>

     */
    isPaused: function () {
        return this._paused;
    },

    /**@
     * #Crafty.timer
     * @category Game Loop
     * Handles game ticks
     */
    timer: (function () {
        /*
         * `window.requestAnimationFrame` or its variants is called for animation.
         * `.requestID` keeps a record of the return value previous `window.requestAnimationFrame` call.
         * This is an internal variable. Used to stop frame.
         */
        var tick, requestID;

        // Internal variables used to control the game loop.  Use Crafty.timer.steptype() to set these.
        var mode = "fixed",
            maxFramesPerStep = 5,
            maxTimestep = 40;

        // variables used by the game loop to track state
        var endTime = 0,
            timeSlip = 0,
            gameTime;

        // Controls the target rate of fixed mode loop.  Set these with the Crafty.timer.FPS function
        var FPS = 50,
            milliSecPerFrame = 1000 / FPS;




        return {
            init: function () {
                // When first called, set the  gametime one frame before now!
                if (typeof gameTime === "undefined")
                    gameTime = (new Date().getTime()) - milliSecPerFrame;

                var onFrame = (typeof window !== "undefined") && (
                    window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    null
                );

                if (onFrame) {
                    tick = function () {
                        Crafty.timer.step();
                        if (tick !== null) {
                            requestID = onFrame(tick);
                        }
                        //Crafty.log(requestID + ', ' + frame)
                    };

                    tick();
                } else {
                    tick = setInterval(function () {
                        Crafty.timer.step();
                    }, 1000 / FPS);
                }
            },

            stop: function () {
                Crafty.trigger("CraftyStopTimer");

                if (typeof tick !== "function") clearInterval(tick);

                var onFrame = (typeof window !== "undefined") && (
                    window.cancelAnimationFrame ||
                    window.cancelRequestAnimationFrame ||
                    window.webkitCancelRequestAnimationFrame ||
                    window.mozCancelRequestAnimationFrame ||
                    window.oCancelRequestAnimationFrame ||
                    window.msCancelRequestAnimationFrame ||
                    null
                );

                if (onFrame) onFrame(requestID);
                tick = null;
            },


            /**@
             * #Crafty.timer.steptype
             * @comp Crafty.timer
             * @sign public void Crafty.timer.steptype(mode [, maxTimeStep])
             * Can be called to set the type of timestep the game loop uses
             * @param mode - the type of time loop.  Allowed values are "fixed", "semifixed", and "variable".  Crafty defaults to "fixed".
             * @param maxTimeStep - For "fixed", sets the max number of frames per step.   For "variable" and "semifixed", sets the maximum time step allowed.
             *
             * * In "fixed" mode, each frame is sent the same value of `dt`, and to achieve the target game speed, mulitiple frame events are triggered before each render.
             * * In "variable" mode, there is only one frame triggered per render.  This recieves a value of `dt` equal to the actual elapsed time since the last frame.
             * * In "semifixed" mode, multiple frames per render are processed, and the total time since the last frame is divided evenly between them.
             *
             */

            steptype: function (newmode, option) {
                if (newmode === "variable" || newmode === "semifixed") {
                    mode = newmode;
                    if (option)
                        maxTimestep = option;

                } else if (newmode === "fixed") {
                    mode = "fixed";
                    if (option)
                        maxFramesPerStep = option;
                } else {
                    throw "Invalid step type specified";
                }


            },

            /**@
             * #Crafty.timer.step
             * @comp Crafty.timer
             * @sign public void Crafty.timer.step()
             * @trigger EnterFrame - Triggered on each frame.  Passes the frame number, and the amount of time since the last frame.  If the time is greater than maxTimestep, that will be used instead.  (The default value of maxTimestep is 50 ms.) - { frame: Number, dt:Number }
             * @trigger ExitFrame - Triggered after each frame.  Passes the frame number, and the amount of time since the last frame.  If the time is greater than maxTimestep, that will be used instead.  (The default value of maxTimestep is 50 ms.) - { frame: Number, dt:Number }
             * @trigger PreRender - Triggered every time immediately before a scene should be rendered
             * @trigger RenderScene - Triggered every time a scene should be rendered
             * @trigger PostRender - Triggered every time immediately after a scene should be rendered
             * @trigger MeasureWaitTime - Triggered at the beginning of each step after the first.  Passes the time the game loop waited between steps. - Number
             * @trigger MeasureFrameTime - Triggered after each frame.  Passes the time it took to advance one frame. - Number
             * @trigger MeasureRenderTime - Triggered after each render. Passes the time it took to render the scene - Number
             *
             * Advances the game by performing a step. A step consists of one/multiple frames followed by a render. The amount of frames depends on the timer's steptype.
             * Specifically it triggers `EnterFrame` & `ExitFrame` events for each frame and `PreRender`, `RenderScene` & `PostRender` events for each render.
             *
             * @see Crafty.timer.steptype
             */
            step: function () {
                var drawTimeStart, dt, lastFrameTime, loops = 0;

                currentTime = new Date().getTime();
                if (endTime > 0)
                    Crafty.trigger("MeasureWaitTime", currentTime - endTime);

                // If we're currently ahead of the current time, we need to wait until we're not!
                if (gameTime + timeSlip >= currentTime) {
                    endTime = currentTime;
                    return;
                }

                var netTimeStep = currentTime - (gameTime + timeSlip);
                // We try to keep up with the target FPS by processing multiple frames per render
                // If we're hopelessly behind, stop trying to catch up.
                if (netTimeStep > milliSecPerFrame * 20) {
                    //gameTime = currentTime - milliSecPerFrame;
                    timeSlip += netTimeStep - milliSecPerFrame;
                    netTimeStep = milliSecPerFrame;
                }

                // Set up how time is incremented
                if (mode === "fixed") {
                    loops = Math.ceil(netTimeStep / milliSecPerFrame);
                    // maxFramesPerStep adjusts how willing we are to delay drawing in order to keep at the target FPS
                    loops = Math.min(loops, maxFramesPerStep);
                    dt = milliSecPerFrame;
                } else if (mode === "variable") {
                    loops = 1;
                    dt = netTimeStep;
                    // maxTimestep is the maximum time to be processed in a frame.  (Large dt => unstable physics)
                    dt = Math.min(dt, maxTimestep);
                } else if (mode === "semifixed") {
                    loops = Math.ceil(netTimeStep / maxTimestep);
                    dt = netTimeStep / loops;
                }

                // Process frames, incrementing the game clock with each frame.
                // dt is determined by the mode
                for (var i = 0; i < loops; i++) {
                    lastFrameTime = currentTime;
                    
                    var frameData = {
                        frame: frame++,
                        dt: dt,
                        gameTime: gameTime
                    };
                    // Everything that changes over time hooks into this event
                    Crafty.trigger("EnterFrame", frameData);
                    // Event that happens after "EnterFrame", e.g. for resolivng collisions applied through movement during "EnterFrame" events
                    Crafty.trigger("ExitFrame", frameData);
                    gameTime += dt;

                    currentTime = new Date().getTime();
                    Crafty.trigger("MeasureFrameTime", currentTime - lastFrameTime);
                }

                //If any frames were processed, render the results
                if (loops > 0) {
                    drawTimeStart = currentTime;
                    Crafty.trigger("PreRender"); // Pre-render setup opportunity
                    Crafty.trigger("RenderScene");
                    Crafty.trigger("PostRender"); // Post-render cleanup opportunity
                    currentTime = new Date().getTime();
                    Crafty.trigger("MeasureRenderTime", currentTime - drawTimeStart);
                }

                endTime = currentTime;
            },
            /**@
             * #Crafty.timer.FPS
             * @comp Crafty.timer
             * @sign public void Crafty.timer.FPS()
             * Returns the target frames per second. This is not an actual frame rate.
             * @sign public void Crafty.timer.FPS(Number value)
             * @param value - the target rate
             * @trigger FPSChange - Triggered when the target FPS is changed by user - Number - new target FPS
             *
             * Sets the target frames per second. This is not an actual frame rate.
             * The default rate is 50.
             */
            FPS: function (value) {
                if (typeof value == "undefined")
                    return FPS;
                else {
                    FPS = value;
                    milliSecPerFrame = 1000 / FPS;
                    Crafty.trigger("FPSChange", value);
                }
            },

            /**@
             * #Crafty.timer.simulateFrames
             * @comp Crafty.timer
             * @sign public this Crafty.timer.simulateFrames(Number frames[, Number timestep])
             * Advances the game state by a number of frames and draws the resulting stage at the end. Useful for tests and debugging.
             * @param frames - number of frames to simulate
             * @param timestep - the duration to pass each frame.  Defaults to milliSecPerFrame (20 ms) if not specified.
             */
            simulateFrames: function (frames, timestep) {
                if (typeof timestep === "undefined")
                    timestep = milliSecPerFrame;
                while (frames-- > 0) {
                    var frameData = {
                        frame: frame++,
                        dt: timestep
                    };
                    Crafty.trigger("EnterFrame", frameData);
                    Crafty.trigger("ExitFrame", frameData);
                }
                Crafty.trigger("PreRender");
                Crafty.trigger("RenderScene");
                Crafty.trigger("PostRender");
            }
        };
    })(),


    /**@
     * #Crafty.e
     * @category Core
     * @trigger NewEntity - When the entity is created and all components are added - { id:Number }
     * @sign public Entity Crafty.e(String componentList)
     * @param componentList - List of components to assign to new entity
     * @sign public Entity Crafty.e(String component1[, .., String componentN])
     * @param component# - Component to add
     *
     * Creates an entity. Any arguments will be applied in the same
     * way `.addComponent()` is applied as a quick way to add components.
     *
     * Any component added will augment the functionality of
     * the created entity by assigning the properties and methods from the component to the entity.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* var myEntity = Crafty.e(&#34;2D, DOM, Color&#34;);&#10;*</span><br></pre></td></tr></table></figure>

     *
     * @see Crafty.c
     */
    e: function () {
        var id = UID();
        entities[id] = null;
        entities[id] = Crafty(id);

        if (arguments.length > 0) {
            entities[id].addComponent.apply(entities[id], arguments);
        }
        entities[id].setName('Entity #' + id); //set default entity human readable name
        entities[id].addComponent("obj"); //every entity automatically assumes obj

        Crafty.trigger("NewEntity", {
            id: id
        });

        return entities[id];
    },

    /**@
     * #Crafty.c
     * @category Core
     * @sign public void Crafty.c(String name, Object component)
     * @param name - Name of the component
     * @param component - Object with the component's properties and methods
     *
     * Creates a component where the first argument is the ID and the second
     * is the object that will be inherited by entities.
     *
     * Specifically, each time a component is added to an entity, the component properties are copied over to the entity. 
     * * In the case of primitive datatypes (booleans, numbers, strings) the property is copied by value.
     * * In the case of complex datatypes (objects, arrays, functions) the property is copied by reference and will thus reference the components' original property.
     * * (See the two examples below for further explanation)
     * Note that when a component method gets called, the `this` keyword will refer to the current entity the component was added to.
     *
     * A handful of methods or properties are treated specially. They are invoked in partiular contexts, and (in those contexts) cannot be overridden by other components.
     *
     * - `required`: A string listing required components, which will be added to the component before `init()` runs.
     * - `init`: A function to be called when the component is added to an entity
     * - `remove`: A function which will be called just before a component is removed, or before an entity is destroyed. It is passed a single boolean parameter that is `true` if the entity is being destroyed.
     * - `events`: An object whose properties represent functions bound to events equivalent to the property names.  (See the example below.)  The binding occurs directly after the call to `init`, and will be removed directly before `remove` is called.
     *
     * In addition to these hardcoded special methods, there are some conventions for writing components.
     *
     * - Properties or methods that start with an underscore are considered private.
     * - A method with the same name as the component is considered to be a constructor
     * and is generally used when you need to pass configuration data to the component on a per entity basis.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Crafty.c(&#34;Annoying&#34;, &#123;&#10;*     _message: &#34;HiHi&#34;,&#10;*     init: function() &#123;&#10;*         this.bind(&#34;EnterFrame&#34;, function() &#123; alert(this.message); &#125;);&#10;*     &#125;,&#10;*     annoying: function(message) &#123; this.message = message; &#125;&#10;* &#125;);&#10;*&#10;* Crafty.e(&#34;Annoying&#34;).annoying(&#34;I&#39;m an orange...&#34;);&#10;*</span><br></pre></td></tr></table></figure>

     * To attach to the "EnterFrame" event using the `events` property instead:
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Crafty.c(&#34;Annoying&#34;, &#123;&#10;*     _message: &#34;HiHi&#34;,&#10;*     events: &#123;&#10;*         &#34;EnterFrame&#34;: function()&#123;alert(this.message);&#125;&#10;*     &#125;&#10;*     annoying: function(message) &#123; this.message = message; &#125;&#10;* &#125;);&#10;*</span><br></pre></td></tr></table></figure>

     *
     *
     * @warning In the examples above the field _message is local to the entity. 
     * That is, if you create many entities with the Annoying component, they can all have different values for _message.
     * That is because it is a simple value, and simple values are copied by value. 
     * If however the field had been an object or array, 
     * the value would have been shared by all entities with the component,
     * because complex types are copied by reference in javascript.
     * This is probably not what you want and the following example demonstrates how to work around it.
     *
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Crafty.c(&#34;MyComponent&#34;, &#123;&#10;*     _iAmShared: &#123; a: 3, b: 4 &#125;,&#10;*     init: function() &#123;&#10;*         this._iAmNotShared = &#123; a: 3, b: 4 &#125;;&#10;*     &#125;,&#10;* &#125;);&#10;*</span><br></pre></td></tr></table></figure>

     *
     * @see Crafty.e
     */
    c: function (compName, component) {
        components[compName] = component;
    },

    /**@
     * #Crafty.trigger
     * @category Core, Events
     * @sign public void Crafty.trigger(String eventName, * data)
     * @param eventName - Name of the event to trigger
     * @param data - Arbitrary data to pass into the callback as an argument
     *
     * This method will trigger every single callback attached to the event name. This means
     * every global event and every entity that has a callback.
     *
     * @see Crafty.bind
     */
    trigger: function (event, data) {

        //  To learn how the event system functions, see the comments for Crafty._callbackMethods
        var hdl = handlers[event] || (handlers[event] = {}),
            h, callbacks;
        //loop over every object bound
        for (h in hdl) {
            // Check whether h needs to be processed
            if (!hdl.hasOwnProperty(h)) continue;
            callbacks = hdl[h];
            if (!callbacks || callbacks.length === 0) continue;

            callbacks.context._runCallbacks(event, data);
        }
    },

    /**@
     * #Crafty.bind
     * @category Core, Events
     * @sign public Function bind(String eventName, Function callback)
     * @param eventName - Name of the event to bind to
     * @param callback - Method to execute upon event triggered
     * @returns callback function which can be used for unbind
     *
     * Binds to a global event. Method will be executed when `Crafty.trigger` is used
     * with the event name.
     *
     * @see Crafty.trigger, Crafty.unbind
     */
    bind: function (event, callback) {

        // To learn how the event system functions, see the comments for Crafty._callbackMethods
        this._bindCallback(event, callback);
        return callback;
    },


    /**@
     * #Crafty.uniqueBind
     * @category Core, Events
     * @sign public Function uniqueBind(String eventName, Function callback)
     * @param eventName - Name of the event to bind to
     * @param callback - Method to execute upon event triggered
     * @returns callback function which can be used for unbind
     *
     * Works like Crafty.bind, but prevents a callback from being bound multiple times.
     *
     * @see Crafty.bind
     */
    uniqueBind: function (event, callback) {
        this.unbind(event, callback);
        return this.bind(event, callback);
    },

    /**@
     * #Crafty.one
     * @category Core, Events
     * @sign public Function one(String eventName, Function callback)
     * @param eventName - Name of the event to bind to
     * @param callback - Method to execute upon event triggered
     * @returns callback function which can be used for unbind
     *
     * Works like Crafty.bind, but will be unbound once the event triggers.
     *
     * @see Crafty.bind
     */
    one: function (event, callback) {
        var self = this;
        var oneHandler = function (data) {
            callback.call(self, data);
            self.unbind(event, oneHandler);
        };
        return self.bind(event, oneHandler);
    },

    /**@
     * #Crafty.unbind
     * @category Core, Events
     * @sign public Boolean Crafty.unbind(String eventName, Function callback)
     * @param eventName - Name of the event to unbind
     * @param callback - Function to unbind
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">*    var play_gameover_sound = function () &#123;...&#125;;&#10;*    Crafty.bind(&#39;GameOver&#39;, play_gameover_sound);&#10;*    ...&#10;*    Crafty.unbind(&#39;GameOver&#39;, play_gameover_sound);&#10;*</span><br></pre></td></tr></table></figure>

     *
     * The first line defines a callback function. The second line binds that
     * function so that `Crafty.trigger('GameOver')` causes that function to
     * run. The third line unbinds that function.
     *
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">*    Crafty.unbind(&#39;GameOver&#39;);&#10;*</span><br></pre></td></tr></table></figure>

     *
     * This unbinds ALL global callbacks for the event 'GameOver'. That
     * includes all callbacks attached by `Crafty.bind('GameOver', ...)`, but
     * none of the callbacks attached by `some_entity.bind('GameOver', ...)`.
     */
    unbind: function (event, callback) {
        //  To learn how the event system functions, see the comments for Crafty._callbackMethods
        this._unbindCallbacks(event, callback);
    },

    /**@
     * #Crafty.frame
     * @category Core
     * @sign public Number Crafty.frame(void)
     * @returns the current frame number
     */
    frame: function () {
        return frame;
    },

    components: function () {
        return components;
    },

    isComp: function (comp) {
        return comp in components;
    },

    debug: function (str) {
        // access internal variables - handlers or entities
        if (str === 'handlers') {
            return handlers;
        }
        return entities;
    },

    /**@
     * #Crafty.settings
     * @category Core
     * Modify the inner workings of Crafty through the settings.
     */
    settings: (function () {
        var states = {},
            callbacks = {};

        return {
            /**@
             * #Crafty.settings.register
             * @comp Crafty.settings
             * @sign public void Crafty.settings.register(String settingName, Function callback)
             * @param settingName - Name of the setting
             * @param callback - Function to execute when use modifies setting
             *
             * Use this to register custom settings. Callback will be executed when `Crafty.settings.modify` is used.
             *
             * @see Crafty.settings.modify
             */
            register: function (setting, callback) {
                callbacks[setting] = callback;
            },

            /**@
             * #Crafty.settings.modify
             * @comp Crafty.settings
             * @sign public void Crafty.settings.modify(String settingName, * value)
             * @param settingName - Name of the setting
             * @param value - Value to set the setting to
             *
             * Modify settings through this method.
             *
             * @see Crafty.settings.register, Crafty.settings.get
             */
            modify: function (setting, value) {
                if (!callbacks[setting]) return;
                callbacks[setting].call(states[setting], value);
                states[setting] = value;
            },

            /**@
             * #Crafty.settings.get
             * @comp Crafty.settings
             * @sign public * Crafty.settings.get(String settingName)
             * @param settingName - Name of the setting
             * @returns Current value of the setting
             *
             * Returns the current value of the setting.
             *
             * @see Crafty.settings.register, Crafty.settings.get
             */
            get: function (setting) {
                return states[setting];
            }
        };
    })(),

    /**@
     * #Crafty.defineField
     * @category Core
     * @sign public void Crafty.defineField(Object object, String property, Function getCallback, Function setCallback)
     * @param object - Object to define property on
     * @param property - Property name to assign getter & setter to
     * @param getCallback - Method to execute if the property is accessed
     * @param setCallback - Method to execute if the property is mutated
     *
     * Assigns getters and setters to the property in the given object.
     * A getter will watch a property waiting for access and will then invoke the
     * given getCallback when attempting to retrieve.
     * A setter will watch a property waiting for mutation and will then invoke the
     * given setCallback when attempting to modify.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* var ent = Crafty.e(&#34;2D&#34;);&#10;* Crafty.defineField(ent, &#34;customData&#34;, function() &#123; &#10;*    return this._customData; &#10;* &#125;, function(newValue) &#123; &#10;*    this._customData = newValue;&#10;* &#125;);&#10;*&#10;* ent.customData = &#34;2&#34; // set customData to 2&#10;* Crafty.log(ent.customData) // prints 2&#10;*</span><br></pre></td></tr></table></figure>

     * @see Crafty Core#.defineField
     */
    defineField: function(obj, prop, getCallback, setCallback) {
        Object.defineProperty(obj, prop, {
            get: getCallback,
            set: setCallback,
            configurable: false,
            enumerable: true,
        });
    },

    clone: clone
});

/**
 * Return a unique ID
 */

function UID() {
    var id = GUID++;
    //if GUID is not unique
    if (id in entities) {
        return UID(); //recurse until it is unique
    }
    return id;
}

/**@
 * #Crafty.clone
 * @category Core
 * @sign public Object .clone(Object obj)
 * @param obj - an object
 *
 * Deep copy (a.k.a clone) of an object.
 * 
 * @example
 * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* // Null or Primitive types&#10;* Crafty.clone(null); // returns null&#10;* Crafty.clone(4);    // returns 4&#10;* &#10;* // Objects&#10;* var globalCount = 0;&#10;* var obj1 = &#123;&#10;*   count: 0,&#10;*   inc: function()&#123;&#10;*      this.count++;&#10;*      globalCount++;&#10;*   &#125;,&#10;*   log: function()&#123;&#10;*     console.log(this.count + &#39;/&#39; + globalCount);&#10;*   &#125;&#10;* &#125;;&#10;* &#10;* obj1.inc();&#10;* obj1.log(); // prints &#34;1/1&#34; to the log&#10;* &#10;* var obj2 = Crafty.clone(obj1);&#10;* obj2.log(); // prints &#34;1/1&#34; to the log&#10;* &#10;* obj1.inc();&#10;* obj1.log(); // prints &#34;2/2&#34; to the log&#10;* obj2.log(); // prints &#34;1/2&#34; to the log&#10;*</span><br></pre></td></tr></table></figure>

 */

function clone(obj) {
    if (obj === null || typeof (obj) != 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for (var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}

// export Crafty
if (typeof define === 'function') { // AMD
    define('crafty', [], function () {
        return Crafty;
    });
}

module.exports = Crafty;

},{"./version":16}],8:[function(require,module,exports){
(function (process){
var Crafty = require('./core');
var document = (typeof window !== "undefined") && window.document;

/**@
 * #Crafty.support
 * @category Misc, Core
 * Determines feature support for what Crafty can do.
 */
(function testSupport() {
    var support = Crafty.support = {},
        ua = (typeof navigator !== "undefined" && navigator.userAgent.toLowerCase()) || (typeof process !== "undefined" && process.version),
        match = /(webkit)[ \/]([\w.]+)/.exec(ua) ||
            /(o)pera(?:.*version)?[ \/]([\w.]+)/.exec(ua) ||
            /(ms)ie ([\w.]+)/.exec(ua) ||
            /(moz)illa(?:.*? rv:([\w.]+))?/.exec(ua) ||
            /(v)\d+\.(\d+)/.exec(ua) || [],
        mobile = /iPad|iPod|iPhone|Android|webOS|IEMobile/i.exec(ua);

    /**@
     * #Crafty.mobile
     * @comp Crafty.device
     *
     * Determines if Crafty is running on mobile device.
     *
     * If Crafty.mobile is equal true Crafty does some things under hood:
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* - set viewport on max device width and height&#10;* - set Crafty.stage.fullscreen on true&#10;* - hide window scrollbars&#10;*</span><br></pre></td></tr></table></figure>

     *
     * @see Crafty.viewport
     */
    if (mobile) Crafty.mobile = mobile[0];

    /**@
     * #Crafty.support.defineProperty
     * @comp Crafty.support
     * Is `Object.defineProperty` supported?
     */
    support.defineProperty = (function () {
        if (!('defineProperty' in Object)) return false;
        try {
            Object.defineProperty({}, 'x', {});
        } catch (e) {
            return false;
        }
        return true;
    })();

    /**@
     * #Crafty.support.audio
     * @comp Crafty.support
     * Is HTML5 `Audio` supported?
     */
    support.audio = (typeof window !== "undefined") && ('canPlayType' in document.createElement('audio'));

    /**@
     * #Crafty.support.prefix
     * @comp Crafty.support
     * Returns the browser specific prefix (`Moz`, `O`, `ms`, `webkit`, `node`).
     */
    support.prefix = (match[1] || match[0]);

    //browser specific quirks
    if (support.prefix === "moz") support.prefix = "Moz";
    if (support.prefix === "o") support.prefix = "O";
    if (support.prefix === "v") support.prefix = "node";

    if (match[2]) {
        /**@
         * #Crafty.support.versionName
         * @comp Crafty.support
         * Version of the browser
         */
        support.versionName = match[2];

        /**@
         * #Crafty.support.version
         * @comp Crafty.support
         * Version number of the browser as an Integer (first number)
         */
        support.version = +(match[2].split("."))[0];
    }

    /**@
     * #Crafty.support.canvas
     * @comp Crafty.support
     * Is the `canvas` element supported?
     */
    support.canvas = (typeof window !== "undefined") && ('getContext' in document.createElement("canvas"));

    /**@
     * #Crafty.support.webgl
     * @comp Crafty.support
     * Is WebGL supported on the canvas element?
     */
    if (support.canvas) {
        var gl;
        try {
            var c = document.createElement("canvas");
            gl = c.getContext("webgl") || c.getContext("experimental-webgl");
            gl.viewportWidth = support.canvas.width;
            gl.viewportHeight = support.canvas.height;
        } catch (e) {}
        support.webgl = !! gl;
    } else {
        support.webgl = false;
    }

    /**@
     * #Crafty.support.css3dtransform
     * @comp Crafty.support
     * Is css3Dtransform supported by browser.
     */
    support.css3dtransform = (typeof window !== "undefined") && ((typeof document.createElement("div").style.Perspective !== "undefined") || (typeof document.createElement("div").style[support.prefix + "Perspective"] !== "undefined"));

    /**@
     * #Crafty.support.deviceorientation
     * @comp Crafty.support
     * Is deviceorientation event supported by browser.
     */
    support.deviceorientation = (typeof window !== "undefined") && ((typeof window.DeviceOrientationEvent !== "undefined") || (typeof window.OrientationEvent !== "undefined"));

    /**@
     * #Crafty.support.devicemotion
     * @comp Crafty.support
     * Is devicemotion event supported by browser.
     */
    support.devicemotion = (typeof window !== "undefined") && (typeof window.DeviceMotionEvent !== "undefined");

})();

module.exports = {
    _events: {},

    /**@
     * #Crafty.addEvent
     * @category Events, Misc
     * @sign public this Crafty.addEvent(Object ctx, HTMLElement obj, String event, Function callback)
     * @param ctx - Context of the callback or the value of `this`
     * @param obj - Element to add the DOM event to
     * @param event - Event name to bind to
     * @param callback - Method to execute when triggered
     *
     * Adds DOM level 3 events to elements. The arguments it accepts are the call
     * context (the value of `this`), the DOM element to attach the event to,
     * the event name (without `on` (`click` rather than `onclick`)) and
     * finally the callback method.
     *
     * If no element is passed, the default element will be `window.document`.
     *
     * Callbacks are passed with event data.
     *
     * @note This is related to DOM events only,  not Crafty's own event system.  
     * Of course, you can trigger Crafty events in the callback function!
     *
     * @example
     * Normally you'd use Crafty's built-in mouse component, but for the sake of an example let's pretend that doesn't exist.  
     * The following code will add a stage-wide MouseDown event listener to the player, and log both which button was pressed
     * and the (x,y) coordinates in viewport/world/game space.
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* var player = Crafty.e(&#34;2D&#34;);&#10;*     player.onMouseDown = function(e) &#123;&#10;*         Crafty.log(e.mouseButton, e.realX, e.realY);&#10;*     &#125;;&#10;* Crafty.addEvent(player, Crafty.stage.elem, &#34;mousedown&#34;, player.onMouseDown);&#10;*</span><br></pre></td></tr></table></figure>

     * @see Crafty.removeEvent
     */
    addEvent: function (ctx, obj, type, callback) {
        if (arguments.length === 3) {
            callback = type;
            type = obj;
            obj = window.document;
        }

        //save anonymous function to be able to remove
        var afn = function (e) {
            callback.call(ctx, e);
        },
            id = ctx[0] || "";

        if (!this._events[id + obj + type + callback]) 
            this._events[id + obj + type + callback] = afn;
        else  {
            return;
        }

        obj.addEventListener(type, afn, false);
        
    },

    /**@
     * #Crafty.removeEvent
     * @category Events, Misc
     * @sign public this Crafty.removeEvent(Object ctx, HTMLElement obj, String event, Function callback)
     * @param ctx - Context of the callback or the value of `this`
     * @param obj - Element the event is on
     * @param event - Name of the event
     * @param callback - Method executed when triggered
     *
     * Removes events attached by `Crafty.addEvent()`. All parameters must
     * be the same that were used to attach the event including a reference
     * to the callback method.
     *
     * @see Crafty.addEvent
     */
    removeEvent: function (ctx, obj, type, callback) {
        if (arguments.length === 3) {
            callback = type;
            type = obj;
            obj = window.document;
        }

        //retrieve anonymous function
        var id = ctx[0] || "",
            afn = this._events[id + obj + type + callback];

        if (afn) {
            obj.removeEventListener(type, afn, false);
            delete this._events[id + obj + type + callback];
        }
    },

    /**@
     * #Crafty.background
     * @category Graphics, Stage
     * @sign public void Crafty.background(String style)
     * @param style - Modify the background with a color or image
     *
     * This method is a shortcut for adding a background
     * style to the stage element, i.e.
     * `Crafty.stage.elem.style.background = ...`
     * 
     * For example, if you want the background to be white,
     * with an image in the center, you might use:
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Crafty.background(&#39;#FFFFFF url(landscape.png) no-repeat center center&#39;);&#10;*</span><br></pre></td></tr></table></figure>

     *  
     */
    background: function (style) {
        Crafty.stage.elem.style.background = style;
    }
};

}).call(this,require('_process'))
},{"./core":7,"_process":1}],9:[function(require,module,exports){
var Crafty = require('../core/core.js');

module.exports = {
    /**@
     * #Crafty.assets
     * @category Assets
     * An object containing every asset used in the current Crafty game.
     * The key is the URL and the value is the `Audio` or `Image` object.
     *
     * If loading an asset, check that it is in this object first to avoid loading twice.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* var isLoaded = !!Crafty.assets[&#34;images/sprite.png&#34;];&#10;*</span><br></pre></td></tr></table></figure>

     * @see Crafty.load
     */
    assets: {},
    __paths: { audio: "", images: "" },
    /**@
     * #Crafty.paths
     * @category Assets
     * @sign public void Crafty.paths([Object paths])
     * @param paths - Object containing paths for audio and images folders
     *
     * Function to define custom folder for audio and images. You should use
     * this function to avoid typing the same paths again and again when
     * loading assets with the Crafty.load() function.
     *
     * If you do not give a object you get the current paths for both audio
     * and images back.
     *
     * You do not have to define paths.
     *
     * @example
     *
     *
     * Setting folders:
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Crafty.paths(&#123; audio: &#34;custom/audio/path/&#34;, images: &#34;custom/images/path/&#34; &#125;);&#10;*&#10;* Crafty.load(&#123;&#10;*   &#34;audio&#34;: &#123;&#10;*     &#34;ray&#34;: [&#39;ray.mp3&#39;] // This loads ray.mp3 from custom/audio/path/ray.mp3&#10;*   &#125;&#10;* &#125;, function() &#123;&#10;*   Crafty.log(&#39;loaded&#39;);&#10;* &#125;);&#10;*</span><br></pre></td></tr></table></figure>

     *
     * @see Crafty.load
     */
    paths: function(p) {
        if (typeof p === "undefined") {
            return this.__paths;
        } else {
            if(p.audio)
                this.__paths.audio = p.audio;
            if(p.images)
                this.__paths.images = p.images;
        }
    },

    /**@
     * #Crafty.asset
     * @category Assets
     * @trigger NewAsset - After setting new asset - Object - key and value of new added asset.
     * @sign public void Crafty.asset(String key, Object asset)
     * @param key - asset url.
     * @param asset - `Audio` or `Image` object.
     *
     * Add new asset to assets object.
     *
     * @sign public void Crafty.asset(String key)
     * @param key - asset url.
     *
     *
     * Get asset from assets object.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Crafty.asset(key, value);&#10;* var asset = Crafty.asset(key); //object with key and value fields&#10;*</span><br></pre></td></tr></table></figure>

     *
     * @see Crafty.assets
     */
    asset: function (key, value) {
        if (arguments.length === 1) {
            return Crafty.assets[key];
        }

        if (!Crafty.assets[key]) {
            Crafty.assets[key] = value;
            this.trigger("NewAsset", {
                key: key,
                value: value
            });
            return value;
        }
    },
    /**@
     * #Crafty.image_whitelist
     * @category Assets
     *
     * A list of file extensions that can be loaded as images by Crafty.load
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* // add tif extension to list of supported image files&#10;* Crafty.image_whitelist.push(&#34;tif&#34;);&#10;*&#10;* var assets = &#123;&#10;*     &#34;sprites&#34;: &#123;&#10;*         &#34;sprite.tif&#34;: &#123;   //set a tif sprite&#10;*            &#34;tile&#34;: 64,&#10;*            &#34;tileh&#34;: 32,&#10;*            &#34;map&#34;: &#123; &#34;sprite_car&#34;: [0, 0] &#125;&#10;*         &#125;&#10;*     &#125;,&#10;*     &#34;audio&#34;: &#123;&#10;*         &#34;jump&#34;: &#34;jump.mp3&#34;;&#10;*     &#125;&#10;* &#125;;&#10;*&#10;* Crafty.load( assets, // preload the assets&#10;*     function() &#123;     //when loaded&#10;*         Crafty.audio.play(&#34;jump&#34;); //Play the audio file&#10;*         Crafty.e(&#39;2D, DOM, sprite_car&#39;); // create entity with sprite&#10;*     &#125;,&#10;*&#10;*     function(e) &#123; //progress&#10;*     &#125;,&#10;*&#10;*     function(e) &#123; //uh oh, error loading&#10;*     &#125;&#10;* );&#10;*</span><br></pre></td></tr></table></figure>

     *
     * @see Crafty.asset
     * @see Crafty.load
     */
    image_whitelist: ["jpg", "jpeg", "gif", "png", "svg"],
    /**@
     * #Crafty.load
     * @category Assets
     * @sign public void Crafty.load(Object assets, Function onLoad[, Function onProgress[, Function onError]])
     * @param assets - Object JSON formatted (or JSON string), with assets to load (accepts sounds, images and sprites)
     * @param onLoad - Callback when the assets are loaded
     * @param onProgress - Callback when an asset is loaded. Contains information about assets loaded
     * @param onError - Callback when an asset fails to load
     *
     * Preloader for all assets. Takes a JSON formatted object (or JSON string) of files and adds them to the
     * `Crafty.assets` object, as well as setting sprites accordingly.
     *
     * Format must follow the pattern shown in the example below, but it's not required to pass all "audio",
     * "images" and "sprites" properties, only those you'll need. For example, if you don't need to preload
     * sprites, you can omit that property.
     *
     * By default, Crafty will assume all files are in the current path.  For changing these,
     * use the function `Crafty.paths`.
     *
     * Files with suffixes in `image_whitelist` (case insensitive) will be loaded.
     *
     * It's possible to pass the full file path(including protocol), instead of just the filename.ext, in case
     * you want some asset to be loaded from another domain.
     *
     * If `Crafty.support.audio` is `true`, files with the following suffixes `mp3`, `wav`, `ogg` and
     * `mp4` (case insensitive) can be loaded.
     *
     * The `onProgress` function will be passed on object with information about
     * the progress including how many assets loaded, total of all the assets to
     * load and a percentage of the progress.
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* &#123; loaded: j, total: total, percent: (j / total * 100), src:src &#125;&#10;*</span><br></pre></td></tr></table></figure>

     *
     * `onError` will be passed with the asset that couldn't load.
     *
     * When `onError` is not provided, the onLoad is loaded even when some assets are not successfully loaded.
     * Otherwise, onLoad will be called no matter whether there are errors or not.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* var assetsObj = &#123;&#10;*     &#34;audio&#34;: &#123;&#10;*         &#34;beep&#34;: [&#34;beep.wav&#34;, &#34;beep.mp3&#34;, &#34;beep.ogg&#34;],&#10;*         &#34;boop&#34;: &#34;boop.wav&#34;,&#10;*         &#34;slash&#34;: &#34;slash.wav&#34;&#10;*     &#125;,&#10;*     &#34;images&#34;: [&#34;badguy.bmp&#34;, &#34;goodguy.png&#34;],&#10;*     &#34;sprites&#34;: &#123;&#10;*         &#34;animals.png&#34;: &#123;&#10;*             &#34;tile&#34;: 50,&#10;*             &#34;tileh&#34;: 40,&#10;*             &#34;map&#34;: &#123; &#34;ladybug&#34;: [0,0], &#34;lazycat&#34;: [0,1], &#34;ferociousdog&#34;: [0,2] &#125;&#10;*             &#34;paddingX&#34;: 5,&#10;*             &#34;paddingY&#34;: 5,&#10;*             &#34;paddingAroundBorder&#34;: 10&#10;*         &#125;,&#10;*         &#34;vehicles.png&#34;: &#123;&#10;*             &#34;tile&#34;: 150,&#10;*             &#34;tileh&#34;: 75,&#10;*             &#34;map&#34;: &#123; &#34;car&#34;: [0,0], &#34;truck&#34;: [0,1] &#125;&#10;*         &#125;&#10;*     &#125;,&#10;* &#125;;&#10;*&#10;* Crafty.load(assetsObj, // preload assets&#10;*     function() &#123; //when loaded&#10;*         Crafty.scene(&#34;main&#34;); //go to main scene&#10;*         Crafty.audio.play(&#34;boop&#34;); //Play the audio file&#10;*         Crafty.e(&#39;2D, DOM, lazycat&#39;); // create entity with sprite&#10;*     &#125;,&#10;*&#10;*     function(e) &#123; //progress&#10;*     &#125;,&#10;*&#10;*     function(e) &#123; //uh oh, error loading&#10;*     &#125;&#10;* );&#10;*</span><br></pre></td></tr></table></figure>

     *
     * @see Crafty.paths
     * @see Crafty.assets
     * @see Crafty.image_whitelist
     * @see Crafty.removeAssets
     */
    load: function (data, oncomplete, onprogress, onerror) {

        if (Array.isArray(data)) {
            Crafty.log("Calling Crafty.load with an array of assets no longer works; see the docs for more details.");
        }

        data = (typeof data === "string" ? JSON.parse(data) : data);

        var j = 0,
            total = (data.audio ? Object.keys(data.audio).length : 0) +
              (data.images ? Object.keys(data.images).length : 0) +
              (data.sprites ? Object.keys(data.sprites).length : 0),
            current, fileUrl, obj, type, asset,
            audSupport = Crafty.support.audio,
            paths = Crafty.paths(),
            getExt = function(f) {
                return f.substr(f.lastIndexOf('.') + 1).toLowerCase();
            },
            getFilePath = function(type,f) {
                return (f.search("://") === -1 ? (type == "audio" ? paths.audio + f : paths.images + f) : f);
            },
            // returns null if 'a' is not already a loaded asset, obj otherwise
            isAsset = function(a) {
                return Crafty.asset(a) || null;
            },
            isSupportedAudio = function(f) {
                return Crafty.audio.supports(getExt(f));
            },
            isValidImage = function(f) {
                return Crafty.image_whitelist.indexOf(getExt(f)) != -1;
            },
            onImgLoad = function(obj,url) {
                obj.onload = pro;
                if (Crafty.support.prefix === 'webkit')
                    obj.src = ""; // workaround for webkit bug
                obj.src = url;
            };

        //Progress function

        function pro() {
            var src = this.src;

            //Remove events cause audio trigger this event more than once(depends on browser)
            if (this.removeEventListener)
                this.removeEventListener('canplaythrough', pro, false);

            j++;
            //if progress callback, give information of assets loaded, total and percent
            if (onprogress)
                onprogress({
                    loaded: j,
                    total: total,
                    percent: (j / total * 100),
                    src: src
                });

            if (j === total && oncomplete) oncomplete();
        }
        //Error function

        function err() {
            var src = this.src;
            if (onerror)
                onerror({
                    loaded: j,
                    total: total,
                    percent: (j / total * 100),
                    src: src
                });

            j++;
            if (j === total && oncomplete) oncomplete();
        }

        for (type in data) {
            for(asset in data[type]) {
                if (!data[type].hasOwnProperty(asset))
                    continue; // maintain compatibility to other frameworks while iterating array

                current = data[type][asset];

                if (type === "audio" && audSupport) {
                    if (typeof current === "object") {
                        var files = [];
                        for (var i in current) {
                            fileUrl = getFilePath(type, current[i]);
                            if (!isAsset(fileUrl) && isSupportedAudio(current[i]))
                                files.push(fileUrl);
                        }
                        obj = Crafty.audio.add(asset, files).obj;
                    }
                    else if (typeof current === "string" && isSupportedAudio(current)) {
                        fileUrl = getFilePath(type, current);
                        if (!isAsset(fileUrl))
                            obj = Crafty.audio.add(asset, fileUrl).obj;
                    }

                    //addEventListener is supported on IE9 , Audio as well
                    if (obj && obj.addEventListener)
                        obj.addEventListener('canplaythrough', pro, false);
                } else {
                    asset = (type === "sprites" ? asset : current);
                    fileUrl = getFilePath(type, asset);
                    if (isValidImage(asset)) {
                        obj = isAsset(fileUrl);
                        if (!obj) {
                            obj = new Image();
                            if (type === "sprites")
                                Crafty.sprite(current.tile, current.tileh, fileUrl, current.map,
                                  current.paddingX, current.paddingY, current.paddingAroundBorder);
                            Crafty.asset(fileUrl, obj);
                        }
                        onImgLoad(obj, fileUrl);
                    }
                }
                if (obj)
                    obj.onerror = err;
                else
                    --total;
            }
        }

        // If we aren't trying to handle *any* of the files, that's as complete as it gets!
        if (total === 0)
            oncomplete();

    },
    /**@
     * #Crafty.removeAssets
     * @category Assets
     *
     * @sign public void Crafty.removeAssets(Object assets)
     * @param data - Object JSON formatted (or JSON string), with assets to remove (accepts sounds, images and sprites)
     *
     * Removes assets (audio, images, sprites - and related sprite components) in order to allow the browser
     * to free memory.
     *
     * Recieves a JSON fomatted object (or JSON string) containing 'audio', 'images' and/or 'sprites'
     * properties with assets to be deleted. Follows a similar format as Crafty.load 'data' argument. If
     * you pass the exact same object passed to Crafty.load, that will delete everything loaded that way.
     * For sprites, if you want to keep some specific component, just don't pass that component's name in
     * the sprite 'map'.
     *
     * Note that in order to remove the sprite components related to a given sprite, it's required to
     * pass the 'map' property of that sprite, and although its own properties's values (the properties refer
     * to sprite components) are not used in the removing process, omitting them will cause an error (since
     * 'map' is an object, thus it's properties can NOT omitted - however, they can be null, or undefined).
     * It will work as long as the 'map' objects' properties have any value. Or if you define 'map' itself
     * as an array, like:
     * "map": [ "car", "truck" ] instead of "map": { "car": [0,0], "truck": [0,1] }.
     * This is examplified below ("animals.png" VS. "vehicles.png" sprites).
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* var assetsToRemoveObj = &#123;&#10;*     &#34;audio&#34;: &#123;&#10;*         &#34;beep&#34;: [&#34;beep.wav&#34;, &#34;beep.mp3&#34;, &#34;beep.ogg&#34;],&#10;*         &#34;boop&#34;: &#34;boop.wav&#34;&#10;*     &#125;,&#10;*     &#34;images&#34;: [&#34;badguy.bmp&#34;, &#34;goodguy.png&#34;],&#10;*     &#34;sprites&#34;: &#123;&#10;*         &#34;animals.png&#34;: &#123;&#10;*             &#34;map&#34;: &#123; &#34;ladybug&#34;: [0,0], &#34;lazycat&#34;: [0,1] &#125;,&#10;*         &#125;,&#10;*         &#34;vehicles.png&#34;: &#123;&#10;*             &#34;map&#34;: [ &#34;car&#34;, &#34;truck&#34; ]&#10;*         &#125;&#10;*     &#125;&#10;* &#125;&#10;*&#10;* Crafty.removeAssets(assetsToRemoveObj);&#10;*</span><br></pre></td></tr></table></figure>

     *
     * @see Crafty.load
     */
    removeAssets: function(data) {

        data = (typeof data === "string" ? JSON.parse(data) : data);

        var current, fileUrl, type, asset,
            paths = Crafty.paths(),
            getFilePath = function(type,f) {
                return (f.search("://") === -1 ? (type == "audio" ? paths.audio + f : paths.images + f) : f);
            };

        for (type in data) {
            for (asset in data[type]) {
                if (!data[type].hasOwnProperty(asset))
                    continue; // maintain compatibility to other frameworks while iterating array

                current = data[type][asset];

                if (type === "audio") {
                    if (typeof current === "object") {
                        for (var i in current) {
                            fileUrl = getFilePath(type, current[i]);
                            if (Crafty.asset(fileUrl))
                                Crafty.audio.remove(asset);
                        }
                    }
                    else if (typeof current === "string") {
                        fileUrl = getFilePath(type, current);
                        if (Crafty.asset(fileUrl))
                            Crafty.audio.remove(asset);
                    }
                } else {
                    asset = (type === "sprites" ? asset : current);
                    fileUrl = getFilePath(type, asset);
                    if (Crafty.asset(fileUrl)) {
                        if (type === "sprites")
                            for (var comp in current.map)
                                delete Crafty.components()[comp];
                        delete Crafty.assets[fileUrl];
                    }
                }
            }
        }
    }
};

},{"../core/core.js":7}],10:[function(require,module,exports){
/**@
 * #Model
 * @category Model
 * Model is a component that offers new features for isolating business
 * logic in your application. It offers default values, dirty values,
 * and deep events on your data.
 *
 * All data should be accessed via the appropriate methods `.get`, `.set`,
 * and `.data` for the proper events to be triggered. It is not encouraged
 * to access them directly.
 *
 * Dirty values make it simple to inspect a model and see what values have changed.
 *
 * Deep events allow you to bind to specific fields, like `name` or even deep fields
 * like `contact.email` and get notified when those specific fields are updated.
 *
 * @trigger Change - When any data on the model has changed.
 * @trigger Change[key] - When the specific key on the model has changed.
 * @trigger Change[key.key] - The nested key value has changed.
 * @example
 * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Crafty.c(&#39;Person&#39;, &#123;&#10;*   name: &#39;Fox&#39;,&#10;*   init: function() &#123; this.requires(&#39;Model&#39;); &#125;&#10;* &#125;);&#10;* person = Crafty.e(&#39;Person&#39;).attr(&#123;name: &#39;blaine&#39;&#125;);&#10;* person.bind(&#39;Change[name]&#39;, function() &#123;&#10;*   Crafty.log(&#39;name changed!&#39;);&#10;* &#125;);&#10;* person.attr(&#39;name&#39;, &#39;blainesch&#39;); // Triggers event&#10;* person.is_dirty(&#39;name&#39;); // true&#10;* person.changed // name&#10;*</span><br></pre></td></tr></table></figure>

 */
module.exports = {
  init: function() {
    this.changed = [];
    this.bind('Change', this._changed_attributes);
    this.bind('Change', this._changed_triggers);
  },

  /**
   * Fires more specific `Change` events.
   *
   * For instance a `Change[name]` may get fired when you
   * update the name data attribute on the model.
   */
  _changed_triggers: function(data, options) {
    var key, trigger_data;
    options = Crafty.extend.call({pre: ''}, options);
    for (key in data) {
      this.trigger('Change[' + options.pre + key + ']', data[key]);
      if (data[key].constructor === Object) {
        this._changed_triggers(data[key], {
          pre: options.pre + key + '.'
        });
      }
    }
  },

  /**
   * Pushes all top-levle changed attribute names to the
   * changed array.
   */
  _changed_attributes: function(data) {
    var key;
    for (key in data) {
      this.changed.push(key);
    }
    return this;
  },

  /**@
   * #.is_dirty
   * @comp Model
   * Helps determine when data or the entire component is "dirty" or has changed attributes.
   *
   * @example
   * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* person = Crafty.e(&#39;Person&#39;).attr(&#123;name: &#39;Fox&#39;, age: 24&#125;)&#10;* person.is_dirty() // false&#10;* person.is_dirty(&#39;name&#39;) // false&#10;*&#10;* person.attr(&#39;name&#39;, &#39;Lucky&#39;);&#10;* person.is_dirty(); // true&#10;* person.is_dirty(&#39;name&#39;); // true&#10;* person.is_dirty(&#39;age&#39;); // false&#10;* person.changed; // [&#39;name&#39;]&#10;*</span><br></pre></td></tr></table></figure>

   */
  is_dirty: function(key) {
    if (arguments.length === 0) {
      return !!this.changed.length;
    } else {
      return this.changed.indexOf(key) > -1;
    }
  }
};


},{}],11:[function(require,module,exports){
var Crafty = require('../core/core.js');


module.exports = {
    _scenes: {},
    _current: null,

    /**@
     * #Crafty.scene
     * @category Scenes, Stage
     * @trigger SceneChange - just before a new scene is initialized - { oldScene:String, newScene:String }
     * @trigger SceneDestroy - just before the current scene is destroyed - { newScene:String  }
     *
     * @sign public void Crafty.scene(String sceneName, Function init[, Function uninit])
     * @param sceneName - Name of the scene to add
     * @param init - Function to execute when scene is played
     * @param uninit - Function to execute before next scene is played, after entities with `2D` are destroyed
     *
     * This is equivalent to calling `Crafty.defineScene`.
     *
     * @sign public void Crafty.scene(String sceneName[, Data])
     * @param sceneName - Name of scene to play
     * @param Data - The init function of the scene will be called with this data as its parameter.  Can be of any type other than a function.
     *
     * This is equivalent to calling `Crafty.enterScene`.
     *
     * Method to create scenes on the stage. Pass an ID and function to register a scene.
     *
     * To play a scene, just pass the ID. When a scene is played, all
     * previously-created entities with the `2D` component are destroyed. The
     * viewport is also reset.
     *
     * You can optionally specify an arugment that will be passed to the scene's init function.
     *
     * If you want some entities to persist over scenes (as in, not be destroyed)
     * simply add the component `Persist`.
     *
     * @example
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Crafty.defineScene(&#34;loading&#34;, function() &#123;&#10;*     Crafty.background(&#34;#000&#34;);&#10;*     Crafty.e(&#34;2D, DOM, Text&#34;)&#10;*           .attr(&#123; w: 100, h: 20, x: 150, y: 120 &#125;)&#10;*           .text(&#34;Loading&#34;)&#10;*           .css(&#123; &#34;text-align&#34;: &#34;center&#34;&#125;)&#10;*           .textColor(&#34;#FFFFFF&#34;);&#10;* &#125;);&#10;*&#10;* Crafty.defineScene(&#34;UFO_dance&#34;,&#10;*              function() &#123;Crafty.background(&#34;#444&#34;); Crafty.e(&#34;UFO&#34;);&#125;,&#10;*              function() &#123;...send message to server...&#125;);&#10;*&#10;* // An example of an init function which accepts arguments, in this case an object.&#10;* Crafty.defineScene(&#34;square&#34;, function(attributes) &#123;&#10;*     Crafty.background(&#34;#000&#34;);&#10;*     Crafty.e(&#34;2D, DOM, Color&#34;)&#10;*           .attr(attributes)&#10;*           .color(&#34;red&#34;);&#10;* &#10;* &#125;);&#10;*&#10;*</span><br></pre></td></tr></table></figure>

     * This defines (but does not play) two scenes as discussed below.
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Crafty.enterScene(&#34;loading&#34;);&#10;*</span><br></pre></td></tr></table></figure>

     * This command will clear the stage by destroying all `2D` entities (except
     * those with the `Persist` component). Then it will set the background to
     * black and display the text "Loading".
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Crafty.enterScene(&#34;UFO_dance&#34;);&#10;*</span><br></pre></td></tr></table></figure>

     * This command will clear the stage by destroying all `2D` entities (except
     * those with the `Persist` component). Then it will set the background to
     * gray and create a UFO entity. Finally, the next time the game encounters
     * another command of the form `Crafty.scene(scene_name)` (if ever), then the
     * game will send a message to the server.
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Crafty.enterScene(&#34;square&#34;, &#123;x:10, y:10, w:20, h:20&#125;);&#10;*</span><br></pre></td></tr></table></figure>

     * This will clear the stage, set the background black, and create a red square with the specified position and dimensions.
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    scene: function (name, intro, outro) &#123;&#10;        // If there&#39;s one argument, or the second argument isn&#39;t a function, play the scene&#10;        if (arguments.length === 1 || typeof(arguments[1]) !== &#34;function&#34;) &#123;&#10;            Crafty.enterScene(name, arguments[1]);&#10;            return;&#10;        &#125;&#10;        // Otherwise, this is a call to create a scene&#10;        Crafty.defineScene(name, intro, outro);&#10;    &#125;,&#10;&#10;    /* &#10;     * #Crafty.defineScene&#10;     * @category Scenes, Stage&#10;     *&#10;     * @sign public void Crafty.enterScene(String name[, Data])&#10;     * @param name - Name of the scene to run.&#10;     * @param Data - The init function of the scene will be called with this data as its parameter.  Can be of any type other than a function.&#10;     *&#10;     * @see Crafty.enterScene&#10;     * @see Crafty.scene&#10;     */&#10;    defineScene: function(name, init, uninit)&#123;&#10;        if (typeof init !== &#34;function&#34;)&#10;            throw(&#34;Init function is the wrong type.&#34;);&#10;        this._scenes[name] = &#123;&#125;;&#10;        this._scenes[name].initialize = init;&#10;        if (typeof uninit !== &#39;undefined&#39;) &#123;&#10;            this._scenes[name].uninitialize = uninit;&#10;        &#125;&#10;        return;&#10;&#10;    &#125;,&#10;&#10;    /* &#10;     * #Crafty.enterScene&#10;     * @category Scenes, Stage&#10;     * @trigger SceneChange - just before a new scene is initialized - &#123; oldScene:String, newScene:String &#125;&#10;     * @trigger SceneDestroy - just before the current scene is destroyed - &#123; newScene:String  &#125;&#10;     *&#10;     * @sign public void Crafty.enterScene(String name[, Data])&#10;     * @param name - Name of the scene to run.&#10;     * @param Data - The init function of the scene will be called with this data as its parameter.  Can be of any type other than a function.&#10;     * &#10;     * @see Crafty.defineScene&#10;     * @see Crafty.scene&#10;     */&#10;    enterScene: function(name, data)&#123;&#10;        if (typeof data === &#34;function&#34;)&#10;            throw(&#34;Scene data cannot be a function&#34;);&#10;&#10;        // ---FYI---&#10;        // this._current is the name (ID) of the scene in progress.&#10;        // this._scenes is an object like the following:&#10;        // &#123;&#39;Opening scene&#39;: &#123;&#39;initialize&#39;: fnA, &#39;uninitialize&#39;: fnB&#125;,&#10;        //  &#39;Another scene&#39;: &#123;&#39;initialize&#39;: fnC, &#39;uninitialize&#39;: fnD&#125;&#125;&#10;&#10;        Crafty.trigger(&#34;SceneDestroy&#34;, &#123;&#10;            newScene: name&#10;        &#125;);&#10;        Crafty.viewport.reset();&#10;&#10;        Crafty(&#34;2D&#34;).each(function () &#123;&#10;            if (!this.has(&#34;Persist&#34;)) this.destroy();&#10;        &#125;);&#10;        // uninitialize previous scene&#10;        if (this._current !== null &#38;&#38; &#39;uninitialize&#39; in this._scenes[this._current]) &#123;&#10;            this._scenes[this._current].uninitialize.call(this);&#10;        &#125;&#10;        // initialize next scene&#10;        var oldScene = this._current;&#10;        this._current = name;&#10;        Crafty.trigger(&#34;SceneChange&#34;, &#123;&#10;            oldScene: oldScene,&#10;            newScene: name&#10;        &#125;);&#10;           &#10;        if (this._scenes.hasOwnProperty(name)) &#123;&#10;            this._scenes[name].initialize.call(this, data);&#10;        &#125; else &#123;&#10;            Crafty.error(&#39;The scene &#34;&#39; + name + &#39;&#34; does not exist&#39;);&#10;        &#125;&#10;&#10;        return;&#10;&#10;    &#125;&#10;&#125;;&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],12:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;try &#123;&#10;  var storage = (typeof window !== &#34;undefined&#34; &#38;&#38; window.localStorage) || (new require(&#39;node-localstorage&#39;).LocalStorage(&#39;./localStorage&#39;));&#10;&#125; catch(e) &#123;&#10;  var storage = null;&#10;&#125;&#10;&#10;&#10;/**@&#10; * #Storage&#10; * @category Utilities&#10; * Very simple way to get and set values, which will persist when the browser is closed also.&#10; * Storage wraps around HTML5 Web Storage, which is well-supported across browsers and platforms, but limited to 5MB total storage per domain.&#10; * Storage is also available for node, which is permanently persisted to the `./localStorage` folder - take care of removing entries. Note that multiple Crafty instances use the same storage, so care has to be taken not to overwrite existing entries.&#10; */&#10;/**@&#10; * #Crafty.storage&#10; * @comp Storage&#10; * @sign Crafty.storage(String key)&#10; * @param key - a key you would like to get from the storage. &#10; * @returns The stored value, or `null` if none saved under that key exists&#10; *&#10; * @sign Crafty.storage(String key, String value)&#10; * @param key - the key you would like to save the data under.&#10; * @param value - the value you would like to save.&#10; *&#10; * @sign Crafty.storage(String key, [Object value, Array value, Boolean value])&#10; * @param key - the key you would like to save the data under.&#10; * @param value - the value you would like to save, can be an Object or an Array.&#10; *&#10; * `Crafty.storage` is used synchronously to either get or set values. &#10; *&#10; * You can store booleans, strings, objects and arrays.&#10; *&#10; * @note Because the underlying method is synchronous, it can cause slowdowns if used frequently during gameplay.&#10; * You should aim to load or save data at reasonable times such as on level load,&#10; * or in response to specific user actions.&#10; *&#10; * @note If used in a cross-domain context, the localStorage might not be accessible.&#10; *&#10; * @example&#10; * Get an already stored value&#10; *</span><br></pre></td></tr></table></figure>

 * var playername = Crafty.storage('playername');
 * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">*&#10;* @example&#10;* Save a value&#10;*</span><br></pre></td></tr></table></figure>

 * Crafty.storage('playername', 'Hero');
 * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">*&#10;* @example&#10;* Test to see if a value is already there.&#10;*</span><br></pre></td></tr></table></figure>

 * var heroname = Crafty.storage('name');
 * if(!heroname){
 *   // Maybe ask the player what their name is here
 *   heroname = 'Guest';
 * }
 * // Do something with heroname
 * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;&#10;var store = function(key, value) &#123;&#10;  var _value = value;&#10;&#10;  if(!storage) &#123;&#10;    Crafty.error(&#34;Local storage is not accessible.  (Perhaps you are including crafty.js cross-domain?)&#34;);&#10;    return false;&#10;  &#125;&#10;&#10;  if(arguments.length === 1) &#123;&#10;    try &#123;&#10;      return JSON.parse(storage.getItem(key));&#10;    &#125;&#10;    catch (e) &#123;&#10;      return storage.getItem(key);&#10;    &#125;&#10;  &#125; else &#123;&#10;    if(typeof value === &#34;object&#34;) &#123;&#10;      _value = JSON.stringify(value);&#10;    &#125;&#10;&#10;    storage.setItem(key, _value);&#10;    &#10;  &#125;&#10;&#10;&#125;;&#10;/**@&#10; * #Crafty.storage.remove&#10; * @comp Storage&#10; * @sign Crafty.storage.remove(String key)&#10; * @param key - a key where you will like to delete the value of.&#10; *&#10; * Generally you do not need to remove values from localStorage, but if you do&#10; * store large amount of text, or want to unset something you can do that with&#10; * this function.&#10; *&#10; * @example&#10; * Get an already stored value&#10; *</span><br></pre></td></tr></table></figure>

 * Crafty.storage.remove('playername');
 * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; */&#10;store.remove = function(key) &#123;&#10;  if(!storage)&#123;&#10;    Crafty.error(&#34;Local storage is not accessible.  (Perhaps you are including crafty.js cross-domain?)&#34;);&#10;    return;&#10;  &#125;&#10;  storage.removeItem(key);&#10;&#125;;&#10;&#10;module.exports = store;&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],13:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;&#10;// Dictionary of existing systems&#10;Crafty._systems = &#123;&#125;;&#10;&#10;/**@&#10; * #Crafty.s&#10; * @category Core&#10; *&#10; * Registers a system.&#10; *&#10; * @trigger SystemLoaded - When the system has initialized itself - obj - system object&#10; * @trigger SystemDestroyed - Right before the system is destroyed - obj - system object&#10; *&#10; * @sign void Crafty.s(String name, Obj template[, Boolean lazy])&#10; * Register a system&#10; * @param name - The name of the system&#10; * @param template - an object whose methods and properties will be copied to the new system&#10; * @param lazy - a flag that indicates whether the system should be initialized right away or the first time it is referenced&#10; *&#10; * @sign System Crafty.s(String name)&#10; * Access the named system&#10; * @param name - The system to return&#10; * @returns The referenced system.  If the system has not been initialized, it will be before it is returned.&#10; *&#10; * Objects which handle entities might want to subscribe to the event system without being entities themselves.  &#10; * When you declare a system with a template object, all the methods and properties of that template are copied to a new object.&#10; * This new system will automatically have the following event related methods, which function like those of components: `.bind()`, `unbind()`, `trigger()`, `one()`, `uniqueBind()`, `destroy()`.&#10; * Much like components, you can also provide `init()` and `remove()` methods, as well as an `events` parameter for automatically binding to events.&#10; *&#10; * *Note*: The `init()` method is for setting up the internal state of the system -- if you create entities in it that then reference the system, that&#39;ll create an infinite loop.&#10; */&#10;Crafty.s = function(name, obj, lazy) &#123;&#10;&#9;if (obj) &#123;&#10;&#9;&#9;if (lazy === false ) &#123;&#10;&#9;&#9;&#9;Crafty._systems[name] = new Crafty.CraftySystem(name, obj);&#10;&#9;&#9;&#9;Crafty.trigger(&#34;SystemLoaded&#34;, name);&#10;&#9;&#9;&#125; else &#123;&#10;&#9;&#9;&#9;Crafty._registerLazySystem(name, obj);&#10;&#9;&#9;&#125;&#10;&#9;&#125; else &#123;&#10;&#9;&#9;return Crafty._systems[name];&#10;&#9;&#125;&#10;&#125;;&#10;&#10;&#10;&#10;Crafty._registerLazySystem = function(name, obj) &#123;&#10;&#9;// This is a bit of magic to only init a system if it&#39;s requested at least once.&#10;&#9;// We define a getter for _systems[name] that will first initialize the system, &#10;&#9;// and then redefine _systems[name] to ` that getter.&#10;&#9;Object.defineProperty(Crafty._systems, name, &#123;&#10;&#9;&#9;get: function() &#123;&#10;&#9;&#9;&#9;Object.defineProperty(Crafty._systems, name, &#123; &#10;&#9;&#9;&#9;&#9;value: new Crafty.CraftySystem(name, obj),&#10;&#9;&#9;&#9;&#9;writable: true,&#10;&#9;&#9;&#9;&#9;enumerable: true,&#10;&#9;&#9;&#9;&#9;configurable: true&#10;&#9;&#9;&#9;&#125;);&#10;&#9;&#9;&#9;Crafty.trigger(&#34;SystemLoaded&#34;, name);&#10;&#9;&#9;&#9;return Crafty._systems[name];&#10;&#9;&#9;&#125;,&#10;&#9;&#9;configurable: true&#10;&#9;&#125;);&#10;&#10;&#125;;&#10;&#10;// Each system has its properties and methods copied onto an object of this type&#10;Crafty.CraftySystem = (function()&#123;&#10;&#9;systemID = 1;&#10;&#9;return function(name, template) &#123;&#10;&#9;&#9;this.name = name;&#10;&#9;&#9;if (!template) return this;&#10;&#9;&#9;this._systemTemplate = template;&#10;&#9;&#9;this.extend(template);&#10;&#10;&#9;&#9;// Add the &#34;low leveL&#34; callback methods&#10;&#9;&#9;Crafty._addCallbackMethods(this);&#10;&#10;&#9;&#9;// Give this object a global ID.  Used for event handlers.&#10;&#9;&#9;this[0] = &#34;system&#34; + (systemID++);&#10;&#9;&#9;// Run any instantiation code&#10;&#9;&#9;if (typeof this.init === &#34;function&#34;) &#123;&#10;&#9;&#9;&#9;this.init(name);&#10;&#9;&#9;&#125;&#10;&#9;&#9;// If an events object is provided, bind the listed event handlers&#10;&#9;&#9;if (&#34;events&#34; in template)&#123;&#10;&#9;&#9;&#9;var auto = template.events;&#10;&#9;&#9;&#9;for (var eventName in auto)&#123;&#10;&#9;&#9;&#9;&#9;var fn = typeof auto[eventName] === &#34;function&#34; ? auto[eventName] : template[auto[eventName]];&#10;&#9;&#9;&#9;&#9;this.bind(eventName, fn);&#10;&#9;&#9;&#9;&#125;&#10;&#9;&#9;&#125;&#10;&#9;&#125;;&#10;&#125;)();&#10;&#10;&#10;&#10;Crafty.CraftySystem.prototype = &#123;&#10;&#9;extend: function(obj) &#123;&#10;&#9;&#9;// Copy properties and methods of obj&#10;&#9;&#9;for (var key in obj) &#123;&#10;&#9;&#9;&#9;if (typeof this[key] === &#34;undefined&#34;) &#123;&#10;&#9;&#9;&#9;&#9;this[key] = obj[key];&#10;&#9;&#9;&#9;&#125;&#10;&#9;&#9;&#125;&#10;&#9;&#125;,&#10;&#10;&#9;// Event methods&#10;&#9;bind: function(event, callback) &#123;&#10;&#9;&#9;this._bindCallback(event, callback);&#10;&#9;&#9;return this;&#10;&#9;&#125;,&#10;&#10;&#9;trigger: function(event, data) &#123;&#10;&#9;&#9;this._runCallbacks(event, data);&#10;&#9;&#9;return this;&#10;&#9;&#125;,&#10;&#10;&#9;unbind: function(event, callback) &#123;&#10;&#9;&#9;this._unbindCallbacks(event, callback);&#10;&#9;&#9;return this;&#10;&#9;&#125;,&#10;&#10;&#9;one: function (event, callback) &#123;&#10;&#9;&#9;var self = this;&#10;&#9;&#9;var oneHandler = function (data) &#123;&#10;&#9;&#9;&#9;callback.call(self, data);&#10;&#9;&#9;&#9;self.unbind(event, oneHandler);&#10;&#9;&#9;&#125;;&#10;&#9;&#9;return self.bind(event, oneHandler);&#10;&#9;&#125;,&#10;&#10;&#9;uniqueBind: function(event, callback) &#123;&#10;&#9;&#9;this.unbind(event, callback);&#10;&#9;&#9;return this.bind(event, callback);&#10;&#9;&#125;,&#10;&#10;&#9;destroy: function() &#123;&#10;&#9;&#9;Crafty.trigger(&#34;SystemDestroyed&#34;, this);&#10;&#9;&#9;// Check the template itself&#10;&#9;&#9;if (typeof this.remove === &#34;function&#34;) &#123;&#10;&#9;&#9;&#9;this.remove();&#10;&#9;&#9;&#125;&#10;&#9;&#9;this._unbindAll();&#10;&#9;&#9;delete Crafty._systems[this.name];&#10;&#9;&#125;&#10;&#10;&#125;;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],14:[function(require,module,exports)&#123;&#10;/**@&#10; * #Delay&#10; * @category Utilities&#10; *&#10; * A component for triggering functions after a given amount of time.&#10; *&#10; * This syncs with Crafty&#39;s internal clock, and so should generally be preferred to using methods such as `setTimeout`.&#10; */&#10;module.exports = &#123;&#10;    init: function () &#123;&#10;        this._delays = [];&#10;        this.bind(&#34;EnterFrame&#34;, function (frameData) &#123;&#10;            var index = this._delays.length;&#10;            while (--index &#62;= 0) &#123;&#10;                var item = this._delays[index];&#10;                if (item === false) &#123;&#10;                    // remove canceled item from array&#10;                    this._delays.splice(index, 1);&#10;                &#125; else &#123;&#10;                    item.accumulator+=frameData.dt;&#10;                    // The while loop handles the (pathological) case where dt&#62;delay&#10;                    while(item.accumulator &#62;= item.delay &#38;&#38; item.repeat &#62;= 0)&#123;&#10;                        item.accumulator -= item.delay;&#10;                        item.repeat--;&#10;                        item.callback.call(this);&#10;                    &#125;&#10;                    // remove finished item from array&#10;                    if (item.repeat&#60;0)&#123;&#10;                        this._delays.splice(index, 1);&#10;                        if(typeof item.callbackOff === &#34;function&#34;)&#10;                            item.callbackOff.call(this);&#10;                    &#125;&#10;                &#125;&#10;            &#125;&#10;        &#125;);&#10;&#10;    &#125;,&#10;    /**@&#10;     * #.delay&#10;     * @comp Delay&#10;     * @sign public this.delay(Function callback, Number delay[, Number repeat[, Function callbackOff]])&#10;     * @param callback - Method to execute after given amount of milliseconds. If reference of a&#10;     * method is passed, there&#39;s possibility to cancel the delay.&#10;     * @param delay - Amount of milliseconds to execute the method.&#10;     * @param repeat - (optional) How often to repeat the delayed function. A value of 0 triggers the delayed&#10;     * function exactly once. A value n &#62; 0 triggers the delayed function exactly n+1 times. A&#10;     * value of -1 triggers the delayed function indefinitely. Defaults to one execution.&#10;     * @param callbackOff - (optional) Method to execute after delay ends(after all iterations are executed). &#10;     * If repeat value equals -1, callbackOff will never be triggered.&#10;     *&#10;     * The delay method will execute a function after a given amount of time in milliseconds.&#10;     *&#10;     * It is not a wrapper for `setTimeout`.&#10;     *&#10;     * If Crafty is paused, the delay is interrupted with the pause and then resume when unpaused&#10;     *&#10;     * If the entity is destroyed, the delay is also destroyed and will not have effect.&#10;     *&#10;     * @example&#10;     *&#10;     * The simplest delay&#10;     *</span><br></pre></td></tr></table></figure>

     * Crafty.log("start");
     * Crafty.e("Delay").delay(function() {
     *   Crafty.log("100ms later");
     * }, 100, 0);
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">*&#10;* Delay with callbackOff to be executed after all delay iterations&#10;*</span><br></pre></td></tr></table></figure>

     * Crafty.log("start");
     * Crafty.e("Delay").delay(function() {
     *   Crafty.log("100ms later");
     * }, 100, 3, function() {
     *   Crafty.log("delay finished");
     * });
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; */&#10;delay: function (callback, delay, repeat, callbackOff) &#123;&#10;    this._delays.push(&#123;&#10;        accumulator: 0,&#10;        callback: callback,&#10;        callbackOff: callbackOff,&#10;        delay: delay,&#10;        repeat: (repeat &#60; 0 ? Infinity : repeat) || 0,&#10;    &#125;);&#10;    return this;&#10;&#125;,&#10;/**@&#10; * #.cancelDelay&#10; * @comp Delay&#10; * @sign public this.cancelDelay(Function callback)&#10; * @param callback - Method reference passed to .delay&#10; *&#10; * The cancelDelay method will cancel a delay set previously.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var doSomething = function(){
     *   Crafty.log("doing something");
     * };
     *
     * // execute doSomething each 100 miliseconds indefinetely
     * var ent = Crafty.e("Delay").delay(doSomething, 100, -1);
     *
     * // and some time later, cancel further execution of doSomething
     * ent.cancelDelay(doSomething);
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    cancelDelay: function (callback) &#123;&#10;        var index = this._delays.length;&#10;        while (--index &#62;= 0) &#123;&#10;            var item = this._delays[index];&#10;            if(item &#38;&#38; item.callback == callback)&#123;&#10;                this._delays[index] = false;&#10;            &#125;&#10;        &#125;&#10;        return this;&#10;    &#125;&#10;&#125;;&#10;&#10;&#125;,&#123;&#125;],15:[function(require,module,exports)&#123;&#10;/**@&#10; * #Tween&#10; * @category Animation&#10; * @trigger TweenEnd - when a tween finishes - String - property&#10; *&#10; * Component to animate the change in 2D properties over time.&#10; */&#10;module.exports = &#123;&#10;&#10;  init: function()&#123;&#10;    this.tweenGroup = &#123;&#125;;&#10;    this.tweenStart = &#123;&#125;;&#10;    this.tweens = [];&#10;    this.uniqueBind(&#34;EnterFrame&#34;, this._tweenTick);&#10;&#10;  &#125;,&#10;&#10;  _tweenTick: function(frameData)&#123;&#10;    var tween, v, i;&#10;    for ( i = this.tweens.length-1; i&#62;=0; i--)&#123;&#10;      tween = this.tweens[i];&#10;      tween.easing.tick(frameData.dt);&#10;      v  = tween.easing.value();&#10;      this._doTween(tween.props, v);&#10;      if (tween.easing.complete) &#123;&#10;        this.tweens.splice(i, 1);&#10;        this._endTween(tween.props);&#10;      &#125;&#10;    &#125;&#10;  &#125;,&#10;&#10;  _doTween: function(props, v)&#123;&#10;    for (var name in props)&#10;      this[name] = (1-v) * this.tweenStart[name] + v * props[name];&#10;&#10;  &#125;,&#10;&#10;&#10;&#10;  /**@&#10;  * #.tween&#10;  * @comp Tween&#10;  * @sign public this .tween(Object properties, Number duration[, String|function easingFn])&#10;  * @param properties - Object of numeric properties and what they should animate to&#10;  * @param duration - Duration to animate the properties over, in milliseconds.&#10;  * @param easingFn - A string or custom function specifying an easing.  (Defaults to linear behavior.)  See Crafty.easing for more information.&#10;  *&#10;  * This method will animate numeric properties over the specified duration.&#10;  * These include `x`, `y`, `w`, `h`, `alpha` and `rotation`.&#10;  *&#10;  * The object passed should have the properties as keys and the value should be the resulting&#10;  * values of the properties.  The passed object might be modified if later calls to tween animate the same properties.&#10;  *&#10;  * @example&#10;  * Move an object to 100,100 and fade out over 200 ms.&#10;  *</span><br></pre></td></tr></table></figure>

  * Crafty.e("2D, Tween")
  *    .attr({alpha: 1.0, x: 0, y: 0})
  *    .tween({alpha: 0.0, x: 100, y: 100}, 200)
  * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* @example&#10;* Rotate an object over 2 seconds, using the &#34;smootherStep&#34; easing function.&#10;*</span><br></pre></td></tr></table></figure>

  * Crafty.e("2D, Tween")
  *    .attr({rotation:0})
  *    .tween({rotation:180}, 2000, "smootherStep")
  * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">  *&#10;  * @see Crafty.easing&#10;  *&#10;  */&#10;  tween: function (props, duration, easingFn) &#123;&#10;&#10;    var tween = &#123;&#10;      props: props,&#10;      easing: new Crafty.easing(duration, easingFn)&#10;    &#125;;&#10;&#10;    // Tweens are grouped together by the original function call.&#10;    // Individual properties must belong to only a single group&#10;    // When a new tween starts, if it already belongs to a group, move it to the new one&#10;    // Record the group it currently belongs to, as well as its starting coordinate.&#10;    for (var propname in props)&#123;&#10;      if (typeof this.tweenGroup[propname] !== &#34;undefined&#34;)&#10;        this.cancelTween(propname);&#10;      this.tweenStart[propname] = this[propname];&#10;      this.tweenGroup[propname] = props;&#10;    &#125;&#10;    this.tweens.push(tween);&#10;&#10;    return this;&#10;&#10;  &#125;,&#10;&#10;  /**@&#10;  * #.cancelTween&#10;  * @comp Tween&#10;  * @sign public this .cancelTween(String target)&#10;  * @param target - The property to cancel&#10;  *&#10;  * @sign public this .cancelTween(Object target)&#10;  * @param target - An object containing the properties to cancel.&#10;  *&#10;  * Stops tweening the specified property or properties.&#10;  * Passing the object used to start the tween might be a typical use of the second signature.&#10;  */&#10;  cancelTween: function(target)&#123;&#10;    if (typeof target === &#34;string&#34;)&#123;&#10;      if (typeof this.tweenGroup[target] == &#34;object&#34; )&#10;        delete this.tweenGroup[target][target];&#10;    &#125; else if (typeof target === &#34;object&#34;) &#123;&#10;      for (var propname in target)&#10;        this.cancelTween(propname);&#10;    &#125;&#10;&#10;    return this;&#10;&#10;  &#125;,&#10;&#10;  /**@&#10;  * #.pauseTweens&#10;  * @comp Tween&#10;  * @sign public this .pauseTweens()&#10;  *&#10;  * Pauses all tweens associated with the entity&#10;  */&#10;  pauseTweens: function()&#123;&#10;      this.tweens.map(function(e)&#123;e.easing.pause();&#125;);&#10;  &#125;,&#10;&#10;  /**@&#10;  * #.resumeTWeens&#10;  * @comp Tween&#10;  * @sign public this .resumeTweens()&#10;  *&#10;  * Resumes all paused tweens associated with the entity&#10;  */&#10;  resumeTweens: function()&#123;&#10;      this.tweens.map(function(e)&#123;e.easing.resume();&#125;);&#10;  &#125;,&#10;&#10;  /*&#10;  * Stops tweening the specified group of properties, and fires the &#34;TweenEnd&#34; event.&#10;  */&#10;  _endTween: function(properties)&#123;&#10;    for (var propname in properties)&#123;&#10;      delete this.tweenGroup[propname];&#10;    &#125;&#10;    this.trigger(&#34;TweenEnd&#34;, properties);&#10;  &#125;&#10;&#125;;&#10;&#10;&#125;,&#123;&#125;],16:[function(require,module,exports)&#123;&#10;module.exports = &#34;0.7.1&#34;;&#10;&#125;,&#123;&#125;],17:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;./core/core&#39;);&#10;&#10;Crafty.easing = require(&#39;./core/animation&#39;);&#10;Crafty.extend(require(&#39;./core/extensions&#39;));&#10;Crafty.extend(require(&#39;./core/loader&#39;));&#10;Crafty.c(&#39;Model&#39;, require(&#39;./core/model&#39;));&#10;Crafty.extend(require(&#39;./core/scenes&#39;));&#10;Crafty.storage = require(&#39;./core/storage&#39;);&#10;Crafty.c(&#39;Delay&#39;, require(&#39;./core/time&#39;));&#10;Crafty.c(&#39;Tween&#39;, require(&#39;./core/tween&#39;));&#10;&#10;require(&#39;./core/systems&#39;);&#10;&#10;require(&#39;./spatial/2d&#39;);&#10;require(&#39;./spatial/collision&#39;);&#10;require(&#39;./spatial/spatial-grid&#39;);&#10;require(&#39;./spatial/rect-manager&#39;);&#10;require(&#39;./spatial/math&#39;);&#10;&#10;require(&#39;./graphics/canvas&#39;);&#10;require(&#39;./graphics/canvas-layer&#39;);&#10;require(&#39;./graphics/color&#39;);&#10;require(&#39;./graphics/dom&#39;);&#10;require(&#39;./graphics/dom-helper&#39;);&#10;require(&#39;./graphics/dom-layer&#39;);&#10;require(&#39;./graphics/drawing&#39;);&#10;require(&#39;./graphics/gl-textures&#39;);&#10;require(&#39;./graphics/html&#39;);&#10;require(&#39;./graphics/image&#39;);&#10;require(&#39;./graphics/particles&#39;);&#10;require(&#39;./graphics/sprite-animation&#39;);&#10;require(&#39;./graphics/sprite&#39;);&#10;require(&#39;./graphics/text&#39;);&#10;require(&#39;./graphics/viewport&#39;);&#10;require(&#39;./graphics/webgl&#39;);&#10;&#10;require(&#39;./isometric/diamond-iso&#39;);&#10;require(&#39;./isometric/isometric&#39;);&#10;&#10;require(&#39;./controls/inputs&#39;);&#10;require(&#39;./controls/controls&#39;);&#10;require(&#39;./controls/device&#39;);&#10;require(&#39;./controls/keycodes&#39;);&#10;&#10;require(&#39;./sound/sound&#39;);&#10;&#10;require(&#39;./debug/debug-layer&#39;);&#10;require(&#39;./debug/logging&#39;);&#10;&#10;if(window) window.Crafty = Crafty;&#10;&#10;module.exports = Crafty;&#10;&#10;&#125;,&#123;&#34;./controls/controls&#34;:2,&#34;./controls/device&#34;:3,&#34;./controls/inputs&#34;:4,&#34;./controls/keycodes&#34;:5,&#34;./core/animation&#34;:6,&#34;./core/core&#34;:7,&#34;./core/extensions&#34;:8,&#34;./core/loader&#34;:9,&#34;./core/model&#34;:10,&#34;./core/scenes&#34;:11,&#34;./core/storage&#34;:12,&#34;./core/systems&#34;:13,&#34;./core/time&#34;:14,&#34;./core/tween&#34;:15,&#34;./debug/debug-layer&#34;:18,&#34;./debug/logging&#34;:19,&#34;./graphics/canvas&#34;:21,&#34;./graphics/canvas-layer&#34;:20,&#34;./graphics/color&#34;:22,&#34;./graphics/dom&#34;:25,&#34;./graphics/dom-helper&#34;:23,&#34;./graphics/dom-layer&#34;:24,&#34;./graphics/drawing&#34;:26,&#34;./graphics/gl-textures&#34;:27,&#34;./graphics/html&#34;:28,&#34;./graphics/image&#34;:29,&#34;./graphics/particles&#34;:30,&#34;./graphics/sprite&#34;:32,&#34;./graphics/sprite-animation&#34;:31,&#34;./graphics/text&#34;:33,&#34;./graphics/viewport&#34;:34,&#34;./graphics/webgl&#34;:35,&#34;./isometric/diamond-iso&#34;:36,&#34;./isometric/isometric&#34;:37,&#34;./sound/sound&#34;:38,&#34;./spatial/2d&#34;:39,&#34;./spatial/collision&#34;:40,&#34;./spatial/math&#34;:41,&#34;./spatial/rect-manager&#34;:42,&#34;./spatial/spatial-grid&#34;:43&#125;],18:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;),&#10;    document = window.document;&#10;&#10;/**@&#10; * #DebugCanvas&#10; * @category Debug&#10; * @trigger Draw - when the entity is ready to be drawn to the stage&#10; * @trigger NoCanvas - if the browser does not support canvas&#10; *&#10; * When this component is added to an entity it will be drawn by the DebugCanvas layer.&#10; *&#10; * Crafty.debugCanvas.init() will be automatically called if it is not called already to initialize the canvas element.&#10; *&#10; * To visualise an object&#39;s MBR, use &#34;VisibleMBR&#34;.  To visualise a &#34;Collision&#34; object&#39;s hitbox, use &#34;WiredHitBox&#34; or &#34;SolidHitBox&#34;.&#10; * @see DebugPolygon,  DebugRectangle&#10; */&#10;Crafty.c(&#34;DebugCanvas&#34;, &#123;&#10;    init: function () &#123;&#10;        this.requires(&#34;2D&#34;);&#10;        if (!Crafty.DebugCanvas.context)&#10;            Crafty.DebugCanvas.init();&#10;        Crafty.DebugCanvas.add(this);&#10;        this._debug = &#123;&#10;            alpha: 1.0,&#10;            lineWidth: 1&#10;        &#125;;&#10;        this.bind(&#34;RemoveComponent&#34;, this.onDebugRemove);&#10;        this.bind(&#34;Remove&#34;, this.onDebugDestroy);&#10;    &#125;,&#10;&#10;    // When component is removed&#10;    onDebugRemove: function (id) &#123;&#10;        if (id === &#34;DebugCanvas&#34;) &#123;&#10;            Crafty.DebugCanvas.remove(this);&#10;        &#125;&#10;    &#125;,&#10;&#10;    //When entity is destroyed&#10;    onDebugDestroy: function (id) &#123;&#10;        Crafty.DebugCanvas.remove(this);&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.debugAlpha&#10;     * @comp DebugCanvas&#10;     * @sign public  .debugAlpha(Number alpha)&#10;     * @param alpha - The alpha level the component will be drawn with&#10;     */&#10;    debugAlpha: function (alpha) &#123;&#10;        this._debug.alpha = alpha;&#10;        return this;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.debugFill&#10;     * @comp DebugCanvas&#10;     * @sign public  .debugFill([String fillStyle])&#10;     * @param fillStyle - The color the component will be filled with.  Defaults to &#34;red&#34;. Pass the boolean false to turn off filling.&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * var myEntity = Crafty.e("2D, Collision, SolidHitBox ").debugFill("purple")
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;debugFill: function (fillStyle) &#123;&#10;    if (typeof fillStyle === &#39;undefined&#39;)&#10;        fillStyle = &#34;red&#34;;&#10;    this._debug.fillStyle = fillStyle;&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.debugStroke&#10; * @comp DebugCanvas&#10; * @sign public  .debugStroke([String strokeStyle])&#10; * @param strokeStyle - The color the component will be outlined with.  Defaults to &#34;red&#34;.  Pass the boolean false to turn this off.&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var myEntity = Crafty.e("2D, Collision, WiredHitBox ").debugStroke("white")
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    debugStroke: function (strokeStyle) &#123;&#10;        if (typeof strokeStyle === &#39;undefined&#39;)&#10;            strokeStyle = &#34;red&#34;;&#10;        this._debug.strokeStyle = strokeStyle;&#10;        return this;&#10;    &#125;,&#10;&#10;    debugDraw: function (ctx) &#123;&#10;        var ga = ctx.globalAlpha;&#10;        var props = this._debug;&#10;&#10;        if (props.alpha)&#10;            ctx.globalAlpha = this._debug.alpha;&#10;&#10;        if (props.strokeStyle)&#10;            ctx.strokeStyle = props.strokeStyle;&#10;&#10;        if (props.lineWidth)&#10;            ctx.lineWidth = props.lineWidth;&#10;&#10;        if (props.fillStyle)&#10;            ctx.fillStyle = props.fillStyle;&#10;&#10;        this.trigger(&#34;DebugDraw&#34;);&#10;&#10;        ctx.globalAlpha = ga;&#10;&#10;    &#125;&#10;&#10;&#10;&#125;);&#10;&#10;&#10;&#10;/**@&#10; * #DebugRectangle&#10; * @category Debug&#10; *&#10; * A component for rendering an object with a position and dimensions to the debug canvas.&#10; *&#10; *&#10; *</span><br></pre></td></tr></table></figure>

 * var myEntity = Crafty.e("2D, DebugRectangle")
 *                      .attr({x: 13, y: 37, w: 42, h: 42})
 *                      .debugStroke("green");
 * myEntity.debugRectangle(myEntity)
 *<figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> * @see DebugCanvas&#10; */&#10;Crafty.c(&#34;DebugRectangle&#34;, &#123;&#10;    init: function () &#123;&#10;        this.requires(&#34;2D, DebugCanvas&#34;);&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.debugRectangle&#10;     * @comp DebugRectangle&#10;     * @sign public  .debugRectangle(Object rect)&#10;     * @param rect - an object with _x, _y, _w, and _h to draw&#10;     *&#10;     * Sets the rectangle that this component draws to the debug canvas.&#10;     *&#10;     */&#10;    debugRectangle: function (rect) &#123;&#10;        this.debugRect = rect;&#10;        this.unbind(&#34;DebugDraw&#34;, this.drawDebugRect);&#10;        this.bind(&#34;DebugDraw&#34;, this.drawDebugRect);&#10;        return this;&#10;&#10;    &#125;,&#10;&#10;    drawDebugRect: function () &#123;&#10;&#10;        var ctx = Crafty.DebugCanvas.context;&#10;        var rect = this.debugRect;&#10;        if (rect === null || rect === undefined)&#10;            return;&#10;        if (rect._h &#38;&#38; rect._w) &#123;&#10;            if (this._debug.fillStyle)&#10;                ctx.fillRect(rect._x, rect._y, rect._w, rect._h);&#10;            if (this._debug.strokeStyle)&#10;                ctx.strokeRect(rect._x, rect._y, rect._w, rect._h);&#10;        &#125;&#10;&#10;    &#125;&#10;&#10;&#10;&#10;&#125;);&#10;&#10;&#10;&#10;/**@&#10; * #VisibleMBR&#10; * @category Debug&#10; *&#10; * Adding this component to an entity will cause it&#39;s MBR to be drawn to the debug canvas.&#10; *&#10; * The methods of DebugCanvas can be used to control this component&#39;s appearance.&#10; * @see 2D, DebugRectangle, DebugCanvas&#10; */&#10;Crafty.c(&#34;VisibleMBR&#34;, &#123;&#10;    init: function () &#123;&#10;        this.requires(&#34;DebugRectangle&#34;)&#10;            .debugFill(&#34;purple&#34;)&#10;            .bind(&#34;EnterFrame&#34;, this._assignRect);&#10;    &#125;,&#10;&#10;    // Internal method for updating the MBR drawn.&#10;    _assignRect: function () &#123;&#10;        if (this._mbr)&#10;            this.debugRectangle(this._mbr);&#10;        else&#10;            this.debugRectangle(this);&#10;&#10;    &#125;&#10;&#10;&#10;&#125;);&#10;&#10;&#10;/**@&#10; * #DebugPolygon&#10; * @category Debug&#10; *&#10; * For drawing a polygon to the debug canvas&#10; *&#10; * The methods of DebugCanvas can be used to control this component&#39;s appearance -- by default it is neither filled nor outlined&#10; *&#10; * For debugging hitboxes, use WiredHitBox or SolidHitBox.  For debugging MBR, use VisibleMBR&#10; *&#10; * @see DebugCanvas&#10; */&#10;Crafty.c(&#34;DebugPolygon&#34;, &#123;&#10;    init: function () &#123;&#10;        this.requires(&#34;2D, DebugCanvas&#34;);&#10;    &#125;,&#10;&#10;&#10;    /**@&#10;     * #.debugPolygon&#10;     * @comp DebugPolygon&#10;     * @sign public  .debugPolygon(Polygon poly)&#10;     * @param poly - a polygon to render&#10;     *&#10;     * Sets the polygon that this component renders to the debug canvas.&#10;     *&#10;     */&#10;    debugPolygon: function (poly) &#123;&#10;        this.polygon = poly;&#10;        this.unbind(&#34;DebugDraw&#34;, this.drawDebugPolygon);&#10;        this.bind(&#34;DebugDraw&#34;, this.drawDebugPolygon);&#10;        return this;&#10;    &#125;,&#10;&#10;    drawDebugPolygon: function () &#123;&#10;        if (typeof this.polygon === &#34;undefined&#34;)&#10;            return;&#10;&#10;        var ctx = Crafty.DebugCanvas.context;&#10;        ctx.beginPath();&#10;        var p = this.polygon.points, l = p.length;&#10;        for (var i=0; i&#60;l; i+=2)&#123;&#10;            ctx.lineTo(p[i], p[i+1]);&#10;        &#125;&#10;        ctx.closePath();&#10;&#10;        if (this._debug.fillStyle)&#10;            ctx.fill();&#10;        if (this._debug.strokeStyle)&#10;            ctx.stroke();&#10;    &#125;&#10;&#125;);&#10;&#10;&#10;/**@&#10; * #WiredHitBox&#10; * @category Debug&#10; *&#10; * Adding this component to an entity with a Collision component will cause its collision polygon to be drawn to the debug canvas as an outline&#10; *&#10; * The methods of DebugCanvas can be used to control this component&#39;s appearance.&#10; * @see DebugPolygon, DebugCanvas&#10; */&#10;Crafty.c(&#34;WiredHitBox&#34;, &#123;&#10;    init: function () &#123;&#10;        this.requires(&#34;DebugPolygon&#34;)&#10;            .debugStroke(&#34;red&#34;)&#10;            .matchHitBox();&#10;        this.bind(&#34;NewHitbox&#34;, this.matchHitBox);&#10;    &#125;,&#10;    matchHitBox: function () &#123;&#10;        this.debugPolygon(this.map);&#10;    &#125;&#10;&#125;);&#10;&#10;/**@&#10; * #SolidHitBox&#10; * @category Debug&#10; *&#10; * Adding this component to an entity with a Collision component will cause its collision polygon to be drawn to the debug canvas, with a default alpha level of 0.7.&#10; *&#10; * The methods of DebugCanvas can be used to control this component&#39;s appearance.&#10; * @see DebugPolygon, DebugCanvas&#10; */&#10;Crafty.c(&#34;SolidHitBox&#34;, &#123;&#10;    init: function () &#123;&#10;        this.requires(&#34;Collision, DebugPolygon&#34;)&#10;            .debugFill(&#34;orange&#34;).debugAlpha(0.7)&#10;            .matchHitBox();&#10;        this.bind(&#34;NewHitbox&#34;, this.matchHitBox);&#10;    &#125;,&#10;    matchHitBox: function () &#123;&#10;        this.debugPolygon(this.map);&#10;    &#125;&#10;&#125;);&#10;&#10;/**@&#10; * #WiredAreaMap&#10; * @category Debug&#10; *&#10; * Adding this component to an entity with an AreaMap component will cause its click polygon to be drawn to the debug canvas as an outline.&#10; * Following click areas exist for an entity (in decreasing order of priority): AreaMap, Hitbox, MBR. Use the appropriate debug components to display them.&#10; *&#10; * The methods of DebugCanvas can be used to control this component&#39;s appearance.&#10; * @see DebugPolygon, DebugCanvas&#10; */&#10;Crafty.c(&#34;WiredAreaMap&#34;, &#123;&#10;    init: function () &#123;&#10;        this.requires(&#34;DebugPolygon&#34;)&#10;            .debugStroke(&#34;green&#34;)&#10;            .matchAreaMap();&#10;        this.bind(&#34;NewAreaMap&#34;, this.matchAreaMap);&#10;    &#125;,&#10;    matchAreaMap: function () &#123;&#10;        this.debugPolygon(this.mapArea);&#10;    &#125;&#10;&#125;);&#10;&#10;/**@&#10; * #SolidAreaMap&#10; * @category Debug&#10; *&#10; * Adding this component to an entity with an AreaMap component will cause its click polygon to be drawn to the debug canvas, with a default alpha level of 0.7.&#10; * Following click areas exist for an entity (in decreasing order of priority): AreaMap, Hitbox, MBR. Use the appropriate debug components to display them.&#10; *&#10; * The methods of DebugCanvas can be used to control this component&#39;s appearance.&#10; * @see DebugPolygon, DebugCanvas&#10; */&#10;Crafty.c(&#34;SolidAreaMap&#34;, &#123;&#10;    init: function () &#123;&#10;        this.requires(&#34;DebugPolygon&#34;)&#10;            .debugFill(&#34;lime&#34;).debugAlpha(0.7)&#10;            .matchAreaMap();&#10;        this.bind(&#34;NewAreaMap&#34;, this.matchAreaMap);&#10;    &#125;,&#10;    matchAreaMap: function () &#123;&#10;        this.debugPolygon(this.mapArea);&#10;    &#125;&#10;&#125;);&#10;&#10;Crafty.DebugCanvas = &#123;&#10;    context: null,&#10;    entities: [],&#10;    onetimeEntities: [],&#10;    add: function (ent) &#123;&#10;        this.entities.push(ent);&#10;    &#125;,&#10;&#10;    remove: function (ent) &#123;&#10;        var list = this.entities;&#10;        for (var i = list.length - 1; i &#62;= 0; i--)&#10;            if (list[i] == ent)&#10;                list.splice(i, 1);&#10;&#10;    &#125;,&#10;&#10;    // Mostly copied from canvas.init()&#10;    // Called the first time a &#34;DebugCanvas&#34; component is added to an entity&#10;    // We should consider how to abstract the idea of multiple canvases&#10;    init: function () &#123;&#10;        if (!Crafty.DebugCanvas.context) &#123;&#10;            //check if canvas is supported&#10;            if (!Crafty.support.canvas) &#123;&#10;                Crafty.trigger(&#34;NoCanvas&#34;);&#10;                Crafty.stop();&#10;                return;&#10;            &#125;&#10;&#10;            //create an empty canvas element&#10;            var c;&#10;            c = document.createElement(&#34;canvas&#34;);&#10;            c.width = Crafty.viewport.width;&#10;            c.height = Crafty.viewport.height;&#10;            c.style.position = &#39;absolute&#39;;&#10;            c.style.left = &#34;0px&#34;;&#10;            c.style.top = &#34;0px&#34;;&#10;            c.id = &#34;debug-canvas&#34;;&#10;            // The debug canvas should be on the very top; the highest a regular zindex can get is ~10000&#10;            c.style.zIndex = 100000;&#10;&#10;            Crafty.stage.elem.appendChild(c);&#10;            Crafty.DebugCanvas.context = c.getContext(&#39;2d&#39;);&#10;            Crafty.DebugCanvas._canvas = c;&#10;&#10;&#10;&#10;        &#125;&#10;        //Bind rendering of canvas context (see drawing.js)&#10;        Crafty.unbind(&#34;RenderScene&#34;, Crafty.DebugCanvas.renderScene);&#10;        Crafty.bind(&#34;RenderScene&#34;, Crafty.DebugCanvas.renderScene);&#10;&#10;    &#125;,&#10;&#10;&#10;    // copied from drawAll()&#10;    renderScene: function (rect) &#123;&#10;        rect = rect || Crafty.viewport.rect();&#10;        var q = Crafty.DebugCanvas.entities,&#10;            i = 0,&#10;            l = q.length,&#10;            ctx = Crafty.DebugCanvas.context,&#10;            current;&#10;&#10;        var view = Crafty.viewport;&#10;        ctx.setTransform(view._scale, 0, 0, view._scale, Math.round(view._x*view._scale), Math.round(view._y*view._scale));&#10;&#10;        ctx.clearRect(rect._x, rect._y, rect._w, rect._h);&#10;&#10;&#10;        //sort the objects by the global Z&#10;        //q.sort(zsort);&#10;        for (; i &#60; l; i++) &#123;&#10;            current = q[i];&#10;            current.debugDraw(ctx);&#10;        &#125;&#10;&#10;    &#125;&#10;&#10;&#125;;&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],19:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;&#10;/**@&#10; * #Crafty.log&#10; * @category Debug&#10; *&#10; * @sign Crafty.log( arguments )&#10; * @param arguments - arguments which are passed to `console.log`&#10; *&#10; * This is a simple wrapper for `console.log`.  You can disable logging messages by setting `Crafty.loggingEnabled` to false.&#10; * It is recommended to use `Crafty.log`, as `console.log` can crash on IE9.&#10; */&#10;/**@&#10; * #Crafty.error&#10; * @category Debug&#10; *&#10; * @sign Crafty.error( arguments )&#10; * @param arguments - arguments which are passed to `console.error`&#10; *&#10; * This is a simple wrapper for `console.error`.  You can disable logging messages by setting `Crafty.loggingEnabled` to false.&#10; * It is recommended to use `Crafty.error`, as `console.error` can crash on IE9.&#10; */&#10;Crafty.extend(&#123;&#10;&#9;// Allow logging to be disabled&#10;&#9;loggingEnabled: true,&#10;&#9;// In some cases console.log doesn&#39;t exist, so provide a wrapper for it&#10;&#9;log: function() &#123;&#10;&#9;&#9;if (Crafty.loggingEnabled &#38;&#38; console &#38;&#38; console.log) &#123;&#10;&#9;&#9;&#9;console.log.apply(console, arguments);&#10;&#9;&#9;&#125;&#10;&#9;&#125;,&#10;&#9;error: function() &#123;&#10;&#9;&#9;if (Crafty.loggingEnabled &#38;&#38; console &#38;&#38; console.error) &#123;&#10;&#9;&#9;&#9;console.error.apply(console, arguments);&#10;&#9;&#9;&#125;&#10;&#9;&#125;&#10;&#125;);&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],20:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;&#10;/**@&#10; * #Crafty.canvasLayer&#10; * @category Graphics&#10; *&#10; * Collection of mostly private methods to draw entities on a canvas element.&#10; */&#10;Crafty.extend(&#123;&#10;    canvasLayer: &#123;&#10;        _dirtyRects: [],&#10;        _changedObjs: [],&#10;        layerCount: 0,&#10;        _dirtyViewport: false,&#10;&#10;        // Sort function for rendering in the correct order&#10;        _sort: function(a, b) &#123;&#10;            return a._globalZ - b._globalZ;&#10;        &#125;,&#10;&#10;        /**@&#10;         * #Crafty.canvasLayer.add&#10;         * @comp Crafty.canvasLayer&#10;         * @sign public Crafty.canvasLayer.add(ent)&#10;         * @param ent - The entity to add&#10;         *&#10;         * Add an entity to the list of Canvas objects to draw&#10;         */&#10;        add: function add(ent) &#123;&#10;            this._changedObjs.push(ent);&#10;        &#125;,&#10;        /**@&#10;         * #Crafty.canvasLayer.context&#10;         * @comp Crafty.canvasLayer&#10;         *&#10;         * This will return the 2D context of the main canvas element.&#10;         * The value returned from `Crafty.canvasLayer._canvas.getContext(&#39;2d&#39;)`.&#10;         */&#10;        context: null,&#10;        /**@&#10;         * #Crafty.canvasLayer._canvas&#10;         * @comp Crafty.canvasLayer&#10;         *&#10;         * Main Canvas element&#10;         */&#10;         _canvas: null,&#10;&#10;        /**@&#10;         * #Crafty.canvasLayer.init&#10;         * @comp Crafty.canvasLayer&#10;         * @sign public void Crafty.canvasLayer.init(void)&#10;         * @trigger NoCanvas - triggered if `Crafty.support.canvas` is false&#10;         *&#10;         * Creates a `canvas` element inside `Crafty.stage.elem`. Must be called&#10;         * before any entities with the Canvas component can be drawn.&#10;         *&#10;         * This method will automatically be called if no `Crafty.canvasLayer.context` is&#10;         * found.&#10;         */&#10;        init: function () &#123;&#10;            //check if canvas is supported&#10;            if (!Crafty.support.canvas) &#123;&#10;                Crafty.trigger(&#34;NoCanvas&#34;);&#10;                Crafty.stop();&#10;                return;&#10;            &#125;&#10;&#10;            // set properties to initial values -- necessary on a restart&#10;            this._dirtyRects = [];&#10;            this._changedObjs = [];&#10;            this.layerCount = 0;&#10;&#10;            //create an empty canvas element&#10;            var c;&#10;            c = document.createElement(&#34;canvas&#34;);&#10;            c.width = Crafty.viewport.width;&#10;            c.height = Crafty.viewport.height;&#10;            c.style.position = &#39;absolute&#39;;&#10;            c.style.left = &#34;0px&#34;;&#10;            c.style.top = &#34;0px&#34;;&#10;&#10;            var canvas = Crafty.canvasLayer;&#10;&#10;            Crafty.stage.elem.appendChild(c);&#10;            this.context = c.getContext(&#39;2d&#39;);&#10;            this._canvas = c;&#10;&#10;            //Set any existing transformations&#10;            var zoom = Crafty.viewport._scale;&#10;            if (zoom != 1)&#10;                c.scale(zoom, zoom);&#10;&#10;            // Set pixelart to current status, and listen for changes&#10;            this._setPixelart(Crafty._pixelartEnabled);&#10;            Crafty.uniqueBind(&#34;PixelartSet&#34;, this._setPixelart);&#10;&#10;            //Bind rendering of canvas context (see drawing.js)&#10;            Crafty.uniqueBind(&#34;RenderScene&#34;, this._render);&#10;            &#10;            Crafty.uniqueBind(&#34;ViewportResize&#34;, this._resize);&#10;&#10;            Crafty.bind(&#34;InvalidateViewport&#34;, function () &#123;&#10;                Crafty.canvasLayer._dirtyViewport = true;&#10;            &#125;);&#10;        &#125;,&#10;&#10;&#10;        _render: function() &#123;&#10;            var layer = Crafty.canvasLayer,&#10;                dirtyViewport = layer._dirtyViewport,&#10;                l = layer._changedObjs.length,&#10;                ctx = layer.context;&#10;            if (!l &#38;&#38; !dirtyViewport) &#123;&#10;                return;&#10;            &#125;&#10;&#10;            if (dirtyViewport) &#123;&#10;                var view = Crafty.viewport;&#10;                ctx.setTransform(view._scale, 0, 0, view._scale, Math.round(view._x*view._scale), Math.round(view._y*view._scale) );&#10;            &#125;&#10;&#10;            //if the amount of changed objects is over 60% of the total objects&#10;            //do the naive method redrawing&#10;            // TODO: I&#39;m not sure this condition really makes that much sense!&#10;            if (l / layer.layerCount &#62; 0.6 || dirtyViewport) &#123;&#10;                layer._drawAll();&#10;            &#125; else &#123;&#10;                layer._drawDirty();&#10;            &#125;&#10;            //Clean up lists etc&#10;            layer._clean();&#10;        &#125;,&#10;&#10;        /**@&#10;         * #Crafty.canvasLayer.drawDirty&#10;         * @comp Crafty.canvasLayer&#10;         * @sign public Crafty.canvasLayer.drawDirty()&#10;         *&#10;         * - Triggered by the &#34;RenderScene&#34; event&#10;         * - If the number of rects is over 60% of the total number of objects&#10;         *  do the naive method redrawing `Crafty.canvasLayer.drawAll` instead&#10;         * - Otherwise, clear the dirty regions, and redraw entities overlapping the dirty regions.&#10;         *&#10;         * @see Canvas#.draw&#10;         */&#10;        _drawDirty: function () &#123;&#10;&#10;            var i, j, q, rect,len, obj, ent,&#10;                changed = this._changedObjs,&#10;                l = changed.length,&#10;                dirty = this._dirtyRects,&#10;                rectManager = Crafty.rectManager,&#10;                overlap = rectManager.overlap,&#10;                ctx = this.context,&#10;                dupes = [],&#10;                objs = [];&#10;&#10;            // Calculate _dirtyRects from all changed objects, then merge some overlapping regions together&#10;            for (i = 0; i &#60; l; i++) &#123;&#10;                this._createDirty(changed[i]);&#10;            &#125;&#10;            rectManager.mergeSet(dirty);&#10;&#10;&#10;            l = dirty.length;&#10;&#10;            // For each dirty rectangle, find entities near it, and draw the overlapping ones&#10;            for (i = 0; i &#60; l; ++i) &#123; //loop over every dirty rect&#10;                rect = dirty[i];&#10;                dupes.length = 0;&#10;                objs.length = 0;&#10;                if (!rect) continue;&#10;&#10;                // Find the smallest rectangle with integer coordinates that encloses rect&#10;                rect._w = rect._x + rect._w;&#10;                rect._h = rect._y + rect._h;&#10;                rect._x = (rect._x &#62; 0) ? (rect._x|0) : (rect._x|0) - 1;&#10;                rect._y = (rect._y &#62; 0) ? (rect._y|0) : (rect._y|0) - 1;&#10;                rect._w -= rect._x;&#10;                rect._h -= rect._y;&#10;                rect._w = (rect._w === (rect._w|0)) ? rect._w : (rect._w|0) + 1;&#10;                rect._h = (rect._h === (rect._h|0)) ? rect._h : (rect._h|0) + 1;&#10;&#10;                //search for ents under dirty rect&#10;                q = Crafty.map.search(rect, false);&#10;&#10;                //clear the rect from the main canvas&#10;                ctx.clearRect(rect._x, rect._y, rect._w, rect._h);&#10;&#10;                //Then clip drawing region to dirty rectangle&#10;                ctx.save();&#10;                ctx.beginPath();&#10;                ctx.rect(rect._x, rect._y, rect._w, rect._h);&#10;                ctx.clip();&#10;&#10;                // Loop over found objects removing dupes and adding visible canvas objects to array&#10;                for (j = 0, len = q.length; j &#60; len; ++j) &#123;&#10;                    obj = q[j];&#10;&#10;                    if (dupes[obj[0]] || !obj._visible || !obj.__c.Canvas)&#10;                        continue;&#10;                    dupes[obj[0]] = true;&#10;                    objs.push(obj);&#10;                &#125;&#10;&#10;                // Sort objects by z level&#10;                objs.sort(this._sort);&#10;&#10;                // Then draw each object in that order&#10;                for (j = 0, len = objs.length; j &#60; len; ++j) &#123;&#10;                    obj = objs[j];&#10;                    var area = obj._mbr || obj;&#10;                    if (overlap(area, rect))&#10;                        obj.draw();&#10;                    obj._changed = false;&#10;                &#125;&#10;&#10;                // Close rectangle clipping&#10;                ctx.closePath();&#10;                ctx.restore();&#10;&#10;            &#125;&#10;&#10;            // Draw dirty rectangles for debugging, if that flag is set&#10;            if (Crafty.canvasLayer.debugDirty === true) &#123;&#10;                ctx.strokeStyle = &#39;red&#39;;&#10;                for (i = 0, l = dirty.length; i &#60; l; ++i) &#123;&#10;                    rect = dirty[i];&#10;                    ctx.strokeRect(rect._x, rect._y, rect._w, rect._h);&#10;                &#125;&#10;            &#125;&#10;&#10;        &#125;,&#10;&#10;        /**@&#10;         * #Crafty.canvasLayer.drawAll&#10;         * @comp Crafty.canvasLayer&#10;         * @sign public Crafty.canvasLayer.drawAll([Object rect])&#10;         * @param rect - a rectangular region &#123;_x: x_val, _y: y_val, _w: w_val, _h: h_val&#125;&#10;         *&#10;         * - If rect is omitted, redraw within the viewport&#10;         * - If rect is provided, redraw within the rect&#10;         */&#10;        _drawAll: function (rect) &#123;&#10;            rect = rect || Crafty.viewport.rect();&#10;            var q = Crafty.map.search(rect),&#10;                i = 0,&#10;                l = q.length,&#10;                ctx = this.context,&#10;                current;&#10;&#10;            ctx.clearRect(rect._x, rect._y, rect._w, rect._h);&#10;&#10;            //sort the objects by the global Z&#10;            q.sort(this._sort);&#10;            for (; i &#60; l; i++) &#123;&#10;                current = q[i];&#10;                if (current._visible &#38;&#38; current.__c.Canvas) &#123;&#10;                    current.draw();&#10;                    current._changed = false;&#10;                &#125;&#10;            &#125;&#10;        &#125;,&#10;&#10;        debug: function() &#123;&#10;            Crafty.log(this._changedObjs);&#10;        &#125;,&#10;&#10;        /** cleans up current dirty state, stores stale state for future passes */&#10;        _clean: function () &#123;&#10;            var rect, obj, i, l,&#10;                changed = this._changedObjs;&#10;             for (i = 0, l = changed.length; i &#60; l; i++) &#123;&#10;                 obj = changed[i];&#10;                 rect = obj._mbr || obj;&#10;                 if (typeof obj.staleRect === &#39;undefined&#39;)&#10;                     obj.staleRect = &#123;&#125;;&#10;                 obj.staleRect._x = rect._x;&#10;                 obj.staleRect._y = rect._y;&#10;                 obj.staleRect._w = rect._w;&#10;                 obj.staleRect._h = rect._h;&#10;&#10;                 obj._changed = false;&#10;             &#125;&#10;             changed.length = 0;&#10;             this._dirtyRects.length = 0;&#10;             this._dirtyViewport = false;&#10;&#10;        &#125;,&#10;&#10;         /** Takes the current and previous position of an object, and pushes the dirty regions onto the stack&#10;          *  If the entity has only moved/changed a little bit, the regions are squashed together */&#10;        _createDirty: function (obj) &#123;&#10;&#10;            var rect = obj._mbr || obj,&#10;                dirty = this._dirtyRects,&#10;                rectManager = Crafty.rectManager;&#10;&#10;            if (obj.staleRect) &#123;&#10;                //If overlap, merge stale and current position together, then return&#10;                //Otherwise just push stale rectangle&#10;                if (rectManager.overlap(obj.staleRect, rect)) &#123;&#10;                    rectManager.merge(obj.staleRect, rect, obj.staleRect);&#10;                    dirty.push(obj.staleRect);&#10;                    return;&#10;                &#125; else &#123;&#10;                  dirty.push(obj.staleRect);&#10;                &#125;&#10;            &#125;&#10;&#10;            // We use the intermediate &#34;currentRect&#34; so it can be modified without messing with obj&#10;            obj.currentRect._x = rect._x;&#10;            obj.currentRect._y = rect._y;&#10;            obj.currentRect._w = rect._w;&#10;            obj.currentRect._h = rect._h;&#10;            dirty.push(obj.currentRect);&#10;&#10;        &#125;,&#10;&#10;&#10;        // Resize the canvas element to the current viewport&#10;        _resize: function() &#123;&#10;            var c = Crafty.canvasLayer._canvas;&#10;            c.width = Crafty.viewport.width;&#10;            c.height = Crafty.viewport.height;&#10;&#10;        &#125;,&#10;&#10;        _setPixelart: function(enabled) &#123;&#10;            var context = Crafty.canvasLayer.context;&#10;            context.imageSmoothingEnabled = !enabled;&#10;            context.mozImageSmoothingEnabled = !enabled;&#10;            context.webkitImageSmoothingEnabled = !enabled;&#10;            context.oImageSmoothingEnabled = !enabled;&#10;            context.msImageSmoothingEnabled = !enabled;&#10;        &#125;&#10;&#10;    &#125;&#10;&#125;);&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],21:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;&#10;/**@&#10; * #Canvas&#10; * @category Graphics&#10; * @trigger Draw - when the entity is ready to be drawn to the stage - &#123;type: &#34;canvas&#34;, pos, co, ctx&#125;&#10; * @trigger NoCanvas - if the browser does not support canvas&#10; *&#10; * When this component is added to an entity it will be drawn to the global canvas element. The canvas element (and hence all Canvas entities) is always rendered below any DOM entities.&#10; *&#10; * Crafty.canvasLayer.init() will be automatically called if it is not called already to initialize the canvas element.&#10; *&#10; * Create a canvas entity like this&#10; *</span><br></pre></td></tr></table></figure>

 * var myEntity = Crafty.e("2D, Canvas, Color")
 *      .color("green")
 *      .attr({x: 13, y: 37, w: 42, h: 42});
 *<figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;Crafty.c(&#34;Canvas&#34;, &#123;&#10;&#10;    init: function () &#123;&#10;        var canvasLayer = Crafty.canvasLayer;&#10;        if (!canvasLayer.context) &#123;&#10;            canvasLayer.init();&#10;        &#125;&#10;        this._drawLayer = canvasLayer;&#10;        this._drawContext = canvasLayer.context;&#10;&#10;        //increment the amount of canvas objs&#10;        canvasLayer.layerCount++;&#10;        //Allocate an object to hold this components current region&#10;        this.currentRect = &#123;&#125;;&#10;        this._changed = true;&#10;        canvasLayer.add(this);&#10;&#10;        this.bind(&#34;Invalidate&#34;, function (e) &#123;&#10;            //flag if changed&#10;            if (this._changed === false) &#123;&#10;                this._changed = true;&#10;                canvasLayer.add(this);&#10;            &#125;&#10;&#10;        &#125;);&#10;&#10;&#10;        this.bind(&#34;Remove&#34;, function () &#123;&#10;            this._drawLayer.layerCount--;&#10;            this._changed = true;&#10;            this._drawLayer.add(this);&#10;        &#125;);&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.draw&#10;     * @comp Canvas&#10;     * @sign public this .draw([[Context ctx, ]Number x, Number y, Number w, Number h])&#10;     * @param ctx - Canvas 2D context if drawing on another canvas is required&#10;     * @param x - X offset for drawing a segment&#10;     * @param y - Y offset for drawing a segment&#10;     * @param w - Width of the segment to draw&#10;     * @param h - Height of the segment to draw&#10;     *&#10;     * Method to draw the entity on the canvas element. Can pass rect values for redrawing a segment of the entity.&#10;     */&#10;&#10;    // Cache the various objects and arrays used in draw:&#10;    drawVars: &#123;&#10;        type: &#34;canvas&#34;,&#10;        pos: &#123;&#125;,&#10;        ctx: null,&#10;        coord: [0, 0, 0, 0],&#10;        co: &#123;&#10;            x: 0,&#10;            y: 0,&#10;            w: 0,&#10;            h: 0&#10;        &#125;&#10;&#10;&#10;    &#125;,&#10;&#10;    draw: function (ctx, x, y, w, h) &#123;&#10;        if (!this.ready) return;&#10;        if (arguments.length === 4) &#123;&#10;            h = w;&#10;            w = y;&#10;            y = x;&#10;            x = ctx;&#10;            ctx = this._drawContext;&#10;        &#125;&#10;&#10;        var pos = this.drawVars.pos;&#10;        pos._x = (this._x + (x || 0));&#10;        pos._y = (this._y + (y || 0));&#10;        pos._w = (w || this._w);&#10;        pos._h = (h || this._h);&#10;&#10;&#10;        context = ctx || this._drawContext;&#10;        coord = this.__coord || [0, 0, 0, 0];&#10;        var co = this.drawVars.co;&#10;        co.x = coord[0] + (x || 0);&#10;        co.y = coord[1] + (y || 0);&#10;        co.w = w || coord[2];&#10;        co.h = h || coord[3];&#10;&#10;        // If we are going to perform any entity-specific changes to the current context, save the current state&#10;        if (this._flipX || (this._flipY || this._rotation)) &#123;&#10;            context.save();&#10;        &#125;&#10;&#10;        // rotate the context about this entity&#39;s origin&#10;        if (this._rotation !== 0) &#123;&#10;            context.translate(this._origin.x + this._x, this._origin.y + this._y);&#10;            pos._x = -this._origin.x;&#10;            pos._y = -this._origin.y;&#10;            context.rotate((this._rotation % 360) * (Math.PI / 180));&#10;        &#125;&#10;&#10;        // We realize a flipped entity by scaling the context in the opposite direction, then adjusting the position coordinates to match&#10;        if (this._flipX || this._flipY) &#123;&#10;            context.scale((this._flipX ? -1 : 1), (this._flipY ? -1 : 1));&#10;            if (this._flipX) &#123;&#10;                pos._x = -(pos._x + pos._w);&#10;            &#125;&#10;            if (this._flipY) &#123;&#10;                pos._y = -(pos._y + pos._h);&#10;            &#125;&#10;        &#125;&#10;&#10;        var globalpha;&#10;&#10;        //draw with alpha&#10;        if (this._alpha &#60; 1.0) &#123;&#10;            globalpha = context.globalAlpha;&#10;            context.globalAlpha = this._alpha;&#10;        &#125;&#10;&#10;        this.drawVars.ctx = context;&#10;        this.trigger(&#34;Draw&#34;, this.drawVars);&#10;&#10;        // If necessary, restore context&#10;        if (this._rotation !== 0 || (this._flipX || this._flipY)) &#123;&#10;            context.restore();&#10;        &#125;&#10;        if (globalpha) &#123;&#10;            context.globalAlpha = globalpha;&#10;        &#125;&#10;        return this;&#10;    &#125;&#10;&#125;);&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],22:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;),&#10;    document = window.document;&#10;&#10;&#10;&#10;&#10;/**@&#10; * #Crafty.assignColor&#10; * @category Graphics&#10; * @sign Crafty.assignColor(color[, assignee])&#10; * @param color - a string represenation of the color to assign, in any valid HTML format&#10; * @param assignee - an object to use instead of creating one from scratch&#10; * @returns  An object with `_red`, `_green`, and `_blue` properties assigned.&#10; *           Potentially with `_strength` representing the alpha channel.&#10; *           If the assignee parameter is passed, that object will be assigned those values and returned.&#10; */&#10;Crafty.extend(&#123;&#10;    assignColor: (function()&#123;&#10;        &#10;        // Create phantom element to assess color&#10;        var element = document.createElement(&#34;div&#34;);&#10;        element.style.display = &#34;none&#34;;&#10;        // Can&#39;t attach it til later on, so we need a flag!&#10;        var element_attached = false;&#10;        var dictionary = &#123;&#10;            &#34;aqua&#34;:     &#34;#00ffff&#34;,&#10;            &#34;black&#34;:    &#34;#000000&#34;,&#10;            &#34;blue&#34;:     &#34;#0000ff&#34;,&#10;            &#34;fuchsia&#34;:  &#34;#ff00ff&#34;,&#10;            &#34;gray&#34;:     &#34;#808080&#34;,&#10;            &#34;green&#34;:    &#34;#00ff00&#34;,&#10;            &#34;lime&#34;:     &#34;#00ff00&#34;,&#10;            &#34;maroon&#34;:   &#34;#800000&#34;,&#10;            &#34;navy&#34;:     &#34;#000080&#34;,&#10;            &#34;olive&#34;:    &#34;#808000&#34;,&#10;            &#34;orange&#34;:   &#34;#ffa500&#34;,&#10;            &#34;purple&#34;:   &#34;#800080&#34;,&#10;            &#34;red&#34;:      &#34;#ff0000&#34;,&#10;            &#34;silver&#34;:   &#34;#c0c0c0&#34;,&#10;            &#34;teal&#34;:     &#34;#008080&#34;,&#10;            &#34;white&#34;:    &#34;#ffffff&#34;,&#10;            &#34;yellow&#34;:   &#34;#ffff00&#34;&#10;        &#125;;&#10;&#10;        function default_value(c)&#123;&#10;            c._red = c._blue = c._green = 0;&#10;            return c;&#10;        &#125;&#10;&#10;        function hexComponent(component) &#123;&#10;            var hex = component.toString(16);&#10;            if (hex.length==1)&#10;                hex = &#34;0&#34; + hex;&#10;            return hex;&#10;        &#125;&#10;&#10;        function rgbToHex(r, g, b)&#123;&#10;            return &#34;#&#34; + hexComponent(r) + hexComponent(g) + hexComponent(b);&#10;        &#125;&#10;&#10;        function parseHexString(hex, c) &#123;&#10;            var l;&#10;            if (hex.length === 7)&#123;&#10;                l=2;&#10;            &#125; else if (hex.length === 4)&#123;&#10;                l=1;&#10;            &#125; else &#123;&#10;                return default_value(c);&#10;            &#125;&#10;            c._red = parseInt(hex.substr(1, l), 16);&#10;            c._green = parseInt(hex.substr(1+l, l), 16);&#10;            c._blue = parseInt(hex.substr(1+2*l, l), 16);&#10;            return c;&#10;        &#125;&#10;&#10;        var rgb_regex = /rgba?\s*\(\s*([0-9]&#123;1,3&#125;)\s*,\s*([0-9]&#123;1,3&#125;)\s*,\s*([0-9]&#123;1,3&#125;)\s*,?\s*([0-9.]+)?\)/;&#10;&#10;        function parseRgbString(rgb, c) &#123;&#10;            var values = rgb_regex.exec(rgb);&#10;            if( values===null || (values.length != 4 &#38;&#38; values.length != 5)) &#123;&#10;                return default_value(c); // return bad result?         &#10;            &#125;&#10;            c._red = Math.round(parseFloat(values[1]));&#10;            c._green = Math.round(parseFloat(values[2]));&#10;            c._blue = Math.round(parseFloat(values[3]));&#10;            if (values[4]) &#123;&#10;                c._strength = parseFloat(values[4]);&#10;            &#125;&#10;            return c;&#10;        &#125;&#10;&#10;        function parseColorName(key, c)&#123;&#10;            if (typeof dictionary[key] === &#34;undefined&#34;)&#123;&#10;                if (element_attached === false)&#123;&#10;                    window.document.body.appendChild(element);&#10;                    element_attached = true;&#10;                &#125;&#10;                element.style.color = key;&#10;                var rgb = window.getComputedStyle(element).color;&#10;                parseRgbString(rgb, c);&#10;                dictionary[key] = rgbToHex(c._red, c._green, c._blue);&#10;                //window.document.body.removeChild(element);&#10;            &#125; else &#123;&#10;                parseHexString(dictionary[key], c);&#10;            &#125;&#10;            return c;&#10;        &#125;&#10;&#10;        function rgbaString(c)&#123;&#10;            return &#34;rgba(&#34; + c._red + &#34;, &#34; + c._green + &#34;, &#34; + c._blue + &#34;, &#34; + c._strength + &#34;)&#34;;&#10;        &#125;&#10;&#10;        // The actual assignColor function&#10;        return function(color, c)&#123;&#10;            c = c || &#123;&#125;;&#10;            color = color.trim().toLowerCase();&#10;            var ret = null;&#10;            if (color[0] === &#39;#&#39;)&#123;&#10;                ret = parseHexString(color, c);&#10;            &#125; else if (color[0] === &#39;r&#39; &#38;&#38; color[1] === &#39;g&#39; &#38;&#38; color[2] === &#39;b&#39;)&#123;&#10;                ret = parseRgbString(color, c);&#10;            &#125; else &#123;&#10;                ret = parseColorName(color, c);&#10;            &#125;&#10;            c._strength = c._strength || 1.0;&#10;            c._color = rgbaString(c);&#10;        &#125;;&#10;&#10;    &#125;)()&#10;&#125;);&#10;&#10;&#10;&#10;&#10;&#10;// Define some variables required for webgl&#10;&#10;var COLOR_VERTEX_SHADER = &#34;attribute vec2 aPosition;\nattribute vec3 aOrientation;\nattribute vec2 aLayer;\nattribute vec4 aColor;\n\nvarying lowp vec4 vColor;\n\nuniform  vec4 uViewport;\n\nmat4 viewportScale = mat4(2.0 / uViewport.z, 0, 0, 0,    0, -2.0 / uViewport.w, 0,0,    0, 0,1,0,    -1,+1,0,1);\nvec4 viewportTranslation = vec4(uViewport.xy, 0, 0);\n\nvoid main() &#123;\n  vec2 pos = aPosition;\n  vec2 entityOrigin = aOrientation.xy;\n  mat2 entityRotationMatrix = mat2(cos(aOrientation.z), sin(aOrientation.z), -sin(aOrientation.z), cos(aOrientation.z));\n\n  pos = entityRotationMatrix * (pos - entityOrigin) + entityOrigin;\n  gl_Position = viewportScale * (viewportTranslation + vec4(pos, 1.0/(1.0+exp(aLayer.x) ), 1) );\n  vColor = vec4(aColor.rgb*aColor.a*aLayer.y, aColor.a*aLayer.y);\n&#125;&#34;;&#10;var COLOR_FRAGMENT_SHADER = &#34;precision mediump float;\nvarying lowp vec4 vColor;\nvoid main(void) &#123;\n\tgl_FragColor = vColor;\n&#125;&#34;;&#10;var COLOR_ATTRIBUTE_LIST = [&#10;    &#123;name:&#34;aPosition&#34;, width: 2&#125;,&#10;    &#123;name:&#34;aOrientation&#34;, width: 3&#125;,&#10;    &#123;name:&#34;aLayer&#34;, width:2&#125;,&#10;    &#123;name:&#34;aColor&#34;,  width: 4&#125;&#10;];&#10;&#10;&#10;&#10;/**@&#10; * #Color&#10; * @category Graphics&#10; * Draw a colored rectangle.&#10; */&#10;Crafty.c(&#34;Color&#34;, &#123;&#10;    _red: 0,&#10;    _green: 0,&#10;    _blue: 0,&#10;    _strength: 1.0,&#10;    _color: &#34;&#34;,&#10;    ready: true,&#10;&#10;    init: function () &#123;&#10;        this.bind(&#34;Draw&#34;, this._drawColor);&#10;        if (this.has(&#34;WebGL&#34;))&#123;&#10;            this._establishShader(&#34;Color&#34;, COLOR_FRAGMENT_SHADER, COLOR_VERTEX_SHADER, COLOR_ATTRIBUTE_LIST);&#10;        &#125;&#10;        this.trigger(&#34;Invalidate&#34;);&#10;    &#125;,&#10;&#10;    remove: function()&#123;&#10;        this.unbind(&#34;Draw&#34;, this._drawColor);&#10;        if (this.has(&#34;DOM&#34;))&#123;&#10;            this._element.style.backgroundColor = &#34;transparent&#34;;&#10;        &#125;&#10;        this.trigger(&#34;Invalidate&#34;);&#10;    &#125;,&#10;&#10;    // draw function for &#34;Color&#34;&#10;    _drawColor: function(e)&#123;&#10;        if (!this._color) &#123; return; &#125;&#10;        if (e.type === &#34;DOM&#34;) &#123;&#10;            e.style.backgroundColor = this._color;&#10;            e.style.lineHeight = 0;&#10;        &#125; else if (e.type === &#34;canvas&#34;) &#123;&#10;            e.ctx.fillStyle = this._color;&#10;            e.ctx.fillRect(e.pos._x, e.pos._y, e.pos._w, e.pos._h);&#10;        &#125; else if (e.type === &#34;webgl&#34;)&#123;&#10;            e.program.writeVector(&#34;aColor&#34;,&#10;                this._red/255,&#10;                this._green/255,&#10;                this._blue/255,&#10;                this._strength&#10;            );&#10;        &#125;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.color&#10;     * @comp Color&#10;     * @trigger Invalidate - when the color changes&#10;     *&#10;     * Will assign the color and opacity, either through a string shorthand, or through explicit rgb values.&#10;     * @sign public this .color(String color[, Float strength])&#10;     * @param color - Color of the rectangle&#10;     * @param strength - the opacity of the rectangle&#10;     *&#10;     * @sign public this .color(r, g, b[, strength])&#10;     * @param r - value for the red channel&#10;     * @param g - value for the green channel&#10;     * @param b - value for the blue channel&#10;     * @param strength - the opacity of the rectangle &#10;     *&#10;     * @sign public String .color()&#10;     * @return A string representing the current color as a CSS property.&#10;     *&#10;     * @example&#10;     * ```&#10;     * var c = Crafty.e(&#34;2D, DOM, Color&#34;);&#10;     * c.color(&#34;#FF0000&#34;);&#10;     * c.color(&#34;red&#34;);&#10;     * c.color(255, 0, 0);&#10;     * c.color(&#34;rgb(255, 0, 0&#34;)&#10;     * ```&#10;     * Three different ways of assign the color red.&#10;     * ```&#10;     * var c = Crafty.e(&#34;2D, DOM, Color&#34;);&#10;     * c.color(&#34;#00FF00&#34;, 0.5);&#10;     * c.color(&#34;rgba(0, 255, 0, 0.5)&#34;);&#10;     * ```&#10;     * Two ways of assigning a transparent green color.&#10;     */&#10;    color: function (color) &#123;&#10;        if (arguments.length === 0 )&#123;&#10;            return this._color;&#10;        &#125; else if (arguments.length&#62;=3)&#123;&#10;            this._red = arguments[0];&#10;            this._green = arguments[1];&#10;            this._blue = arguments[2];&#10;            if (typeof arguments[3] === &#34;number&#34;)&#10;                this._strength = arguments[3];&#10;        &#125; else &#123;&#10;            // First argument is color name&#10;            Crafty.assignColor(color, this);&#10;            // Second argument, if present, is strength of color&#10;            // Note that assignColor will give a default strength of 1.0 if none exists.&#10;            if (typeof arguments[1] == &#34;number&#34;)&#10;                this._strength = arguments[1];&#10;        &#125;&#10;        this._color = &#34;rgba(&#34; + this._red + &#34;, &#34; + this._green + &#34;, &#34; + this._blue + &#34;, &#34; + this._strength + &#34;)&#34;;&#10;        this.trigger(&#34;Invalidate&#34;);&#10;        return this;&#10;    &#125;&#10;&#125;);&#10;&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],23:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;),&#10;    document = window.document;&#10;&#10;Crafty.extend(&#123;&#10;    /**@&#10;     * #Crafty.domHelper&#10;     * @category Graphics&#10;     *&#10;     * Collection of utilities for using the DOM.&#10;     */&#10;    domHelper: &#123;&#10;        /**@&#10;         * #Crafty.domHelper.innerPosition&#10;         * @comp Crafty.domHelper&#10;         * @sign public Object Crafty.domHelper.innerPosition(HTMLElement obj)&#10;         * @param obj - HTML element to calculate the position&#10;         * @returns Object with `x` key being the `x` position, `y` being the `y` position&#10;         *&#10;         * Find a DOM elements position including&#10;         * padding and border.&#10;         */&#10;        innerPosition: function (obj) &#123;&#10;            var rect = obj.getBoundingClientRect(),&#10;                x = rect.left + (window.pageXOffset ? window.pageXOffset : document.body.scrollLeft),&#10;                y = rect.top + (window.pageYOffset ? window.pageYOffset : document.body.scrollTop),&#10;&#10;                //border left&#10;                borderX = parseInt(this.getStyle(obj, &#39;border-left-width&#39;) || 0, 10) || parseInt(this.getStyle(obj, &#39;borderLeftWidth&#39;) || 0, 10) || 0,&#10;                borderY = parseInt(this.getStyle(obj, &#39;border-top-width&#39;) || 0, 10) || parseInt(this.getStyle(obj, &#39;borderTopWidth&#39;) || 0, 10) || 0;&#10;&#10;            x += borderX;&#10;            y += borderY;&#10;&#10;            return &#123;&#10;                x: x,&#10;                y: y&#10;            &#125;;&#10;        &#125;,&#10;&#10;        /**@&#10;         * #Crafty.domHelper.getStyle&#10;         * @comp Crafty.domHelper&#10;         * @sign public Object Crafty.domHelper.getStyle(HTMLElement obj, String property)&#10;         * @param obj - HTML element to find the style&#10;         * @param property - Style to return&#10;         *&#10;         * Determine the value of a style on an HTML element. Notation can be&#10;         * in either CSS or JS.&#10;         */&#10;        getStyle: function (obj, prop) &#123;&#10;            var result;&#10;            if (obj.currentStyle)&#10;                result = obj.currentStyle[this.camelize(prop)];&#10;            else if (window.getComputedStyle)&#10;                result = document.defaultView.getComputedStyle(obj, null).getPropertyValue(this.csselize(prop));&#10;            return result;&#10;        &#125;,&#10;&#10;        /**&#10;         * Used in the Zepto framework&#10;         *&#10;         * Converts CSS notation to JS notation&#10;         */&#10;        camelize: function (str) &#123;&#10;            return str.replace(/-+(.)?/g, function (match, chr) &#123;&#10;                return chr ? chr.toUpperCase() : &#39;&#39;;&#10;            &#125;);&#10;        &#125;,&#10;&#10;        /**&#10;         * Converts JS notation to CSS notation&#10;         */&#10;        csselize: function (str) &#123;&#10;            return str.replace(/[A-Z]/g, function (chr) &#123;&#10;                return chr ? &#39;-&#39; + chr.toLowerCase() : &#39;&#39;;&#10;            &#125;);&#10;        &#125;,&#10;&#10;        /**@&#10;         * #Crafty.domHelper.translate&#10;         * @comp Crafty.domHelper&#10;         * @sign public Object Crafty.domHelper.translate(Number clientX, Number clientY)&#10;         * @param clientX - clientX position in the browser screen&#10;         * @param clientY - clientY position in the browser screen&#10;         * @return Object `&#123;x: ..., y: ...&#125;` with Crafty coordinates.&#10;         * &#10;         * The parameters clientX and clientY are pixel coordinates within the visible&#10;         * browser window. This function translates those to Crafty coordinates (i.e.,&#10;         * the coordinates that you might apply to an entity), by taking into account&#10;         * where the stage is within the screen, what the current viewport is, etc.&#10;         */&#10;        translate: function (clientX, clientY) &#123;&#10;            var doc = document.documentElement;&#10;            var body = document.body;&#10;&#10;            return &#123;&#10;                x: (clientX - Crafty.stage.x + ( doc &#38;&#38; doc.scrollLeft || body &#38;&#38; body.scrollLeft || 0 )) / Crafty.viewport._scale - Crafty.viewport._x,&#10;                y: (clientY - Crafty.stage.y + ( doc &#38;&#38; doc.scrollTop  || body &#38;&#38; body.scrollTop  || 0 )) / Crafty.viewport._scale - Crafty.viewport._y&#10;            &#125;;&#10;        &#125;&#10;    &#125;&#10;&#125;);&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],24:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;),&#10;    document = window.document;&#10;&#10;&#10;/**@&#10; * #Crafty.domLayer&#10; * @category Graphics&#10; *&#10; * Collection of mostly private methods to represent entities using the DOM.&#10; */&#10;Crafty.extend(&#123;&#10;    domLayer: &#123;&#10;        _changedObjs: [],&#10;        _dirtyViewport: false,&#10;        _div: null,&#10;&#10;        init: function () &#123;&#10;            // Set properties to initial values -- necessary on a restart&#10;            this._changedObjs = [];&#10;            this._dirtyViewport = false;&#10;&#10;            // Create the div that will contain DOM elements&#10;            var div = this._div = document.createElement(&#34;div&#34;);&#10;&#10;            Crafty.stage.elem.appendChild(div);&#10;            div.style.position = &#34;absolute&#34;;&#10;            div.style.zIndex = &#34;1&#34;;&#10;            div.style.transformStyle = &#34;preserve-3d&#34;; // Seems necessary for Firefox to preserve zIndexes?&#10;&#10;            // Bind scene rendering (see drawing.js)&#10;            Crafty.uniqueBind(&#34;RenderScene&#34;, this._render);&#10;&#10;            // Layers should generally listen for resize events, but the DOM layers automatically inherit the stage&#39;s dimensions&#10;&#10;            // Listen for changes in pixel art settings&#10;            // Since window is inited before stage, can&#39;t set right away, but shouldn&#39;t need to!&#10;            Crafty.uniqueBind(&#34;PixelartSet&#34;, this._setPixelArt);&#10;&#10;            Crafty.uniqueBind(&#34;InvalidateViewport&#34;, function() &#123;&#10;                Crafty.domLayer._dirtyViewport = true;&#10;            &#125;);&#10;        &#125;,&#10;&#10;        // Handle whether images should be smoothed or not&#10;        _setPixelArt: function(enabled) &#123;&#10;            var style = Crafty.domLayer._div.style;&#10;            var camelize = Crafty.domHelper.camelize;&#10;            if (enabled) &#123;&#10;                style[camelize(&#34;image-rendering&#34;)] = &#34;optimizeSpeed&#34;;   /* legacy */&#10;                style[camelize(&#34;image-rendering&#34;)] = &#34;-moz-crisp-edges&#34;;    /* Firefox */&#10;                style[camelize(&#34;image-rendering&#34;)] = &#34;-o-crisp-edges&#34;;  /* Opera */&#10;                style[camelize(&#34;image-rendering&#34;)] = &#34;-webkit-optimize-contrast&#34;;   /* Webkit (Chrome &#38; Safari) */&#10;                style[camelize(&#34;-ms-interpolation-mode&#34;)] = &#34;nearest-neighbor&#34;;  /* IE */&#10;                style[camelize(&#34;image-rendering&#34;)] = &#34;optimize-contrast&#34;;   /* CSS3 proposed */&#10;                style[camelize(&#34;image-rendering&#34;)] = &#34;pixelated&#34;;   /* CSS4 proposed */&#10;                style[camelize(&#34;image-rendering&#34;)] = &#34;crisp-edges&#34;; /* CSS4 proposed */&#10;            &#125; else &#123;&#10;                style[camelize(&#34;image-rendering&#34;)] = &#34;optimizeQuality&#34;;   /* legacy */&#10;                style[camelize(&#34;-ms-interpolation-mode&#34;)] = &#34;bicubic&#34;;   /* IE */&#10;                style[camelize(&#34;image-rendering&#34;)] = &#34;auto&#34;;   /* CSS3 */&#10;            &#125;&#10;        &#125;,&#10;&#10;        /**@&#10;         * #Crafty.domLayer.debug&#10;         * @comp Crafty.domLayer&#10;         * @sign public Crafty.domLayer.debug()&#10;         */&#10;        debug: function () &#123;&#10;            Crafty.log(this._changedObjs);&#10;        &#125;,&#10;&#10;&#10;        /**@&#10;         * #Crafty.domLayer._render&#10;         * @comp Crafty.domLayer&#10;         * @sign public Crafty.domLayer.render()&#10;         *&#10;         * When &#34;RenderScene&#34; is triggered, draws all DOM entities that have been flagged&#10;         *&#10;         * @see DOM#.draw&#10;         */&#10;        _render: function () &#123;&#10;            var layer = Crafty.domLayer;&#10;            var changed = layer._changedObjs;&#10;            // Adjust the viewport&#10;            if (layer._dirtyViewport) &#123;&#10;               layer._setViewport();&#10;               layer._dirtyViewport = false;&#10;            &#125;&#10;&#10;            //if no objects have been changed, stop&#10;            if (!changed.length) return;&#10;&#10;            var i = 0,&#10;                k = changed.length;&#10;            //loop over all DOM elements needing updating&#10;            for (; i &#60; k; ++i) &#123;&#10;                changed[i].draw()._changed = false;&#10;            &#125;&#10;&#10;            //reset DOM array&#10;            changed.length = 0;&#10;&#10;        &#125;,&#10;&#10;        /**@&#10;         * #Crafty.domLayer.add&#10;         * @comp Crafty.domLayer&#10;         * @sign public Crafty.domLayer.add(ent)&#10;         * @param ent - The entity to add&#10;         *&#10;         * Add an entity to the list of DOM object to draw&#10;         */&#10;        add: function add(ent) &#123;&#10;            this._changedObjs.push(ent);&#10;        &#125;,&#10;&#10;        // Sets the viewport position and scale&#10;        // Called by render when the dirtyViewport flag is set&#10;        _setViewport: function() &#123;&#10;            var style = Crafty.domLayer._div.style,&#10;                view = Crafty.viewport;&#10;&#10;            style.transform = style[Crafty.support.prefix + &#34;Transform&#34;] = &#34;scale(&#34; + view._scale + &#34;, &#34; + view._scale + &#34;)&#34;;&#10;            style.left = Math.round(view._x * view._scale) + &#34;px&#34;;&#10;            style.top = Math.round(view._y * view._scale) + &#34;px&#34;;&#10;            style.zIndex = 10;&#10;&#10;&#10;        &#125;&#10;&#10;    &#125;&#10;&#125;);&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],25:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;),&#10;    document = window.document;&#10;&#10;/**@&#10; * #DOM&#10; * @category Graphics&#10; *&#10; * A component which renders entities as DOM nodes, specifically `&#60;div&#62;`s.&#10; */&#10;Crafty.c(&#34;DOM&#34;, &#123;&#10;    /**@&#10;     * #._element&#10;     * @comp DOM&#10;     * The DOM element used to represent the entity.&#10;     */&#10;    _element: null,&#10;    //holds current styles, so we can check if there are changes to be written to the DOM&#10;    _cssStyles: null,&#10;&#10;    /**@&#10;     * #.avoidCss3dTransforms&#10;     * @comp DOM&#10;     * Avoids using of CSS 3D Transform for positioning when true. Default value is false.&#10;     */&#10;    avoidCss3dTransforms: false,&#10;&#10;    init: function () &#123;&#10;        var domLayer = Crafty.domLayer;&#10;        if (!domLayer._div) &#123;&#10;            domLayer.init();&#10;        &#125;&#10;        this._drawLayer = domLayer;&#10;&#10;        this._cssStyles = &#123;&#10;            visibility: &#39;&#39;,&#10;            left: &#39;&#39;,&#10;            top: &#39;&#39;,&#10;            width: &#39;&#39;,&#10;            height: &#39;&#39;,&#10;            zIndex: &#39;&#39;,&#10;            opacity: &#39;&#39;,&#10;            transformOrigin: &#39;&#39;,&#10;            transform: &#39;&#39;&#10;        &#125;;&#10;        this._element = document.createElement(&#34;div&#34;);&#10;        domLayer._div.appendChild(this._element);&#10;        this._element.style.position = &#34;absolute&#34;;&#10;        this._element.id = &#34;ent&#34; + this[0];&#10;&#10;        this.bind(&#34;Invalidate&#34;, this._invalidateDOM);&#10;        this.bind(&#34;NewComponent&#34;, this._updateClass);&#10;        this.bind(&#34;RemoveComponent&#34;, this._removeClass);&#10;&#10;        this._invalidateDOM();&#10;&#10;    &#125;,&#10;&#10;    remove: function()&#123;&#10;        this.undraw();&#10;        this.unbind(&#34;NewComponent&#34;, this._updateClass);&#10;        this.unbind(&#34;RemoveComponent&#34;, this._removeClass);&#10;        this.unbind(&#34;Invalidate&#34;, this._invalidateDOM);&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.getDomId&#10;     * @comp DOM&#10;     * @sign public this .getId()&#10;     *&#10;     * Get the Id of the DOM element used to represent the entity.&#10;     */&#10;    getDomId: function () &#123;&#10;        return this._element.id;&#10;    &#125;,&#10;&#10;    // removes a component on RemoveComponent events&#10;    _removeClass: function(removedComponent) &#123;&#10;        var i = 0,&#10;            c = this.__c,&#10;            str = &#34;&#34;;&#10;        for (i in c) &#123;&#10;          if(i != removedComponent) &#123;&#10;            str += &#39; &#39; + i;&#10;          &#125;&#10;        &#125;&#10;        str = str.substr(1);&#10;        this._element.className = str;&#10;    &#125;,&#10;&#10;    // adds a class on NewComponent events&#10;    _updateClass: function() &#123;&#10;        var i = 0,&#10;            c = this.__c,&#10;            str = &#34;&#34;;&#10;        for (i in c) &#123;&#10;            str += &#39; &#39; + i;&#10;        &#125;&#10;        str = str.substr(1);&#10;        this._element.className = str;&#10;    &#125;,&#10;&#10;    _invalidateDOM: function()&#123;&#10;        if (!this._changed) &#123;&#10;                this._changed = true;&#10;                this._drawLayer.add(this);&#10;            &#125;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.DOM&#10;     * @comp DOM&#10;     * @trigger Draw - when the entity is ready to be drawn to the stage - &#123; style:String, type:&#34;DOM&#34;, co&#125;&#10;     * @sign public this .DOM(HTMLElement elem)&#10;     * @param elem - HTML element that will replace the dynamically created one&#10;     *&#10;     * Pass a DOM element to use rather than one created. Will set `._element` to this value. Removes the old element.&#10;     */&#10;    DOM: function (elem) &#123;&#10;        if (elem &#38;&#38; elem.nodeType) &#123;&#10;            this.undraw();&#10;            this._element = elem;&#10;            this._element.style.position = &#39;absolute&#39;;&#10;        &#125;&#10;        return this;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.draw&#10;     * @comp DOM&#10;     * @sign public this .draw(void)&#10;     *&#10;     * Updates the CSS properties of the node to draw on the stage.&#10;     */&#10;    draw: function () &#123;&#10;        var style = this._element.style,&#10;            coord = this.__coord || [0, 0, 0, 0],&#10;            co = &#123;&#10;                x: coord[0],&#10;                y: coord[1],&#10;                w: coord[2],&#10;                h: coord[3]&#10;            &#125;,&#10;            prefix = Crafty.support.prefix,&#10;            trans = [];&#10;&#10;        if (this._cssStyles.visibility !== this._visible) &#123;&#10;            this._cssStyles.visibility = this._visible;&#10;            if (!this._visible) &#123;&#10;                style.visibility = &#34;hidden&#34;;&#10;            &#125; else &#123;&#10;                style.visibility = &#34;visible&#34;;&#10;            &#125;&#10;        &#125;&#10;&#10;        //utilize CSS3 if supported&#10;        if (Crafty.support.css3dtransform &#38;&#38; !this.avoidCss3dTransforms) &#123;&#10;            trans.push(&#34;translate3d(&#34; + (~~this._x) + &#34;px,&#34; + (~~this._y) + &#34;px,0)&#34;);&#10;        &#125; else &#123;&#10;            if (this._cssStyles.left !== this._x) &#123;&#10;                this._cssStyles.left = this._x;&#10;                style.left = ~~ (this._x) + &#34;px&#34;;&#10;            &#125;&#10;            if (this._cssStyles.top !== this._y) &#123;&#10;                this._cssStyles.top = this._y;&#10;                style.top = ~~ (this._y) + &#34;px&#34;;&#10;            &#125;&#10;        &#125;&#10;&#10;        if (this._cssStyles.width !== this._w) &#123;&#10;            this._cssStyles.width = this._w;&#10;            style.width = ~~ (this._w) + &#34;px&#34;;&#10;        &#125;&#10;        if (this._cssStyles.height !== this._h) &#123;&#10;            this._cssStyles.height = this._h;&#10;            style.height = ~~ (this._h) + &#34;px&#34;;&#10;        &#125;&#10;        if (this._cssStyles.zIndex !== this._z) &#123;&#10;            this._cssStyles.zIndex = this._z;&#10;            style.zIndex = this._z;&#10;        &#125;&#10;&#10;        if (this._cssStyles.opacity !== this._alpha) &#123;&#10;            this._cssStyles.opacity = this._alpha;&#10;            style.opacity = this._alpha;&#10;            style[prefix + &#34;Opacity&#34;] = this._alpha;&#10;        &#125;&#10;&#10;        if (this._mbr) &#123;&#10;            var origin = this._origin.x + &#34;px &#34; + this._origin.y + &#34;px&#34;;&#10;            style.transformOrigin = origin;&#10;            style[prefix + &#34;TransformOrigin&#34;] = origin;&#10;            if (Crafty.support.css3dtransform) trans.push(&#34;rotateZ(&#34; + this._rotation + &#34;deg)&#34;);&#10;            else trans.push(&#34;rotate(&#34; + this._rotation + &#34;deg)&#34;);&#10;        &#125;&#10;&#10;        if (this._flipX) &#123;&#10;            trans.push(&#34;scaleX(-1)&#34;);&#10;        &#125;&#10;&#10;        if (this._flipY) &#123;&#10;            trans.push(&#34;scaleY(-1)&#34;);&#10;        &#125;&#10;&#10;        if (this._cssStyles.transform != trans.join(&#34; &#34;)) &#123;&#10;            this._cssStyles.transform = trans.join(&#34; &#34;);&#10;            style.transform = this._cssStyles.transform;&#10;            style[prefix + &#34;Transform&#34;] = this._cssStyles.transform;&#10;        &#125;&#10;&#10;        this.trigger(&#34;Draw&#34;, &#123;&#10;            style: style,&#10;            type: &#34;DOM&#34;,&#10;            co: co&#10;        &#125;);&#10;&#10;        return this;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.undraw&#10;     * @comp DOM&#10;     * @sign public this .undraw(void)&#10;     *&#10;     * Removes the element from the stage.&#10;     */&#10;    undraw: function () &#123;&#10;        var el = this._element;&#10;        if (el &#38;&#38; el.parentNode !== null) &#123;&#10;            el.parentNode.removeChild(el);&#10;        &#125;&#10;        return this;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.css&#10;     * @comp DOM&#10;     * @sign public css(String property, String value)&#10;     * @param property - CSS property to modify&#10;     * @param value - Value to give the CSS property&#10;     *&#10;     * @sign public  css(Object map)&#10;     * @param map - Object where the key is the CSS property and the value is CSS value&#10;     *&#10;     * Apply CSS styles to the element.&#10;     *&#10;     * Can pass an object where the key is the style property and the value is style value.&#10;     *&#10;     * For setting one style, simply pass the style as the first argument and the value as the second.&#10;     *&#10;     * The notation can be CSS or JS (e.g. `text-align` or `textAlign`).&#10;     *&#10;     * To return a value, pass the property.&#10;     *&#10;     * Note: For entities with &#34;Text&#34; component, some css properties are controlled by separate functions&#10;     * `.textFont()` and `.textColor()`, and ignore `.css()` settings. See Text component for details.&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * this.css({'text-align': 'center', 'text-decoration': 'line-through'});
     * this.css("textAlign", "center");
     * this.css("text-align"); //returns center
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    css: function (obj, value) &#123;&#10;        var key,&#10;            elem = this._element,&#10;            val,&#10;            style = elem.style;&#10;&#10;        //if an object passed&#10;        if (typeof obj === &#34;object&#34;) &#123;&#10;            for (key in obj) &#123;&#10;                if (!obj.hasOwnProperty(key)) continue;&#10;                val = obj[key];&#10;                if (typeof val === &#34;number&#34;) val += &#39;px&#39;;&#10;&#10;                style[Crafty.domHelper.camelize(key)] = val;&#10;            &#125;&#10;        &#125; else &#123;&#10;            //if a value is passed, set the property&#10;            if (value) &#123;&#10;                if (typeof value === &#34;number&#34;) value += &#39;px&#39;;&#10;                style[Crafty.domHelper.camelize(obj)] = value;&#10;            &#125; else &#123; //otherwise return the computed property&#10;                return Crafty.domHelper.getStyle(elem, obj);&#10;            &#125;&#10;        &#125;&#10;&#10;        this.trigger(&#34;Invalidate&#34;);&#10;&#10;        return this;&#10;    &#125;&#10;&#125;);&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],26:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;Crafty.extend(&#123;&#10;    /**@&#10;     * #Crafty.pixelart&#10;     * @category Graphics&#10;     * @sign public void Crafty.pixelart(Boolean enabled)&#10;     * @param enabled - whether to preserve sharp edges when rendering images&#10;     *&#10;     * Sets the image smoothing for drawing images (for all layer types).&#10;     *&#10;     * Setting this to true disables smoothing for images, which is the preferred&#10;     * way for drawing pixel art. Defaults to false.&#10;     *&#10;     * This feature is experimental and you should be careful with cross-browser compatibility. &#10;     * The best way to disable image smoothing is to use the Canvas render method and the Sprite component for drawing your entities.&#10;     *&#10;     * If you want to switch modes in the middle of a scene, &#10;     * be aware that canvas entities won&#39;t be drawn in the new style until something else invalidates them. &#10;     * (You can manually invalidate all canvas entities with `Crafty(&#34;Canvas&#34;).trigger(&#34;Invalidate&#34;);`)&#10;     *&#10;     * @note Firefox_26 currently has a [bug](https://bugzilla.mozilla.org/show_bug.cgi?id=696630) &#10;     * which prevents disabling image smoothing for Canvas entities that use the Image component. Use the Sprite&#10;     * component instead.&#10;     *&#10;     * @note Webkit (Chrome &#38; Safari) currently has a bug [link1](http://code.google.com/p/chromium/issues/detail?id=134040) &#10;     * [link2](http://code.google.com/p/chromium/issues/detail?id=106662) that prevents disabling image smoothing&#10;     * for DOM entities.&#10;     *&#10;     * @example&#10;     * This is the preferred way to draw pixel art with the best cross-browser compatibility.&#10;     *</span><br></pre></td></tr></table></figure>

     * Crafty.canvasLayer.init();
     * Crafty.pixelart(true);
     * 
     * Crafty.sprite(imgWidth, imgHeight, "spriteMap.png", {sprite1:[0,0]});
     * Crafty.e("2D, Canvas, sprite1");
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    _pixelartEnabled: false,&#10;    pixelart: function(enabled) &#123;&#10;        Crafty._pixelartEnabled = enabled;&#10;        Crafty.trigger(&#34;PixelartSet&#34;, enabled);&#10;    &#125;&#10;&#125;);&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],27:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;// An object for wrangling textures&#10;// An assumption here is that doing anything with textures is fairly expensive, so the code should be expressive rather than performant&#10;var TextureManager = Crafty.TextureManager = function(gl, webgl) &#123;&#10;&#9;this.gl = gl;&#10;&#9;this.webgl = webgl;&#10;&#9;// The maximum number of units the environment says it supports &#10;&#9;this.max_units =  gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);&#10;&#9;// An array of textures bound to a texture unit; position corresponds to the unit in question&#10;&#9;this.bound_textures = [];&#10;&#9;// A dictionary of registered textures, so that multiple copies of the same texture aren&#39;t generated&#10;&#9;this.registered_textures = &#123;&#125;;&#10;&#9;// Try to track which texture is active&#10;&#9;this.active = null;&#10;&#125;;&#10;&#10;TextureManager.prototype = &#123;&#10;&#10;&#9;// Clear out the bound textures and other existing state&#10;&#9;reset: function()&#123;&#10;&#9;&#9;var t;&#10;&#9;&#9;for (var i = 0; i &#60; this.bound_textures.length; i++)&#123;&#10;&#9;&#9;&#9;t = this.bound_textures[i];&#10;&#9;&#9;&#9;t.unbind();&#10;&#9;&#9;&#125;&#10;&#9;&#9;this.bound_textures = [];&#10;&#9;&#9;this.active = null;&#10;&#9;&#125;,&#10;&#10;&#9;// creates a texture out of the given image and repeating state&#10;&#9;// The url is just used to generate a unique id for the texture&#10;&#9;makeTexture: function(url, image, repeating) &#123;&#10;&#9;&#9;// gl is the context, webgl the Crafty object containing prefs/etc&#10;        var gl = this.gl, webgl = this.webgl;&#10;&#10;        // Check whether a texture that matches the one requested already exists&#10;        var id =  &#34;texture-(r:&#34; + repeating + &#34;)-&#34; + url;&#10;        if (typeof this.registered_textures[id] !== &#39;undefined&#39;)&#10;            return this.registered_textures[id];&#10;&#10;        // Create a texture, bind it to the next available unit&#10;        var t = new TextureWrapper(this, id);&#10;        this.registered_textures[id] = t;&#10;        this.bindTexture(t);&#10;&#10;        // Set the properties of the texture &#10;        t.setImage(image);&#10;        t.setFilter(webgl.texture_filter);&#10;        t.setRepeat(repeating);&#10;&#10;        return t;&#10;    &#125;,&#10;&#10;    // Returns the bound texture of smallest size&#10;    // If we have more textures than available units, we should preferentially leave the larger textures bound?&#10;&#9;smallest: function() &#123;&#10;&#9;&#9;var min_size = Infinity;&#10;&#9;&#9;var index = null;&#10;&#9;&#9;for (var i=0; i&#60;this.bound_textures.length; i++) &#123;&#10;&#9;&#9;&#9;var t = this.bound_textures[i];&#10;&#9;&#9;&#9;if (t.size &#60; min_size) &#123;&#10;&#9;&#9;&#9;&#9;min_size = t.size;&#10;&#9;&#9;&#9;&#9;index = i;&#10;&#9;&#9;&#9;&#125;&#10;&#9;&#9;&#125;&#10;&#9;&#9;return index;&#10;&#9;&#125;,&#10;&#10;&#9;// Returns either the first empty unit, or the unit of the smallest bound texture&#10;&#9;getAvailableUnit: function() &#123;&#10;&#9;&#9;if (this.bound_textures.length &#60; this.max_units) &#123;&#10;&#9;&#9;&#9;return this.bound_textures.length;&#10;&#9;&#9;&#125; else &#123;&#10;&#9;&#9;&#9;return this.smallest();&#10;&#9;&#9;&#125;&#10;&#9;&#125;,&#10;&#10;&#9;// takes a texture object and, if it isn&#39;t associated with a unit, binds it to one&#10;&#9;bindTexture: function(t) &#123;&#10;&#9;&#9;// return if the texture is already bound&#10;&#9;&#9;if (t.unit !== null) return;&#10;&#9;&#9;var i = this.getAvailableUnit();&#10;&#9;&#9;if (this.bound_textures[i])&#123;&#10;&#9;&#9;&#9;this.unbindTexture(this.bound_textures[i]);&#10;&#9;&#9;&#125;&#10;&#9;&#9;this.bound_textures[i] = t;&#10;&#9;&#9;t.bind(i);&#10;&#10;&#9;&#125;,&#10;&#10;&#9;// We don&#39;t actually &#34;unbind&#34; the texture -- we just set it&#39;s bound state to null&#10;&#9;// This is called before another texture is bound&#10;&#9;unbindTexture: function(t) &#123;&#10;&#9;&#9;t.unbind();&#10;&#9;&#125;,&#10;&#10;&#9;setActiveTexture: function(t) &#123;&#10;&#9;&#9;if (this.active === t.id) return;&#10;&#9;&#9;this.gl.activeTexture(this.gl[t.name]);&#10;&#9;&#9;this.active = t.unit;&#10;&#9;&#125;&#10;&#10;&#125;;&#10;&#10;// An object for abstracting out the gl calls associated with textures&#10;var TextureWrapper = Crafty.TextureWrapper = function(manager, id)&#123;&#10;&#9;this.manager = manager;&#10;&#9;this.gl = manager.gl;&#10;&#9;this.glTexture = this.gl.createTexture();&#10;&#9;this.id = id;&#10;&#9;this.active = false;&#10;&#9;this.unit = null;&#10;&#9;this.powerOfTwo = false;&#10;&#125;;&#10;&#10;TextureWrapper.prototype = &#123;&#10;&#10;&#9;// Given a number, binds to the corresponding texture unit&#10;&#9;bind: function(unit) &#123;&#10;&#9;&#9;var gl = this.gl;&#10;&#9;&#9;this.unit = unit;&#10;&#9;&#9;this.name = &#34;TEXTURE&#34; + unit;&#10;&#9;&#9;this.manager.setActiveTexture(this);&#10;&#9;&#9;gl.bindTexture(gl.TEXTURE_2D, this.glTexture);&#10;&#9;&#125;,&#10;&#10;&#9;// Check whether this texture is active (important for setting properties)&#10;&#9;isActive: function() &#123;&#10;&#9;&#9;return (this.manager.active === this.unit);&#10;&#9;&#125;,&#10;&#10;&#9;// Since gl doesn&#39;t require unbinding, just clears the metadata&#10;&#9;unbind: function() &#123;&#10;&#9;&#9;this.unit = null;&#10;&#9;&#9;this.name = null;&#10;&#9;&#9;if(this.isActive())&#10;&#9;&#9;&#9;this.manager.active = null;&#10;&#9;&#125;,&#10;&#10;&#9;// actually loads an image into the texture object; sets the appropriate metadata&#10;&#9;setImage: function(image) &#123;&#10;&#9;&#9;if(!this.isActive()) throw(&#34;Trying to set image of texture that isn&#39;t active&#34;);&#10;&#9;&#9;this.width = image.width;&#10;&#9;&#9;this.height = image.height;&#10;&#9;&#9;this.size = image.width * image.height;&#10;&#9;&#9;this.powerOfTwo = !((Math.log(image.width)/Math.LN2 != Math.floor(Math.log(image.width)/Math.LN2)) || (Math.log(image.height)/Math.LN2 != Math.floor(Math.log(image.height)/Math.LN2)));&#10;&#9;&#9;var gl = this.gl;&#10;&#9;&#9;gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);&#10;&#9;&#125;,&#10;&#10;&#9;// Sets the min/mag filters&#10;&#9;setFilter: function(filter) &#123;&#10;&#9;&#9;if(!this.isActive()) throw(&#34;Trying to set filter of texture that isn&#39;t active&#34;);&#10;&#9;&#9;var gl = this.gl;&#10;&#9;&#9;gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);&#10;        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);&#10;&#9;&#125;,&#10;&#10;&#9;// set image wrapping&#10;&#9;setRepeat: function(repeat) &#123;&#10;&#9;&#9;if(!this.isActive()) throw(&#34;Trying to set repeat property of texture that isn&#39;t active&#34;);&#10;&#9;&#9;if(repeat &#38;&#38; !this.powerOfTwo)&#123;&#10;&#9;&#9;&#9;throw(&#34;Can&#39;t create a repeating image whose dimensions aren&#39;t a power of 2 in WebGL contexts&#34;);&#10;&#9;&#9;&#125;&#10;&#9;&#9;var gl = this.gl;&#10;&#9;&#9;this.repeatMode = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;&#10;        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.repeatMode);&#10;        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.repeatMode);&#10;&#9;&#125;,&#10;&#10;&#9;// given a shader and pair of uniform names, sets the sampler and dimensions to be used by this texture&#10;&#9;setToProgram: function(shader, sampler_name, dimension_name) &#123;&#10;&#9;&#9;if(this.unit === null) throw(&#34;Trying to use texture not set to a texture unit.&#34;);&#10;&#9;&#9;var gl = this.gl;&#10;&#9;&#9;gl.useProgram(shader);&#10;        // Set the texture buffer to use&#10;        gl.uniform1i(gl.getUniformLocation(shader, sampler_name), this.unit);&#10;        // Set the image dimensions&#10;        gl.uniform2f(gl.getUniformLocation(shader, dimension_name), this.width, this.height);&#10;&#9;&#125;&#10;&#125;;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],28:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;&#10;/**@&#10; * #HTML&#10; * @category Graphics&#10; *&#10; * A component which allows for the insertion of arbitrary HTML into a DOM entity.  &#10; *&#10; * Adding this to an entity will automatically add the `DOM` component.&#10; */&#10;Crafty.c(&#34;HTML&#34;, &#123;&#10;    inner: &#39;&#39;,&#10;&#10;    init: function () &#123;&#10;        this.requires(&#39;2D, DOM&#39;);&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.replace&#10;     * @comp HTML&#10;     * @sign public this .replace(String html)&#10;     * @param html - arbitrary html&#10;     *&#10;     * This method will replace the content of this entity with the supplied html&#10;     *&#10;     * @example&#10;     * Create a link&#10;     *</span><br></pre></td></tr></table></figure>

     * Crafty.e("HTML")
     *    .attr({x:20, y:20, w:100, h:100})
     *    .replace("<a href="index.html">Index</a>");
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;replace: function (new_html) &#123;&#10;    this.inner = new_html;&#10;    this._element.innerHTML = new_html;&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.append&#10; * @comp HTML&#10; * @sign public this .append(String html)&#10; * @param html - arbitrary html&#10; *&#10; * This method will add the supplied html in the end of the entity&#10; *&#10; * @example&#10; * Create a link&#10; *</span><br></pre></td></tr></table></figure>

     * Crafty.e("HTML")
     *    .attr({x:20, y:20, w:100, h:100})
     *    .append("<a href="index.html">Index</a>");
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;append: function (new_html) &#123;&#10;    this.inner += new_html;&#10;    this._element.innerHTML += new_html;&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.prepend&#10; * @comp HTML&#10; * @sign public this .prepend(String html)&#10; * @param html - arbitrary html&#10; *&#10; * This method will add the supplied html in the beginning of the entity&#10; *&#10; * @example&#10; * Create a link&#10; *</span><br></pre></td></tr></table></figure>

     * Crafty.e("HTML")
     *    .attr({x:20, y:20, w:100, h:100})
     *    .prepend("<a href="index.html">Index</a>");
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    prepend: function (new_html) &#123;&#10;        this.inner = new_html + this.inner;&#10;        this._element.innerHTML = new_html + this.inner;&#10;        return this;&#10;    &#125;&#10;&#125;);&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],29:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;&#10;//&#10;// Define some variables required for webgl&#10;&#10;var IMAGE_VERTEX_SHADER = &#34;attribute vec2 aPosition;\nattribute vec3 aOrientation;\nattribute vec2 aLayer;\nattribute vec2 aTextureCoord;\n\nvarying mediump vec3 vTextureCoord;\n\nuniform vec4 uViewport;\nuniform mediump vec2 uTextureDimensions;\n\nmat4 viewportScale = mat4(2.0 / uViewport.z, 0, 0, 0,    0, -2.0 / uViewport.w, 0,0,    0, 0,1,0,    -1,+1,0,1);\nvec4 viewportTranslation = vec4(uViewport.xy, 0, 0);\n\nvoid main() &#123;\n  vec2 pos = aPosition;\n  vec2 entityOrigin = aOrientation.xy;\n  mat2 entityRotationMatrix = mat2(cos(aOrientation.z), sin(aOrientation.z), -sin(aOrientation.z), cos(aOrientation.z));\n  \n  pos = entityRotationMatrix * (pos - entityOrigin) + entityOrigin ;\n  gl_Position = viewportScale * (viewportTranslation + vec4(pos, 1.0/(1.0+exp(aLayer.x) ), 1) );\n  vTextureCoord = vec3(aTextureCoord, aLayer.y);\n&#125;&#34;;&#10;var IMAGE_FRAGMENT_SHADER = &#34;varying mediump vec3 vTextureCoord;\n  \nuniform sampler2D uSampler;\nuniform mediump vec2 uTextureDimensions;\n\nvoid main(void) &#123;\n  highp vec2 coord =   vTextureCoord.xy / uTextureDimensions;\n  mediump vec4 base_color = texture2D(uSampler, coord);\n  gl_FragColor = vec4(base_color.rgb*base_color.a*vTextureCoord.z, base_color.a*vTextureCoord.z);\n&#125;&#34;;&#10;var IMAGE_ATTRIBUTE_LIST = [&#10;    &#123;name:&#34;aPosition&#34;, width: 2&#125;,&#10;    &#123;name:&#34;aOrientation&#34;, width: 3&#125;,&#10;    &#123;name:&#34;aLayer&#34;, width:2&#125;,&#10;    &#123;name:&#34;aTextureCoord&#34;,  width: 2&#125;&#10;];&#10;&#10;/**@&#10; * #Image&#10; * @category Graphics&#10; * Draw an image with or without repeating (tiling).&#10; */&#10;Crafty.c(&#34;Image&#34;, &#123;&#10;    _repeat: &#34;repeat&#34;,&#10;    ready: false,&#10;&#10;    init: function () &#123;&#10;        this.bind(&#34;Draw&#34;, this._drawImage);&#10;    &#125;,&#10;&#10;    remove: function() &#123;&#10;        this.unbind(&#34;Draw&#34;, this._drawImage);&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.image&#10;     * @comp Image&#10;     * @trigger Invalidate - when the image is loaded&#10;     * @sign public this .image(String url[, String repeat])&#10;     * @param url - URL of the image&#10;     * @param repeat - If the image should be repeated to fill the entity.  This follows CSS syntax: (`&#34;no-repeat&#34;, &#34;repeat&#34;, &#34;repeat-x&#34;, &#34;repeat-y&#34;`), but defaults to `no-repeat`.&#10;     *&#10;     * Draw the specified image.&#10;     *&#10;     * @note The default value of repeat is `no-repeat`, which is different than the standard CSS default&#10;     *&#10;     * If the width and height are `0` and repeat is set to `no-repeat` the width and&#10;     * height will automatically assume that of the image. This is an&#10;     * easy way to create an image without needing sprites.&#10;     *&#10;     * If set to `no-repeat` and given dimensions larger than that of the image,&#10;     * the exact appearance will depend on what renderer (WebGL, DOM, or Canvas) is used.&#10;     *&#10;     * @example&#10;     * Will default to no-repeat. Entity width and height will be set to the images width and height&#10;     *</span><br></pre></td></tr></table></figure>

     * var ent = Crafty.e("2D, DOM, Image").image("myimage.png");
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* Create a repeating background.&#10;*</span><br></pre></td></tr></table></figure>

     * var bg = Crafty.e("2D, DOM, Image")
     *              .attr({w: Crafty.viewport.width, h: Crafty.viewport.height})
     *              .image("bg.png", "repeat");
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     *&#10;     * @see Crafty.sprite&#10;     */&#10;    image: function (url, repeat) &#123;&#10;        this.__image = url;&#10;        this._repeat = repeat || &#34;no-repeat&#34;;&#10;&#10;        this.img = Crafty.asset(url);&#10;        if (!this.img) &#123;&#10;            this.img = new Image();&#10;            Crafty.asset(url, this.img);&#10;            this.img.src = url;&#10;            var self = this;&#10;&#10;            this.img.onload = function () &#123;&#10;                self._onImageLoad();&#10;            &#125;;&#10;        &#125; else &#123;&#10;            this._onImageLoad();&#10;        &#125;&#10;&#10;&#10;        this.trigger(&#34;Invalidate&#34;);&#10;&#10;        return this;&#10;    &#125;,&#10;&#10;    _onImageLoad: function()&#123;&#10;&#10;        if (this.has(&#34;Canvas&#34;)) &#123;&#10;            this._pattern = this._drawContext.createPattern(this.img, this._repeat);&#10;        &#125; else if (this.has(&#34;WebGL&#34;)) &#123;&#10;            this._establishShader(&#34;image:&#34; + this.__image, IMAGE_FRAGMENT_SHADER, IMAGE_VERTEX_SHADER, IMAGE_ATTRIBUTE_LIST);&#10;            this.program.setTexture( this.webgl.makeTexture(this.__image, this.img, (this._repeat!==&#34;no-repeat&#34;)));&#10;        &#125;&#10;&#10;        if (this._repeat === &#34;no-repeat&#34;) &#123;&#10;            this.w = this.w || this.img.width;&#10;            this.h = this.h || this.img.height;&#10;        &#125;&#10;&#10;&#10;&#10;        this.ready = true;&#10;        this.trigger(&#34;Invalidate&#34;);&#10;    &#125;,&#10;&#10;    _drawImage: function(e)&#123;&#10;        if (e.type === &#34;canvas&#34;) &#123;&#10;            //skip if no image&#10;            if (!this.ready || !this._pattern) return;&#10;&#10;            var context = e.ctx;&#10;&#10;            context.fillStyle = this._pattern;&#10;&#10;            context.save();&#10;            context.translate(e.pos._x, e.pos._y);&#10;            context.fillRect(0, 0, e.pos._w, e.pos._h);&#10;            context.restore();&#10;        &#125; else if (e.type === &#34;DOM&#34;) &#123;&#10;            if (this.__image) &#123;&#10;              e.style.backgroundImage = &#34;url(&#34; + this.__image + &#34;)&#34;;&#10;              e.style.backgroundRepeat = this._repeat;&#10;            &#125;&#10;        &#125; else if (e.type === &#34;webgl&#34;) &#123;&#10;            var pos = e.pos;&#10;            // Write texture coordinates&#10;            e.program.writeVector(&#34;aTextureCoord&#34;,&#10;                0, 0,&#10;                0, pos._h,&#10;                pos._w, 0,&#10;                pos._w, pos._h&#10;            );&#10;        &#125;&#10;&#10;    &#125;&#10;&#125;);&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],30:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;),    &#10;    document = window.document;&#10;&#10;/**@&#10; * #Particles&#10; * @category Graphics&#10; * @trigger ParticleEnd - when the particle animation has finished&#10; *&#10; * Based on Parcycle by Mr. Speaker, licensed under the MIT, Ported by Leo Koppelkamm&#10; *&#10; * @note This requires the canvas element, and won&#39;t do anything if the browser doesn&#39;t support it!&#10; *&#10; * For implementation details, check out the source code.&#10; */&#10;Crafty.c(&#34;Particles&#34;, &#123;&#10;    init: function () &#123;&#10;        //We need to clone it&#10;        this._Particles = Crafty.clone(this._Particles);&#10;        this._Particles.parentEntity = this;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.particles&#10;     * @comp Particles&#10;     * @sign public this .particles(Object options)&#10;     * @param options - Map of options that specify the behavior and look of the particles.&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * var options = {
     *   maxParticles: 150,
     *   size: 18,
     *   sizeRandom: 4,
     *   speed: 1,
     *   speedRandom: 1.2,
     *   // Lifespan in frames
     *   lifeSpan: 29,
     *   lifeSpanRandom: 7,
     *   // Angle is calculated clockwise: 12pm is 0deg, 3pm is 90deg etc.
     *   angle: 65,
     *   angleRandom: 34,
     *   startColour: [255, 131, 0, 1],
     *   startColourRandom: [48, 50, 45, 0],
     *   endColour: [245, 35, 0, 0],
     *   endColourRandom: [60, 60, 60, 0],
     *   // Only applies when fastMode is off, specifies how sharp the gradients are drawn
     *   sharpness: 20,
     *   sharpnessRandom: 10,
     *   // Random spread from origin
     *   spread: 10,
     *   // How many frames should this last
     *   duration: -1,
     *   // Will draw squares instead of circle gradients
     *   fastMode: false,
     *   gravity: { x: 0, y: 0.1 },
     *   // sensible values are 0-3
     *   jitter: 0,
     *   // Offset for the origin of the particles
     *   originOffset: {x: 0, y: 0}
     * };
     *
     * Crafty.e("2D,Canvas,Particles").particles(options);
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    particles: function (options) &#123;&#10;&#10;        if (!Crafty.support.canvas || Crafty.deactivateParticles) return this;&#10;&#10;        //If we drew on the main canvas, we&#39;d have to redraw&#10;        //potentially huge sections of the screen every frame&#10;        //So we create a separate canvas, where we only have to redraw&#10;        //the changed particles.&#10;        var c, ctx, relativeX, relativeY, bounding;&#10;&#10;        c = document.createElement(&#34;canvas&#34;);&#10;        c.width = Crafty.viewport.width;&#10;        c.height = Crafty.viewport.height;&#10;        c.style.position = &#39;absolute&#39;;&#10;        c.style.left = &#34;0px&#34;;&#10;        c.style.top = &#34;0px&#34;;&#10;&#10;        Crafty.stage.elem.appendChild(c);&#10;&#10;        ctx = c.getContext(&#39;2d&#39;);&#10;&#10;        this._Particles.init(options);&#10;&#10;        // Clean up the DOM when this component is removed&#10;        this.bind(&#39;Remove&#39;, function () &#123;&#10;            Crafty.stage.elem.removeChild(c);&#10;        &#125;).bind(&#34;RemoveComponent&#34;, function (id) &#123;&#10;            if (id === &#34;particles&#34;)&#10;                Crafty.stage.elem.removeChild(c);&#10;        &#125;);&#10;&#10;        relativeX = this.x + Crafty.viewport.x;&#10;        relativeY = this.y + Crafty.viewport.y;&#10;        this._Particles.position = this._Particles.vectorHelpers.create(relativeX, relativeY);&#10;&#10;        var oldViewport = &#123;&#10;            x: Crafty.viewport.x,&#10;            y: Crafty.viewport.y&#10;        &#125;;&#10;&#10;        this.bind(&#39;EnterFrame&#39;, function () &#123;&#10;            relativeX = this.x + Crafty.viewport.x;&#10;            relativeY = this.y + Crafty.viewport.y;&#10;            this._Particles.viewportDelta = &#123;&#10;                x: Crafty.viewport.x - oldViewport.x,&#10;                y: Crafty.viewport.y - oldViewport.y&#10;            &#125;;&#10;&#10;            oldViewport = &#123;&#10;                x: Crafty.viewport.x,&#10;                y: Crafty.viewport.y&#10;            &#125;;&#10;&#10;            this._Particles.position = this._Particles.vectorHelpers.create(relativeX, relativeY);&#10;&#10;            //Selective clearing&#10;            if (typeof Crafty.rectManager.boundingRect == &#39;function&#39;) &#123;&#10;                bounding = Crafty.rectManager.boundingRect(this._Particles.register);&#10;                if (bounding) ctx.clearRect(bounding._x, bounding._y, bounding._w, bounding._h);&#10;            &#125; else &#123;&#10;                ctx.clearRect(0, 0, Crafty.viewport.width, Crafty.viewport.height);&#10;            &#125;&#10;&#10;            //This updates all particle colors &#38; positions&#10;            this._Particles.update();&#10;&#10;            //This renders the updated particles&#10;            this._Particles.render(ctx);&#10;        &#125;);&#10;        return this;&#10;    &#125;,&#10;    _Particles: &#123;&#10;        presets: &#123;&#10;            maxParticles: 150,&#10;            size: 18,&#10;            sizeRandom: 4,&#10;            speed: 1,&#10;            speedRandom: 1.2,&#10;            // Lifespan in frames&#10;            lifeSpan: 29,&#10;            lifeSpanRandom: 7,&#10;            // Angle is calculated clockwise: 12pm is 0deg, 3pm is 90deg etc.&#10;            angle: 65,&#10;            angleRandom: 34,&#10;            startColour: [255, 131, 0, 1],&#10;            startColourRandom: [48, 50, 45, 0],&#10;            endColour: [245, 35, 0, 0],&#10;            endColourRandom: [60, 60, 60, 0],&#10;            // Only applies when fastMode is off, specifies how sharp the gradients are drawn&#10;            sharpness: 20,&#10;            sharpnessRandom: 10,&#10;            // Random spread from origin&#10;            spread: 10,&#10;            // How many frames should this last&#10;            duration: -1,&#10;            // Will draw squares instead of circle gradients&#10;            fastMode: false,&#10;            gravity: &#123;&#10;                x: 0,&#10;                y: 0.1&#10;            &#125;,&#10;            // sensible values are 0-3&#10;            jitter: 0,&#10;            // offset of particles from origin&#10;            originOffset: &#123;x: 0, y: 0&#125;,&#10;&#10;            //Don&#39;t modify the following&#10;            particles: [],&#10;            active: true,&#10;            particleCount: 0,&#10;            elapsedFrames: 0,&#10;            emissionRate: 0,&#10;            emitCounter: 0,&#10;            particleIndex: 0&#10;        &#125;,&#10;&#10;&#10;        init: function (options) &#123;&#10;            this.position = this.vectorHelpers.create(0, 0);&#10;            if (typeof options == &#39;undefined&#39;) options = &#123;&#125;;&#10;&#10;            //Create current config by merging given options and presets.&#10;            for (var key in this.presets) &#123;&#10;                if (typeof options[key] != &#39;undefined&#39;) this[key] = options[key];&#10;                else this[key] = this.presets[key];&#10;            &#125;&#10;&#10;            this.emissionRate = this.maxParticles / this.lifeSpan;&#10;            this.positionRandom = this.vectorHelpers.create(this.spread, this.spread);&#10;        &#125;,&#10;&#10;        addParticle: function () &#123;&#10;            if (this.particleCount == this.maxParticles) &#123;&#10;                return false;&#10;            &#125;&#10;&#10;            // Take the next particle out of the particle pool we have created and initialize it&#10;            var particle = new this.particle(this.vectorHelpers);&#10;            this.initParticle(particle);&#10;            this.particles[this.particleCount] = particle;&#10;            // Increment the particle count&#10;            this.particleCount++;&#10;&#10;            return true;&#10;        &#125;,&#10;        RANDM1TO1: function () &#123;&#10;            return Math.random() * 2 - 1;&#10;        &#125;,&#10;        initParticle: function (particle) &#123;&#10;            particle.position.x = Crafty.viewport._scale * (this.position.x + this.originOffset.x + this.positionRandom.x * this.RANDM1TO1());&#10;            particle.position.y = Crafty.viewport._scale * (this.position.y + this.originOffset.y + this.positionRandom.y * this.RANDM1TO1());&#10;&#10;            var newAngle = (this.angle + this.angleRandom * this.RANDM1TO1()) * (Math.PI / 180); // convert to radians&#10;            var vector = this.vectorHelpers.create(Math.sin(newAngle), -Math.cos(newAngle)); // Could move to lookup for speed&#10;            var vectorSpeed = this.speed + this.speedRandom * this.RANDM1TO1();&#10;            particle.direction = this.vectorHelpers.multiply(vector, vectorSpeed);&#10;&#10;            particle.size = Crafty.viewport._scale * (this.size + this.sizeRandom * this.RANDM1TO1());&#10;            particle.size = particle.size &#60; 0 ? 0 : ~~particle.size;&#10;            particle.timeToLive = this.lifeSpan + this.lifeSpanRandom * this.RANDM1TO1();&#10;&#10;            particle.sharpness = this.sharpness + this.sharpnessRandom * this.RANDM1TO1();&#10;            particle.sharpness = particle.sharpness &#62; 100 ? 100 : particle.sharpness &#60; 0 ? 0 : particle.sharpness;&#10;            // internal circle gradient size - affects the sharpness of the radial gradient&#10;            particle.sizeSmall = ~~ ((particle.size / 200) * particle.sharpness); //(size/2/100)&#10;            var start = [&#10;                this.startColour[0] + this.startColourRandom[0] * this.RANDM1TO1(),&#10;                this.startColour[1] + this.startColourRandom[1] * this.RANDM1TO1(),&#10;                this.startColour[2] + this.startColourRandom[2] * this.RANDM1TO1(),&#10;                this.startColour[3] + this.startColourRandom[3] * this.RANDM1TO1()&#10;            ];&#10;&#10;            var end = [&#10;                this.endColour[0] + this.endColourRandom[0] * this.RANDM1TO1(),&#10;                this.endColour[1] + this.endColourRandom[1] * this.RANDM1TO1(),&#10;                this.endColour[2] + this.endColourRandom[2] * this.RANDM1TO1(),&#10;                this.endColour[3] + this.endColourRandom[3] * this.RANDM1TO1()&#10;            ];&#10;&#10;            particle.colour = start;&#10;            particle.deltaColour[0] = (end[0] - start[0]) / particle.timeToLive;&#10;            particle.deltaColour[1] = (end[1] - start[1]) / particle.timeToLive;&#10;            particle.deltaColour[2] = (end[2] - start[2]) / particle.timeToLive;&#10;            particle.deltaColour[3] = (end[3] - start[3]) / particle.timeToLive;&#10;        &#125;,&#10;        update: function () &#123;&#10;            if (this.active &#38;&#38; this.emissionRate &#62; 0) &#123;&#10;                var rate = 1 / this.emissionRate;&#10;                this.emitCounter++;&#10;                while (this.particleCount &#60; this.maxParticles &#38;&#38; this.emitCounter &#62; rate) &#123;&#10;                    this.addParticle();&#10;                    this.emitCounter -= rate;&#10;                &#125;&#10;                this.elapsedFrames++;&#10;                if (this.duration != -1 &#38;&#38; this.duration &#60; this.elapsedFrames) &#123;&#10;                    this.stop();&#10;                &#125;&#10;            &#125;&#10;&#10;            this.particleIndex = 0;&#10;            this.register = [];&#10;            var draw;&#10;            while (this.particleIndex &#60; this.particleCount) &#123;&#10;&#10;                var currentParticle = this.particles[this.particleIndex];&#10;&#10;                // If the current particle is alive then update it&#10;                if (currentParticle.timeToLive &#62; 0) &#123;&#10;&#10;                    // Calculate the new direction based on gravity&#10;                    currentParticle.direction = this.vectorHelpers.add(currentParticle.direction, this.gravity);&#10;                    currentParticle.position = this.vectorHelpers.add(currentParticle.position, currentParticle.direction);&#10;                    currentParticle.position = this.vectorHelpers.add(currentParticle.position, this.viewportDelta);&#10;                    if (this.jitter) &#123;&#10;                        currentParticle.position.x += this.jitter * this.RANDM1TO1();&#10;                        currentParticle.position.y += this.jitter * this.RANDM1TO1();&#10;                    &#125;&#10;                    currentParticle.timeToLive--;&#10;&#10;                    // Update colours&#10;                    var r = currentParticle.colour[0] += currentParticle.deltaColour[0];&#10;                    var g = currentParticle.colour[1] += currentParticle.deltaColour[1];&#10;                    var b = currentParticle.colour[2] += currentParticle.deltaColour[2];&#10;                    var a = currentParticle.colour[3] += currentParticle.deltaColour[3];&#10;&#10;                    // Calculate the rgba string to draw.&#10;                    draw = [];&#10;                    draw.push(&#34;rgba(&#34; + (r &#62; 255 ? 255 : r &#60; 0 ? 0 : ~~r));&#10;                    draw.push(g &#62; 255 ? 255 : g &#60; 0 ? 0 : ~~g);&#10;                    draw.push(b &#62; 255 ? 255 : b &#60; 0 ? 0 : ~~b);&#10;                    draw.push((a &#62; 1 ? 1 : a &#60; 0 ? 0 : a.toFixed(2)) + &#34;)&#34;);&#10;                    currentParticle.drawColour = draw.join(&#34;,&#34;);&#10;&#10;                    if (!this.fastMode) &#123;&#10;                        draw[3] = &#34;0)&#34;;&#10;                        currentParticle.drawColourEnd = draw.join(&#34;,&#34;);&#10;                    &#125;&#10;&#10;                    this.particleIndex++;&#10;                &#125; else &#123;&#10;                    // Replace particle with the last active&#10;                    if (this.particleIndex != this.particleCount - 1) &#123;&#10;                        this.particles[this.particleIndex] = this.particles[this.particleCount - 1];&#10;                    &#125;&#10;                    this.particleCount--;&#10;                &#125;&#10;                var rect = &#123;&#125;;&#10;                rect._x = ~~currentParticle.position.x;&#10;                rect._y = ~~currentParticle.position.y;&#10;                rect._w = currentParticle.size;&#10;                rect._h = currentParticle.size;&#10;&#10;                this.register.push(rect);&#10;            &#125;&#10;        &#125;,&#10;&#10;        stop: function () &#123;&#10;            this.active = false;&#10;            this.elapsedFrames = 0;&#10;            this.emitCounter = 0;&#10;            this.parentEntity.trigger(&#34;ParticleEnd&#34;);&#10;        &#125;,&#10;&#10;        render: function (context) &#123;&#10;&#10;            for (var i = 0, j = this.particleCount; i &#60; j; i++) &#123;&#10;                var particle = this.particles[i];&#10;                var size = particle.size;&#10;                var halfSize = size &#62;&#62; 1;&#10;&#10;                if (particle.position.x + size &#60; 0 || particle.position.y + size &#60; 0 || particle.position.x - size &#62; Crafty.viewport.width || particle.position.y - size &#62; Crafty.viewport.height) &#123;&#10;                    //Particle is outside&#10;                    continue;&#10;                &#125;&#10;                var x = ~~particle.position.x;&#10;                var y = ~~particle.position.y;&#10;&#10;                if (this.fastMode) &#123;&#10;                    context.fillStyle = particle.drawColour;&#10;                &#125; else &#123;&#10;                    var radgrad = context.createRadialGradient(x + halfSize, y + halfSize, particle.sizeSmall, x + halfSize, y + halfSize, halfSize);&#10;                    radgrad.addColorStop(0, particle.drawColour);&#10;                    //0.9 to avoid visible boxing&#10;                    radgrad.addColorStop(0.9, particle.drawColourEnd);&#10;                    context.fillStyle = radgrad;&#10;                &#125;&#10;                context.fillRect(x, y, size, size);&#10;            &#125;&#10;        &#125;,&#10;        particle: function (vectorHelpers) &#123;&#10;            this.position = vectorHelpers.create(0, 0);&#10;            this.direction = vectorHelpers.create(0, 0);&#10;            this.size = 0;&#10;            this.sizeSmall = 0;&#10;            this.timeToLive = 0;&#10;            this.colour = [];&#10;            this.drawColour = &#34;&#34;;&#10;            this.deltaColour = [];&#10;            this.sharpness = 0;&#10;        &#125;,&#10;        vectorHelpers: &#123;&#10;            create: function (x, y) &#123;&#10;                return &#123;&#10;                    &#34;x&#34;: x,&#10;                    &#34;y&#34;: y&#10;                &#125;;&#10;            &#125;,&#10;            multiply: function (vector, scaleFactor) &#123;&#10;                vector.x *= scaleFactor;&#10;                vector.y *= scaleFactor;&#10;                return vector;&#10;            &#125;,&#10;            add: function (vector1, vector2) &#123;&#10;                vector1.x += vector2.x;&#10;                vector1.y += vector2.y;&#10;                return vector1;&#10;            &#125;&#10;        &#125;&#10;    &#125;&#10;&#125;);&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],31:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;&#10;/**@&#10;* #SpriteAnimation&#10;* @category Animation&#10;* @trigger StartAnimation - When an animation starts playing, or is resumed from the paused state - &#123;Reel&#125;&#10;* @trigger AnimationEnd - When the animation finishes - &#123; Reel &#125;&#10;* @trigger FrameChange - Each time the frame of the current reel changes - &#123; Reel &#125;&#10;* @trigger ReelChange - When the reel changes - &#123; Reel &#125;&#10;*&#10;* Used to animate sprites by treating a sprite map as a set of animation frames.&#10;* Must be applied to an entity that has a sprite-map component.&#10;*&#10;* To define an animation, see the `reel` method.  To play an animation, see the `animate` method.&#10;*&#10;* A reel is an object that contains the animation frames and current state for an animation.  The reel object has the following properties:&#10;* @param id: (String) - the name of the reel&#10;* @param frames: (Array) - A list of frames in the format [xpos, ypos]&#10;* @param currentFrame: (Number) - The index of the current frame&#10;* @param easing: (Crafty.easing object) - The object that handles the internal progress of the animation.&#10;* @param duration: (Number) - The duration in milliseconds.&#10;*&#10;* Many animation related events pass a reel object as data.  As typical with events, this should be treated as read only data that might be later altered by the entity.  If you wish to preserve the data, make a copy of it.&#10;*&#10;* @see Crafty.sprite&#10;*/&#10;Crafty.c(&#34;SpriteAnimation&#34;, &#123;&#10;&#9;/*&#10;&#9;*&#10;&#9;* A map in which the keys are the names assigned to animations defined using&#10;&#9;* the component (also known as reelIDs), and the values are objects describing&#10;&#9;* the animation and its state.&#10;&#9;*/&#10;&#9;_reels: null,&#10;&#10;&#9;/*&#10;&#9;* The reelID of the currently active reel (which is one of the elements in `this._reels`).&#10;&#9;* This value is `null` if no reel is active. Some of the component&#39;s actions can be invoked&#10;&#9;* without specifying a reel, in which case they will work on the active reel.&#10;&#9;*/&#10;&#9;_currentReelId: null,&#10;&#10;&#9;/*&#10;&#9;* The currently active reel.&#10;&#9;* This value is `null` if no reel is active.&#10;&#9;*/&#10;&#9;_currentReel: null,&#10;&#10;&#9;/*&#10;&#9;* Whether or not an animation is currently playing.&#10;&#9;*/&#10;&#9;_isPlaying: false,&#10;&#10;&#9;/**@&#10;&#9;* #.animationSpeed&#10;&#9;* @comp SpriteAnimation&#10;&#9;*&#10;&#9;* The playback rate of the animation.  This property defaults to 1.&#10;&#9;*/&#10;&#9;animationSpeed: 1,&#10;&#10;&#10;&#9;init: function () &#123;&#10;&#9;&#9;this._reels = &#123;&#125;;&#10;&#9;&#125;,&#10;&#10;&#9;/**@&#10;&#9;* #.reel&#10;&#9;* @comp SpriteAnimation&#10;&#9;* Used to define reels, to change the active reel, and to fetch the id of the active reel.&#10;&#9;*&#10;&#9;* @sign public this .reel(String reelId, Duration duration, Number fromX, Number fromY, Number frameCount)&#10;&#9;* Defines a reel by starting and ending position on the sprite sheet.&#10;&#9;* @param reelId - ID of the animation reel being created&#10;&#9;* @param duration - The length of the animation in milliseconds.&#10;&#9;* @param fromX - Starting `x` position on the sprite map (x&#39;s unit is the horizontal size of the sprite in the sprite map).&#10;&#9;* @param fromY - `y` position on the sprite map (y&#39;s unit is the horizontal size of the sprite in the sprite map). Remains constant through the animation.&#10;&#9;* @param frameCount - The number of sequential frames in the animation.  If negative, the animation will play backwards.&#10;&#9;*&#10;&#9;* @sign public this .reel(String reelId, Duration duration, Array frames)&#10;&#9;* Defines a reel by an explicit list of frames&#10;&#9;* @param reelId - ID of the animation reel being created&#10;&#9;* @param duration - The length of the animation in milliseconds.&#10;&#9;* @param frames - An array of arrays containing the `x` and `y` values of successive frames: [[x1,y1],[x2,y2],...] (the values are in the unit of the sprite map&#39;s width/height respectively).&#10;&#9;*&#10;&#9;* @sign public this .reel(String reelId)&#10;&#9;* Switches to the specified reel.  The sprite will be updated to that reel&#39;s current frame&#10;&#9;* @param reelID - the ID to switch to&#10;&#9;*&#10;&#9;* @sign public Reel .reel()&#10;&#9;* @return The id of the current reel&#10;&#9;*&#10;&#9;*&#10;&#9;* A method to handle animation reels.  Only works for sprites built with the Crafty.sprite methods.&#10;&#9;* See the Tween component for animation of 2D properties.&#10;&#9;*&#10;&#9;* To setup an animation reel, pass the name of the reel (used to identify the reel later), and either an&#10;&#9;* array of absolute sprite positions or the start x on the sprite map, the y on the sprite map and then the end x on the sprite map.&#10;&#9;*&#10;&#9;*&#10;&#9;* @example&#10;&#9;*</span><br></pre></td></tr></table></figure>

	* // Define a sprite-map component
	* Crafty.sprite(16, "images/sprite.png", {
	*     PlayerSprite: [0,0]
	* });
	*
	* // Define an animation on the second row of the sprite map (fromY = 1)
	* // from the left most sprite (fromX = 0) to the fourth sprite
	* // on that row (frameCount = 4), with a duration of 1 second
	* Crafty.e("2D, DOM, SpriteAnimation, PlayerSprite").reel('PlayerRunning', 1000, 0, 1, 4);
	*
	* // This is the same animation definition, but using the alternative method
	* Crafty.e("2D, DOM, SpriteAnimation, PlayerSprite").reel('PlayerRunning', 1000, [[0, 1], [1, 1], [2, 1], [3, 1]]);
	* <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">*/&#10;reel: function (reelId, duration, fromX, fromY, frameCount) &#123;&#10;&#9;// @sign public this .reel()&#10;&#9;if (arguments.length === 0)&#10;&#9;&#9;return this._currentReelId;&#10;&#10;&#9;// @sign public this .reel(String reelID)&#10;&#9;if (arguments.length === 1 &#38;&#38; typeof reelId === &#34;string&#34;)&#123;&#10;&#9;&#9;if (typeof this._reels[reelId] === &#34;undefined&#34;)&#10;&#9;&#9;&#9;throw(&#34;The specified reel &#34; + reelId + &#34; is undefined.&#34;);&#10;&#9;&#9;this.pauseAnimation();&#10;&#9;&#9;if (this._currentReelId !== reelId) &#123;&#10;&#9;&#9;&#9;this._currentReelId = reelId;&#10;&#9;&#9;&#9;this._currentReel = this._reels[reelId];&#10;&#9;&#9;&#9;// Change the visible sprite&#10;&#9;&#9;&#9;this._updateSprite();&#10;&#9;&#9;&#9;// Trigger event&#10;&#9;&#9;&#9;this.trigger(&#34;ReelChange&#34;, this._currentReel);&#10;&#9;&#9;&#125;&#10;&#9;&#9;return this;&#10;&#9;&#125;&#10;&#10;&#10;&#9;var reel, i, y;&#10;&#10;&#9;reel = &#123;&#10;&#9;&#9;id: reelId,&#10;&#9;&#9;frames: [],&#10;&#9;&#9;currentFrame: 0,&#10;&#9;&#9;easing: new Crafty.easing(duration),&#10;&#9;&#9;defaultLoops: 1&#10;&#9;&#125;;&#10;&#10;&#9;reel.duration = reel.easing.duration;&#10;&#10;&#9;// @sign public this .reel(String reelId, Number duration, Number fromX, Number fromY, Number frameDuration)&#10;&#9;if (typeof fromX === &#34;number&#34;) &#123;&#10;&#9;&#9;i = fromX;&#10;&#9;&#9;y = fromY;&#10;&#9;&#9;if (frameCount &#62;= 0) &#123;&#10;&#9;&#9;&#9;for (; i &#60; fromX + frameCount ; i++) &#123;&#10;&#9;&#9;&#9;&#9;reel.frames.push([i, y]);&#10;&#9;&#9;&#9;&#125;&#10;&#9;&#9;&#125;&#10;&#9;&#9;else &#123;&#10;&#9;&#9;&#9;for (; i &#62; fromX + frameCount; i--) &#123;&#10;&#9;&#9;&#9;&#9;reel.frames.push([i, y]);&#10;&#9;&#9;&#9;&#125;&#10;&#9;&#9;&#125;&#10;&#9;&#125;&#10;&#9;// @sign public this .reel(String reelId, Number duration, Array frames)&#10;&#9;else if (arguments.length === 3 &#38;&#38; typeof fromX === &#34;object&#34;) &#123;&#10;&#9;&#9;reel.frames = fromX;&#10;&#9;&#125;&#10;&#9;else &#123;&#10;&#9;&#9;throw &#34;Urecognized arguments. Please see the documentation for &#39;reel(...)&#39;.&#34;;&#10;&#9;&#125;&#10;&#10;&#9;this._reels[reelId] = reel;&#10;&#10;&#9;return this;&#10;&#125;,&#10;&#10;/**@&#10;* #.animate&#10;* @comp SpriteAnimation&#10;* @sign public this .animate([String reelId] [, Number loopCount])&#10;* @param reelId - ID of the animation reel to play.  Defaults to the current reel if none is specified.&#10;* @param loopCount - Number of times to repeat the animation. Use -1 to repeat indefinitely.  Defaults to 1.&#10;*&#10;* Play one of the reels previously defined through `.reel(...)`. Simply pass the name of the reel. If you wish the&#10;* animation to play multiple times in succession, pass in the amount of times as an additional parameter.&#10;* To have the animation repeat indefinitely, pass in `-1`.&#10;*&#10;* If another animation is currently playing, it will be paused.&#10;*&#10;* This will always play an animation from the beginning.  If you wish to resume from the current state of a reel, use `resumeAnimation()`.&#10;*&#10;* Once an animation ends, it will remain at its last frame.&#10;*&#10;*&#10;* @example&#10;*</span><br></pre></td></tr></table></figure>

	* // Define a sprite-map component
	* Crafty.sprite(16, "images/sprite.png", {
	*     PlayerSprite: [0,0]
	* });
	*
	* // Play the animation across 20 frames (so each sprite in the 4 sprite animation should be seen for 5 frames) and repeat indefinitely
	* Crafty.e("2D, DOM, SpriteAnimation, PlayerSprite")
	*     .reel('PlayerRunning', 20, 0, 0, 3) // setup animation
	*     .animate('PlayerRunning', -1); // start animation
	* <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">*/&#10;animate: function(reelId, loopCount) &#123;&#10;&#10;&#9;var pos;&#10;&#10;&#10;&#9;// switch to the specified reel if necessary&#10;&#9;if (typeof reelId === &#34;string&#34;)&#10;&#9;&#9;this.reel(reelId);&#10;&#10;&#9;var currentReel = this._currentReel;&#10;&#10;&#9;if (typeof currentReel === &#34;undefined&#34; || currentReel === null)&#10;&#9;&#9;throw(&#34;No reel is specified, and there is no currently active reel.&#34;);&#10;&#10;&#9;this.pauseAnimation(); // This will pause the current animation, if one is playing&#10;&#10;&#9;// Handle repeats; if loopCount is undefined and reelID is a number, calling with that signature&#10;&#9;if (typeof loopCount === &#34;undefined&#34;)&#10;&#9;&#9;if (typeof reelId === &#34;number&#34;)&#10;&#9;&#9;&#9;loopCount = reelId;&#10;&#9;&#9;else&#10;&#9;&#9;&#9;loopCount = 1;&#10;&#10;&#9;// set the animation to the beginning&#10;&#9;currentReel.easing.reset();&#10;&#10;&#10;&#9;// user provided loop count.&#10;&#9;this.loops(loopCount);&#10;&#10;&#9;// trigger the necessary events and switch to the first frame&#10;&#9;this._setFrame(0);&#10;&#10;&#9;// Start the anim&#10;&#9;this.bind(&#34;EnterFrame&#34;, this._animationTick);&#10;&#9;this._isPlaying = true;&#10;&#10;&#9;this.trigger(&#34;StartAnimation&#34;, currentReel);&#10;&#9;return this;&#10;&#125;,&#10;&#10;/**@&#10;* #.resumeAnimation&#10;* @comp SpriteAnimation&#10;* @sign public this .resumeAnimation()&#10;*&#10;* This will resume animation of the current reel from its current state.&#10;* If a reel is already playing, or there is no current reel, there will be no effect.&#10;*/&#10;resumeAnimation: function() &#123;&#10;&#9;if (this._isPlaying === false &#38;&#38;  this._currentReel !== null) &#123;&#10;&#9;&#9;this.bind(&#34;EnterFrame&#34;, this._animationTick);&#10;&#9;&#9;this._isPlaying = true;&#10;&#9;&#9;this._currentReel.easing.resume();&#10;&#9;&#9;this.trigger(&#34;StartAnimation&#34;, this._currentReel);&#10;&#9;&#125;&#10;&#9;return this;&#10;&#125;,&#10;&#10;/**@&#10;* #.pauseAnimation&#10;* @comp SpriteAnimation&#10;* @sign public this .pauseAnimation(void)&#10;*&#10;* Pauses the currently playing animation, or does nothing if no animation is playing.&#10;*/&#10;pauseAnimation: function () &#123;&#10;&#9;if (this._isPlaying === true) &#123;&#10;&#9;&#9;this.unbind(&#34;EnterFrame&#34;, this._animationTick);&#10;&#9;&#9;this._isPlaying = false;&#10;&#9;&#9;this._reels[this._currentReelId].easing.pause();&#10;&#9;&#125;&#10;&#9;return this;&#10;&#125;,&#10;&#10;/**@&#10;* #.resetAnimation&#10;* @comp SpriteAnimation&#10;* @sign public this .resetAnimation()&#10;*&#10;* Resets the current animation to its initial state.  Resets the number of loops to the last specified value, which defaults to 1.&#10;*&#10;* Neither pauses nor resumes the current animation.&#10;*/&#10;resetAnimation: function()&#123;&#10;&#9;var currentReel = this._currentReel;&#10;&#9;if  (currentReel === null)&#10;&#9;&#9;throw(&#34;No active reel to reset.&#34;);&#10;&#9;this.reelPosition(0);&#10;&#9;currentReel.easing.repeat(currentReel.defaultLoops);&#10;&#9;return this;&#10;  &#125;,&#10;&#10;&#10;/**@&#10;* #.loops&#10;* @comp SpriteAnimation&#10;* @sign public this .loops(Number loopCount)&#10;* @param loopCount - The number of times to play the animation&#10;*&#10;* Sets the number of times the animation will loop for.&#10;* If called while an animation is in progress, the current state will be considered the first loop.&#10;*&#10;* @sign public Number .loops()&#10;* @returns The number of loops left.  Returns 0 if no reel is active.&#10;*/&#10;loops: function(loopCount) &#123;&#10;&#9;if (arguments.length === 0)&#123;&#10;&#9;&#9;if (this._currentReel !== null)&#10;&#9;&#9;&#9;return this._currentReel.easing.loops;&#10;&#9;&#9;else&#10;&#9;&#9;&#9;return 0;&#10;&#9;&#125;&#10;&#10;&#9;if (this._currentReel !== null)&#123;&#10;&#9;&#9;if (loopCount &#60; 0)&#10;&#9;&#9;&#9;loopCount = Infinity;&#10;&#9;&#9;this._currentReel.easing.repeat(loopCount);&#10;&#9;&#9;this._currentReel.defaultLoops = loopCount;&#10;&#9;&#125;&#10;&#9;return this;&#10;&#10;&#125;,&#10;&#10;/**@&#10;* #.reelPosition&#10;* @comp SpriteAnimation&#10;*&#10;* @sign public this .reelPosition(Integer position)&#10;* Sets the position of the current reel by frame number.&#10;* @param position - the frame to jump to.  This is zero-indexed.  A negative values counts back from the last frame.&#10;*&#10;* @sign public this .reelPosition(Number position)&#10;* Sets the position of the current reel by percent progress.&#10;* @param position - a non-integer number between 0 and 1&#10;*&#10;* @sign public this .reelPosition(String position)&#10;* Jumps to the specified position.  The only currently accepted value is &#34;end&#34;, which will jump to the end of the reel.&#10;*&#10;* @sign public Number .reelPosition()&#10;* @returns The current frame number&#10;*&#10;*/&#10;reelPosition: function(position) &#123;&#10;&#9;if (this._currentReel === null)&#10;&#9;&#9;throw(&#34;No active reel.&#34;);&#10;&#10;&#9;if (arguments.length === 0)&#10;&#9;&#9;return this._currentReel.currentFrame;&#10;&#10;&#9;var progress,&#10;&#9;&#9;l = this._currentReel.frames.length;&#10;&#9;if (position === &#34;end&#34;)&#10;&#9;&#9;position = l - 1;&#10;&#10;&#9;if (position &#60; 1 &#38;&#38; position &#62; 0) &#123;&#10;&#9;&#9;progress = position;&#10;&#9;&#9;position = Math.floor(l * progress);&#10;&#9;&#125; else &#123;&#10;&#9;&#9;if (position !== Math.floor(position))&#10;&#9;&#9;&#9;throw(&#34;Position &#34; + position + &#34; is invalid.&#34;);&#10;&#9;&#9;if (position &#60; 0)&#10;&#9;&#9;&#9;position = l - 1 + position;&#10;&#9;&#9;progress = position / l;&#10;&#9;&#125;&#10;&#9;// cap to last frame&#10;&#9;position = Math.min(position, l-1);&#10;&#9;position = Math.max(position, 0);&#10;&#9;this._setProgress(progress);&#10;&#9;this._setFrame(position);&#10;&#10;&#9;return this;&#10;&#10;&#125;,&#10;&#10;&#10;// Bound to &#34;EnterFrame&#34;.  Progresses the animation by dt, changing the frame if necessary.&#10;// dt is multiplied by the animationSpeed property&#10;_animationTick: function(frameData) &#123;&#10;&#9;var currentReel = this._reels[this._currentReelId];&#10;&#9;currentReel.easing.tick(frameData.dt * this.animationSpeed);&#10;&#9;var progress = currentReel.easing.value();&#10;&#9;var frameNumber = Math.min( Math.floor(currentReel.frames.length * progress), currentReel.frames.length - 1);&#10;&#10;&#9;this._setFrame(frameNumber);&#10;&#10;&#9;if(currentReel.easing.complete === true)&#123;&#10;&#9;&#9;this.pauseAnimation();&#10;&#9;&#9;this.trigger(&#34;AnimationEnd&#34;, this._currentReel);&#10;&#9;&#125;&#10;&#125;,&#10;&#10;&#10;&#10;&#10;&#10;// Set the current frame and update the displayed sprite&#10;// The actual progress for the animation must be set seperately.&#10;_setFrame: function(frameNumber) &#123;&#10;&#9;var currentReel = this._currentReel;&#10;&#9;if (frameNumber === currentReel.currentFrame)&#10;&#9;&#9;return;&#10;&#9;currentReel.currentFrame = frameNumber;&#10;&#9;this._updateSprite();&#10;&#9;this.trigger(&#34;FrameChange&#34;, currentReel);&#10;&#125;,&#10;&#10;// Update the displayed sprite.&#10;_updateSprite: function() &#123;&#10;&#9;var currentReel = this._currentReel;&#10;&#9;var pos = currentReel.frames[currentReel.currentFrame];&#10;&#9;this.sprite(pos[0], pos[1]); // .sprite will trigger redraw&#10;&#10;&#125;,&#10;&#10;&#10;// Sets the internal state of the current reel&#39;s easing object&#10;_setProgress: function(progress, repeats) &#123;&#10;&#9;this._currentReel.easing.setProgress(progress, repeats);&#10;&#10;&#125;,&#10;&#10;&#10;/**@&#10;* #.isPlaying&#10;* @comp SpriteAnimation&#10;* @sign public Boolean .isPlaying([String reelId])&#10;* @param reelId - The reelId of the reel we wish to examine&#10;* @returns The current animation state&#10;*&#10;* Determines if the specified animation is currently playing. If no reelId is specified,&#10;* checks if any animation is playing.&#10;*&#10;* @example&#10;*</span><br></pre></td></tr></table></figure>

	* myEntity.isPlaying() // is any animation playing
	* myEntity.isPlaying('PlayerRunning') // is the PlayerRunning animation playing
	* <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">&#9;*/&#10;&#9;isPlaying: function (reelId) &#123;&#10;&#9;&#9;if (!this._isPlaying) return false;&#10;&#10;&#9;&#9;if (!reelId) return !!this._currentReelId;&#10;&#9;&#9;return this._currentReelId === reelId;&#10;&#9;&#125;,&#10;&#10;&#9;/**@&#10;&#9;* #.getReel&#10;&#9;* @comp SpriteAnimation&#10;&#9;* @sign public Reel .getReel()&#10;&#9;* @returns The current reel, or null if there is no active reel&#10;&#9;*&#10;&#9;* @sign public Reel .getReel(reelId)&#10;&#9;* @param reelId - The id of the reel to fetch.&#10;&#9;* @returns The specified reel, or `undefined` if no such reel exists.&#10;&#9;*&#10;&#9;*/&#10;&#9;getReel: function (reelId) &#123;&#10;&#9;&#9;if (arguments.length === 0)&#123;&#10;&#9;&#9;&#9;if (!this._currentReelId) return null;&#10;&#9;&#9;&#9;reelId = this._currentReelId;&#10;&#9;&#9;&#125;&#10;&#10;&#9;&#9;return this._reels[reelId];&#10;&#9;&#125;&#10;&#125;);&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],32:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;&#10;// Define some variables required for webgl&#10;&#10;var SPRITE_VERTEX_SHADER = &#34;attribute vec2 aPosition;\nattribute vec3 aOrientation;\nattribute vec2 aLayer;\nattribute vec2 aTextureCoord;\n\nvarying mediump vec3 vTextureCoord;\n\nuniform vec4 uViewport;\nuniform mediump vec2 uTextureDimensions;\n\nmat4 viewportScale = mat4(2.0 / uViewport.z, 0, 0, 0,    0, -2.0 / uViewport.w, 0,0,    0, 0,1,0,    -1,+1,0,1);\nvec4 viewportTranslation = vec4(uViewport.xy, 0, 0);\n\nvoid main() &#123;\n  vec2 pos = aPosition;\n  vec2 entityOrigin = aOrientation.xy;\n  mat2 entityRotationMatrix = mat2(cos(aOrientation.z), sin(aOrientation.z), -sin(aOrientation.z), cos(aOrientation.z));\n  \n  pos = entityRotationMatrix * (pos - entityOrigin) + entityOrigin ;\n  gl_Position = viewportScale * (viewportTranslation + vec4(pos, 1.0/(1.0+exp(aLayer.x) ), 1) );\n  vTextureCoord = vec3(aTextureCoord, aLayer.y);\n&#125;&#34;;&#10;var SPRITE_FRAGMENT_SHADER = &#34;varying mediump vec3 vTextureCoord;\n  \nuniform sampler2D uSampler;\nuniform mediump vec2 uTextureDimensions;\n\nvoid main(void) &#123;\n  highp vec2 coord =   vTextureCoord.xy / uTextureDimensions;\n  mediump vec4 base_color = texture2D(uSampler, coord);\n  gl_FragColor = vec4(base_color.rgb*base_color.a*vTextureCoord.z, base_color.a*vTextureCoord.z);\n&#125;&#34;;&#10;var SPRITE_ATTRIBUTE_LIST = [&#10;    &#123;name:&#34;aPosition&#34;, width: 2&#125;,&#10;    &#123;name:&#34;aOrientation&#34;, width: 3&#125;,&#10;    &#123;name:&#34;aLayer&#34;, width:2&#125;,&#10;    &#123;name:&#34;aTextureCoord&#34;,  width: 2&#125;&#10;];&#10;&#10;Crafty.extend(&#123;&#10;&#10;    /**@&#10;     * #Crafty.sprite&#10;     * @category Graphics&#10;     * @sign public this Crafty.sprite([Number tile, [Number tileh]], String url, Object map[, Number paddingX[, Number paddingY[, Boolean paddingAroundBorder]]])&#10;     * @param tile - Tile size of the sprite map, defaults to 1&#10;     * @param tileh - Height of the tile; if provided, tile is interpreted as the width&#10;     * @param url - URL of the sprite image&#10;     * @param map - Object where the key is what becomes a new component and the value points to a position on the sprite map&#10;     * @param paddingX - Horizontal space in between tiles. Defaults to 0.&#10;     * @param paddingY - Vertical space in between tiles. Defaults to paddingX.&#10;     * @param paddingAroundBorder - If padding should be applied around the border of the sprite sheet. If enabled the first tile starts at (paddingX,paddingY) instead of (0,0). Defaults to false.&#10;     *&#10;     * Generates components based on positions in a sprite image to be applied to entities.&#10;     *&#10;     * Accepts a tile size, URL and map for the name of the sprite and its position.&#10;     *&#10;     * The position must be an array containing the position of the sprite where index `0`&#10;     * is the `x` position, `1` is the `y` position and optionally `2` is the width and `3`&#10;     * is the height. If the sprite map has padding, pass the values for the `x` padding&#10;     * or `y` padding. If they are the same, just add one value.&#10;     *&#10;     * If the sprite image has no consistent tile size, `1` or no argument need be&#10;     * passed for tile size.&#10;     *&#10;     * Entities that add the generated components are also given the `2D` component, and&#10;     * a component called `Sprite`.&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * Crafty.sprite("imgs/spritemap6.png", {flower:[0,0,20,30]});
     * var flower_entity = Crafty.e("2D, DOM, flower");
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* The first line creates a component called `flower` associated with the sub-image of&#10;* spritemap6.png with top-left corner (0,0), width 20 pixels, and height 30 pixels.&#10;* The second line creates an entity with that image. (Note: The `2D` is not really&#10;* necessary here, because adding the `flower` component automatically also adds the&#10;* `2D` component.)&#10;*</span><br></pre></td></tr></table></figure>

     * Crafty.sprite(50, "imgs/spritemap6.png", {flower:[0,0], grass:[0,1,3,1]});
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">* In this case, the `flower` component is pixels 0 &#60;= x &#60; 50, 0 &#60;= y &#60; 50, and the&#10;* `grass` component is pixels 0 &#60;= x &#60; 150, 50 &#60;= y &#60; 100. (The `3` means grass has a&#10;* width of 3 tiles, i.e. 150 pixels.)&#10;*</span><br></pre></td></tr></table></figure>

     * Crafty.sprite(50, 100, "imgs/spritemap6.png", {flower:[0,0], grass:[0,1]}, 10);
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     * In this case, each tile is 50x100, and there is a spacing of 10 pixels between&#10;     * consecutive tiles. So `flower` is pixels 0 &#60;= x &#60; 50, 0 &#60;= y &#60; 100, and `grass` is&#10;     * pixels 0 &#60;= x &#60; 50, 110 &#60;= y &#60; 210.&#10;     *&#10;     * @see Sprite&#10;     */&#10;    sprite: function (tile, tileh, url, map, paddingX, paddingY, paddingAroundBorder) &#123;&#10;        var spriteName, temp, x, y, w, h, img;&#10;&#10;        //if no tile value, default to 1.&#10;        //(if the first passed argument is a string, it must be the url.)&#10;        if (typeof tile === &#34;string&#34;) &#123;&#10;            paddingY = paddingX;&#10;            paddingX = map;&#10;            map = tileh;&#10;            url = tile;&#10;            tile = 1;&#10;            tileh = 1;&#10;        &#125;&#10;&#10;        if (typeof tileh == &#34;string&#34;) &#123;&#10;            paddingY = paddingX;&#10;            paddingX = map;&#10;            map = url;&#10;            url = tileh;&#10;            tileh = tile;&#10;        &#125;&#10;&#10;        //if no paddingY, use paddingX&#10;        if (!paddingY &#38;&#38; paddingX) paddingY = paddingX;&#10;        paddingX = parseInt(paddingX || 0, 10); //just incase&#10;        paddingY = parseInt(paddingY || 0, 10);&#10;&#10;        var markSpritesReady = function() &#123;&#10;            this.ready = true;&#10;            this.trigger(&#34;Invalidate&#34;);&#10;        &#125;;&#10;&#10;        img = Crafty.asset(url);&#10;        if (!img) &#123;&#10;            img = new Image();&#10;            img.src = url;&#10;            Crafty.asset(url, img);&#10;            img.onload = function () &#123;&#10;                //all components with this img are now ready&#10;                for (var spriteName in map) &#123;&#10;                    Crafty(spriteName).each(markSpritesReady);&#10;                &#125;&#10;            &#125;;&#10;        &#125;&#10;&#10;        var sharedSpriteInit = function() &#123;&#10;            this.requires(&#34;2D, Sprite&#34;);&#10;            this.__trim = [0, 0, 0, 0];&#10;            this.__image = url;&#10;            this.__coord = [this.__coord[0], this.__coord[1], this.__coord[2], this.__coord[3]];&#10;            this.__tile = tile;&#10;            this.__tileh = tileh;&#10;            this.__padding = [paddingX, paddingY];&#10;            this.__padBorder = paddingAroundBorder;&#10;            this.sprite(this.__coord[0], this.__coord[1], this.__coord[2], this.__coord[3]);&#10;            &#10;            this.img = img;&#10;            //draw now&#10;            if (this.img.complete &#38;&#38; this.img.width &#62; 0) &#123;&#10;                this.ready = true;&#10;                this.trigger(&#34;Invalidate&#34;);&#10;            &#125;&#10;&#10;            //set the width and height to the sprite size&#10;            this.w = this.__coord[2];&#10;            this.h = this.__coord[3];&#10;&#10;            if (this.has(&#34;WebGL&#34;))&#123;&#10;                this._establishShader(this.__image, SPRITE_FRAGMENT_SHADER, SPRITE_VERTEX_SHADER, SPRITE_ATTRIBUTE_LIST);&#10;                this.program.setTexture( this.webgl.makeTexture(this.__image, this.img, false) );&#10;            &#125;&#10;        &#125;;&#10;&#10;        for (spriteName in map) &#123;&#10;            if (!map.hasOwnProperty(spriteName)) continue;&#10;&#10;            temp = map[spriteName];&#10;&#10;            //generates sprite components for each tile in the map&#10;            Crafty.c(spriteName, &#123;&#10;                ready: false,&#10;                __coord: [temp[0], temp[1], temp[2] || 1, temp[3] || 1],&#10;&#10;                init: sharedSpriteInit&#10;            &#125;);&#10;        &#125;&#10;&#10;        return this;&#10;    &#125;&#10;&#125;);&#10;&#10;/**@&#10; * #Sprite&#10; * @category Graphics&#10; * @trigger Invalidate - when the sprites change&#10; *&#10; * A component for using tiles in a sprite map.  &#10; *&#10; * This is automatically added to entities which use the components created by `Crafty.sprite` or `Crafty.load`.&#10; * Since these are also used to define tile size, you&#39;ll rarely need to use this components methods directly.&#10; *&#10; * @see Crafty.sprite, Crafty.load&#10; */&#10;Crafty.c(&#34;Sprite&#34;, &#123;&#10;    __image: &#39;&#39;,&#10;    /*&#10;     * #.__tile&#10;     * @comp Sprite&#10;     *&#10;     * Horizontal sprite tile size.&#10;     */&#10;    __tile: 0,&#10;    /*&#10;     * #.__tileh&#10;     * @comp Sprite&#10;     *&#10;     * Vertical sprite tile size.&#10;     */&#10;    __tileh: 0,&#10;    __padding: null,&#10;    __trim: null,&#10;    img: null,&#10;    //ready is changed to true in Crafty.sprite&#10;    ready: false,&#10;&#10;    init: function () &#123;&#10;        this.__trim = [0, 0, 0, 0];&#10;        this.bind(&#34;Draw&#34;, this._drawSprite);&#10;    &#125;,&#10;&#10;    remove: function()&#123;&#10;        this.unbind(&#34;Draw&#34;, this._drawSprite);&#10;    &#125;,&#10;&#10;    _drawSprite: function(e)&#123;&#10;        var co = e.co,&#10;                pos = e.pos,&#10;                context = e.ctx;&#10;&#10;        if (e.type === &#34;canvas&#34;) &#123;&#10;            //draw the image on the canvas element&#10;            context.drawImage(this.img, //image element&#10;                co.x, //x position on sprite&#10;                co.y, //y position on sprite&#10;                co.w, //width on sprite&#10;                co.h, //height on sprite&#10;                pos._x, //x position on canvas&#10;                pos._y, //y position on canvas&#10;                pos._w, //width on canvas&#10;                pos._h //height on canvas&#10;            );&#10;        &#125; else if (e.type === &#34;DOM&#34;) &#123;&#10;            // Get scale (ratio of entity dimensions to sprite&#39;s dimensions)&#10;            // If needed, we will scale up the entire sprite sheet, and then modify the position accordingly&#10;            var vscale = this._h / co.h,&#10;                hscale = this._w / co.w,&#10;                style = this._element.style,&#10;                bgColor = style.backgroundColor;&#10;&#10;            if (bgColor === &#34;initial&#34;) bgColor = &#34;&#34;;&#10;&#10;            // Don&#39;t change background if it&#39;s not necessary -- this can cause some browsers to reload the image&#10;            // See [this chrome issue](https://code.google.com/p/chromium/issues/detail?id=102706)&#10;            var newBackground = bgColor + &#34; url(&#39;&#34; + this.__image + &#34;&#39;) no-repeat&#34;; &#10;            if (newBackground !== style.background) &#123;&#10;                style.background = newBackground;&#10;            &#125;&#10;            style.backgroundPosition = &#34;-&#34; + co.x * hscale + &#34;px -&#34; + co.y * vscale + &#34;px&#34;;&#10;            // style.backgroundSize must be set AFTER style.background!&#10;            if (vscale != 1 || hscale != 1) &#123;&#10;                style.backgroundSize = (this.img.width * hscale) + &#34;px&#34; + &#34; &#34; + (this.img.height * vscale) + &#34;px&#34;;&#10;            &#125;&#10;        &#125; else if (e.type === &#34;webgl&#34;) &#123;&#10;            // Write texture coordinates&#10;            e.program.writeVector(&#34;aTextureCoord&#34;,&#10;                co.x, co.y,&#10;                co.x, co.y + co.h,&#10;                co.x + co.w, co.y,&#10;                co.x + co.w, co.y + co.h&#10;            );&#10;        &#125;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.sprite&#10;     * @comp Sprite&#10;     * @sign public this .sprite(Number x, Number y[, Number w, Number h])&#10;     * @param x - X cell position&#10;     * @param y - Y cell position&#10;     * @param w - Width in cells. Optional.&#10;     * @param h - Height in cells. Optional.&#10;     *&#10;     * Uses a new location on the sprite map as its sprite. If w or h are ommitted, the width and height are not changed.&#10;     *&#10;     * Values should be in tiles or cells (not pixels).&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * Crafty.e("2D, DOM, Sprite")
     *   .sprite(0, 0, 2, 2);
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;&#10;/**@&#10; * #.__coord&#10; * @comp Sprite&#10; *&#10; * The coordinate of the slide within the sprite in the format of [x, y, w, h].&#10; */&#10;sprite: function (x, y, w, h) &#123;&#10;    this.__coord = this.__coord || [0, 0, 0, 0];&#10;&#10;    this.__coord[0] = x * (this.__tile + this.__padding[0]) + (this.__padBorder ? this.__padding[0] : 0) + this.__trim[0];&#10;    this.__coord[1] = y * (this.__tileh + this.__padding[1]) + (this.__padBorder ? this.__padding[1] : 0) + this.__trim[1];&#10;    if (typeof(w)!==&#39;undefined&#39; &#38;&#38; typeof(h)!==&#39;undefined&#39;) &#123;&#10;        this.__coord[2] = this.__trim[2] || w * this.__tile || this.__tile;&#10;        this.__coord[3] = this.__trim[3] || h * this.__tileh || this.__tileh;&#10;    &#125;&#10;&#10;    this.trigger(&#34;Invalidate&#34;);&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.crop&#10; * @comp Sprite&#10; * @sign public this .crop(Number x, Number y, Number w, Number h)&#10; * @param x - Offset x position&#10; * @param y - Offset y position&#10; * @param w - New width&#10; * @param h - New height&#10; *&#10; * If the entity needs to be smaller than the tile size, use this method to crop it.&#10; *&#10; * The values should be in pixels rather than tiles.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * Crafty.e("2D, DOM, Sprite")
     *   .crop(40, 40, 22, 23);
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    crop: function (x, y, w, h) &#123;&#10;        var old = this._mbr || this.pos();&#10;        this.__trim = [];&#10;        this.__trim[0] = x;&#10;        this.__trim[1] = y;&#10;        this.__trim[2] = w;&#10;        this.__trim[3] = h;&#10;&#10;        this.__coord[0] += x;&#10;        this.__coord[1] += y;&#10;        this.__coord[2] = w;&#10;        this.__coord[3] = h;&#10;        this._w = w;&#10;        this._h = h;&#10;&#10;        this.trigger(&#34;Invalidate&#34;, old);&#10;        return this;&#10;    &#125;&#10;&#125;);&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],33:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;&#10;/**@&#10; * #Text&#10; * @category Graphics&#10; * @trigger Invalidate - when the text is changed&#10; * @requires Canvas or DOM&#10; * Component to make a text entity.&#10; *&#10; * By default, text will have the style &#34;10px sans-serif&#34;.&#10; *&#10; * @note An entity with the text component is just text! If you want to write text&#10; * inside an image, you need one entity for the text and another entity for the image.&#10; * More tips for writing text inside an image: (1) Use the z-index (from 2D component)&#10; * to ensure that the text is on top of the image, not the other way around; (2)&#10; * use .attach() (from 2D component) to glue the text to the image so they move and&#10; * rotate together.&#10; *&#10; * @note For DOM (but not canvas) text entities, various font settings (like&#10; * text-decoration and text-align) can be set using `.css()` (see DOM component). But&#10; * you cannot use `.css()` to set the properties which are controlled by `.textFont()`&#10; * or `.textColor()` -- the settings will be ignored.&#10; *&#10; * @note If you use canvas text with glyphs that are taller than standard letters, portions of the glyphs might be cut off.&#10; */&#10;Crafty.c(&#34;Text&#34;, &#123;&#10;    _text: &#34;&#34;,&#10;    defaultSize: &#34;10px&#34;,&#10;    defaultFamily: &#34;sans-serif&#34;,&#10;    defaultVariant: &#34;normal&#34;,&#10;    defaultLineHeight: &#34;normal&#34;,&#10;    ready: true,&#10;&#10;    init: function () &#123;&#10;        this.requires(&#34;2D&#34;);&#10;        this._textFont = &#123;&#10;            &#34;type&#34;: &#34;&#34;,&#10;            &#34;weight&#34;: &#34;&#34;,&#10;            &#34;size&#34;: this.defaultSize,&#10;            &#34;lineHeight&#34;:this.defaultLineHeight,&#10;            &#34;family&#34;: this.defaultFamily,&#10;            &#34;variant&#34;: this.defaultVariant&#10;        &#125;;&#10;&#10;        this.bind(&#34;Draw&#34;, function (e) &#123;&#10;            var font = this._fontString();&#10;&#10;            if (e.type === &#34;DOM&#34;) &#123;&#10;                var el = this._element,&#10;                    style = el.style;&#10;&#10;                style.color = this._textColor;&#10;                style.font = font;&#10;                el.innerHTML = this._text;&#10;            &#125; else if (e.type === &#34;canvas&#34;) &#123;&#10;                var context = e.ctx;&#10;&#10;                context.save();&#10;&#10;                context.textBaseline = &#34;top&#34;;&#10;                context.fillStyle = this._textColor || &#34;rgb(0,0,0)&#34;;&#10;                context.font = font;&#10;&#10;                context.fillText(this._text, e.pos._x, e.pos._y);&#10;&#10;                context.restore();&#10;            &#125;&#10;        &#125;);&#10;    &#125;,&#10;&#10;    // takes a CSS font-size string and gets the height of the resulting font in px&#10;    _getFontHeight: (function()&#123;&#10;        // regex for grabbing the first string of letters&#10;        var re = /([a-zA-Z]+)\b/;&#10;        // From the CSS spec.  &#34;em&#34; and &#34;ex&#34; are undefined on a canvas.&#10;        var multipliers = &#123;&#10;            &#34;px&#34;: 1,&#10;            &#34;pt&#34;: 4/3,&#10;            &#34;pc&#34;: 16,&#10;            &#34;cm&#34;: 96/2.54,&#10;            &#34;mm&#34;: 96/25.4,&#10;            &#34;in&#34;: 96,&#10;            &#34;em&#34;: undefined,&#10;            &#34;ex&#34;: undefined&#10;        &#125;;&#10;        return function (font)&#123;&#10;            var number = parseFloat(font);&#10;            var match = re.exec(font);&#10;            var unit =  match ? match[1] : &#34;px&#34;;&#10;            if (multipliers[unit] !== undefined)&#10;                return Math.ceil(number * multipliers[unit]);&#10;            else&#10;                return Math.ceil(number);&#10;        &#125;;&#10;    &#125;)(),&#10;&#10;    /**@&#10;     * #.text&#10;     * @comp Text&#10;     * @sign public this .text(String text)&#10;     * @param text - String of text that will be inserted into the DOM or Canvas element.&#10;     *&#10;     * @sign public this .text(Function textGenerator)&#10;     * @param textGenerator - A function that returns a string.  &#10;     *        It will be immediately invoked in the context of the entity, with the result used as the text to display.&#10;     *&#10;     * This method will update the text inside the entity.&#10;     *&#10;     * If you need to reference attributes on the entity itself you can pass a function instead of a string.&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * Crafty.e("2D, DOM, Text").attr({ x: 100, y: 100 }).text("Look at me!!");
     *
     * Crafty.e("2D, DOM, Text").attr({ x: 100, y: 100 })
     *     .text(function () { return "My position is " + this._x });
     *
     * Crafty.e("2D, Canvas, Text").attr({ x: 100, y: 100 }).text("Look at me!!");
     *
     * Crafty.e("2D, Canvas, Text").attr({ x: 100, y: 100 })
     *     .text(function () { return "My position is " + this._x });
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;text: function (text) &#123;&#10;    if (!(typeof text !== &#34;undefined&#34; &#38;&#38; text !== null)) return this._text;&#10;    if (typeof (text) == &#34;function&#34;)&#10;        this._text = text.call(this);&#10;    else&#10;        this._text = text;&#10;&#10;    if (this.has(&#34;Canvas&#34;) )&#10;        this._resizeForCanvas();&#10;&#10;    this.trigger(&#34;Invalidate&#34;);&#10;    return this;&#10;&#125;,&#10;&#10;// Calculates the height and width of text on the canvas&#10;// Width is found by using the canvas measureText function&#10;// Height is only estimated -- it calculates the font size in pixels, and sets the height to 110% of that.&#10;_resizeForCanvas: function()&#123;&#10;    var ctx = this._drawContext;&#10;    ctx.font = this._fontString();&#10;    this.w = ctx.measureText(this._text).width;&#10;&#10;    var size = (this._textFont.size || this.defaultSize);&#10;    this.h = 1.1 * this._getFontHeight(size);&#10;&#125;,&#10;&#10;// Returns the font string to use&#10;_fontString: function()&#123;&#10;    return this._textFont.type + &#39; &#39; + this._textFont.variant  + &#39; &#39; + this._textFont.weight + &#39; &#39; + this._textFont.size  + &#39; / &#39; + this._textFont.lineHeight + &#39; &#39; + this._textFont.family;&#10;&#125;,&#10;/**@&#10; * #.textColor&#10; * @comp Text&#10; * @sign public this .textColor(String color)&#10; * @param color - The color in name, hex, rgb or rgba&#10; *&#10; * Change the color of the text. You can use HEX, rgb and rgba colors. &#10; *&#10; * If you want the text to be transparent, you should use rgba where you can define alphaChannel.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * Crafty.e("2D, DOM, Text").attr({ x: 100, y: 100 }).text("Look at me!!")
     *   .textColor('#FF0000');
     *
     * Crafty.e("2D, Canvas, Text").attr({ x: 100, y: 100 }).text('Look at me!!')
     *   .textColor('rgba(0, 255, 0, 0.5)');
     *
     * Crafty.e("2D, Canvas, Text").attr({ x: 100, y: 100 }).text('Look at me!!')
     *   .textColor('white');
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> * @see Crafty.assignColor&#10; */&#10;textColor: function (color) &#123;&#10;    Crafty.assignColor(color, this);&#10;    this._textColor = &#34;rgba(&#34; + this._red + &#34;, &#34; + this._green + &#34;, &#34; + this._blue + &#34;, &#34; + this._strength + &#34;)&#34;;&#10;    this.trigger(&#34;Invalidate&#34;);&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.textFont&#10; * @comp Text&#10; * @triggers Invalidate&#10; * @sign public this .textFont(String key, * value)&#10; * @param key - Property of the entity to modify&#10; * @param value - Value to set the property to&#10; *&#10; * @sign public this .textFont(Object map)&#10; * @param map - Object where the key is the property to modify and the value as the property value&#10; *&#10; * Use this method to set font property of the text entity.  Possible values are: type, weight, size, family, lineHeight, and variant.&#10; *&#10; * When rendered by the canvas, lineHeight and variant will be ignored.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * Crafty.e("2D, DOM, Text").textFont({ type: 'italic', family: 'Arial' });
     * Crafty.e("2D, Canvas, Text").textFont({ size: '20px', weight: 'bold' });
     *
     * Crafty.e("2D, Canvas, Text").textFont("type", "italic");
     * Crafty.e("2D, Canvas, Text").textFont("type"); // italic
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;textFont: function (key, value) &#123;&#10;    if (arguments.length === 1) &#123;&#10;        //if just the key, return the value&#10;        if (typeof key === &#34;string&#34;) &#123;&#10;            return this._textFont[key];&#10;        &#125;&#10;&#10;        if (typeof key === &#34;object&#34;) &#123;&#10;            for (var propertyKey in key) &#123;&#10;                if(propertyKey == &#39;family&#39;)&#123;&#10;                    this._textFont[propertyKey] = &#34;&#39;&#34; + key[propertyKey] + &#34;&#39;&#34;;&#10;                &#125; else &#123;&#10;                    this._textFont[propertyKey] = key[propertyKey];&#10;                &#125;&#10;            &#125;&#10;        &#125;&#10;    &#125; else &#123;&#10;        this._textFont[key] = value;&#10;    &#125;&#10;&#10;    if (this.has(&#34;Canvas&#34;) )&#10;        this._resizeForCanvas();&#10;&#10;    this.trigger(&#34;Invalidate&#34;);&#10;    return this;&#10;&#125;,&#10;/**@&#10; * #.unselectable&#10; * @comp Text&#10; * @triggers Invalidate&#10; * @sign public this .unselectable()&#10; *&#10; * This method sets the text so that it cannot be selected (highlighted) by dragging.&#10; * (Canvas text can never be highlighted, so this only matters for DOM text.)&#10; * Works by changing the css property &#34;user-select&#34; and its variants.&#10; * &#10; * Likewise, this sets the mouseover cursor to be &#34;default&#34; (arrow), not &#34;text&#34; (I-beam)&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * Crafty.e("2D, DOM, Text").text('This text cannot be highlighted!').unselectable();
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    unselectable: function () &#123;&#10;        // http://stackoverflow.com/questions/826782/css-rule-to-disable-text-selection-highlighting&#10;        if (this.has(&#34;DOM&#34;)) &#123;&#10;            this.css(&#123;&#10;                &#39;-webkit-touch-callout&#39;: &#39;none&#39;,&#10;                &#39;-webkit-user-select&#39;: &#39;none&#39;,&#10;                &#39;-khtml-user-select&#39;: &#39;none&#39;,&#10;                &#39;-moz-user-select&#39;: &#39;none&#39;,&#10;                &#39;-ms-user-select&#39;: &#39;none&#39;,&#10;                &#39;user-select&#39;: &#39;none&#39;,&#10;                &#39;cursor&#39;: &#39;default&#39;&#10;            &#125;);&#10;            this.trigger(&#34;Invalidate&#34;);&#10;        &#125;&#10;        return this;&#10;    &#125;&#10;&#10;&#125;);&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],34:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;),&#10;    document = window.document;&#10;&#10;Crafty.extend(&#123;&#10;    /**@&#10;     * #Crafty.viewport&#10;     * @category Stage&#10;     * @trigger ViewportScroll - when the viewport&#39;s x or y coordinates change&#10;     * @trigger ViewportScale - when the viewport&#39;s scale changes&#10;     * @trigger ViewportResize - when the viewport&#39;s dimension&#39;s change&#10;     * @trigger InvalidateViewport - when the viewport changes&#10;     * @trigger StopCamera - when any camera animations should stop, such as at the start of a new animation.&#10;     * @trigger CameraAnimationDone - when a camera animation reaches completion&#10;     *&#10;     * Viewport is essentially a 2D camera looking at the stage. Can be moved or zoomed, which&#10;     * in turn will react just like a camera moving in that direction.&#10;     *&#10;     * There are multiple camera animation methods available - these are the viewport methods with an animation time parameter and the `follow` method.&#10;     * Only one animation can run at a time. Starting a new animation will cancel the previous one and the appropriate events will be fired.&#10;     * &#10;     * Tip: At any given moment, the stuff that you can see is...&#10;     * &#10;     * `x` between `(-Crafty.viewport._x)` and `(-Crafty.viewport._x + (Crafty.viewport._width / Crafty.viewport._scale))`&#10;     * &#10;     * `y` between `(-Crafty.viewport._y)` and `(-Crafty.viewport._y + (Crafty.viewport._height / Crafty.viewport._scale))`&#10;     *&#10;     *&#10;     * @example&#10;     * Prevent viewport from adjusting itself when outside the game world.&#10;     * Scale the viewport so that entities appear twice as large.&#10;     * Then center the viewport on an entity over the duration of 3 seconds.&#10;     * After that animation finishes, start following the entity.&#10;     *</span><br></pre></td></tr></table></figure>

     * var ent = Crafty.e('2D, DOM').attr({x: 250, y: 250, w: 100, h: 100});
     *
     * Crafty.viewport.clampToEntities = false;
     * Crafty.viewport.scale(2);
     * Crafty.one("CameraAnimationDone", function() {
     *     Crafty.viewport.follow(ent, 0, 0);
     * });
     * Crafty.viewport.centerOn(ent, 3000);
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;viewport: &#123;&#10;    /**@&#10;     * #Crafty.viewport.clampToEntities&#10;     * @comp Crafty.viewport&#10;     *&#10;     * Decides if the viewport functions should clamp to game entities.&#10;     * When set to `true` functions such as Crafty.viewport.mouselook() will not allow you to move the&#10;     * viewport over areas of the game that has no entities.&#10;     * For development it can be useful to set this to false.&#10;     */&#10;    clampToEntities: true,&#10;    _width: 0,&#10;    _height: 0,&#10;    /**@&#10;     * #Crafty.viewport.x&#10;     * @comp Crafty.viewport&#10;     *&#10;     * Will move the stage and therefore every visible entity along the `x`&#10;     * axis in the opposite direction.&#10;     *&#10;     * When this value is set, it will shift the entire stage. This means that entity&#10;     * positions are not exactly where they are on screen. To get the exact position,&#10;     * simply add `Crafty.viewport.x` onto the entities `x` position.&#10;     */&#10;    _x: 0,&#10;    /**@&#10;     * #Crafty.viewport.y&#10;     * @comp Crafty.viewport&#10;     *&#10;     * Will move the stage and therefore every visible entity along the `y`&#10;     * axis in the opposite direction.&#10;     *&#10;     * When this value is set, it will shift the entire stage. This means that entity&#10;     * positions are not exactly where they are on screen. To get the exact position,&#10;     * simply add `Crafty.viewport.y` onto the entities `y` position.&#10;     */&#10;    _y: 0,&#10;&#10;    /**@&#10;     * #Crafty.viewport._scale&#10;     * @comp Crafty.viewport&#10;     *&#10;     * This value is the current scale (zoom) of the viewport. When the value is bigger than 1, everything&#10;     * looks bigger (zoomed in). When the value is less than 1, everything looks smaller (zoomed out). This&#10;     * does not alter the size of the stage itself, just the magnification of what it shows.&#10;     * &#10;     * This is a read-only property: Do not set it directly. Instead, use `Crafty.viewport.scale(...)`&#10;     * or `Crafty.viewport.zoom(...)`&#10;     */&#10;&#10;    _scale: 1,&#10;&#10;    /**@&#10;     * #Crafty.viewport.bounds&#10;     * @comp Crafty.viewport&#10;     *&#10;     * A rectangle which defines the bounds of the viewport.&#10;     * It should be an object with two properties, `max` and `min`,&#10;     * which are each an object with `x` and `y` properties.&#10;     *&#10;     * If this property is null, Crafty uses the bounding box of all the items&#10;     * on the stage.  This is the initial value.  (To prevent this behavior, set `Crafty.viewport.clampToEntities` to `false`)&#10;     *&#10;     * If you wish to bound the viewport along one axis but not the other, you can use `-Infinity` and `+Infinity` as bounds.&#10;     *&#10;     * @see Crafty.viewport.clampToEntities&#10;     *&#10;     * @example&#10;     * Set the bounds to a 500 by 500 square:&#10;     *&#10;     *</span><br></pre></td></tr></table></figure>

         * Crafty.viewport.bounds = {min:{x:0, y:0}, max:{x:500, y:500}};
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;bounds: null,&#10;&#10;/**@&#10; * #Crafty.viewport.scroll&#10; * @comp Crafty.viewport&#10; * @sign Crafty.viewport.scroll(String axis, Number val)&#10; * @param axis - &#39;x&#39; or &#39;y&#39;&#10; * @param val - The new absolute position on the axis&#10; *&#10; * Will move the viewport to the position given on the specified axis&#10; *&#10; * @example&#10; * Will move the camera 500 pixels right of its initial position, in effect&#10; * shifting everything in the viewport 500 pixels to the left.&#10; *&#10; *</span><br></pre></td></tr></table></figure>

         * Crafty.viewport.scroll('_x', 500);
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;scroll: function (axis, val) &#123;&#10;    this[axis] = val;&#10;    Crafty.trigger(&#34;ViewportScroll&#34;);&#10;    Crafty.trigger(&#34;InvalidateViewport&#34;);&#10;&#125;,&#10;&#10;rect_object: &#123; _x: 0, _y: 0, _w: 0, _h: 0&#125;,&#10;&#10;rect: function () &#123;&#10;    this.rect_object._x = -this._x;&#10;    this.rect_object._y = -this._y;&#10;    this.rect_object._w = this._width / this._scale;&#10;    this.rect_object._h = this._height / this._scale;&#10;    return this.rect_object;&#10;&#125;,&#10;&#10;/**@ &#10;&#10; * #Crafty.viewport.pan&#10; * @comp Crafty.viewport&#10; * @sign public void Crafty.viewport.pan(Number dx, Number dy, Number time[, String|function easingFn])&#10; * @param Number dx - The distance along the x axis&#10; * @param Number dy - The distance along the y axis&#10; * @param Number time - The duration in ms for the entire camera movement&#10; * @param easingFn - A string or custom function specifying an easing.  (Defaults to linear behavior.)  See Crafty.easing for more information.&#10; *&#10; * Pans the camera a given number of pixels over the specified time&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * // pan the camera 100 px right and down over the duration of 2 seconds using linear easing behaviour
         * Crafty.viewport.pan(100, 100, 2000);
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;pan: (function () &#123;&#10;    var tweens = &#123;&#125;, i, bound = false;&#10;    var targetX, targetY, startingX, startingY, easing;&#10;&#10;    function enterFrame(e) &#123;&#10;        easing.tick(e.dt);&#10;        var v = easing.value();&#10;        Crafty.viewport.x = (1-v) * startingX + v * targetX;&#10;        Crafty.viewport.y = (1-v) * startingY + v * targetY;&#10;        Crafty.viewport._clamp();&#10;&#10;        if (easing.complete)&#123;&#10;            stopPan();&#10;            Crafty.trigger(&#34;CameraAnimationDone&#34;);&#10;        &#125;&#10;    &#125;&#10;&#10;    function stopPan()&#123;&#10;        Crafty.unbind(&#34;EnterFrame&#34;, enterFrame);&#10;    &#125;&#10;&#10;    Crafty._preBind(&#34;StopCamera&#34;, stopPan);&#10;&#10;    return function (dx, dy, time, easingFn) &#123;&#10;        // Cancel any current camera control&#10;        Crafty.trigger(&#34;StopCamera&#34;);&#10;&#10;        // Handle request to reset&#10;        if (dx == &#39;reset&#39;) &#123;&#10;           return;&#10;        &#125;&#10;&#10;        startingX = Crafty.viewport._x;&#10;        startingY = Crafty.viewport._y;&#10;        targetX = startingX - dx;&#10;        targetY = startingY - dy;&#10;&#10;        easing = new Crafty.easing(time, easingFn);&#10;&#10;        // bind to event, using uniqueBind prevents multiple copies from being bound&#10;        Crafty.uniqueBind(&#34;EnterFrame&#34;, enterFrame);&#10;               &#10;    &#125;;&#10;&#125;)(),&#10;&#10;/**@&#10; * #Crafty.viewport.follow&#10; * @comp Crafty.viewport&#10; * @sign public void Crafty.viewport.follow(Object target, Number offsetx, Number offsety)&#10; * @param Object target - An entity with the 2D component&#10; * @param Number offsetx - Follow target&#39;s center should be offsetx pixels away from viewport&#39;s center. Positive values puts target to the right of the screen.&#10; * @param Number offsety - Follow target&#39;s center should be offsety pixels away from viewport&#39;s center. Positive values puts target to the bottom of the screen.&#10; *&#10; * Follows a given entity with the 2D component. If following target will take a portion of&#10; * the viewport out of bounds of the world, following will stop until the target moves away.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * var ent = Crafty.e('2D, DOM').attr({w: 100, h: 100});
         * Crafty.viewport.follow(ent, 0, 0);
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;follow: (function () &#123;&#10;    var oldTarget, offx, offy;&#10;&#10;    function change() &#123;&#10;        var scale = Crafty.viewport._scale;&#10;        Crafty.viewport.scroll(&#39;_x&#39;, -(this.x + (this.w / 2) - (Crafty.viewport.width / 2 / scale) - offx * scale));&#10;        Crafty.viewport.scroll(&#39;_y&#39;, -(this.y + (this.h / 2) - (Crafty.viewport.height / 2 / scale) - offy * scale));&#10;        Crafty.viewport._clamp();&#10;    &#125;&#10;&#10;    function stopFollow()&#123;&#10;        if (oldTarget) &#123;&#10;            oldTarget.unbind(&#39;Move&#39;, change);&#10;            oldTarget.unbind(&#39;ViewportScale&#39;, change);&#10;            oldTarget.unbind(&#39;ViewportResize&#39;, change);&#10;        &#125;&#10;    &#125;&#10;&#10;    Crafty._preBind(&#34;StopCamera&#34;, stopFollow);&#10;&#10;    return function (target, offsetx, offsety) &#123;&#10;        if (!target || !target.has(&#39;2D&#39;))&#10;            return;&#10;        Crafty.trigger(&#34;StopCamera&#34;);&#10;&#10;        oldTarget = target;&#10;        offx = (typeof offsetx != &#39;undefined&#39;) ? offsetx : 0;&#10;        offy = (typeof offsety != &#39;undefined&#39;) ? offsety : 0;&#10;&#10;        target.bind(&#39;Move&#39;, change);&#10;        target.bind(&#39;ViewportScale&#39;, change);&#10;        target.bind(&#39;ViewportResize&#39;, change);&#10;        change.call(target);&#10;    &#125;;&#10;&#125;)(),&#10;&#10;/**@&#10; * #Crafty.viewport.centerOn&#10; * @comp Crafty.viewport&#10; * @sign public void Crafty.viewport.centerOn(Object target, Number time)&#10; * @param Object target - An entity with the 2D component&#10; * @param Number time - The duration in ms of the camera motion&#10; *&#10; * Centers the viewport on the given entity.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * var ent = Crafty.e('2D, DOM').attr({x: 250, y: 250, w: 100, h: 100});
         * Crafty.viewport.centerOn(ent, 3000);
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;centerOn: function (targ, time) &#123;&#10;    var x = targ.x + Crafty.viewport.x,&#10;        y = targ.y + Crafty.viewport.y,&#10;        mid_x = targ.w / 2,&#10;        mid_y = targ.h / 2,&#10;        cent_x = Crafty.viewport.width / 2 / Crafty.viewport._scale,&#10;        cent_y = Crafty.viewport.height / 2 / Crafty.viewport._scale,&#10;        new_x = x + mid_x - cent_x,&#10;        new_y = y + mid_y - cent_y;&#10;&#10;    Crafty.viewport.pan(new_x, new_y, time);&#10;&#125;,&#10;&#10;/**@&#10; * #Crafty.viewport.zoom&#10; * @comp Crafty.viewport&#10; * @sign public void Crafty.viewport.zoom(Number amt, Number cent_x, Number cent_y, Number time[, String|function easingFn])&#10; * @param Number amt - amount to zoom in on the target by (eg. 2, 4, 0.5)&#10; * @param Number cent_x - the center to zoom on&#10; * @param Number cent_y - the center to zoom on&#10; * @param Number time - the duration in ms of the entire zoom operation&#10; * @param easingFn - A string or custom function specifying an easing.  (Defaults to linear behavior.)  See Crafty.easing for more information.&#10; *&#10; * Zooms the camera in on a given point. amt &#62; 1 will bring the camera closer to the subject&#10; * amt &#60; 1 will bring it farther away. amt = 0 will reset to the default zoom level&#10; * Zooming is multiplicative. To reset the zoom amount, pass 0.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * // Make the entities appear twice as large by zooming in on the specified coordinates over the duration of 3 seconds using linear easing behavior
         * Crafty.viewport.zoom(2, 100, 100, 3000);
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;zoom: (function () &#123;&#10;    &#10;&#10;    function stopZoom()&#123;&#10;        Crafty.unbind(&#34;EnterFrame&#34;, enterFrame);&#10;    &#125;&#10;    Crafty._preBind(&#34;StopCamera&#34;, stopZoom);&#10;&#10;    var startingZoom, finalZoom, finalAmount, startingX, finalX, startingY, finalY, easing;&#10;&#10;    function enterFrame(e)&#123;&#10;        var amount, v;&#10;&#10;        easing.tick(e.dt);&#10;&#10;        // The scaling should happen smoothly -- start at 1, end at finalAmount, and at half way scaling should be by finalAmount^(1/2)&#10;        // Since value goes smoothly from 0 to 1, this fufills those requirements&#10;        amount = Math.pow(finalAmount, easing.value() );&#10;&#10;        // The viewport should move in such a way that no point reverses&#10;        // If a and b are the top left/bottom right of the viewport, then the below can be derived from&#10;        //      (a_0-b_0)/(a-b) = amount,&#10;        // and the assumption that both a and b have the same form&#10;        //      a = a_0 * (1-v) + a_f * v,&#10;        //      b = b_0 * (1-v) + b_f * v.&#10;        // This is just an arbitrary parameterization of the only sensible path for the viewport corners to take.&#10;        // And by symmetry they should be parameterized in the same way!  So not much choice here.&#10;        if (finalAmount === 1)&#10;            v = easing.value();  // prevent NaN!  If zoom is used this way, it&#39;ll just become a pan.&#10;        else&#10;            v = (1/amount - 1 ) / (1/finalAmount - 1);&#10;&#10;        // Set new scale and viewport position&#10;        Crafty.viewport.scale( amount * startingZoom );&#10;        Crafty.viewport.scroll(&#34;_x&#34;, startingX * (1-v) + finalX * v );&#10;        Crafty.viewport.scroll(&#34;_y&#34;, startingY * (1-v) + finalY * v );&#10;        Crafty.viewport._clamp();&#10;&#10;        if (easing.complete)&#123;&#10;            stopZoom();&#10;            Crafty.trigger(&#34;CameraAnimationDone&#34;);&#10;        &#125;&#10;&#10;&#10;    &#125;&#10;&#10;    return function (amt, cent_x, cent_y, time, easingFn)&#123;&#10;        if (!amt) &#123; // we&#39;re resetting to defaults&#10;            Crafty.viewport.scale(1);&#10;            return;&#10;        &#125;&#10;&#10;        if (arguments.length &#60;= 2) &#123;&#10;            time = cent_x;&#10;            cent_x = Crafty.viewport.x - Crafty.viewport.width;&#10;            cent_y = Crafty.viewport.y - Crafty.viewport.height;&#10;        &#125;&#10;&#10;        Crafty.trigger(&#34;StopCamera&#34;);&#10;        startingZoom = Crafty.viewport._scale;&#10;        finalAmount = amt;&#10;        finalZoom = startingZoom * finalAmount;&#10;        &#10;&#10;        startingX = Crafty.viewport.x;&#10;        startingY = Crafty.viewport.y;&#10;        finalX = - (cent_x - Crafty.viewport.width  / (2 * finalZoom) );&#10;        finalY = - (cent_y - Crafty.viewport.height / (2 * finalZoom) );&#10;&#10;        easing = new Crafty.easing(time, easingFn);&#10;&#10;        Crafty.uniqueBind(&#34;EnterFrame&#34;, enterFrame);&#10;    &#125;;&#10;&#10;    &#10;&#125;)(),&#10;/**@&#10; * #Crafty.viewport.scale&#10; * @comp Crafty.viewport&#10; * @sign public void Crafty.viewport.scale(Number amt)&#10; * @param Number amt - amount to zoom/scale in on the elements&#10; *&#10; * Adjusts the scale (zoom). When `amt` is 1, it is set to the normal scale,&#10; * e.g. an entity with `this.w == 20` would appear exactly 20 pixels wide.&#10; * When `amt` is 10, that same entity would appear 200 pixels wide (i.e., zoomed in&#10; * by a factor of 10), and when `amt` is 0.1, that same entity would be 2 pixels wide&#10; * (i.e., zoomed out by a factor of `(1 / 0.1)`).&#10; * &#10; * If you pass an `amt` of 0, it is treated the same as passing 1, i.e. the scale is reset.&#10; *&#10; * This method sets the absolute scale, while `Crafty.viewport.zoom` sets the scale relative to the existing value.&#10; * @see Crafty.viewport.zoom&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * Crafty.viewport.scale(2); // Zoom in -- all entities will appear twice as large.
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;scale: (function () &#123;&#10;    return function (amt) &#123;&#10;        this._scale = amt ? amt : 1;&#10;        Crafty.trigger(&#34;InvalidateViewport&#34;);&#10;        Crafty.trigger(&#34;ViewportScale&#34;);&#10;&#10;    &#125;;&#10;&#125;)(),&#10;/**@&#10; * #Crafty.viewport.mouselook&#10; * @comp Crafty.viewport&#10; * @sign public void Crafty.viewport.mouselook(Boolean active)&#10; * @param Boolean active - Activate or deactivate mouselook&#10; *&#10; * Toggle mouselook on the current viewport.&#10; * Simply call this function and the user will be able to&#10; * drag the viewport around.&#10; *&#10; * If the user starts a drag, &#34;StopCamera&#34; will be triggered, which will cancel any existing camera animations.&#10; */&#10;mouselook: (function () &#123;&#10;    var active = false,&#10;        dragging = false,&#10;        lastMouse = &#123;&#125;;&#10;    old = &#123;&#125;;&#10;    function stopLook()&#123;&#10;        dragging = false;&#10;    &#125;&#10;&#10;&#10;    return function (op, arg) &#123;&#10;        if (typeof op == &#39;boolean&#39;) &#123;&#10;            active = op;&#10;            if (active) &#123;&#10;                Crafty.mouseObjs++;&#10;            &#125; else &#123;&#10;                Crafty.mouseObjs = Math.max(0, Crafty.mouseObjs - 1);&#10;            &#125;&#10;            return;&#10;        &#125;&#10;        if (!active) return;&#10;        switch (op) &#123;&#10;        case &#39;move&#39;:&#10;        case &#39;drag&#39;:&#10;            if (!dragging) return;&#10;            diff = &#123;&#10;                x: arg.clientX - lastMouse.x,&#10;                y: arg.clientY - lastMouse.y&#10;            &#125;;&#10;&#10;            lastMouse.x = arg.clientX;&#10;            lastMouse.y = arg.clientY;&#10;&#10;            Crafty.viewport.x += diff.x;&#10;            Crafty.viewport.y += diff.y;&#10;            Crafty.viewport._clamp();&#10;            break;&#10;        case &#39;start&#39;:&#10;            Crafty.trigger(&#34;StopCamera&#34;);&#10;            lastMouse.x = arg.clientX;&#10;            lastMouse.y = arg.clientY;&#10;            dragging = true;&#10;            break;&#10;        case &#39;stop&#39;:&#10;            dragging = false;&#10;            break;&#10;        &#125;&#10;    &#125;;&#10;&#125;)(),&#10;_clamp: function () &#123;&#10;    // clamps the viewport to the viewable area&#10;    // under no circumstances should the viewport see something outside the boundary of the &#39;world&#39;&#10;    if (!this.clampToEntities) return;&#10;    var bound = Crafty.clone(this.bounds) || Crafty.map.boundaries();&#10;    bound.max.x *= this._scale;&#10;    bound.min.x *= this._scale;&#10;    bound.max.y *= this._scale;&#10;    bound.min.y *= this._scale;&#10;    if (bound.max.x - bound.min.x &#62; Crafty.viewport.width) &#123;&#10;        if (Crafty.viewport.x &#60; (-bound.max.x + Crafty.viewport.width) / this._scale) &#123;&#10;            Crafty.viewport.x = (-bound.max.x + Crafty.viewport.width) / this._scale;&#10;        &#125; else if (Crafty.viewport.x &#62; -bound.min.x) &#123;&#10;            Crafty.viewport.x = -bound.min.x;&#10;        &#125;&#10;    &#125; else &#123;&#10;        Crafty.viewport.x = -1 * (bound.min.x + (bound.max.x - bound.min.x) / 2 - Crafty.viewport.width / 2);&#10;    &#125;&#10;    if (bound.max.y - bound.min.y &#62; Crafty.viewport.height) &#123;&#10;        if (Crafty.viewport.y &#60; (-bound.max.y + Crafty.viewport.height) / this._scale) &#123;&#10;            Crafty.viewport.y = (-bound.max.y + Crafty.viewport.height) / this._scale;&#10;        &#125; else if (Crafty.viewport.y &#62; -bound.min.y) &#123;&#10;            Crafty.viewport.y = -bound.min.y;&#10;        &#125;&#10;    &#125; else &#123;&#10;        Crafty.viewport.y = -1 * (bound.min.y + (bound.max.y - bound.min.y) / 2 - Crafty.viewport.height / 2);&#10;    &#125;&#10;&#125;,&#10;&#10;/**@&#10; * #Crafty.viewport.init&#10; * @comp Crafty.viewport&#10; * @sign public void Crafty.viewport.init([Number width, Number height, String stage_elem])&#10; * @sign public void Crafty.viewport.init([Number width, Number height, HTMLElement stage_elem])&#10; * @param Number width - Width of the viewport&#10; * @param Number height - Height of the viewport&#10; * @param String or HTMLElement stage_elem - the element to use as the stage (either its id or the actual element).&#10; *&#10; * Initialize the viewport. If the arguments &#39;width&#39; or &#39;height&#39; are missing, use `window.innerWidth` and `window.innerHeight` (full screen model).&#10; *&#10; * The argument &#39;stage_elem&#39; is used to specify a stage element other than the default, and can be either a string or an HTMLElement.  If a string is provided, it will look for an element with that id and, if none exists, create a div.  If an HTMLElement is provided, that is used directly.  Omitting this argument is the same as passing an id of &#39;cr-stage&#39;.&#10; *&#10; * @see Crafty.device, Crafty.domHelper, Crafty.stage&#10; */&#10;init: function (w, h, stage_elem) &#123;&#10;    // setters+getters for the viewport&#10;    this._defineViewportProperties();&#10;&#10;    // Set initial values -- necessary on restart&#10;    this._x = 0;&#10;    this._y = 0;&#10;    this._scale = 1;&#10;    this.bounds = null;&#10;&#10;    // If no width or height is defined, the width and height is set to fullscreen&#10;    this._width = w || window.innerWidth;&#10;    this._height = h || window.innerHeight;&#10;&#10;    //check if stage exists&#10;    if (typeof stage_elem === &#39;undefined&#39;)&#10;        stage_elem = &#34;cr-stage&#34;;&#10;&#10;    var crstage;&#10;    if (typeof stage_elem === &#39;string&#39;)&#10;        crstage = document.getElementById(stage_elem);&#10;    else if (typeof HTMLElement !== &#34;undefined&#34; ? stage_elem instanceof HTMLElement : stage_elem instanceof Element)&#10;        crstage = stage_elem;&#10;    else&#10;        throw new TypeError(&#34;stage_elem must be a string or an HTMLElement&#34;);&#10;&#10;    /**@&#10;     * #Crafty.stage&#10;     * @category Core&#10;     * The stage where all the DOM entities will be placed.&#10;     */&#10;&#10;    /**@&#10;     * #Crafty.stage.elem&#10;     * @comp Crafty.stage&#10;     * The `#cr-stage` div element.&#10;     */&#10;&#10;    /**@&#10;     * #Crafty.domLayer._div&#10;     * @comp Crafty.domLayer&#10;     * `Crafty.domLayer._div` is a div inside the `#cr-stage` div that holds all DOM entities.&#10;     * If you use canvas, a `canvas` element is created at the same level in the dom&#10;     * as the the `Crafty.domLayer._div` div. So the hierarchy in the DOM is&#10;     *  &#10;     *</span><br></pre></td></tr></table></figure>

             * Crafty.stage.elem
             *  - Crafty.domLayer._div (a div HTMLElement)
             *  - Crafty.canvasLayer._canvas (a canvas HTMLElement)
             * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">             */&#10;&#10;            //create stage div to contain everything&#10;            Crafty.stage = &#123;&#10;                x: 0,&#10;                y: 0,&#10;                fullscreen: false,&#10;                elem: (crstage ? crstage : document.createElement(&#34;div&#34;)),&#10;            &#125;;&#10;&#10;            //fullscreen, stop scrollbars&#10;            if (!w &#38;&#38; !h) &#123;&#10;                document.body.style.overflow = &#34;hidden&#34;;&#10;                Crafty.stage.fullscreen = true;&#10;            &#125;&#10;&#10;            Crafty.addEvent(this, window, &#34;resize&#34;, Crafty.viewport.reload);&#10;&#10;            Crafty.addEvent(this, window, &#34;blur&#34;, function () &#123;&#10;                if (Crafty.settings.get(&#34;autoPause&#34;)) &#123;&#10;                    if (!Crafty._paused) Crafty.pause();&#10;                &#125;&#10;            &#125;);&#10;            Crafty.addEvent(this, window, &#34;focus&#34;, function () &#123;&#10;                if (Crafty._paused &#38;&#38; Crafty.settings.get(&#34;autoPause&#34;)) &#123;&#10;                    Crafty.pause();&#10;                &#125;&#10;            &#125;);&#10;&#10;            //make the stage unselectable&#10;            Crafty.settings.register(&#34;stageSelectable&#34;, function (v) &#123;&#10;                Crafty.stage.elem.onselectstart = v ? function () &#123;&#10;                    return true;&#10;                &#125; : function () &#123;&#10;                    return false;&#10;                &#125;;&#10;            &#125;);&#10;            Crafty.settings.modify(&#34;stageSelectable&#34;, false);&#10;&#10;            //make the stage have no context menu&#10;            Crafty.settings.register(&#34;stageContextMenu&#34;, function (v) &#123;&#10;                Crafty.stage.elem.oncontextmenu = v ? function () &#123;&#10;                    return true;&#10;                &#125; : function () &#123;&#10;                    return false;&#10;                &#125;;&#10;            &#125;);&#10;            Crafty.settings.modify(&#34;stageContextMenu&#34;, false);&#10;&#10;            Crafty.settings.register(&#34;autoPause&#34;, function () &#123;&#125;);&#10;            Crafty.settings.modify(&#34;autoPause&#34;, false);&#10;&#10;            //add to the body and give it an ID if not exists&#10;            if (!crstage) &#123;&#10;                document.body.appendChild(Crafty.stage.elem);&#10;                Crafty.stage.elem.id = stage_elem;&#10;            &#125;&#10;&#10;            var elem = Crafty.stage.elem.style,&#10;                offset;&#10;&#10;            //css style&#10;            elem.width = this.width + &#34;px&#34;;&#10;            elem.height = this.height + &#34;px&#34;;&#10;            elem.overflow = &#34;hidden&#34;;&#10;&#10;&#10;            // resize events&#10;            Crafty.bind(&#34;ViewportResize&#34;, function()&#123;Crafty.trigger(&#34;InvalidateViewport&#34;);&#125;);&#10;&#10;            if (Crafty.mobile) &#123;&#10;&#10;                // remove default gray highlighting after touch&#10;                if (typeof elem.webkitTapHighlightColor !== undefined) &#123;&#10;                    elem.webkitTapHighlightColor = &#34;rgba(0,0,0,0)&#34;;&#10;                &#125;&#10;&#10;                var meta = document.createElement(&#34;meta&#34;),&#10;                    head = document.getElementsByTagName(&#34;head&#34;)[0];&#10;&#10;                //hide the address bar&#10;                meta = document.createElement(&#34;meta&#34;);&#10;                meta.setAttribute(&#34;name&#34;, &#34;apple-mobile-web-app-capable&#34;);&#10;                meta.setAttribute(&#34;content&#34;, &#34;yes&#34;);&#10;                head.appendChild(meta);&#10;&#10;                Crafty.addEvent(this, Crafty.stage.elem, &#34;touchmove&#34;, function (e) &#123;&#10;                    e.preventDefault();&#10;                &#125;);&#10;&#10;&#10;            &#125;&#10;            &#10;            elem.position = &#34;relative&#34;;&#10;            //find out the offset position of the stage&#10;            offset = Crafty.domHelper.innerPosition(Crafty.stage.elem);&#10;            Crafty.stage.x = offset.x;&#10;            Crafty.stage.y = offset.y;&#10;&#10;            Crafty.uniqueBind(&#34;ViewportResize&#34;, this._resize);&#10;        &#125;,&#10;&#10;        _resize: function()&#123;&#10;            Crafty.stage.elem.style.width = Crafty.viewport.width + &#34;px&#34;;&#10;            Crafty.stage.elem.style.height = Crafty.viewport.height + &#34;px&#34;;&#10;        &#125;,&#10;&#10;        // Create setters/getters for x, y, width, height&#10;        _defineViewportProperties: function()&#123;&#10;            Object.defineProperty(this, &#39;x&#39;, &#123;&#10;                set: function (v) &#123;&#10;                    this.scroll(&#39;_x&#39;, v);&#10;                &#125;,&#10;                get: function () &#123;&#10;                    return this._x;&#10;                &#125;,&#10;                configurable : true&#10;            &#125;);&#10;            Object.defineProperty(this, &#39;y&#39;, &#123;&#10;                set: function (v) &#123;&#10;                    this.scroll(&#39;_y&#39;, v);&#10;                &#125;,&#10;                get: function () &#123;&#10;                    return this._y;&#10;                &#125;,&#10;                configurable : true&#10;            &#125;);&#10;            Object.defineProperty(this, &#39;width&#39;, &#123;&#10;                set: function (v) &#123;&#10;                    this._width = v;&#10;                    Crafty.trigger(&#34;ViewportResize&#34;);&#10;                &#125;,&#10;                get: function () &#123;&#10;                    return this._width;&#10;                &#125;,&#10;                configurable : true&#10;            &#125;);&#10;            Object.defineProperty(this, &#39;height&#39;, &#123;&#10;                set: function (v) &#123;&#10;                    this._height = v;&#10;                    Crafty.trigger(&#34;ViewportResize&#34;);&#10;                &#125;,&#10;                get: function () &#123;&#10;                    return this._height;&#10;                &#125;,&#10;                configurable : true&#10;            &#125;);&#10;        &#125;,&#10;&#10;        /**@&#10;         * #Crafty.viewport.reload&#10;         * @comp Crafty.stage&#10;         *&#10;         * @sign public Crafty.viewport.reload()&#10;         *&#10;         * Recalculate and reload stage width, height and position.&#10;         * Useful when browser return wrong results on init (like safari on Ipad2).&#10;         * You should also call this method if you insert custom DOM elements that affect Crafty&#39;s stage offset.&#10;         *&#10;         */&#10;        reload: function () &#123;&#10;            var w = window.innerWidth,&#10;                h= window.innerHeight,&#10;                offset;&#10;&#10;&#10;            if (Crafty.stage.fullscreen) &#123;&#10;                this._width = w;&#10;                this._height = h;&#10;                Crafty.trigger(&#34;ViewportResize&#34;);&#10;            &#125;&#10;&#10;            offset = Crafty.domHelper.innerPosition(Crafty.stage.elem);&#10;            Crafty.stage.x = offset.x;&#10;            Crafty.stage.y = offset.y;&#10;        &#125;,&#10;&#10;        /**@&#10;         * #Crafty.viewport.reset&#10;         * @comp Crafty.stage&#10;         * @trigger StopCamera - called to cancel camera animations&#10;         *&#10;         * @sign public Crafty.viewport.reset()&#10;         *&#10;         * Resets the viewport to starting values, and cancels any existing camera animations.&#10;         * Called when scene() is run.&#10;         */&#10;        reset: function () &#123;&#10;            Crafty.viewport.mouselook(&#34;stop&#34;);&#10;            Crafty.trigger(&#34;StopCamera&#34;);&#10;            // Reset viewport position and scale&#10;            Crafty.viewport.scroll(&#34;_x&#34;, 0);&#10;            Crafty.viewport.scroll(&#34;_y&#34;, 0);&#10;            Crafty.viewport.scale(1);&#10;        &#125;,&#10;&#10;        /**@&#10;         * #Crafty.viewport.onScreen&#10;         * @comp Crafty.viewport&#10;         * @sign public Crafty.viewport.onScreen(Object rect)&#10;         * @param rect - A rectangle with field &#123;_x: x_val, _y: y_val, _w: w_val, _h: h_val&#125;&#10;         *&#10;         * Test if a rectangle is completely in viewport&#10;         */&#10;        onScreen: function (rect) &#123;&#10;            return Crafty.viewport._x + rect._x + rect._w &#62; 0 &#38;&#38; Crafty.viewport._y + rect._y + rect._h &#62; 0 &#38;&#38;&#10;                Crafty.viewport._x + rect._x &#60; Crafty.viewport.width &#38;&#38; Crafty.viewport._y + rect._y &#60; Crafty.viewport.height;&#10;        &#125;,&#10;    &#125;&#10;&#125;);&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],35:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;),&#10;    document = window.document;&#10;&#10;// Object for abstracting out all the gl calls to handle rendering entities with a particular program&#10;RenderProgramWrapper = function(context, shader)&#123;&#10;    this.shader = shader;&#10;    this.context = context;&#10;&#10;    this.array_size = 16;&#10;    this.max_size = 1024;&#10;    this._indexArray = new Uint16Array(6 * this.array_size);&#10;    this._indexBuffer = context.createBuffer();&#10;&#125;;&#10;&#10;RenderProgramWrapper.prototype = &#123;&#10;    // Takes an array of attributes; see Crafty.webgl.getProgramWrapper&#10;    initAttributes: function(attributes)&#123;&#10;        this.attributes = attributes;&#10;        this._attribute_table = &#123;&#125;;&#10;        var offset = 0;&#10;        for (var i=0; i&#60;attributes.length; i++)&#123;&#10;            var a = attributes[i];&#10;            this._attribute_table[a.name] = a;&#10;&#10;            a.bytes = a.bytes || Float32Array.BYTES_PER_ELEMENT;&#10;            a.type = a.type || this.context.FLOAT;&#10;            a.offset = offset;&#10;            a.location = this.context.getAttribLocation(this.shader, a.name);&#10;&#10;            this.context.enableVertexAttribArray(a.location);&#10;&#10;            offset += a.width;&#10;        &#125;&#10;&#10;        // Stride is the full width including the last set&#10;        this.stride = offset;&#10;&#10;        // Create attribute array of correct size to hold max elements&#10;        this._attributeArray = new Float32Array(this.array_size*4*this.stride);&#10;        this._attributeBuffer = this.context.createBuffer();&#10;        this._registryHoles = [];&#10;        this._registrySize = 0;&#10;    &#125;,&#10;&#10;    // increase the size of the typed arrays&#10;    // does so by creating a new array of that size and copying the existing one into it&#10;    growArrays: function(size)&#123;&#10;        if(this.array_size &#62;= this.max_size) return;&#10;&#10;        var newsize = Math.min(size, this.max_size);&#10;&#10;        var newAttributeArray = new Float32Array(newsize*4*this.stride);&#10;        var newIndexArray = new Uint16Array(6 * newsize);&#10;&#10;        newAttributeArray.set(this._attributeArray);&#10;        newIndexArray.set(this._indexArray);&#10;&#10;        this._attributeArray = newAttributeArray;&#10;        this._indexArray = newIndexArray;&#10;        this.array_size = newsize;&#10;    &#125;,&#10;&#10;    // Add an entity that needs to be rendered by this program&#10;    // Needs to be assigned an index in the buffer&#10;    registerEntity: function(e)&#123;&#10;        if (this._registryHoles.length === 0) &#123;&#10;            if (this._registrySize &#62;= this.max_size)&#123;&#10;                throw(&#34;Number of entities exceeds maximum limit.&#34;);&#10;            &#125; else if (this._registrySize &#62;= this.array_size) &#123;&#10;                this.growArrays(2*this.array_size);&#10;            &#125;&#10;            e._glBufferIndex = this._registrySize;&#10;            this._registrySize++;&#10;        &#125; else &#123;&#10;            e._glBufferIndex = this._registryHoles.pop();&#10;        &#125;&#10;    &#125;,&#10;&#10;    // remove an entity; allow its buffer index to be reused&#10;    unregisterEntity: function(e)&#123;&#10;        if (typeof e._glBufferIndex === &#34;number&#34;)&#10;            this._registryHoles.push(e._glBufferIndex);&#10;        e._glBufferIndex = null;&#10;    &#125;,&#10;&#10;    resetRegistry: function()&#123;&#10;        this._maxElement = 0;&#10;        this._registryHoles.length = 0;&#10;    &#125;,&#10;&#10;    setCurrentEntity: function(ent)&#123;&#10;        // offset is 4 * buffer index, because each entity has 4 vertices&#10;        this.ent_offset = ent._glBufferIndex*4;&#10;        this.ent = ent;&#10;    &#125;,&#10;&#10;    // Called before a batch of entities is prepped for rendering&#10;    switchTo: function()&#123;&#10;        var gl = this.context;&#10;        gl.useProgram(this.shader);&#10;        gl.bindBuffer(gl.ARRAY_BUFFER, this._attributeBuffer);&#10;        var a, attributes = this.attributes;&#10;        // Process every attribute&#10;        for (var i=0; i&#60;attributes.length; i++)&#123;&#10;            a = attributes[i];&#10;            gl.vertexAttribPointer(a.location, a.width, a.type, false, this.stride*a.bytes, a.offset*a.bytes);&#10;        &#125;&#10;&#10;        // For now, special case the need for texture objects&#10;        var t = this.texture_obj;&#10;        if (t &#38;&#38; t.unit === null)&#123;&#10;            Crafty.webgl.texture_manager.bindTexture(t);&#10;        &#125;&#10;&#10;        this.index_pointer = 0;&#10;    &#125;,&#10;&#10;    // Sets a texture&#10;    setTexture: function(texture_obj) &#123;&#10;        // Only needs to be done once&#10;        if (this.texture_obj !== undefined)&#10;            return;&#10;        // Set the texture buffer to use&#10;        texture_obj.setToProgram(this.shader, &#34;uSampler&#34;, &#34;uTextureDimensions&#34;);&#10;        this.texture_obj = texture_obj;&#10;    &#125;,&#10;&#10;    // adds a set of 6 indices to the index array&#10;    // Corresponds to 2 triangles that make up a rectangle&#10;    addIndices: function(offset)&#123;&#10;        var index = this._indexArray, l = this.index_pointer;&#10;        index[0+l] = 0 + offset;&#10;        index[1+l] = 1 + offset;&#10;        index[2+l] = 2 + offset;&#10;        index[3+l] = 1 + offset;&#10;        index[4+l] = 2 + offset;&#10;        index[5+l] = 3 + offset;&#10;        this.index_pointer+=6;&#10;    &#125;,&#10;&#10;&#10;    // Writes data from the attribute and index arrays to the appropriate buffers, and then calls drawElements.&#10;    renderBatch: function()&#123;&#10;        var gl = this.context;&#10;        gl.bindBuffer(gl.ARRAY_BUFFER, this._attributeBuffer);&#10;        gl.bufferData(gl.ARRAY_BUFFER, this._attributeArray, gl.STATIC_DRAW);&#10;        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);&#10;        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indexArray, gl.STATIC_DRAW);&#10;        gl.drawElements(gl.TRIANGLES, this.index_pointer, gl.UNSIGNED_SHORT, 0);&#10;    &#125;,&#10;&#10;    setViewportUniforms: function(viewport)&#123;&#10;        var gl = this.context;&#10;        gl.useProgram(this.shader);&#10;        gl.uniform4f(this.shader.viewport, viewport._x, viewport._y, viewport._width/viewport._scale, viewport._height/viewport._scale);&#10;    &#125;,&#10;&#10;    // Fill in the attribtue with the given arguments, cycling through the data if necessary&#10;    // If the arguments provided match the width of the attribute, that means it&#39;ll fill the same values for each of the four vertices.&#10;    // TODO determine if this abstraction is a performance hit!&#10;    writeVector: function (name, x, y)&#123;&#10;        var a = this._attribute_table[name];&#10;        var stride = this.stride, offset = a.offset+this.ent_offset*stride, w = a.width;&#10;        var l = (arguments.length-1);&#10;        var data = this._attributeArray;&#10;&#10;        for (var r=0; r&#60;4 ; r++)&#10;            for (var c=0; c&#60;w; c++)&#123;&#10;                data[offset + stride*r + c] = arguments[ (w*r + c) % l + 1];&#10;            &#125;&#10;        &#125;&#10;&#125;;&#10;&#10;&#10;/**@&#10; * #WebGL&#10; * @category Graphics&#10; * @trigger Draw - when the entity is ready to be drawn to the stage - &#123;type: &#34;canvas&#34;, pos, co, ctx&#125;&#10; * @trigger NoCanvas - if the browser does not support canvas&#10; *&#10; * When this component is added to an entity it will be drawn to the global webgl canvas element. Its canvas element (and hence any WebGL entity) is always rendered below any DOM entities.&#10; *&#10; * Sprite, Image, SpriteAnimation, and Color all support WebGL rendering.  Text entities will need to use DOM or Canvas for now.&#10; * &#10; * If a webgl context does not yet exist, a WebGL entity will automatically create one by calling `Crafty.webgl.init()` before rendering.&#10; *&#10; * @note For better performance, minimize the number of spritesheets used, and try to arrange it so that entities with different spritesheets are on different z-levels.  This is because entities are rendered in z order, and only entities sharing the same texture can be efficiently batched.&#10; *&#10; * Create a webgl entity like this&#10; *</span><br></pre></td></tr></table></figure>

 * var myEntity = Crafty.e("2D, WebGL, Color")
 *      .color(1, 1, 0, 0.5)
 *      .attr({x: 13, y: 37, w: 42, h: 42});
 *<figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;&#10;Crafty.c(&#34;WebGL&#34;, &#123;&#10;    /**@&#10;     * #.context&#10;     * @comp WebGL&#10;     * &#10;     * The webgl context this entity will be rendered to.&#10;     */&#10;    init: function () &#123;&#10;        if (!Crafty.webgl.context) &#123;&#10;            Crafty.webgl.init();&#10;        &#125;&#10;        var webgl = this.webgl = Crafty.webgl;&#10;        var gl = webgl.context;&#10;&#10;        //increment the amount of canvas objs&#10;        this._changed = true;&#10;        this.bind(&#34;Change&#34;, this._glChange);&#10;    &#125;,&#10;&#10;    remove: function()&#123;&#10;        this._changed = true;&#10;        this.unbind(this._glChange);&#10;        // Webgl components need to be removed from their gl program&#10;        if (this.program) &#123;&#10;            this.program.unregisterEntity(this);&#10;        &#125;&#10;    &#125;,&#10;&#10;    _glChange: function()&#123;&#10;        //flag if changed&#10;        if (this._changed === false) &#123;&#10;            this._changed = true;&#10;        &#125;&#10;    &#125;,&#10;&#10;    // Cache the various objects and arrays used in draw&#10;    drawVars: &#123;&#10;        type: &#34;webgl&#34;,&#10;        pos: &#123;&#125;,&#10;        ctx: null,&#10;        coord: [0, 0, 0, 0],&#10;        co: &#123;&#10;            x: 0,&#10;            y: 0,&#10;            w: 0,&#10;            h: 0&#10;        &#125;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.draw&#10;     * @comp WebGL&#10;     * @sign public this .draw([[Context ctx, ]Number x, Number y, Number w, Number h])&#10;     * @param ctx - Optionally supply a different r 2D context if drawing on another canvas is required&#10;     * @param x - X offset for drawing a segment&#10;     * @param y - Y offset for drawing a segment&#10;     * @param w - Width of the segment to draw&#10;     * @param h - Height of the segment to draw&#10;     *&#10;     * An internal method to draw the entity on the webgl canvas element. Rather then rendering directly, it writes relevent information into a buffer to allow batch rendering.&#10;     */&#10;    draw: function (ctx, x, y, w, h) &#123;&#10;&#10;        if (!this.ready) return;&#10;&#10;        if (arguments.length === 4) &#123;&#10;            h = w;&#10;            w = y;&#10;            y = x;&#10;            x = ctx;&#10;            ctx = this.webgl.context;&#10;        &#125;&#10;&#10;        var pos = this.drawVars.pos;&#10;        pos._x = (this._x + (x || 0));&#10;        pos._y = (this._y + (y || 0));&#10;        pos._w = (w || this._w);&#10;        pos._h = (h || this._h);&#10;&#10;        var coord = this.__coord || [0, 0, 0, 0];&#10;        var co = this.drawVars.co;&#10;        co.x = coord[0] + (x || 0);&#10;        co.y = coord[1] + (y || 0);&#10;        co.w = w || coord[2];&#10;        co.h = h || coord[3];&#10;&#10;        // Handle flipX, flipY&#10;        // (Just swap the positions of e.g. x and x+w)&#10;        if (this._flipX ) &#123;&#10;           co.x = co.x + co.w;&#10;           co.w = - co.w;&#10;        &#125;&#10;        if (this._flipY ) &#123;&#10;           co.y = co.y + co.h;&#10;           co.h = - co.h;&#10;        &#125;&#10;&#10;        //Draw entity&#10;        var gl = this.webgl.context;&#10;        this.drawVars.gl = gl;&#10;        var prog = this.drawVars.program = this.program;&#10;&#10;        // The program might need to refer to the current element&#39;s index&#10;        prog.setCurrentEntity(this);&#10;        // Write position; x, y, w, h&#10;        prog.writeVector(&#34;aPosition&#34;,&#10;            this._x, this._y,&#10;            this._x , this._y + this._h,&#10;            this._x + this._w, this._y,&#10;            this._x + this._w, this._y + this._h&#10;        );&#10;&#10;        // Write orientation &#10;        prog.writeVector(&#34;aOrientation&#34;,&#10;            this._origin.x + this._x,&#10;            this._origin.y + this._y,&#10;            this._rotation * Math.PI / 180&#10;        );&#10;&#10;        // Write z, alpha&#10;        prog.writeVector(&#34;aLayer&#34;,&#10;            this._globalZ,&#10;            this._alpha&#10;        );&#10;&#10;        // This should only need to handle *specific* attributes!&#10;        this.trigger(&#34;Draw&#34;, this.drawVars);&#10;&#10;        // Register the vertex groups to be drawn, referring to this entities position in the big buffer&#10;        prog.addIndices(prog.ent_offset);&#10;        &#10;        return this;&#10;    &#125;,&#10;&#10;    // v_src is optional, there&#39;s a default vertex shader that works for regular rectangular entities&#10;    _establishShader: function(compName, f_src, v_src, attributes)&#123;&#10;        this.program = this.webgl.getProgramWrapper(compName, f_src, v_src, attributes);&#10;        &#10;        // Needs to know where in the big array we are!&#10;        this.program.registerEntity(this);&#10;        // Shader program means ready&#10;        this.ready = true;&#10;    &#125;&#10;&#125;);&#10;&#10;/**@&#10; * #Crafty.webgl&#10; * @category Graphics&#10; *&#10; * A collection of methods to handle webgl contexts.&#10; */&#10;Crafty.extend(&#123;&#10;&#10;    webgl: &#123;&#10;        /**@&#10;         * #Crafty.webgl.context&#10;         * @comp Crafty.webgl&#10;         *&#10;         * This will return the context of the webgl canvas element.&#10;         */&#10;        context: null,&#10;        changed_objects: [],&#10;   &#10;       // Create a vertex or fragment shader, given the source and type&#10;       _compileShader: function (src, type)&#123;&#10;            var gl = this.context;&#10;            var shader = gl.createShader(type);&#10;            gl.shaderSource(shader, src);&#10;            gl.compileShader(shader);&#10;            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) &#123;&#10;              throw(gl.getShaderInfoLog(shader));&#10;            &#125;&#10;            return shader;&#10;        &#125;,&#10;&#10;        // Create and return a complete, linked shader program, given the source for the fragment and vertex shaders.&#10;        // Will compile the two shaders and then link them together&#10;        _makeProgram: function (fragment_src, vertex_src)&#123;&#10;            var gl = this.context;&#10;            var fragment_shader = this._compileShader(fragment_src, gl.FRAGMENT_SHADER);&#10;            var vertex_shader = this._compileShader(vertex_src, gl.VERTEX_SHADER);&#10;&#10;            var shaderProgram = gl.createProgram();&#10;            gl.attachShader(shaderProgram, vertex_shader);&#10;            gl.attachShader(shaderProgram, fragment_shader);&#10;            gl.linkProgram(shaderProgram);&#10;&#10;            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) &#123;&#10;              throw(&#34;Could not initialise shaders&#34;);&#10;            &#125;&#10;            &#10;            shaderProgram.viewport = gl.getUniformLocation(shaderProgram, &#34;uViewport&#34;);&#10;            return shaderProgram;&#10;        &#125;,&#10;&#10;        programs: &#123;&#125;,&#10;&#10;        // Will create and return a RenderProgramWrapper for a shader program.&#10;        // name is a unique id, attributes an array of attribute names with their metadata.&#10;        // Each attribute needs at least a `name`  and `width` property:&#10;        //</span><br></pre></td></tr></table></figure>

        //   [
        //      {name:"aPosition", width: 2},
        //      {name:"aOrientation", width: 3},
        //      {name:"aLayer", width:2},
        //      {name:"aColor",  width: 4}
        //   ]
        // <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">        // The &#34;aPositon&#34;, &#34;aOrientation&#34;, and &#34;aLayer&#34; attributes should be the same for any webgl entity,&#10;        // since they support the basic 2D properties&#10;        getProgramWrapper: function(name, fragment_src, vertex_src, attributes)&#123;&#10;            if (this.programs[name] === undefined)&#123;&#10;                var shader = this._makeProgram(fragment_src, vertex_src);&#10;                var program = new RenderProgramWrapper(this.context, shader);&#10;                program.name = name;&#10;                program.initAttributes(attributes);&#10;                program.setViewportUniforms(Crafty.viewport);&#10;                this.programs[name] = program;&#10;            &#125;&#10;            return this.programs[name];&#10;        &#125;,&#10;&#10;        // Make a texture out of the given image element&#10;        // The url is just used as a unique ID&#10;        makeTexture: function(url, image, repeating)&#123;&#10;            var webgl = this;&#10;            return webgl.texture_manager.makeTexture(url, image, repeating);&#10;        &#125;,&#10;&#10;        /**@&#10;         * #Crafty.webgl.init&#10;         * @comp Crafty.webgl&#10;         * @sign public void Crafty.webgl.init(void)&#10;         * @trigger NoWebGL - triggered if `Crafty.support.webgl` is false&#10;         *&#10;         * This will create a `canvas` element inside `Crafty.stage.elem`, used for displaying &#34;WebGL&#34; components.&#10;         *&#10;         * This method will automatically be called by any &#34;WebGL&#34; component if no `Crafty.webgl.context` is&#10;         * found, so it is not neccessary to call this manually.&#10;         */&#10;        init: function () &#123;&#10;&#10;            //check if we support webgl is supported&#10;            if (!Crafty.support.webgl) &#123;&#10;                Crafty.trigger(&#34;NoWebGL&#34;);&#10;                Crafty.stop();&#10;                return;&#10;            &#125;&#10;&#10;            // necessary on restart&#10;            this.changed_objects = [];&#10;&#10;            //create an empty canvas element&#10;            var c;&#10;            c = document.createElement(&#34;canvas&#34;);&#10;            c.width = Crafty.viewport.width;&#10;            c.height = Crafty.viewport.height;&#10;            c.style.position = &#39;absolute&#39;;&#10;            c.style.left = &#34;0px&#34;;&#10;            c.style.top = &#34;0px&#34;;&#10;&#10;            Crafty.stage.elem.appendChild(c);&#10;&#10;            // Try to get a webgl context&#10;            var gl;&#10;            try &#123;&#10;                gl = c.getContext(&#34;webgl&#34;, &#123; premultipliedalpha: true &#125;) || c.getContext(&#34;experimental-webgl&#34;, &#123; premultipliedalpha: true &#125;);&#10;                gl.viewportWidth = c.width;&#10;                gl.viewportHeight = c.height;&#10;            &#125; catch(e) &#123;&#10;                Crafty.trigger(&#34;NoWebGL&#34;);&#10;                Crafty.stop();&#10;                return;&#10;            &#125;&#10;&#10;            // assign to this renderer&#10;            this.context = gl;&#10;            this._canvas = c;&#10;&#10;            gl.clearColor(0.0, 0.0, 0.0, 0.0);&#10;            &#10;            // These commands allow partial transparency, but require drawing in z-order&#10;            gl.disable(gl.DEPTH_TEST);&#10;            // This particular blend function requires the shader programs to output pre-multiplied alpha&#10;            // This is necessary to match the blending of canvas/dom entities against the background color&#10;            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);&#10;            gl.enable(gl.BLEND);&#10;            &#10;&#10;            //Bind rendering of canvas context (see drawing.js)&#10;            var webgl = this;&#10;            Crafty.uniqueBind(&#34;RenderScene&#34;, webgl.render);&#10;            Crafty.uniqueBind(&#34;ViewportResize&#34;, webgl._resize);&#10;            Crafty.uniqueBind(&#34;InvalidateViewport&#34;, function()&#123;webgl.dirtyViewport = true;&#125;);&#10;            Crafty.uniqueBind(&#34;PixelartSet&#34;, webgl._setPixelart);&#10;            webgl._setPixelart(Crafty._pixelartEnabled);&#10;            this.dirtyViewport = true;&#10;&#10;            this.texture_manager = new Crafty.TextureManager(gl, this);&#10;&#10;&#10;        &#125;,&#10;&#10;        // Called when the viewport resizes&#10;        _resize: function()&#123;&#10;            var c = Crafty.webgl._canvas;&#10;            c.width = Crafty.viewport.width;&#10;            c.height = Crafty.viewport.height;&#10;&#10;            var gl = Crafty.webgl.context;&#10;            gl.viewportWidth = c.width;&#10;            gl.viewportHeight = c.height;&#10;        &#125;,&#10;&#10;        // TODO consider shifting to texturemanager&#10;        _setPixelart: function(enabled) &#123;&#10;            var gl = Crafty.webgl.context;&#10;            if (enabled)&#123;&#10;                Crafty.webgl.texture_filter = gl.NEAREST;&#10;            &#125; else &#123;&#10;                Crafty.webgl.texture_filter = gl.LINEAR;&#10;            &#125;&#10;        &#125;,&#10;&#10;        // convenicne to sort array by global Z&#10;        zsort: function(a, b) &#123;&#10;                return a._globalZ - b._globalZ;&#10;        &#125;,&#10;&#10;        // Hold an array ref to avoid garbage&#10;        visible_gl: [],&#10;&#10;        // Render any entities associated with this context; called in response to a draw event&#10;        render: function(rect)&#123;&#10;            rect = rect || Crafty.viewport.rect();&#10;            var webgl = Crafty.webgl,&#10;                gl = webgl.context;&#10;&#10;            // Set viewport and clear it&#10;            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);&#10;            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);&#10;&#10;            //Set the viewport uniform variables used by each registered program&#10;            var programs = webgl.programs;&#10;            if (webgl.dirtyViewport)&#123;&#10;              for (var comp in programs) &#123;&#10;                  programs[comp].setViewportUniforms(Crafty.viewport);&#10;              &#125;&#10;              webgl.dirtyViewport = false;&#10;            &#125;&#10;&#10;            // Search for any entities in the given area (viewport unless otherwise specified)&#10;            var q = Crafty.map.search(rect),&#10;                i = 0,&#10;                l = q.length,&#10;                current;&#10;            //From all potential candidates, build a list of visible entities, then sort by zorder&#10;            var visible_gl = webgl.visible_gl;&#10;            visible_gl.length = 0;&#10;            for (i=0; i &#60; l; i++) &#123;&#10;                current = q[i];&#10;                if (current._visible &#38;&#38; current.__c.WebGL &#38;&#38; current.program) &#123;&#10;                    visible_gl.push(current);&#10;                &#125;&#10;            &#125;&#10;            visible_gl.sort(webgl.zsort);&#10;            l = visible_gl.length;&#10;&#10;&#10;            // Now iterate through the z-sorted entities to be rendered&#10;            // Each entity writes it&#39;s data into a typed array&#10;            // The entities are rendered in batches, where the entire array is copied to a buffer in one operation&#10;            // A batch is rendered whenever the next element needs to use a different type of program&#10;            // Therefore, you get better performance by grouping programs by z-order if possible.&#10;            // (Each sprite sheet will use a different program, but multiple sprites on the same sheet can be rendered in one batch)&#10;            var batchCount = 0;&#10;            var shaderProgram = null;&#10;            for (i=0; i &#60; l; i++) &#123;&#10;                current = visible_gl[i];&#10;                if (shaderProgram !== current.program)&#123;&#10;                  if (shaderProgram !== null)&#123;&#10;                    shaderProgram.renderBatch();&#10;                  &#125;&#10;&#10;                  shaderProgram = current.program;&#10;                  shaderProgram.index_pointer = 0;&#10;                  shaderProgram.switchTo();&#10;                &#125;&#10;                current.draw();&#10;                current._changed = false;&#10;            &#125;&#10;&#10;            if (shaderProgram !== null)&#123;&#10;              shaderProgram.renderBatch();&#10;            &#125;&#10;            &#10;        &#125;&#10;&#10;    &#125;&#10;&#125;);&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],36:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;&#10;Crafty.extend(&#123;&#10;    /**@&#10;     * #Crafty.diamondIso&#10;     * @category 2D&#10;     * Place entities in a 45deg diamond isometric fashion. It is similar to isometric but has another grid locations&#10;     * In this mode, the x axis and y axis are aligned to the edges of tiles with x increasing being down and to the&#10;     * right and y being down and to the left.&#10;     */&#10;    diamondIso: &#123;&#10;        _tile: &#123;&#10;            width: 0,&#10;            height: 0&#10;        &#125;,&#10;        getTileDimensions: function()&#123;&#10;            return &#123;w:this._tile.width,h:this._tile.height&#125;;&#10;        &#125;,&#10;        _map: &#123;&#10;            width: 0,&#10;            height: 0&#10;        &#125;,&#10;        _origin: &#123;&#10;            x: 0,&#10;            y: 0&#10;        &#125;,&#10;        _tiles: [],&#10;        getTile: function(x,y,z)&#123;&#10;            return this._tiles[x][y][z];&#10;        &#125;,&#10;        /**@&#10;         * #Crafty.diamondIso.init&#10;         * @comp Crafty.diamondIso&#10;         * @sign public this Crafty.diamondIso.init(Number tileWidth,Number tileHeight,Number mapWidth,Number mapHeight)&#10;         * @param tileWidth - The size of base tile width&#39;s grid space in Pixel&#10;         * @param tileHeight - The size of base tile height grid space in Pixel&#10;         * @param mapWidth - The width of whole map in Tiles&#10;         * @param mapHeight - The height of whole map in Tiles&#10;         * @param x - the x coordinate of the TOP corner of the 0,0 tile&#10;         * @param y - the y coordinate of the TOP corner of the 0,0, tile&#10;         *&#10;         * Method used to initialize the size of the isometric placement.&#10;         * Recommended to use a size alues in the power of `2` (128, 64 or 32).&#10;         * This makes it easy to calculate positions and implement zooming.&#10;         *&#10;         * @example&#10;         *</span><br></pre></td></tr></table></figure>

         * var iso = Crafty.diamondIso.init(64,128,20,20);
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; * @see Crafty.diamondIso.place&#10; */&#10;init: function (tw, th, mw, mh, x, y) &#123;&#10;    this._tile.width = parseInt(tw, 10);&#10;    this._tile.height = parseInt(th, 10) || parseInt(tw, 10) / 2;&#10;    this._tile.r = this._tile.width / this._tile.height;&#10;&#10;    this._map.width = parseInt(mw, 10);&#10;    this._map.height = parseInt(mh, 10) || parseInt(mw, 10);&#10;    for (var i=0; i&#60;mw; i++) &#123;&#10;        this._tiles[i]=Array();&#10;        for (var j=0; j&#60;mh; j++)&#123;&#10;        this._tiles[i][j]=Array();&#10;        &#125;&#10;    &#125;&#10;    this.x = parseInt(x,10) || 0;&#10;    this.y = parseInt(y,10) || 0;&#10;    this.layerZLevel= (mw+mh+1);&#10;    return this;&#10;&#125;,&#10;/**@&#10; * #Crafty.diamondIso.place&#10; * @comp Crafty.diamondIso&#10; * @sign public this Crafty.diamondIso.place(Entity tile,Number x, Number y, Number layer)&#10; * @param x - The `x` position to place the tile&#10; * @param y - The `y` position to place the tile&#10; * @param layer - The `z` position to place the tile&#10; * @param tile - The entity that should be position in the isometric fashion&#10; *&#10; * Use this method to place an entity in an isometric grid.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * var iso = Crafty.diamondIso.init(64,128,20,20);
         * isos.place(Crafty.e('2D, DOM, Color').color('red').attr({w:128, h:128}),1,1,2);
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">         *&#10;         * @see Crafty.diamondIso.size&#10;         */&#10;        place: function (obj, x, y, layer) &#123;&#10;            var pos = this.pos2px(x, y);&#10;            //this calculation is weird because tile sprites are h*2&#10;            //for tiles of size h in isometric&#10;            var objHeight = obj.tileHeight;&#10;            var spriteHeight =obj.h/this._tile.height;&#10;            obj.x = pos.x;&#10;            obj.y = pos.y - (spriteHeight-2)*this._tile.height - this._tile.height*layer;&#10;            obj.z = this.getZAtLoc(x,y,layer);&#10;            for (var i=0; i&#60;=spriteHeight-2; i++) &#123;&#10;                var prevTile = this._tiles[x][y][layer+i];&#10;                if (prevTile &#38;&#38; prevTile !== obj)&#123;&#10;                    prevTile.destroy();&#10;                &#125;&#10;                this._tiles[x][y][layer+i] = obj;&#10;            &#125;&#10;            return this;&#10;&#10;        &#125;,&#10;        detachTile: function(obj)&#123;&#10;            for (var _x=0; _x&#60;this._map.width; _x++)&#123;&#10;                for (var _y=0; _y&#60;this._map.height; _y++)&#123;&#10;                    var len = this._tiles[_x][_y].length;&#10;                    for(var _z=0; _z&#60;len; _z++)&#123;&#10;                        if (this._tiles[_x][_y][_z] &#38;&#38; obj === this._tiles[_x][_y][_z])&#123;&#10;                            tHeight=obj.h/this._tile.height;&#10;                            for (var i=0; i&#60;tHeight; i++)&#123;&#10;                                this._tiles[_x][_y][_z+i] = undefined;&#10;                            &#125;&#10;                            return &#123;&#10;                                x:_x,&#10;                                y:_y,&#10;                                z:_z&#10;                            &#125;;&#10;                        &#125;&#10;&#10;                    &#125;&#10;                &#125;&#10;            &#125;&#10;            return false;&#10;        &#125;,&#10;        centerAt: function (x, y) &#123;&#10;            var pos = this.pos2px(x, y);&#10;            Crafty.viewport.x = -pos.x + Crafty.viewport.width / 2 - this._tile.width;&#10;            Crafty.viewport.y = -pos.y + Crafty.viewport.height / 2;&#10;&#10;        &#125;,&#10;        getZAtLoc: function(x,y,layer)&#123;&#10;            return this.layerZLevel * layer + x+y;&#10;        &#125;,&#10;        pos2px: function (x, y) &#123;&#10;        /* This returns the correct coordinates to place the &#10;        object&#39;s top and left to fit inside the grid, which is&#10;        NOT inside of the tile for an isometric grid.  IF you&#10;        want the top corner of the diamond add tile width/2 */&#10;            return &#123;&#10;                x: this.x + ((x - y - 1) * this._tile.width / 2),&#10;                y: this.y + ((x + y) * this._tile.height / 2)&#10;            &#125;;&#10;        &#125;,&#10;        px2pos: function (left, top) &#123;&#10;        /* This returns the x/y coordinates on z level 0.&#10;        @TODO add a specifying z level&#10;        */&#10;            var v1 = (top - this.y)/this._tile.height;&#10;            var v2 = (left - this.x)/this._tile.width;&#10;            var x = v1+v2;&#10;            var y = v1-v2;&#10;            inX = x&#62;0 &#38;&#38; x&#60;this._map.width;&#10;            inY = y&#62;0 &#38;&#38; y&#60;this._map.height;&#10;            if (!inX || !inY)&#123;&#10;                return undefined;&#10;            &#125;&#10;            return &#123;&#10;                x: ~~x,&#10;                y: ~~y&#10;            &#125;;&#10;        &#125;,&#10;        getOverlappingTiles: function(x,y)&#123;&#10;        /* This will find all of the tiles that might be at a given x/y in pixels */&#10;                var pos = this.px2pos(x,y);&#10;                var tiles = [];&#10;                var _x = ~~pos.x;&#10;                var _y = ~~pos.y;&#10;                var maxX = this._map.width - _x;&#10;                var maxY = this._map.height - _y;&#10;                var furthest = Math.min(maxX, maxY);&#10;                var obj = this._tiles[_x][_y][1];&#10;                if (obj)&#123;&#10;                    tiles.push(obj);&#10;                &#125;&#10;                for (var i=1; i&#60;furthest; i++)&#123;&#10;                    var _obj= this._tiles[_x+i][_y+i][i];&#10;                    if (_obj)&#123;&#10;                        tiles.push(_obj);&#10;                    &#125;&#10;                &#125;&#10;                return tiles;&#10;        &#125;,&#10;        polygon: function (obj) &#123;&#10;            /*I don&#39;t know what this is trying to do...*/&#10;            obj.requires(&#34;Collision&#34;);&#10;            var marginX = 0,&#10;                marginY = 0;&#10;            var points = [&#10;                marginX - 0, obj.h - marginY - this._tile.height / 2,&#10;                marginX - this._tile.width / 2, obj.h - marginY - 0,&#10;                marginX - this._tile.width, obj.h - marginY - this._tile.height / 2,&#10;                marginX - this._tile.width / 2, obj.h - marginY - this._tile.height&#10;            ];&#10;            var poly = new Crafty.polygon(points);&#10;            return poly;&#10;&#10;        &#125;&#10;    &#125;&#10;&#10;&#125;);&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],37:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;&#10;Crafty.extend(&#123;&#10;    /**@&#10;     * #Crafty.isometric&#10;     * @category 2D&#10;     * Place entities in a 45deg isometric fashion. The alignment of this&#10;     * grid&#39;s axes for tile placement is 90 degrees.  If you are looking&#10;     * to have the grid of tile indicies for this.place aligned to the tiles&#10;     * themselves, use DiamondIso instead.&#10;     */&#10;    isometric: &#123;&#10;        _tile: &#123;&#10;            width: 0,&#10;            height: 0&#10;        &#125;,&#10;        _elements: &#123;&#125;,&#10;        _pos: &#123;&#10;            x: 0,&#10;            y: 0&#10;        &#125;,&#10;        _z: 0,&#10;        /**@&#10;         * #Crafty.isometric.size&#10;         * @comp Crafty.isometric&#10;         * @sign public this Crafty.isometric.size(Number tileSize)&#10;         * @param tileSize - The size of the tiles to place.&#10;         *&#10;         * Method used to initialize the size of the isometric placement.&#10;         * Recommended to use a size values in the power of `2` (128, 64 or 32).&#10;         * This makes it easy to calculate positions and implement zooming.&#10;         *&#10;         * @example&#10;         *</span><br></pre></td></tr></table></figure>

         * var iso = Crafty.isometric.size(128);
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; * @see Crafty.isometric.place&#10; */&#10;size: function (width, height) &#123;&#10;    this._tile.width = width;&#10;    this._tile.height = height &#62; 0 ? height : width / 2; //Setup width/2 if height isn&#39;t set&#10;    return this;&#10;&#125;,&#10;/**@&#10; * #Crafty.isometric.place&#10; * @comp Crafty.isometric&#10; * @sign public this Crafty.isometric.place(Number x, Number y, Number z, Entity tile)&#10; * @param x - The `x` position to place the tile&#10; * @param y - The `y` position to place the tile&#10; * @param z - The `z` position or height to place the tile&#10; * @param tile - The entity that should be position in the isometric fashion&#10; *&#10; * Use this method to place an entity in an isometric grid.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * var iso = Crafty.isometric.size(128);
         * iso.place(2, 1, 0, Crafty.e('2D, DOM, Color').color('red').attr({w:128, h:128}));
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; * @see Crafty.isometric.size&#10; */&#10;place: function (x, y, z, obj) &#123;&#10;    var pos = this.pos2px(x, y);&#10;    pos.top -= z * (this._tile.height / 2);&#10;    obj.attr(&#123;&#10;        x: pos.left + Crafty.viewport._x,&#10;        y: pos.top + Crafty.viewport._y&#10;    &#125;).z += z;&#10;    return this;&#10;&#125;,&#10;/**@&#10; * #Crafty.isometric.pos2px&#10; * @comp Crafty.isometric&#10; * @sign public Object Crafty.isometric.pos2px(Number x,Number y)&#10; * @param x - A position along the x axis&#10; * @param y - A position along the y axis&#10; * @return An object with `left` and `top` fields &#123;left Number,top Number&#125;&#10; *&#10; * This method converts a position in x and y coordinates to one in pixels&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * var iso = Crafty.isometric.size(128,96);
         * var position = iso.pos2px(100,100); //Object { left=12800, top=4800}
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;pos2px: function (x, y) &#123;&#10;    return &#123;&#10;        left: x * this._tile.width + (y &#38; 1) * (this._tile.width / 2),&#10;        top: y * this._tile.height / 2&#10;    &#125;;&#10;&#125;,&#10;/**@&#10; * #Crafty.isometric.px2pos&#10; * @comp Crafty.isometric&#10; * @sign public Object Crafty.isometric.px2pos(Number left,Number top)&#10; * @param top - Offset from the top in pixels&#10; * @param left - Offset from the left in pixels&#10; * @return An object with `x` and `y` fields representing the position&#10; *&#10; * This method converts a position in pixels to x,y coordinates&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * var iso = Crafty.isometric.size(128,96);
         * var px = iso.pos2px(12800,4800);
         * Crafty.log(px); //Object { x=100, y=100}
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;px2pos: function (left, top) &#123;&#10;    return &#123;&#10;        x: -Math.ceil(-left / this._tile.width - (top &#38; 1) * 0.5),&#10;        y: top / this._tile.height * 2&#10;    &#125;;&#10;&#125;,&#10;/**@&#10; * #Crafty.isometric.centerAt&#10; * @comp Crafty.isometric&#10; *&#10; * @sign public Obect Crafty.isometric.centerAt()&#10; * @returns An object with `top` and `left` fields represneting the viewport&#39;s current center&#10; *&#10; * @sign public this Crafty.isometric.centerAt(Number x, Number y)&#10; * @param x - The x position to center at&#10; * @param y - The y position to center at&#10; *&#10; * This method centers the Viewport at an `x,y` location or gives the current centerpoint of the viewport&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * var iso = Crafty.isometric.size(128,96).centerAt(10,10); //Viewport is now moved
         * //After moving the viewport by another event you can get the new center point
         * Crafty.log(iso.centerAt());
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;centerAt: function (x, y) &#123;&#10;    if (typeof x == &#34;number&#34; &#38;&#38; typeof y == &#34;number&#34;) &#123;&#10;        var center = this.pos2px(x, y);&#10;        Crafty.viewport._x = -center.left + Crafty.viewport.width / 2 - this._tile.width / 2;&#10;        Crafty.viewport._y = -center.top + Crafty.viewport.height / 2 - this._tile.height / 2;&#10;        return this;&#10;    &#125; else &#123;&#10;        return &#123;&#10;            top: -Crafty.viewport._y + Crafty.viewport.height / 2 - this._tile.height / 2,&#10;            left: -Crafty.viewport._x + Crafty.viewport.width / 2 - this._tile.width / 2&#10;        &#125;;&#10;    &#125;&#10;&#125;,&#10;/**@&#10; * #Crafty.isometric.area&#10; * @comp Crafty.isometric&#10; * @sign public Object Crafty.isometric.area()&#10; * @return An obect with `x` and `y` fields, each of which have a start and end field.&#10; * In other words, the object has this structure: `&#123;x:&#123;start Number,end Number&#125;,y:&#123;start Number,end Number&#125;&#125;`&#10; *&#10; * This method returns an object representing the bounds of the viewport&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * var iso = Crafty.isometric.size(128,96).centerAt(10,10); //Viewport is now moved
         * var area = iso.area(); //get the area
         * for(var y = area.y.start;y <= area.y.end;y++){="" *="" for(var="" x="area.x.start" ;x="" <="area.x.end;x++){" iso.place(x,y,0,crafty.e("2d,dom,gras"));="" display="" tiles="" in="" the="" screen="" }="" <figure="" class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">         */&#10;        area: function () &#123;&#10;            //Get the center Point in the viewport&#10;            var center = this.centerAt();&#10;            var start = this.px2pos(-center.left + Crafty.viewport.width / 2, -center.top + Crafty.viewport.height / 2);&#10;            var end = this.px2pos(-center.left - Crafty.viewport.width / 2, -center.top - Crafty.viewport.height / 2);&#10;            return &#123;&#10;                x: &#123;&#10;                    start: start.x,&#10;                    end: end.x&#10;                &#125;,&#10;                y: &#123;&#10;                    start: start.y,&#10;                    end: end.y&#10;                &#125;&#10;            &#125;;&#10;        &#125;&#10;    &#125;&#10;&#125;);&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],38:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;),&#10;    document = window.document;&#10;&#10;Crafty.extend(&#123;&#10;    /**@&#10;     * #Crafty.audio&#10;     * @category Audio&#10;     *&#10;     * Add sound files and play them. Chooses best format for browser support.&#10;     * Due to the nature of HTML5 audio, three types of audio files will be&#10;     * required for cross-browser capabilities. These formats are MP3, Ogg and WAV.&#10;     * When sound was not muted on before pause, sound will be unmuted after unpause.&#10;     * When sound is muted Crafty.pause() does not have any effect on sound&#10;     *&#10;     * The maximum number of sounds that can be played simultaneously is defined by Crafty.audio.maxChannels.  The default value is 7.&#10;     */&#10;    audio: &#123;&#10;&#10;        sounds: &#123;&#125;,&#10;        supported: null,&#10;        codecs: &#123; // Chart from jPlayer&#10;            ogg: &#39;audio/ogg; codecs=&#34;vorbis&#34;&#39;, //OGG&#10;            wav: &#39;audio/wav; codecs=&#34;1&#34;&#39;, // PCM&#10;            webma: &#39;audio/webm; codecs=&#34;vorbis&#34;&#39;, // WEBM&#10;            mp3: &#39;audio/mpeg; codecs=&#34;mp3&#34;&#39;, //MP3&#10;            m4a: &#39;audio/mp4; codecs=&#34;mp4a.40.2&#34;&#39; // AAC / MP4&#10;        &#125;,&#10;        volume: 1, //Global Volume&#10;        muted: false,&#10;        paused: false,&#10;        playCheck: null,&#10;        /**&#10;         * Function to setup supported formats&#10;         **/&#10;        _canPlay: function () &#123;&#10;            this.supported = &#123;&#125;;&#10;            // Without support, no formats are supported&#10;            if (!Crafty.support.audio)&#10;                return;&#10;            var audio = this.audioElement(),&#10;                canplay;&#10;            for (var i in this.codecs) &#123;&#10;                canplay = audio.canPlayType(this.codecs[i]);&#10;                if (canplay !== &#34;&#34; &#38;&#38; canplay !== &#34;no&#34;) &#123;&#10;                    this.supported[i] = true;&#10;                &#125; else &#123;&#10;                    this.supported[i] = false;&#10;                &#125;&#10;            &#125;&#10;&#10;        &#125;,&#10;&#10;        /**@&#10;         * #Crafty.audio.supports&#10;         * @comp Crafty.audio&#10;         * @sign public this Crafty.audio.supports(String extension)&#10;         * @param extension - A file extension to check audio support for&#10;         *&#10;         * Return true if the browser thinks it can play the given file type, otherwise false&#10;         */&#10;        supports: function (extension) &#123;&#10;            // Build cache of supported formats, if necessary&#10;            if (this.supported === null)&#10;                this._canPlay();&#10;&#10;            if (this.supported[extension])&#10;                return true;&#10;            else&#10;                return false;&#10;        &#125;,&#10;&#10;        /**&#10;         * Function to get an Audio Element&#10;         **/&#10;        audioElement: function () &#123;&#10;            //IE does not support Audio Object&#10;            return typeof Audio !== &#39;undefined&#39; ? new Audio(&#34;&#34;) : document.createElement(&#39;audio&#39;);&#10;        &#125;,&#10;&#10;        /**@&#10;         * #Crafty.audio.create&#10;         * @comp Crafty.audio&#10;         * @sign public this Crafty.audio.create(String id, String url)&#10;         * @param id - A string to refer to sounds&#10;         * @param url - A string pointing to the sound file&#10;         *&#10;         * Creates an audio asset with the given id and resource.  `Crafty.audio.add` is a more flexible interface that allows cross-browser compatibility.&#10;         *&#10;         * If the sound file extension is not supported, returns false; otherwise, returns the audio asset.&#10;         */&#10;        create: function (id, path) &#123;&#10;            //check extension, return if not supported&#10;            var ext = path.substr(path.lastIndexOf(&#39;.&#39;) + 1).toLowerCase();&#10;            if (!this.supports(ext))&#10;                return false;&#10;&#10;            //initiate the audio element&#10;            var audio = this.audioElement();&#10;            audio.id = id;&#10;            audio.preload = &#34;auto&#34;;&#10;            audio.volume = Crafty.audio.volume;&#10;            audio.src = path;&#10;&#10;            //create an asset and metadata for the audio element&#10;            Crafty.asset(path, audio);&#10;            this.sounds[id] = &#123;&#10;                obj: audio,&#10;                played: 0,&#10;                volume: Crafty.audio.volume&#10;            &#125;;&#10;            return this.sounds[id];&#10;&#10;        &#125;,&#10;&#10;        /**@&#10;         * #Crafty.audio.add&#10;         * @comp Crafty.audio&#10;         * @sign public this Crafty.audio.add(String id, String url)&#10;         * @param id - A string to refer to sounds&#10;         * @param url - A string pointing to the sound file&#10;         * @sign public this Crafty.audio.add(String id, Array urls)&#10;         * @param urls - Array of urls pointing to different format of the same sound, selecting the first that is playable&#10;         * @sign public this Crafty.audio.add(Object map)&#10;         * @param map - key-value pairs where the key is the `id` and the value is either a `url` or `urls`&#10;         *&#10;         * Loads a sound to be played. Due to the nature of HTML5 audio,&#10;         * three types of audio files will be required for cross-browser capabilities.&#10;         * These formats are MP3, Ogg and WAV.&#10;         *&#10;         * Passing an array of URLs will determine which format the browser can play and select it over any other.&#10;         *&#10;         * Accepts an object where the key is the audio name and&#10;         * either a URL or an Array of URLs (to determine which type to use).&#10;         *&#10;         * The ID you use will be how you refer to that sound when using `Crafty.audio.play`.&#10;         *&#10;         * @example&#10;         *</span><br></pre></td></tr></table>

         * //adding audio from an object
         * Crafty.audio.add({
         *   shoot: ["sounds/shoot.wav",
         *           "sounds/shoot.mp3",
         *           "sounds/shoot.ogg"]
         * });
         *
         * //adding a single sound
         * Crafty.audio.add("walk", [
         * "sounds/walk.mp3",
         * "sounds/walk.ogg",
         * "sounds/walk.wav"
         * ]);
         *
         * //only one format
         * Crafty.audio.add("jump", "sounds/jump.mp3");
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;add: function (id, url) &#123;&#10;    if (!Crafty.support.audio)&#10;        return;&#10;&#10;    var src,&#10;        a;&#10;&#10;    if (arguments.length === 1 &#38;&#38; typeof id === &#34;object&#34;) &#123;&#10;        for (var i in id) &#123;&#10;            for (src in id[i]) &#123;&#10;                a = Crafty.audio.create(i, id[i][src]);&#10;                if (a)&#123;&#10;                    break;&#10;                &#125;&#10;            &#125;&#10;        &#125;&#10;    &#125;&#10;    if (typeof id === &#34;string&#34;) &#123;&#10;        if (typeof url === &#34;string&#34;) &#123;&#10;            a = Crafty.audio.create(id, url);&#10;        &#125;&#10;&#10;        if (typeof url === &#34;object&#34;) &#123;&#10;            for (src in url) &#123;&#10;                a = Crafty.audio.create(id, url[src]);&#10;                if (a)&#10;                    break;&#10;            &#125;&#10;        &#125;&#10;&#10;    &#125;&#10;    return a;&#10;&#125;,&#10;/**@&#10; * #Crafty.audio.play&#10; * @comp Crafty.audio&#10; * @sign public this Crafty.audio.play(String id)&#10; * @sign public this Crafty.audio.play(String id, Number repeatCount)&#10; * @sign public this Crafty.audio.play(String id, Number repeatCount, Number volume)&#10; * @param id - A string to refer to sounds&#10; * @param repeatCount - Repeat count for the file, where -1 stands for repeat forever.&#10; * @param volume - volume can be a number between 0.0 and 1.0&#10; * @returns The audio element used to play the sound.  Null if the call failed due to a lack of open channels.&#10; *&#10; * Will play a sound previously added by using the ID that was used in `Crafty.audio.add`.&#10; * Has a default maximum of 5 channels so that the same sound can play simultaneously unless all of the channels are playing.&#10;&#10; * *Note that the implementation of HTML5 Audio is buggy at best.*&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * Crafty.audio.play("walk");
         *
         * //play and repeat forever
         * Crafty.audio.play("backgroundMusic", -1);
         * Crafty.audio.play("explosion",1,0.5); //play sound once with volume of 50%
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;play: function (id, repeat, volume) &#123;&#10;    if (repeat === 0 || !Crafty.support.audio || !this.sounds[id])&#10;        return;&#10;    var s = this.sounds[id];&#10;    var c = this.getOpenChannel();&#10;    if (!c)&#10;        return null;&#10;    c.id = id;&#10;    c.repeat = repeat;&#10;    var a = c.obj;&#10;&#10;&#10;    c.volume = s.volume = s.obj.volume = volume || Crafty.audio.volume;&#10;&#10;    a.volume = s.volume;&#10;    a.src = s.obj.src;&#10;&#10;    if (this.muted)&#10;        a.volume = 0;&#10;    a.play();&#10;    s.played++;&#10;    c.onEnd = function () &#123;&#10;        if (s.played &#60; c.repeat || repeat == -1) &#123;&#10;            if (this.currentTime)&#10;                this.currentTime = 0;&#10;            this.play();&#10;            s.played++;&#10;        &#125; else &#123;&#10;            c.active = false;&#10;            this.pause();&#10;            this.removeEventListener(&#34;ended&#34;, c.onEnd, true);&#10;            this.currentTime = 0;&#10;            Crafty.trigger(&#34;SoundComplete&#34;, &#123;&#10;                id: c.id&#10;            &#125;);&#10;        &#125;&#10;&#10;    &#125;;&#10;    a.addEventListener(&#34;ended&#34;, c.onEnd, true);&#10;&#10;    return a;&#10;&#125;,&#10;&#10;&#10;&#10;/**@&#10; * #Crafty.audio.setChannels&#10; * @comp Crafty.audio&#10; * @sign public this Crafty.audio.setChannels(Number n)&#10; * @param n - The maximum number of channels&#10; */&#10;maxChannels: 7,&#10;setChannels: function (n) &#123;&#10;    this.maxChannels = n;&#10;    if (n &#60; this.channels.length)&#10;        this.channels.length = n;&#10;&#125;,&#10;&#10;channels: [],&#10;// Finds an unused audio element, marks it as in use, and return it.&#10;getOpenChannel: function () &#123;&#10;    for (var i = 0; i &#60; this.channels.length; i++) &#123;&#10;        var chan = this.channels[i];&#10;          /*&#10;           * Second test looks for stuff that&#39;s out of use,&#10;           * but fallen foul of Chromium bug 280417&#10;           */&#10;        if (chan.active === false ||&#10;              chan.obj.ended &#38;&#38; chan.repeat &#60;= this.sounds[chan.id].played) &#123;&#10;            chan.active = true;&#10;            return chan;&#10;        &#125;&#10;    &#125;&#10;    // If necessary, create a new element, unless we&#39;ve already reached the max limit&#10;    if (i &#60; this.maxChannels) &#123;&#10;        var c = &#123;&#10;            obj: this.audioElement(),&#10;            active: true,&#10;            // Checks that the channel is being used to play sound id&#10;            _is: function (id) &#123;&#10;                return this.id === id &#38;&#38; this.active;&#10;            &#125;&#10;        &#125;;&#10;        this.channels.push(c);&#10;        return c;&#10;    &#125;&#10;    // In that case, return null&#10;    return null;&#10;&#125;,&#10;&#10;/**@&#10; * #Crafty.audio.remove&#10; * @comp Crafty.audio&#10; * @sign public this Crafty.audio.remove([String id])&#10; * @param id - A string to refer to sounds&#10; *&#10; * Will stop the sound and remove all references to the audio object allowing the browser to free the memory.&#10; * If no id is given, all sounds will be removed.&#10; * &#10; * This function uses audio path set in Crafty.path in order to remove sound from the assets object.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * Crafty.audio.remove("walk");
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;remove: function (id) &#123;&#10;    if (!Crafty.support.audio)&#10;        return;&#10;&#10;    var s, filename, audioFolder = Crafty.paths().audio;&#10;&#10;    if (!id) &#123;&#10;        for (var i in this.sounds) &#123;&#10;            s = this.sounds[i];&#10;            filename = s.obj.src.split(&#39;/&#39;).pop();&#10;            Crafty.audio.stop(id);&#10;            delete Crafty.assets[audioFolder + filename];&#10;            delete Crafty.assets[s.obj.src];&#10;            delete Crafty.audio.sounds[id];&#10;        &#125;&#10;        return;&#10;    &#125;&#10;    if (!this.sounds[id])&#10;        return;&#10;&#10;    s = this.sounds[id];&#10;    filename = s.obj.src.split(&#39;/&#39;).pop();&#10;    Crafty.audio.stop(id);&#10;    delete Crafty.assets[audioFolder + filename];&#10;    delete Crafty.assets[s.obj.src];&#10;    delete Crafty.audio.sounds[id];&#10;&#125;,&#10;/**@&#10; * #Crafty.audio.stop&#10; * @comp Crafty.audio&#10; * @sign public this Crafty.audio.stop([Number ID])&#10; *&#10; * Stops any playing sound. if id is not set, stop all sounds which are playing&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * //all sounds stopped playing now
         * Crafty.audio.stop();
         *
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;stop: function (id) &#123;&#10;    if (!Crafty.support.audio)&#10;        return;&#10;    for (var i in this.channels) &#123;&#10;        c = this.channels[i];&#10;        if ( (!id &#38;&#38; c.active) || c._is(id) ) &#123;&#10;            c.active = false;&#10;            c.obj.pause();&#10;        &#125;&#10;    &#125;&#10;    return;&#10;&#125;,&#10;/**&#10; * #Crafty.audio._mute&#10; * @comp Crafty.audio&#10; * @sign public this Crafty.audio._mute([Boolean mute])&#10; *&#10; * Mute or unmute every Audio instance that is playing.&#10; */&#10;_mute: function (mute) &#123;&#10;    if (!Crafty.support.audio)&#10;        return;&#10;    var c;&#10;    for (var i in this.channels) &#123;&#10;        c = this.channels[i];&#10;        c.obj.volume = mute ? 0 : c.volume;&#10;    &#125;&#10;    this.muted = mute;&#10;&#125;,&#10;/**@&#10; * #Crafty.audio.toggleMute&#10; * @comp Crafty.audio&#10; * @sign public this Crafty.audio.toggleMute()&#10; *&#10; * Mute or unmute every Audio instance that is playing. Toggles between&#10; * pausing or playing depending on the state.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * //toggle mute and unmute depending on current state
         * Crafty.audio.toggleMute();
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;toggleMute: function () &#123;&#10;    if (!this.muted) &#123;&#10;        this._mute(true);&#10;    &#125; else &#123;&#10;        this._mute(false);&#10;    &#125;&#10;&#10;&#125;,&#10;/**@&#10; * #Crafty.audio.mute&#10; * @comp Crafty.audio&#10; * @sign public this Crafty.audio.mute()&#10; *&#10; * Mute every Audio instance that is playing.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * Crafty.audio.mute();
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;mute: function () &#123;&#10;    this._mute(true);&#10;&#125;,&#10;/**@&#10; * #Crafty.audio.unmute&#10; * @comp Crafty.audio&#10; * @sign public this Crafty.audio.unmute()&#10; *&#10; * Unmute every Audio instance that is playing.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * Crafty.audio.unmute();
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;unmute: function () &#123;&#10;    this._mute(false);&#10;&#125;,&#10;&#10;/**@&#10; * #Crafty.audio.pause&#10; * @comp Crafty.audio&#10; * @sign public this Crafty.audio.pause(string ID)&#10; * @param &#123;string&#125; id - The id of the audio object to pause&#10; *&#10; * Pause the Audio instance specified by id param.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * Crafty.audio.pause('music');
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; */&#10;pause: function (id) &#123;&#10;    if (!Crafty.support.audio || !id || !this.sounds[id])&#10;        return;&#10;    var c;&#10;    for (var i in this.channels) &#123;&#10;        c = this.channels[i];&#10;        if (c._is(id) &#38;&#38; !c.obj.paused)&#10;            c.obj.pause();&#10;    &#125;&#10;&#10;&#125;,&#10;&#10;/**@&#10; * #Crafty.audio.unpause&#10; * @comp Crafty.audio&#10; * @sign public this Crafty.audio.unpause(string ID)&#10; * @param &#123;string&#125; id - The id of the audio object to unpause&#10; *&#10; * Resume playing the Audio instance specified by id param.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * Crafty.audio.unpause('music');
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; */&#10;unpause: function (id) &#123;&#10;    if (!Crafty.support.audio || !id || !this.sounds[id])&#10;        return;&#10;    var c;&#10;    for (var i in this.channels) &#123;&#10;        c = this.channels[i];&#10;        if (c._is(id) &#38;&#38; c.obj.paused)&#10;            c.obj.play();&#10;    &#125;&#10;&#125;,&#10;&#10;/**@&#10; * #Crafty.audio.togglePause&#10; * @comp Crafty.audio&#10; * @sign public this Crafty.audio.togglePause(string ID)&#10; * @param &#123;string&#125; id - The id of the audio object to pause/&#10; *&#10; * Toggle the pause status of the Audio instance specified by id param.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * Crafty.audio.togglePause('music');
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; */&#10;togglePause: function (id) &#123;&#10;    if (!Crafty.support.audio || !id || !this.sounds[id])&#10;        return;&#10;    var c;&#10;    for (var i in this.channels) &#123;&#10;        c = this.channels[i];&#10;        if (c._is(id)) &#123;&#10;            if (c.obj.paused) &#123;&#10;                c.obj.play();&#10;            &#125; else &#123;&#10;                c.obj.pause();&#10;            &#125;&#10;        &#125;&#10;    &#125;&#10;&#125;,&#10;&#10;/**@&#10; * #Crafty.audio.isPlaying&#10; * @comp Crafty.audio&#10; * @sign public Boolean Crafty.audio.isPlaying(string ID)&#10; * @param &#123;string&#125; id - The id of the audio object&#10; * @return a Boolean indicating whether the audio is playing or not&#10; *&#10; * Check if audio with the given ID is playing or not (on at least one channel).&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * var isPlaying = Crafty.audio.isPlaying('music');
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">         *&#10;         */&#10;        isPlaying: function(id) &#123;&#10;            if (!Crafty.support.audio)&#10;                return false;&#10;&#10;            for (var i in this.channels) &#123;&#10;                if (this.channels[i]._is(id))&#10;                    return true;&#10;            &#125;&#10;&#10;            return false;&#10;        &#125;&#10;    &#125;&#10;&#125;);&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],39:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;),&#10;    HashMap = require(&#39;./spatial-grid.js&#39;);&#10;&#10;&#10;&#10;/**@&#10; * #Crafty.map&#10; * @category 2D&#10; * Functions related with querying entities.&#10; * @see Crafty.HashMap&#10; */&#10;Crafty.map = new HashMap();&#10;var M = Math,&#10;    Mc = M.cos,&#10;    Ms = M.sin,&#10;    PI = M.PI,&#10;    DEG_TO_RAD = PI / 180;&#10;&#10;/**@&#10; * #2D&#10; * @category 2D&#10; * Component for any entity that has a position on the stage.&#10; * @trigger Move - when the entity has moved - &#123; _x:Number, _y:Number, _w:Number, _h:Number &#125; - Old position&#10; * @trigger Invalidate - when the entity needs to be redrawn&#10; * @trigger Rotate - when the entity is rotated - &#123; cos:Number, sin:Number, deg:Number, rad:Number, o: &#123;x:Number, y:Number&#125;&#125;&#10; * @trigger Reorder - when the entity&#39;s z index has changed&#10; */&#10;Crafty.c(&#34;2D&#34;, &#123;&#10;    /**@&#10;     * #.x&#10;     * @comp 2D&#10;     * The `x` position on the stage. When modified, will automatically be redrawn.&#10;     * Is actually a getter/setter so when using this value for calculations and not modifying it,&#10;     * use the `._x` property.&#10;     * @see ._attr&#10;     */&#10;    _x: 0,&#10;    /**@&#10;     * #.y&#10;     * @comp 2D&#10;     * The `y` position on the stage. When modified, will automatically be redrawn.&#10;     * Is actually a getter/setter so when using this value for calculations and not modifying it,&#10;     * use the `._y` property.&#10;     * @see ._attr&#10;     */&#10;    _y: 0,&#10;    /**@&#10;     * #.w&#10;     * @comp 2D&#10;     * The width of the entity. When modified, will automatically be redrawn.&#10;     * Is actually a getter/setter so when using this value for calculations and not modifying it,&#10;     * use the `._w` property.&#10;     *&#10;     * Changing this value is not recommended as canvas has terrible resize quality and DOM will just clip the image.&#10;     * @see ._attr&#10;     */&#10;    _w: 0,&#10;    /**@&#10;     * #.h&#10;     * @comp 2D&#10;     * The height of the entity. When modified, will automatically be redrawn.&#10;     * Is actually a getter/setter so when using this value for calculations and not modifying it,&#10;     * use the `._h` property.&#10;     *&#10;     * Changing this value is not recommended as canvas has terrible resize quality and DOM will just clip the image.&#10;     * @see ._attr&#10;     */&#10;    _h: 0,&#10;    /**@&#10;     * #.z&#10;     * @comp 2D&#10;     * The `z` index on the stage. When modified, will automatically be redrawn.&#10;     * Is actually a getter/setter so when using this value for calculations and not modifying it,&#10;     * use the `._z` property.&#10;     *&#10;     * A higher `z` value will be closer to the front of the stage. A smaller `z` value will be closer to the back.&#10;     * A global Z index is produced based on its `z` value as well as the GID (which entity was created first).&#10;     * Therefore entities will naturally maintain order depending on when it was created if same z value.&#10;     *&#10;     * `z` is required to be an integer, e.g. `z=11.2` is not allowed.&#10;     * @see ._attr&#10;     */&#10;    _z: 0,&#10;    /**@&#10;     * #.rotation&#10;     * @comp 2D&#10;     * The rotation state of the entity, in clockwise degrees.&#10;     * `this.rotation = 0` sets it to its original orientation; `this.rotation = 10`&#10;     * sets it to 10 degrees clockwise from its original orientation;&#10;     * `this.rotation = -10` sets it to 10 degrees counterclockwise from its&#10;     * original orientation, etc.&#10;     *&#10;     * When modified, will automatically be redrawn. Is actually a getter/setter&#10;     * so when using this value for calculations and not modifying it,&#10;     * use the `._rotation` property.&#10;     *&#10;     * `this.rotation = 0` does the same thing as `this.rotation = 360` or `720` or&#10;     * `-360` or `36000` etc. So you can keep increasing or decreasing the angle for continuous&#10;     * rotation. (Numerical errors do not occur until you get to millions of degrees.)&#10;     *&#10;     * The default is to rotate the entity around its (initial) top-left corner; use&#10;     * `.origin()` to change that.&#10;     *&#10;     * @see ._attr, .origin&#10;     */&#10;    _rotation: 0,&#10;    /**@&#10;     * #.alpha&#10;     * @comp 2D&#10;     * Transparency of an entity. Must be a decimal value between 0.0 being fully transparent to 1.0 being fully opaque.&#10;     */&#10;    _alpha: 1.0,&#10;    /**@&#10;     * #.visible&#10;     * @comp 2D&#10;     * If the entity is visible or not. Accepts a true or false value.&#10;     * Can be used for optimization by setting an entities visibility to false when not needed to be drawn.&#10;     *&#10;     * The entity will still exist and can be collided with but just won&#39;t be drawn.&#10;     */&#10;    _visible: true,&#10;&#10;    /**@&#10;     * #._globalZ&#10;     * @comp 2D&#10;     * When two entities overlap, the one with the larger `_globalZ` will be on top of the other.&#10;     */&#10;    _globalZ: null,&#10;&#10;    _origin: null,&#10;    _mbr: null,&#10;    _entry: null,&#10;    _children: null,&#10;    _parent: null,&#10;    _changed: false,&#10;&#10;    &#10;    // Setup   all the properties that we need to define&#10;    _2D_property_definitions: &#123;&#10;        x: &#123;&#10;            set: function (v) &#123;&#10;                this._attr(&#39;_x&#39;, v);&#10;            &#125;,&#10;            get: function () &#123;&#10;                return this._x;&#10;            &#125;,&#10;            configurable: true,&#10;            enumerable: true&#10;        &#125;,&#10;        _x: &#123;enumerable:false&#125;,&#10;&#10;        y: &#123;&#10;            set: function (v) &#123;&#10;                this._attr(&#39;_y&#39;, v);&#10;            &#125;,&#10;            get: function () &#123;&#10;                return this._y;&#10;            &#125;,&#10;            configurable: true,&#10;            enumerable: true&#10;        &#125;,&#10;        _y: &#123;enumerable:false&#125;,&#10;&#10;        w: &#123;&#10;            set: function (v) &#123;&#10;                this._attr(&#39;_w&#39;, v);&#10;            &#125;,&#10;            get: function () &#123;&#10;                return this._w;&#10;            &#125;,&#10;            configurable: true,&#10;            enumerable: true&#10;        &#125;,&#10;        _w: &#123;enumerable:false&#125;,&#10;&#10;        h: &#123;&#10;            set: function (v) &#123;&#10;                this._attr(&#39;_h&#39;, v);&#10;            &#125;,&#10;            get: function () &#123;&#10;                return this._h;&#10;            &#125;,&#10;            configurable: true,&#10;            enumerable: true&#10;        &#125;,&#10;        _h: &#123;enumerable:false&#125;,&#10;&#10;        z: &#123;&#10;            set: function (v) &#123;&#10;                this._attr(&#39;_z&#39;, v);&#10;            &#125;,&#10;            get: function () &#123;&#10;                return this._z;&#10;            &#125;,&#10;            configurable: true,&#10;            enumerable: true&#10;        &#125;,&#10;        _z: &#123;enumerable:false&#125;,&#10;&#10;        rotation: &#123;&#10;            set: function (v) &#123;&#10;                this._attr(&#39;_rotation&#39;, v);&#10;            &#125;,&#10;            get: function () &#123;&#10;                return this._rotation;&#10;            &#125;,&#10;            configurable: true,&#10;            enumerable: true&#10;        &#125;,&#10;        _rotation: &#123;enumerable:false&#125;,&#10;&#10;        alpha: &#123;&#10;            set: function (v) &#123;&#10;                this._attr(&#39;_alpha&#39;, v);&#10;            &#125;,&#10;            get: function () &#123;&#10;                return this._alpha;&#10;            &#125;,&#10;            configurable: true,&#10;            enumerable: true&#10;        &#125;,&#10;        _alpha: &#123;enumerable:false&#125;,&#10;&#10;        visible: &#123;&#10;            set: function (v) &#123;&#10;                this._attr(&#39;_visible&#39;, v);&#10;            &#125;,&#10;            get: function () &#123;&#10;                return this._visible;&#10;            &#125;,&#10;            configurable: true,&#10;            enumerable: true&#10;        &#125;,&#10;        _visible: &#123;enumerable:false&#125;&#10;&#10;    &#125;,&#10;&#10;    _define2DProperties: function () &#123;&#10;        for (var prop in this._2D_property_definitions)&#123;&#10;            Object.defineProperty(this, prop, this._2D_property_definitions[prop]);&#10;        &#125;&#10;    &#125;,&#10;&#10;    init: function () &#123;&#10;        this._globalZ = this[0];&#10;        this._origin = &#123;&#10;            x: 0,&#10;            y: 0&#10;        &#125;;&#10;&#10;        // offsets for the basic bounding box&#10;        this._bx1 = 0;&#10;        this._bx2 = 0;&#10;        this._by1 = 0;&#10;        this._by2 = 0;&#10;&#10;        this._children = [];&#10;&#10;        &#10;        // create setters and getters that associate properties such as x/_x&#10;        this._define2DProperties();&#10;        &#10;&#10;        //insert self into the HashMap&#10;        this._entry = Crafty.map.insert(this);&#10;&#10;        //when object changes, update HashMap&#10;        this.bind(&#34;Move&#34;, function (e) &#123;&#10;            // Choose the largest bounding region that exists&#10;            var area = this._cbr || this._mbr || this;&#10;            this._entry.update(area);&#10;            // Move children (if any) by the same amount&#10;            if (this._children.length &#62; 0) &#123;&#10;                this._cascade(e);&#10;            &#125;&#10;        &#125;);&#10;&#10;        this.bind(&#34;Rotate&#34;, function (e) &#123;&#10;            // Choose the largest bounding region that exists&#10;            var old = this._cbr || this._mbr || this;&#10;            this._entry.update(old);&#10;            // Rotate children (if any) by the same amount&#10;            if (this._children.length &#62; 0) &#123;&#10;                this._cascade(e);&#10;            &#125;&#10;        &#125;);&#10;&#10;        //when object is removed, remove from HashMap and destroy attached children&#10;        this.bind(&#34;Remove&#34;, function () &#123;&#10;            if (this._children) &#123;&#10;                for (var i = 0; i &#60; this._children.length; i++) &#123;&#10;                    // delete the child&#39;s _parent link, or else the child will splice itself out of&#10;                    // this._children while destroying itself (which messes up this for-loop iteration).&#10;                    delete this._children[i]._parent;&#10;&#10;                    // Destroy child if possible (It&#39;s not always possible, e.g. the polygon attached&#10;                    // by areaMap has no .destroy(), it will just get garbage-collected.)&#10;                    if (this._children[i].destroy) &#123;&#10;                        this._children[i].destroy();&#10;                    &#125;&#10;                &#125;&#10;                this._children = [];&#10;            &#125;&#10;&#10;            if (this._parent) &#123;&#10;                this._parent.detach(this);&#10;            &#125;&#10;&#10;            Crafty.map.remove(this);&#10;&#10;            this.detach();&#10;        &#125;);&#10;    &#125;,&#10;&#10;&#10;    /**@&#10;     * #.offsetBoundary&#10;     * @comp 2D&#10;     * Extends the MBR of the entity by a specified amount.&#10;     * &#10;     * @trigger BoundaryOffset - when the MBR offset changes&#10;     * @sign public this .offsetBoundary(Number dx1, Number dy1, Number dx2, Number dy2)&#10;     * @param dx1 - Extends the MBR to the left by this amount&#10;     * @param dy1 - Extends the MBR upward by this amount&#10;     * @param dx2 - Extends the MBR to the right by this amount&#10;     * @param dy2 - Extends the MBR downward by this amount&#10;     *&#10;     * @sign public this .offsetBoundary(Number offset)&#10;     * @param offset - Extend the MBR in all directions by this amount&#10;     *&#10;     * You would most likely use this function to ensure that custom canvas rendering beyond the extent of the entity&#39;s normal bounds is not clipped.&#10;     */&#10;    offsetBoundary: function(x1, y1, x2, y2)&#123;&#10;        if (arguments.length === 1)&#10;            y1 = x2 = y2 = x1;&#10;        this._bx1 = x1;&#10;        this._bx2 = x2;&#10;        this._by1 = y1;&#10;        this._by2 = y2;&#10;        this.trigger(&#34;BoundaryOffset&#34;);&#10;        this._calculateMBR();&#10;        return this;&#10;    &#125;,&#10;&#10;    /**&#10;     * Calculates the MBR when rotated some number of radians about an origin point o.&#10;     * Necessary on a rotation, or a resize&#10;     */&#10;&#10;    _calculateMBR: function () &#123;&#10;        var ox = this._origin.x + this._x,&#10;            oy = this._origin.y + this._y,&#10;            rad = -this._rotation * DEG_TO_RAD;&#10;        // axis-aligned (unrotated) coordinates, relative to the origin point&#10;        var dx1 = this._x - this._bx1 - ox,&#10;            dx2 = this._x + this._w + this._bx2 - ox,&#10;            dy1 = this._y - this._by1 - oy,&#10;            dy2 = this._y + this._h + this._by2 - oy;&#10;&#10;        var ct = Math.cos(rad),&#10;            st = Math.sin(rad);&#10;        // Special case 90 degree rotations to prevent rounding problems&#10;        ct = (ct &#60; 1e-10 &#38;&#38; ct &#62; -1e-10) ? 0 : ct;&#10;        st = (st &#60; 1e-10 &#38;&#38; st &#62; -1e-10) ? 0 : st;&#10;&#10;        // Calculate the new points relative to the origin, then find the new (absolute) bounding coordinates!&#10;        var x0 =   dx1 * ct + dy1 * st,&#10;            y0 = - dx1 * st + dy1 * ct,&#10;            x1 =   dx2 * ct + dy1 * st,&#10;            y1 = - dx2 * st + dy1 * ct,&#10;            x2 =   dx2 * ct + dy2 * st,&#10;            y2 = - dx2 * st + dy2 * ct,&#10;            x3 =   dx1 * ct + dy2 * st,&#10;            y3 = - dx1 * st + dy2 * ct,&#10;            minx = Math.floor(Math.min(x0, x1, x2, x3) + ox),&#10;            miny = Math.floor(Math.min(y0, y1, y2, y3) + oy),&#10;            maxx = Math.ceil(Math.max(x0, x1, x2, x3) + ox),&#10;            maxy = Math.ceil(Math.max(y0, y1, y2, y3) + oy);&#10;        if (!this._mbr) &#123;&#10;            this._mbr = &#123;&#10;                _x: minx,&#10;                _y: miny,&#10;                _w: maxx - minx,&#10;                _h: maxy - miny&#10;            &#125;;&#10;        &#125; else &#123;&#10;            this._mbr._x = minx;&#10;            this._mbr._y = miny;&#10;            this._mbr._w = maxx - minx;&#10;            this._mbr._h = maxy - miny;&#10;        &#125;&#10;&#10;        // If a collision hitbox exists AND sits outside the entity, find a bounding box for both.&#10;        // `_cbr` contains information about a bounding circle of the hitbox. &#10;        // The bounds of `_cbr` will be the union of the `_mbr` and the bounding box of that circle.&#10;        // This will not be a minimal region, but since it&#39;s only used for the broad phase pass it&#39;s good enough. &#10;        //&#10;        // cbr is calculated by the `_checkBounds` method of the &#34;Collision&#34; component&#10;        if (this._cbr) &#123;&#10;            var cbr = this._cbr;&#10;            var cx = cbr.cx, cy = cbr.cy, r = cbr.r;&#10;            var cx2 = ox + (cx + this._x - ox) * ct + (cy + this._y - oy) * st;&#10;            var cy2 = oy - (cx + this._x - ox) * st + (cy + this._y - oy) * ct;&#10;            cbr._x = Math.min(cx2 - r, minx);&#10;            cbr._y = Math.min(cy2 - r, miny);&#10;            cbr._w = Math.max(cx2 + r, maxx) - cbr._x;&#10;            cbr._h = Math.max(cy2 + r, maxy) - cbr._y;&#10;        &#125;&#10;&#10;    &#125;,&#10;&#10;    /**&#10;     * Handle changes that need to happen on a rotation&#10;     */&#10;    _rotate: function (v) &#123;&#10;        var theta = -1 * (v % 360); //angle always between 0 and 359&#10;        var difference = this._rotation - v;&#10;        // skip if there&#39;s no rotation!&#10;        if (difference === 0)&#10;            return;&#10;        else&#10;            this._rotation = v;&#10;&#10;        //Calculate the new MBR&#10;        var rad = theta * DEG_TO_RAD,&#10;            o = &#123;&#10;                x: this._origin.x + this._x,&#10;                y: this._origin.y + this._y&#10;            &#125;;&#10;&#10;        this._calculateMBR();&#10;&#10;&#10;        //trigger &#34;Rotate&#34; event&#10;        var drad = difference * DEG_TO_RAD,&#10;            // ct = Math.cos(rad),&#10;            // st = Math.sin(rad),&#10;            cos = Math.cos(drad),&#10;            sin = Math.sin(drad);&#10;&#10;        this.trigger(&#34;Rotate&#34;, &#123;&#10;            cos: (-1e-10 &#60; cos &#38;&#38; cos &#60; 1e-10) ? 0 : cos, // Special case 90 degree rotations to prevent rounding problems&#10;            sin: (-1e-10 &#60; sin &#38;&#38; sin &#60; 1e-10) ? 0 : sin, // Special case 90 degree rotations to prevent rounding problems&#10;            deg: difference,&#10;            rad: drad,&#10;            o: o&#10;        &#125;);&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.area&#10;     * @comp 2D&#10;     * @sign public Number .area(void)&#10;     * Calculates the area of the entity&#10;     */&#10;    area: function () &#123;&#10;        return this._w * this._h;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.intersect&#10;     * @comp 2D&#10;     * @sign public Boolean .intersect(Number x, Number y, Number w, Number h)&#10;     * @param x - X position of the rect&#10;     * @param y - Y position of the rect&#10;     * @param w - Width of the rect&#10;     * @param h - Height of the rect&#10;     * @sign public Boolean .intersect(Object rect)&#10;     * @param rect - An object that must have the `_x, _y, _w, _h` values as properties&#10;     *&#10;     * Determines if this entity intersects a rectangle.  If the entity is rotated, its MBR is used for the test.&#10;     */&#10;    intersect: function (x, y, w, h) &#123;&#10;        var rect, mbr = this._mbr || this;&#10;        if (typeof x === &#34;object&#34;) &#123;&#10;            rect = x;&#10;        &#125; else &#123;&#10;            rect = &#123;&#10;                _x: x,&#10;                _y: y,&#10;                _w: w,&#10;                _h: h&#10;            &#125;;&#10;        &#125;&#10;&#10;        return mbr._x &#60; rect._x + rect._w &#38;&#38; mbr._x + mbr._w &#62; rect._x &#38;&#38;&#10;            mbr._y &#60; rect._y + rect._h &#38;&#38; mbr._y + mbr._h &#62; rect._y;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.within&#10;     * @comp 2D&#10;     * @sign public Boolean .within(Number x, Number y, Number w, Number h)&#10;     * @param x - X position of the rect&#10;     * @param y - Y position of the rect&#10;     * @param w - Width of the rect&#10;     * @param h - Height of the rect&#10;     * @sign public Boolean .within(Object rect)&#10;     * @param rect - An object that must have the `_x, _y, _w, _h` values as properties&#10;     *&#10;     * Determines if this current entity is within another rectangle.&#10;     */&#10;    within: function (x, y, w, h) &#123;&#10;        var rect, mbr = this._mbr || this;&#10;        if (typeof x === &#34;object&#34;) &#123;&#10;            rect = x;&#10;        &#125; else &#123;&#10;            rect = &#123;&#10;                _x: x,&#10;                _y: y,&#10;                _w: w,&#10;                _h: h&#10;            &#125;;&#10;        &#125;&#10;&#10;        return rect._x &#60;= mbr._x &#38;&#38; rect._x + rect._w &#62;= mbr._x + mbr._w &#38;&#38;&#10;            rect._y &#60;= mbr._y &#38;&#38; rect._y + rect._h &#62;= mbr._y + mbr._h;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.contains&#10;     * @comp 2D&#10;     * @sign public Boolean .contains(Number x, Number y, Number w, Number h)&#10;     * @param x - X position of the rect&#10;     * @param y - Y position of the rect&#10;     * @param w - Width of the rect&#10;     * @param h - Height of the rect&#10;     * @sign public Boolean .contains(Object rect)&#10;     * @param rect - An object that must have the `_x, _y, _w, _h` values as properties.&#10;     *&#10;     * Determines if the rectangle is within the current entity.  If the entity is rotated, its MBR is used for the test.&#10;     */&#10;    contains: function (x, y, w, h) &#123;&#10;        var rect, mbr = this._mbr || this;&#10;        if (typeof x === &#34;object&#34;) &#123;&#10;            rect = x;&#10;        &#125; else &#123;&#10;            rect = &#123;&#10;                _x: x,&#10;                _y: y,&#10;                _w: w,&#10;                _h: h&#10;            &#125;;&#10;        &#125;&#10;&#10;        return rect._x &#62;= mbr._x &#38;&#38; rect._x + rect._w &#60;= mbr._x + mbr._w &#38;&#38;&#10;            rect._y &#62;= mbr._y &#38;&#38; rect._y + rect._h &#60;= mbr._y + mbr._h;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.pos&#10;     * @comp 2D&#10;     * @sign public Object .pos([Object pos])&#10;     * @param pos - an object to use as output&#10;     *&#10;     * @returns An object with this entity&#39;s `_x`, `_y`, `_w`, and `_h` values. &#10;     *          If an object is passed in, it will be reused rather than creating a new object.&#10;     *&#10;     * @note The keys have an underscore prefix. This is due to the x, y, w, h&#10;     * properties being setters and getters that wrap the underlying properties with an underscore (_x, _y, _w, _h).&#10;     */&#10;    pos: function (pos) &#123;&#10;        pos = pos || &#123;&#125;;&#10;        pos._x = (this._x);&#10;        pos._y = (this._y);&#10;        pos._w = (this._w);&#10;        pos._h = (this._h);&#10;        return pos;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.mbr&#10;     * @comp 2D&#10;     * @sign public Object .mbr()&#10;     * Returns the minimum bounding rectangle. If there is no rotation&#10;     * on the entity it will return the rect.&#10;     */&#10;    mbr: function (mbr) &#123;&#10;        mbr = mbr || &#123;&#125;;&#10;&#9;&#9;if (!this._mbr) &#123;&#10;&#9;&#9;&#9;return this.pos(mbr);&#10;&#9;&#9;&#125; else &#123;&#10;            mbr._x = (this._mbr._x);&#10;            mbr._y = (this._mbr._y);&#10;            mbr._w = (this._mbr._w);&#10;            mbr._h = (this._mbr._h);&#10;            return mbr;&#10;        &#125;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.isAt&#10;     * @comp 2D&#10;     * @sign public Boolean .isAt(Number x, Number y)&#10;     * @param x - X position of the point&#10;     * @param y - Y position of the point&#10;     *&#10;     * Determines whether a point is contained by the entity. Unlike other methods,&#10;     * an object can&#39;t be passed. The arguments require the x and y value.&#10;     *&#10;     * The given point is tested against the first of the following that exists: a mapArea associated with &#34;Mouse&#34;, the hitarea associated with &#34;Collision&#34;, or the object&#39;s MBR.&#10;     */&#10;    isAt: function (x, y) &#123;&#10;        if (this.mapArea) &#123;&#10;            return this.mapArea.containsPoint(x, y);&#10;        &#125; else if (this.map) &#123;&#10;            return this.map.containsPoint(x, y);&#10;        &#125;&#10;        var mbr = this._mbr || this;&#10;        return mbr._x &#60;= x &#38;&#38; mbr._x + mbr._w &#62;= x &#38;&#38;&#10;            mbr._y &#60;= y &#38;&#38; mbr._y + mbr._h &#62;= y;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.move&#10;     * @comp 2D&#10;     * @sign public this .move(String dir, Number by)&#10;     * @param dir - Direction to move (n,s,e,w,ne,nw,se,sw)&#10;     * @param by - Amount to move in the specified direction&#10;     *&#10;     * Quick method to move the entity in a direction (n, s, e, w, ne, nw, se, sw) by an amount of pixels.&#10;     */&#10;    move: function (dir, by) &#123;&#10;        if (dir.charAt(0) === &#39;n&#39;) this.y -= by;&#10;        if (dir.charAt(0) === &#39;s&#39;) this.y += by;&#10;        if (dir === &#39;e&#39; || dir.charAt(1) === &#39;e&#39;) this.x += by;&#10;        if (dir === &#39;w&#39; || dir.charAt(1) === &#39;w&#39;) this.x -= by;&#10;&#10;        return this;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.shift&#10;     * @comp 2D&#10;     * @sign public this .shift(Number x, Number y, Number w, Number h)&#10;     * @param x - Amount to move X&#10;     * @param y - Amount to move Y&#10;     * @param w - Amount to widen&#10;     * @param h - Amount to increase height&#10;     *&#10;     * Shift or move the entity by an amount. Use negative values&#10;     * for an opposite direction.&#10;     */&#10;    shift: function (x, y, w, h) &#123;&#10;        if (x) this.x += x;&#10;        if (y) this.y += y;&#10;        if (w) this.w += w;&#10;        if (h) this.h += h;&#10;&#10;        return this;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #._cascade&#10;     * @comp 2D&#10;     * @sign public void ._cascade(e)&#10;     * @param e - An object describing the motion&#10;     *&#10;     * Move or rotate the entity&#39;s children according to a certain motion.&#10;     * This method is part of a function bound to &#34;Move&#34;: It is used&#10;     * internally for ensuring that when a parent moves, the child also&#10;     * moves in the same way.&#10;     */&#10;    _cascade: function (e) &#123;&#10;        if (!e) return; //no change in position&#10;        var i = 0,&#10;            children = this._children,&#10;            l = children.length,&#10;            obj;&#10;        //rotation&#10;        if ((&#34;cos&#34; in e) || (&#34;sin&#34; in e)) &#123;&#10;            for (; i &#60; l; ++i) &#123;&#10;                obj = children[i];&#10;                if (&#39;rotate&#39; in obj) obj.rotate(e);&#10;            &#125;&#10;        &#125; else &#123;&#10;            //use current position&#10;            var dx = this._x - e._x,&#10;                dy = this._y - e._y,&#10;                dw = this._w - e._w,&#10;                dh = this._h - e._h;&#10;&#10;            for (; i &#60; l; ++i) &#123;&#10;                obj = children[i];&#10;                obj.shift(dx, dy, dw, dh);&#10;            &#125;&#10;        &#125;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.attach&#10;     * @comp 2D&#10;     * @sign public this .attach(Entity obj[, .., Entity objN])&#10;     * @param obj - Child entity(s) to attach&#10;     *&#10;     * Sets one or more entities to be children, with the current entity (`this`)&#10;     * as the parent. When the parent moves or rotates, its children move or&#10;     * rotate by the same amount. (But not vice-versa: If you move a child, it&#10;     * will not move the parent.) When the parent is destroyed, its children are&#10;     * destroyed.&#10;     *&#10;     * For any entity, `this._children` is the array of its children entity&#10;     * objects (if any), and `this._parent` is its parent entity object (if any).&#10;     *&#10;     * As many objects as wanted can be attached, and a hierarchy of objects is&#10;     * possible by attaching.&#10;     */&#10;    attach: function () &#123;&#10;        var i = 0,&#10;            arg = arguments,&#10;            l = arguments.length,&#10;            obj;&#10;        for (; i &#60; l; ++i) &#123;&#10;            obj = arg[i];&#10;            if (obj._parent) &#123;&#10;                obj._parent.detach(obj);&#10;            &#125;&#10;            obj._parent = this;&#10;            this._children.push(obj);&#10;        &#125;&#10;&#10;        return this;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.detach&#10;     * @comp 2D&#10;     * @sign public this .detach([Entity obj])&#10;     * @param obj - The entity to detach. Left blank will remove all attached entities&#10;     *&#10;     * Stop an entity from following the current entity. Passing no arguments will stop&#10;     * every entity attached.&#10;     */&#10;    detach: function (obj) &#123;&#10;        var i;&#10;        //if nothing passed, remove all attached objects&#10;        if (!obj) &#123;&#10;            for (i = 0; i &#60; this._children.length; i++) &#123;&#10;                this._children[i]._parent = null;&#10;            &#125;&#10;            this._children = [];&#10;            return this;&#10;        &#125;&#10;&#10;        //if obj passed, find the handler and unbind&#10;        for (i = 0; i &#60; this._children.length; i++) &#123;&#10;            if (this._children[i] == obj) &#123;&#10;                this._children.splice(i, 1);&#10;            &#125;&#10;        &#125;&#10;        obj._parent = null;&#10;&#10;        return this;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.origin&#10;     * @comp 2D&#10;     *&#10;     * @sign public this .origin(Number x, Number y)&#10;     * @param x - Pixel value of origin offset on the X axis&#10;     * @param y - Pixel value of origin offset on the Y axis&#10;     *&#10;     * @sign public this .origin(String offset)&#10;     * @param offset - Combination of center, top, bottom, middle, left and right&#10;     *&#10;     * Set the origin point of an entity for it to rotate around.&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * this.origin("top left")
     * this.origin("center")
     * this.origin("bottom right")
     * this.origin("middle right")
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; * @see .rotation&#10; */&#10;origin: function (x, y) &#123;&#10;    //text based origin&#10;    if (typeof x === &#34;string&#34;) &#123;&#10;        if (x === &#34;centre&#34; || x === &#34;center&#34; || x.indexOf(&#39; &#39;) === -1) &#123;&#10;            x = this._w / 2;&#10;            y = this._h / 2;&#10;        &#125; else &#123;&#10;            var cmd = x.split(&#39; &#39;);&#10;            if (cmd[0] === &#34;top&#34;) y = 0;&#10;            else if (cmd[0] === &#34;bottom&#34;) y = this._h;&#10;            else if (cmd[0] === &#34;middle&#34; || cmd[1] === &#34;center&#34; || cmd[1] === &#34;centre&#34;) y = this._h / 2;&#10;&#10;            if (cmd[1] === &#34;center&#34; || cmd[1] === &#34;centre&#34; || cmd[1] === &#34;middle&#34;) x = this._w / 2;&#10;            else if (cmd[1] === &#34;left&#34;) x = 0;&#10;            else if (cmd[1] === &#34;right&#34;) x = this._w;&#10;        &#125;&#10;    &#125;&#10;&#10;    this._origin.x = x;&#10;    this._origin.y = y;&#10;&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.flip&#10; * @comp 2D&#10; * @trigger Invalidate - when the entity has flipped&#10; * @sign public this .flip(String dir)&#10; * @param dir - Flip direction&#10; *&#10; * Flip entity on passed direction&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * this.flip("X")
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;flip: function (dir) &#123;&#10;    dir = dir || &#34;X&#34;;&#10;    if (!this[&#34;_flip&#34; + dir]) &#123;&#10;        this[&#34;_flip&#34; + dir] = true;&#10;        this.trigger(&#34;Invalidate&#34;);&#10;    &#125;&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.unflip&#10; * @comp 2D&#10; * @trigger Invalidate - when the entity has unflipped&#10; * @sign public this .unflip(String dir)&#10; * @param dir - Unflip direction&#10; *&#10; * Unflip entity on passed direction (if it&#39;s flipped)&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * this.unflip("X")
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    unflip: function (dir) &#123;&#10;        dir = dir || &#34;X&#34;;&#10;        if (this[&#34;_flip&#34; + dir]) &#123;&#10;            this[&#34;_flip&#34; + dir] = false;&#10;            this.trigger(&#34;Invalidate&#34;);&#10;        &#125;&#10;        return this;&#10;    &#125;,&#10;&#10;    /**&#10;     * Method for rotation rather than through a setter&#10;     */&#10;    rotate: function (e) &#123;&#10;        var x2, y2;&#10;        x2 =  (this._x + this._origin.x - e.o.x) * e.cos + (this._y + this._origin.y - e.o.y) * e.sin + (e.o.x - this._origin.x);&#10;        y2 =  (this._y + this._origin.y - e.o.y) * e.cos - (this._x + this._origin.x - e.o.x) * e.sin + (e.o.y - this._origin.y);&#10;        this._attr(&#39;_rotation&#39;, this._rotation - e.deg);&#10;        this._attr(&#39;_x&#39;, x2 );&#10;        this._attr(&#39;_y&#39;, y2 );&#10;    &#125;,&#10;&#10;    /**@&#10;     * #._attr&#10;     * @comp 2D&#10;     * Setter method for all 2D properties including&#10;     * x, y, w, h, alpha, rotation and visible.&#10;     */&#10;    _attr: function (name, value) &#123;&#10;        // Return if there is no change&#10;        if (this[name] === value) &#123;&#10;            return;&#10;        &#125;&#10;        //keep a reference of the old positions&#10;        var old = Crafty.rectManager._pool.copy(this);&#10;&#10;        var mbr;&#10;        //if rotation, use the rotate method&#10;        if (name === &#39;_rotation&#39;) &#123;&#10;            this._rotate(value); // _rotate triggers &#34;Rotate&#34;&#10;            //set the global Z and trigger reorder just in case&#10;        &#125; else if (name === &#39;_z&#39;) &#123;&#10;            var intValue = value &#60;&#60;0;&#10;            value = value==intValue ? intValue : intValue+1;&#10;            this._globalZ = value*100000+this[0]; //magic number 10^5 is the max num of entities&#10;            this[name] = value;&#10;            this.trigger(&#34;Reorder&#34;);&#10;            //if the rect bounds change, update the MBR and trigger move&#10;        &#125; else if (name === &#39;_x&#39; || name === &#39;_y&#39;) &#123;&#10;            // mbr is the minimal bounding rectangle of the entity&#10;            mbr = this._mbr;&#10;            if (mbr) &#123;&#10;                mbr[name] -= this[name] - value;&#10;                // cbr is a non-minmal bounding rectangle that contains both hitbox and mbr&#10;                // It will exist only when the collision hitbox sits outside the entity&#10;                if (this._cbr)&#123;&#10;                    this._cbr[name] -= this[name] - value;&#10;                &#125;&#10;            &#125;&#10;            this[name] = value;&#10;&#10;            this.trigger(&#34;Move&#34;, old);&#10;&#10;        &#125; else if (name === &#39;_h&#39; || name === &#39;_w&#39;) &#123;&#10;            mbr = this._mbr;&#10;&#10;            var oldValue = this[name];&#10;            this[name] = value;&#10;            if (mbr) &#123;&#10;                this._calculateMBR();&#10;            &#125;&#10;            if (name === &#39;_w&#39;) &#123;&#10;                this.trigger(&#34;Resize&#34;, &#123;&#10;                    axis: &#39;w&#39;,&#10;                    amount: value - oldValue&#10;                &#125;);&#10;            &#125; else if (name === &#39;_h&#39;) &#123;&#10;                this.trigger(&#34;Resize&#34;, &#123;&#10;                    axis: &#39;h&#39;,&#10;                    amount: value - oldValue&#10;                &#125;);&#10;            &#125;&#10;            this.trigger(&#34;Move&#34;, old);&#10;&#10;        &#125;&#10;&#10;        //everything will assume the value&#10;        this[name] = value;&#10;&#10;        // flag for redraw&#10;        this.trigger(&#34;Invalidate&#34;);&#10;&#10;        Crafty.rectManager._pool.recycle(old);&#10;    &#125;&#10;&#125;);&#10;&#10;/**@&#10; * #Supportable&#10; * @category 2D&#10; * @trigger LandedOnGround - When entity has landed. This event is triggered with the object the entity landed on.&#10; * @trigger LiftedOffGround - When entity has lifted off. This event is triggered with the object the entity stood on before lift-off.&#10; * @trigger CheckLanding - When entity is about to land. This event is triggered with the object the entity is about to land on. Third parties can respond to this event and prevent the entity from being able to land.&#10; *&#10; * Component that detects if the entity collides with the ground. This component is automatically added and managed by the Gravity component.&#10; * The appropriate events are fired when the entity state changes (lands on ground / lifts off ground). The current ground entity can also be accessed with `.ground`.&#10; */&#10;Crafty.c(&#34;Supportable&#34;, &#123;&#10;    /**@&#10;     * #.ground&#10;     * @comp Supportable&#10;     *&#10;     * Access the ground entity (which may be the actual ground entity if it exists, or `null` if it doesn&#39;t exist) and thus whether this entity is currently on the ground or not. &#10;     * The ground entity is also available through the events, when the ground entity changes.&#10;     */&#10;    _ground: null,&#10;    _groundComp: null,&#10;&#10;    /**@&#10;     * #.canLand&#10;     * @comp Supportable&#10;     *&#10;     * The canLand boolean determines if the entity is allowed to land or not (e.g. perhaps the entity should not land if it&#39;s not falling).&#10;     * The Supportable component will trigger a &#34;CheckLanding&#34; event. &#10;     * Interested parties can listen to this event and prevent the entity from landing by setting `canLand` to false.&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * var player = Crafty.e("2D, Gravity");
     * player.bind("CheckLanding", function(ground) {
     *     if (player.y + player.h > ground.y + player.dy) { // forbid landing, if player's feet are not above ground
     *         player.canLand = false;
     *     }
     * });
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;canLand: true,&#10;&#10;init: function () &#123;&#10;    this.requires(&#34;2D&#34;);&#10;    this.__area = &#123;_x: 0, _y: 0, _w: 0, _h: 0&#125;;&#10;    this.defineField(&#34;ground&#34;, function() &#123; return this._ground; &#125;, function(newValue) &#123;&#125;);&#10;&#125;,&#10;remove: function(destroyed) &#123;&#10;    this.unbind(&#34;EnterFrame&#34;, this._detectGroundTick);&#10;&#125;,&#10;&#10;/*@&#10; * #.startGroundDetection&#10; * @comp Supportable&#10; * @sign private this .startGroundDetection([comp])&#10; * @param comp - The name of a component that will be treated as ground&#10; *&#10; * This method is automatically called by the Gravity component and should not be called by the user.&#10; *&#10; * Enable ground detection for this entity no matter whether comp parameter is specified or not.&#10; * If comp parameter is specified all entities with that component will stop this entity from falling.&#10; * For a player entity in a platform game this would be a component that is added to all entities&#10; * that the player should be able to walk on.&#10; * &#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * Crafty.e("2D, DOM, Color, Gravity")
     *   .color("red")
     *   .attr({ w: 100, h: 100 })
     *   .gravity("platform");
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     *&#10;     * @see Gravity&#10;     */&#10;    startGroundDetection: function(ground) &#123;&#10;        if (ground) this._groundComp = ground;&#10;        this.uniqueBind(&#34;EnterFrame&#34;, this._detectGroundTick);&#10;&#10;        return this;&#10;    &#125;,&#10;    /*@&#10;     * #.stopGroundDetection&#10;     * @comp Supportable&#10;     * @sign private this .stopGroundDetection()&#10;     *&#10;     * This method is automatically called by the Gravity component and should not be called by the user.&#10;     *&#10;     * Disable ground detection for this component. It can be reenabled by calling .startGroundDetection()&#10;     */&#10;    stopGroundDetection: function() &#123;&#10;        this.unbind(&#34;EnterFrame&#34;, this._detectGroundTick);&#10;&#10;        return this;&#10;    &#125;,&#10;&#10;    _detectGroundTick: function() &#123;&#10;        var groundComp = this._groundComp,&#10;            ground = this._ground,&#10;            overlap = Crafty.rectManager.overlap;&#10;&#10;        var pos = this._cbr || this._mbr || this,&#10;            area = this.__area;&#10;        area._x = pos._x;&#10;        area._y = pos._y + 1; // Increase by 1 to make sure map.search() finds the floor&#10;        area._w = pos._w;&#10;        area._h = pos._h;&#10;        // Decrease width by 1px from left and 1px from right, to fall more gracefully&#10;        // area._x++; area._w--;&#10;&#10;        if (ground) &#123;&#10;            var garea = ground._cbr || ground._mbr || ground;&#10;            if (!(ground.__c[groundComp] &#38;&#38; overlap(garea, area))) &#123;&#10;                this._ground = null;&#10;                this.trigger(&#34;LiftedOffGround&#34;, ground); // no collision with ground was detected for first time&#10;                ground = null;&#10;            &#125;&#10;        &#125;&#10;&#10;        if (!ground) &#123;&#10;            var obj, oarea,&#10;                results = Crafty.map.search(area, false),&#10;                i = 0,&#10;                l = results.length;&#10;&#10;            for (; i &#60; l; ++i) &#123;&#10;                obj = results[i];&#10;                oarea = obj._cbr || obj._mbr || obj;&#10;                // check for an intersection with the player&#10;                if (obj !== this &#38;&#38; obj.__c[groundComp] &#38;&#38; overlap(oarea, area)) &#123;&#10;                    this.canLand = true;&#10;                    this.trigger(&#34;CheckLanding&#34;, obj); // is entity allowed to land?&#10;                    if (this.canLand) &#123;&#10;                        this._ground = ground = obj;&#10;                        this.y = obj._y - this._h; // snap entity to ground object&#10;                        this.trigger(&#34;LandedOnGround&#34;, ground); // collision with ground was detected for first time&#10;&#10;                        break;&#10;                    &#125;&#10;                &#125;&#10;            &#125;&#10;        &#125;&#10;    &#125;&#10;&#125;);&#10;&#10;/**@&#10; * #GroundAttacher&#10; * @category 2D&#10; *&#10; * Component that attaches the entity to the ground when it lands. Useful for platformers with moving platforms.&#10; * Remove the component to disable the functionality.&#10; *&#10; * @see Supportable, Gravity&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

 * Crafty.e("2D, Gravity, GroundAttacher")
 *     .gravity("Platform"); // entity will land on and move with entites that have the "Platform" component
 * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;Crafty.c(&#34;GroundAttacher&#34;, &#123;&#10;    _groundAttach: function(ground) &#123;&#10;        ground.attach(this);&#10;    &#125;,&#10;    _groundDetach: function(ground) &#123;&#10;        ground.detach(this);&#10;    &#125;,&#10;&#10;    init: function () &#123;&#10;        this.requires(&#34;Supportable&#34;);&#10;&#10;        this.bind(&#34;LandedOnGround&#34;, this._groundAttach);&#10;        this.bind(&#34;LiftedOffGround&#34;, this._groundDetach);&#10;    &#125;,&#10;    remove: function(destroyed) &#123;&#10;        this.unbind(&#34;LandedOnGround&#34;, this._groundAttach);&#10;        this.unbind(&#34;LiftedOffGround&#34;, this._groundDetach);&#10;    &#125;&#10;&#125;);&#10;&#10;&#10;/**@&#10; * #Gravity&#10; * @category 2D&#10; * @trigger Moved - When entity has moved due to velocity/acceleration on either x or y axis a Moved event is triggered. If the entity has moved on both axes for diagonal movement the event is triggered twice. - &#123; axis: &#39;x&#39; | &#39;y&#39;, oldValue: Number &#125; - Old position&#10; * @trigger NewDirection - When entity has changed direction due to velocity on either x or y axis a NewDirection event is triggered. The event is triggered once, if direction is different from last frame. - &#123; x: -1 | 0 | 1, y: -1 | 0 | 1 &#125; - New direction&#10; * &#10; * Adds gravitational pull to the entity.&#10; *&#10; * @see Supportable, Motion&#10; */&#10;Crafty.c(&#34;Gravity&#34;, &#123;&#10;    _gravityConst: 500,&#10;&#10;    init: function () &#123;&#10;        this.requires(&#34;2D, Supportable, Motion&#34;);&#10;&#10;        this.bind(&#34;LiftedOffGround&#34;, this._startGravity); // start gravity if we are off ground&#10;        this.bind(&#34;LandedOnGround&#34;, this._stopGravity); // stop gravity once landed&#10;    &#125;,&#10;    remove: function(removed) &#123;&#10;        this.unbind(&#34;LiftedOffGround&#34;, this._startGravity);&#10;        this.unbind(&#34;LandedOnGround&#34;, this._stopGravity);&#10;    &#125;,&#10;&#10;    _gravityCheckLanding: function(ground) &#123;&#10;        if (this._dy &#60; 0) &#10;            this.canLand = false;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.gravity&#10;     * @comp Gravity&#10;     * @sign public this .gravity([comp])&#10;     * @param comp - The name of a component that will stop this entity from falling&#10;     *&#10;     * Enable gravity for this entity no matter whether comp parameter is specified or not.&#10;     * If comp parameter is specified all entities with that component will stop this entity from falling.&#10;     * For a player entity in a platform game this would be a component that is added to all entities&#10;     * that the player should be able to walk on.&#10;     * See the Supportable component documentation for additional methods &#38; events that are available.&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * Crafty.e("2D, DOM, Color, Gravity")
     *   .color("red")
     *   .attr({ w: 100, h: 100 })
     *   .gravity("platform");
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; * @see Supportable, Motion&#10; */&#10;gravity: function (comp) &#123;&#10;    this.bind(&#34;CheckLanding&#34;, this._gravityCheckLanding);&#10;    this.startGroundDetection(comp);&#10;    this._startGravity();&#10;&#10;    return this;&#10;&#125;,&#10;/**@&#10; * #.antigravity&#10; * @comp Gravity&#10; * @sign public this .antigravity()&#10; * Disable gravity for this component. It can be reenabled by calling .gravity()&#10; */&#10;antigravity: function () &#123;&#10;    this._stopGravity();&#10;    this.stopGroundDetection();&#10;    this.unbind(&#34;CheckLanding&#34;, this._gravityCheckLanding);&#10;&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.gravityConst&#10; * @comp Gravity&#10; * @sign public this .gravityConst(g)&#10; * @param g - gravitational constant in pixels per second squared&#10; *&#10; * Set the gravitational constant to g for this entity. The default is 500. The greater g, the stronger the downwards acceleration.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * Crafty.e("2D, DOM, Color, Gravity")
     *   .color("red")
     *   .attr({ w: 100, h: 100 })
     *   .gravityConst(5)
     *   .gravity("platform");
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    gravityConst: function (g) &#123;&#10;        if (this._gravityActive) &#123; // gravity active, change acceleration&#10;            this.ay -= this._gravityConst;&#10;            this.ay += g;&#10;        &#125;&#10;        this._gravityConst = g;&#10;&#10;        return this;&#10;    &#125;,&#10;    _startGravity: function() &#123;&#10;        this._gravityActive = true;&#10;        this.ay += this._gravityConst;&#10;    &#125;,&#10;    _stopGravity: function() &#123;&#10;        this.ay = 0;&#10;        this.vy = 0;&#10;        this._gravityActive = false;&#10;    &#125;&#10;&#125;);&#10;&#10;// This is used to define getters and setters for Motion properties&#10;// For instance&#10;//      __motionProp(entity, &#34;a&#34;, &#34;x&#34;, true) &#10;// will define a getter for `ax` which accesses an underlying private property `_ax`&#10;// If the `setter` property is false, setting a value will be a null-op&#10;var __motionProp = function(self, prefix, prop, setter) &#123;&#10;    var publicProp = prefix + prop;&#10;    var privateProp = &#34;_&#34; + publicProp;&#10;&#10;    var motionEvent = &#123; key: &#34;&#34;, oldValue: 0&#125;;&#10;    // getters &#38; setters for public property&#10;    if (setter) &#123;&#10;        Crafty.defineField(self, publicProp, function() &#123; return this[privateProp]; &#125;, function(newValue) &#123;&#10;            var oldValue = this[privateProp];&#10;            if (newValue !== oldValue) &#123;&#10;                this[privateProp] = newValue;&#10;&#10;                motionEvent.key = publicProp;&#10;                motionEvent.oldValue = oldValue;&#10;                this.trigger(&#34;MotionChange&#34;, motionEvent);&#10;            &#125;&#10;        &#125;);&#10;    &#125; else &#123;&#10;        Crafty.defineField(self, publicProp, function() &#123; return this[privateProp]; &#125;, function(newValue) &#123;&#125;);&#10;    &#125;&#10;&#10;    // hide private property&#10;    Object.defineProperty(self, privateProp, &#123;&#10;        value : 0,&#10;        writable : true,&#10;        enumerable : false,&#10;        configurable : false&#10;    &#125;);&#10;&#125;;&#10;&#10;// This defines an alias for a pair of underlying properties which represent the components of a vector&#10;// It takes an object with vector methods, and redefines its x/y properties as getters and setters to properties of self&#10;// This allows you to use the vector&#39;s special methods to manipulate the entity&#39;s properties, &#10;// while still allowing you to manipulate those properties directly if performance matters&#10;var __motionVector = function(self, prefix, setter, vector) &#123;&#10;    var publicX = prefix + &#34;x&#34;,&#10;        publicY = prefix + &#34;y&#34;,&#10;        privateX = &#34;_&#34; + publicX,&#10;        privateY = &#34;_&#34; + publicY;&#10;&#10;    if (setter) &#123;&#10;        Crafty.defineField(vector, &#34;x&#34;, function() &#123; return self[privateX]; &#125;, function(v) &#123; self[publicX] = v; &#125;);&#10;        Crafty.defineField(vector, &#34;y&#34;, function() &#123; return self[privateY]; &#125;, function(v) &#123; self[publicY] = v; &#125;);&#10;    &#125; else &#123;&#10;        Crafty.defineField(vector, &#34;x&#34;, function() &#123; return self[privateX]; &#125;, function(v) &#123;&#125;);&#10;        Crafty.defineField(vector, &#34;y&#34;, function() &#123; return self[privateY]; &#125;, function(v) &#123;&#125;);&#10;    &#125;&#10;    if (Object.seal) &#123; Object.seal(vector); &#125;&#10;&#10;    return vector;&#10;&#125;;&#10;&#10;/**@&#10; * #AngularMotion&#10; * @category 2D&#10; * @trigger Rotated - When entity has rotated due to angular velocity/acceleration a Rotated event is triggered. - Number - Old rotation&#10; * @trigger NewRotationDirection - When entity has changed rotational direction due to rotational velocity a NewRotationDirection event is triggered. The event is triggered once, if direction is different from last frame. - -1 | 0 | 1 - New direction&#10; * @trigger MotionChange - When a motion property has changed a MotionChange event is triggered. - &#123; key: String, oldValue: Number &#125; - Motion property name and old value&#10; *&#10; * Component that allows rotating an entity by applying angular velocity and acceleration.&#10; * All angular motion values are expressed in degrees per second (e.g. an entity with `vrotation` of 10 will rotate 10 degrees each second).&#10; */&#10;Crafty.c(&#34;AngularMotion&#34;, &#123;&#10;    /**@&#10;     * #.vrotation&#10;     * @comp AngularMotion&#10;     * &#10;     * A property for accessing/modifying the angular(rotational) velocity. &#10;     * The velocity remains constant over time, unless the acceleration increases the velocity.&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * var ent = Crafty.e("2D, AngularMotion");
     *
     * var vrotation = ent.vrotation; // retrieve the angular velocity
     * ent.vrotation += 1; // increase the angular velocity
     * ent.vrotation = 0; // reset the angular velocity
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;_vrotation: 0,&#10;&#10;/**@&#10; * #.arotation&#10; * @comp AngularMotion&#10; * &#10; * A property for accessing/modifying the angular(rotational) acceleration. &#10; * The acceleration increases the velocity over time, resulting in ever increasing speed.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var ent = Crafty.e("2D, AngularMotion");
     *
     * var arotation = ent.arotation; // retrieve the angular acceleration
     * ent.arotation += 1; // increase the angular acceleration
     * ent.arotation = 0; // reset the angular acceleration
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;_arotation: 0,&#10;&#10;/**@&#10; * #.drotation&#10; * @comp AngularMotion&#10; * &#10; * A number that reflects the change in rotation (difference between the old &#38; new rotation) that was applied in the last frame.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var ent = Crafty.e("2D, AngularMotion");
     *
     * var drotation = ent.drotation; // the change of rotation in the last frame
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    _drotation: 0,&#10;&#10;    init: function () &#123;&#10;        this.requires(&#34;2D&#34;);&#10;&#10;        __motionProp(this, &#34;v&#34;, &#34;rotation&#34;, true);&#10;        __motionProp(this, &#34;a&#34;, &#34;rotation&#34;, true);&#10;        __motionProp(this, &#34;d&#34;, &#34;rotation&#34;, false);&#10;&#10;        this.__oldRotationDirection = 0;&#10;&#10;        this.bind(&#34;EnterFrame&#34;, this._angularMotionTick);&#10;    &#125;,&#10;    remove: function(destroyed) &#123;&#10;        this.unbind(&#34;EnterFrame&#34;, this._angularMotionTick);&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.resetAngularMotion&#10;     * @comp AngularMotion&#10;     * @sign public this .resetAngularMotion()&#10;     * &#10;     * Reset all motion (resets velocity, acceleration, motionDelta).&#10;     */&#10;    resetAngularMotion: function() &#123;&#10;        this._drotation = 0;&#10;        this.vrotation = 0;&#10;        this.arotation = 0;&#10;&#10;        return this;&#10;    &#125;,&#10;&#10;    /*&#10;     * s += v * &#916;t + (0.5 * a) * &#916;t * &#916;t&#10;     * v += a * &#916;t&#10;     */&#10;    _angularMotionTick: function(frameData) &#123;&#10;        var dt = frameData.dt / 1000; // Time in s&#10;        var oldR = this._rotation,&#10;            vr = this._vrotation,&#10;            ar = this._arotation;&#10;&#10;        // s += v * &#916;t + (0.5 * a) * &#916;t * &#916;t&#10;        var newR = oldR + vr * dt + 0.5 * ar * dt * dt;&#10;        // v += a * &#916;t&#10;        this.vrotation = vr + ar * dt;&#10;&#10;        // Check if direction of velocity has changed&#10;        var _vr = this._vrotation, dvr = _vr ? (_vr&#60;0 ? -1:1):0; // Quick implementation of Math.sign&#10;        if (this.__oldRotationDirection !== dvr) &#123;&#10;            this.__oldRotationDirection = dvr;&#10;            this.trigger(&#39;NewRotationDirection&#39;, dvr);&#10;        &#125;&#10;&#10;        // Check if velocity has changed&#10;        // &#916;s = s[t] - s[t-1]&#10;        this._drotation = newR - oldR;&#10;        if (this._drotation !== 0) &#123;&#10;            this.rotation = newR;&#10;            this.trigger(&#39;Rotated&#39;, oldR);&#10;        &#125;&#10;    &#125;&#10;&#125;);&#10;&#10;/**@&#10; * #Motion&#10; * @category 2D&#10; * @trigger Moved - When entity has moved due to velocity/acceleration on either x or y axis a Moved event is triggered. If the entity has moved on both axes for diagonal movement the event is triggered twice. - &#123; axis: &#39;x&#39; | &#39;y&#39;, oldValue: Number &#125; - Old position&#10; * @trigger NewDirection - When entity has changed direction due to velocity on either x or y axis a NewDirection event is triggered. The event is triggered once, if direction is different from last frame. - &#123; x: -1 | 0 | 1, y: -1 | 0 | 1 &#125; - New direction&#10; * @trigger MotionChange - When a motion property has changed a MotionChange event is triggered. - &#123; key: String, oldValue: Number &#125; - Motion property name and old value&#10; *&#10; * Component that allows moving an entity by applying linear velocity and acceleration.&#10; * All linear motion values are expressed in pixels per second (e.g. an entity with `vx` of 1 will move 1px on the x axis each second).&#10; *&#10; * @note Several methods return Vector2D objects that dynamically reflect the entity&#39;s underlying properties.  If you want a static copy instead, use the vector&#39;s `clone()` method.&#10; */&#10;Crafty.c(&#34;Motion&#34;, &#123;&#10;    /**@&#10;     * #.vx&#10;     * @comp Motion&#10;     * &#10;     * A property for accessing/modifying the linear velocity in the x axis.&#10;     * The velocity remains constant over time, unless the acceleration changes the velocity.&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * var ent = Crafty.e("2D, Motion");
     *
     * var vx = ent.vx; // retrieve the linear velocity in the x axis
     * ent.vx += 1; // increase the linear velocity in the x axis
     * ent.vx = 0; // reset the linear velocity in the x axis
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;_vx: 0,&#10;&#10;/**@&#10; * #.vy&#10; * @comp Motion&#10; * &#10; * A property for accessing/modifying the linear velocity in the y axis.&#10; * The velocity remains constant over time, unless the acceleration changes the velocity.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var ent = Crafty.e("2D, Motion");
     *
     * var vy = ent.vy; // retrieve the linear velocity in the y axis
     * ent.vy += 1; // increase the linear velocity in the y axis
     * ent.vy = 0; // reset the linear velocity in the y axis
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;_vy: 0,&#10;&#10;/**@&#10; * #.ax&#10; * @comp Motion&#10; * &#10; * A property for accessing/modifying the linear acceleration in the x axis.&#10; * The acceleration changes the velocity over time.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var ent = Crafty.e("2D, Motion");
     *
     * var ax = ent.ax; // retrieve the linear acceleration in the x axis
     * ent.ax += 1; // increase the linear acceleration in the x axis
     * ent.ax = 0; // reset the linear acceleration in the x axis
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;_ax: 0,&#10;&#10;/**@&#10; * #.ay&#10; * @comp Motion&#10; * &#10; * A property for accessing/modifying the linear acceleration in the y axis.&#10; * The acceleration changes the velocity over time.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var ent = Crafty.e("2D, Motion");
     *
     * var ay = ent.ay; // retrieve the linear acceleration in the y axis
     * ent.ay += 1; // increase the linear acceleration in the y axis
     * ent.ay = 0; // reset the linear acceleration in the y axis
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;_ay: 0,&#10;&#10;/**@&#10; * #.dx&#10; * @comp Motion&#10; * &#10; * A number that reflects the change in x (difference between the old &#38; new x) that was applied in the last frame.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var ent = Crafty.e("2D, Motion");
     *
     * var dx = ent.dx; // the change of x in the last frame
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;_dx: 0,&#10;&#10;/**@&#10; * #.dy&#10; * @comp Motion&#10; * &#10; * A number that reflects the change in y (difference between the old &#38; new y) that was applied in the last frame.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var ent = Crafty.e("2D, Motion");
     *
     * var dy = ent.dy; // the change of y in the last frame
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;_dy: 0,&#10;&#10;init: function () &#123;&#10;    this.requires(&#34;2D&#34;);&#10;&#10;    __motionProp(this, &#34;v&#34;, &#34;x&#34;, true);&#10;    __motionProp(this, &#34;v&#34;, &#34;y&#34;, true);&#10;    this._velocity = __motionVector(this, &#34;v&#34;, true, new Crafty.math.Vector2D());&#10;    __motionProp(this, &#34;a&#34;, &#34;x&#34;, true);&#10;    __motionProp(this, &#34;a&#34;, &#34;y&#34;, true);&#10;    this._acceleration = __motionVector(this, &#34;a&#34;, true, new Crafty.math.Vector2D());&#10;    __motionProp(this, &#34;d&#34;, &#34;x&#34;, false);&#10;    __motionProp(this, &#34;d&#34;, &#34;y&#34;, false);&#10;    this._motionDelta = __motionVector(this, &#34;d&#34;, false, new Crafty.math.Vector2D());&#10;&#10;    this.__movedEvent = &#123;axis: &#39;&#39;, oldValue: 0&#125;;&#10;    this.__oldDirection = &#123;x: 0, y: 0&#125;;&#10;&#10;    this.bind(&#34;EnterFrame&#34;, this._linearMotionTick);&#10;&#125;,&#10;remove: function(destroyed) &#123;&#10;    this.unbind(&#34;EnterFrame&#34;, this._linearMotionTick);&#10;&#125;,&#10;&#10;/**@&#10; * #.resetMotion&#10; * @comp Motion&#10; * @sign public this .resetMotion()&#10; * @return this&#10; * &#10; * Reset all linear motion (resets velocity, acceleration, motionDelta).&#10; */&#10;resetMotion: function() &#123;&#10;    this.vx = 0; this.vy = 0;&#10;    this.ax = 0; this.ay = 0;&#10;    this._dx = 0; this._dy = 0;&#10;&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.motionDelta&#10; * @comp Motion&#10; * @sign public Vector2D .motionDelta()&#10; * @return A Vector2D with the properties &#123;x, y&#125; that reflect the change in x &#38; y.&#10; * &#10; * Returns the difference between the old &#38; new position that was applied in the last frame.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var ent = Crafty.e("2D, Motion");
     *
     * var deltaY = ent.motionDelta().y; // the change of y in the last frame
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> * @see Crafty.math.Vector2D&#10; */&#10;motionDelta: function() &#123;&#10;    return this._motionDelta;&#10;&#125;,&#10;&#10;/**@&#10; * #.velocity&#10; * @comp Motion&#10; * Method for accessing/modifying the linear(x,y) velocity. &#10; * The velocity remains constant over time, unless the acceleration increases the velocity.&#10; *&#10; * @sign public Vector2D .velocity()&#10; * @return The velocity Vector2D with the properties &#123;x, y&#125; that reflect the velocities in the &#60;x, y&#62; direction of the entity.&#10; *&#10; * Returns the current velocity. You can access/modify the properties in order to retrieve/change the velocity.&#10;&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var ent = Crafty.e("2D, Motion");
     *
     * var vel = ent.velocity(); //returns the velocity vector
     * vel.x;       // retrieve the velocity in the x direction
     * vel.x = 0;   // set the velocity in the x direction
     * vel.x += 4   // add to the velocity in the x direction
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> * @see Crafty.math.Vector2D&#10; */&#10;velocity: function() &#123;&#10;    return this._velocity;&#10;&#125;,&#10;&#10;&#10;/**@&#10; * #.acceleration&#10; * @comp Motion&#10; * Method for accessing/modifying the linear(x,y) acceleration. &#10; * The acceleration increases the velocity over time, resulting in ever increasing speed.&#10; * &#10; * @sign public Vector2D .acceleration()&#10; * @return The acceleration Vector2D with the properties &#123;x, y&#125; that reflects the acceleration in the &#60;x, y&#62; direction of the entity.&#10; *&#10; * Returns the current acceleration. You can access/modify the properties in order to retrieve/change the acceleration.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var ent = Crafty.e("2D, Motion");
     *
     * var acc = ent.acceleration(); //returns the acceleration object
     * acc.x;       // retrieve the acceleration in the x direction
     * acc.x = 0;   // set the acceleration in the x direction
     * acc.x += 4   // add to the acceleration in the x direction
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     * @see Crafty.math.Vector2D&#10;     */&#10;    acceleration: function() &#123;&#10;        return this._acceleration;&#10;    &#125;,&#10;&#10;    /*&#10;     * s += v * &#916;t + (0.5 * a) * &#916;t * &#916;t&#10;     * v += a * &#916;t&#10;     */&#10;    _linearMotionTick: function(frameData) &#123;&#10;        var dt = frameData.dt / 1000; // time in s&#10;        var oldX = this._x, vx = this._vx, ax = this._ax,&#10;            oldY = this._y, vy = this._vy, ay = this._ay;&#10;&#10;        // s += v * &#916;t + (0.5 * a) * &#916;t * &#916;t&#10;        var newX = oldX + vx * dt + 0.5 * ax * dt * dt;&#10;        var newY = oldY + vy * dt + 0.5 * ay * dt * dt;&#10;        // v += a * &#916;t&#10;        this.vx = vx + ax * dt;&#10;        this.vy = vy + ay * dt;&#10;&#10;        // Check if direction of velocity has changed&#10;        var oldDirection = this.__oldDirection,&#10;            _vx = this._vx, dvx = _vx ? (_vx&#60;0 ? -1:1):0, // A quick implementation of Math.sign&#10;            _vy = this._vy, dvy = _vy ? (_vy&#60;0 ? -1:1):0;&#10;        if (oldDirection.x !== dvx || oldDirection.y !== dvy) &#123;&#10;            oldDirection.x = dvx;&#10;            oldDirection.y = dvy;&#10;            this.trigger(&#39;NewDirection&#39;, oldDirection);&#10;        &#125;&#10;&#10;        // Check if velocity has changed&#10;        var movedEvent = this.__movedEvent;&#10;        // &#916;s = s[t] - s[t-1]&#10;        this._dx = newX - oldX;&#10;        this._dy = newY - oldY;&#10;        if (this._dx !== 0) &#123;&#10;            this.x = newX;&#10;            movedEvent.axis = &#39;x&#39;;&#10;            movedEvent.oldValue = oldX;&#10;            this.trigger(&#39;Moved&#39;, movedEvent);&#10;        &#125;&#10;        if (this._dy !== 0) &#123;&#10;            this.y = newY;&#10;            movedEvent.axis = &#39;y&#39;;&#10;            movedEvent.oldValue = oldY;&#10;            this.trigger(&#39;Moved&#39;, movedEvent);&#10;        &#125;&#10;    &#125;&#10;&#125;);&#10;&#10;/**@&#10; * #Crafty.polygon&#10; * @category 2D&#10; *&#10; * The constructor for a polygon object used for hitboxes and click maps. Takes a set of points as an&#10; * argument, giving alternately the x and y coordinates of the polygon&#39;s vertices in order.&#10; *&#10; * The constructor accepts the coordinates as either a single array or as a set of individual arguments.&#10; * If passed an array, the current implementation will use that array internally -- do not attempt to reuse it.&#10; *&#10; * When creating a polygon for an entity, each point should be offset or relative from the entities `x` and `y`&#10; * (don&#39;t include the absolute values as it will automatically calculate this).&#10; *&#10; *&#10; * @example&#10; * Two ways to create a triangle with vertices at `(50, 0)`, `(100, 100)` and `(0, 100)`.&#10; *</span><br></pre></td></tr></table></figure>

 * new Crafty.polygon([50, 0, 100, 100, 0, 100]);
 * new Crafty.polygon(50, 0, 100, 100, 0, 100);
 * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;Crafty.polygon = function (poly) &#123;&#10;    if (arguments.length &#62; 1) &#123;&#10;        poly = Array.prototype.slice.call(arguments, 0);&#10;    &#125;&#10;    this.points = poly;&#10;&#125;;&#10;&#10;Crafty.polygon.prototype = &#123;&#10;    /**@&#10;     * #.containsPoint&#10;     * @comp Crafty.polygon&#10;     * @sign public Boolean .containsPoint(Number x, Number y)&#10;     * @param x - X position of the point&#10;     * @param y - Y position of the point&#10;     *&#10;     * Method is used to determine if a given point is contained by the polygon.&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * var poly = new Crafty.polygon([50, 0, 100, 100, 0, 100]);
     * poly.containsPoint(50, 50); //TRUE
     * poly.containsPoint(0, 0); //FALSE
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;containsPoint: function (x, y) &#123;&#10;    var p = this.points, l = p.length/2,&#10;        i, j, c = false;&#10;&#10;    for (i = 0, j = l - 1; i &#60; l; j = i++) &#123;&#10;        if (((p[2*i+1] &#62; y) != (p[2*j+1] &#62; y)) &#38;&#38; (x &#60; (p[2*j] - p[2*i]) * (y - p[2*i+1]) / (p[2*j+1] - p[2*i+1]) + p[2*i])) &#123;&#10;            c = !c;&#10;        &#125;&#10;    &#125;&#10;&#10;    return c;&#10;&#125;,&#10;&#10;/**@&#10; * #.shift&#10; * @comp Crafty.polygon&#10; * @sign public void .shift(Number x, Number y)&#10; * @param x - Amount to shift the `x` axis&#10; * @param y - Amount to shift the `y` axis&#10; *&#10; * Shifts every single point in the polygon by the specified amount.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var poly = new Crafty.polygon([50, 0, 100, 100, 0, 100]);
     * poly.shift(5,5);
     * //[[55, 5, 105, 5, 5, 105];
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;shift: function (x, y) &#123;&#10;    var i = 0, p =this.points,&#10;        l = p.length;&#10;    for (; i &#60; l; i+=2) &#123;&#10;        p[i] += x;&#10;        p[i+1] += y;&#10;    &#125;&#10;&#125;,&#10;&#10;/**@&#10; * #.clone&#10; * @comp Crafty.polygon&#10; * @sign public void .clone()&#10; * &#10; * Returns a clone of the polygon.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var poly = new Crafty.polygon([50, 0, 100, 100, 0, 100]);
     * var shiftedpoly = poly.clone().shift(5,5);
     * //[55, 5, 105, 5, 5, 105], but the original polygon is unchanged
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    clone: function() &#123;&#10;        //Shallow clone, but points should be full of Number primitives that are copied&#10;        return new Crafty.polygon(this.points.slice(0));&#10;    &#125;,&#10;&#10;    rotate: function (e) &#123;&#10;        var i = 0, p = this.points,&#10;            l = p.length,&#10;            x, y;&#10;&#10;        for (; i &#60; l; i+=2) &#123;&#10;&#10;            x = e.o.x + (p[i] - e.o.x) * e.cos + (p[i+1] - e.o.y) * e.sin;&#10;            y = e.o.y - (p[i] - e.o.x) * e.sin + (p[i+1] - e.o.y) * e.cos;&#10;&#10;            p[i] = x;&#10;            p[i+1] = y;&#10;        &#125;&#10;    &#125;&#10;&#125;;&#10;&#10;/**@&#10; * #Crafty.circle&#10; * @category 2D&#10; * Circle object used for hitboxes and click maps. Must pass a `x`, a `y` and a `radius` value.&#10; *&#10; *@example&#10; *</span><br></pre></td></tr></table></figure>

 * var centerX = 5,
 *     centerY = 10,
 *     radius = 25;
 *
 * new Crafty.circle(centerX, centerY, radius);
 * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; * When creating a circle for an entity, each point should be offset or relative from the entities `x` and `y`&#10; * (don&#39;t include the absolute values as it will automatically calculate this).&#10; */&#10;Crafty.circle = function (x, y, radius) &#123;&#10;    this.x = x;&#10;    this.y = y;&#10;    this.radius = radius;&#10;&#10;    // Creates an octagon that approximate the circle for backward compatibility.&#10;    this.points = [];&#10;    var theta;&#10;&#10;    for (var i = 0; i &#60; 16; i+=2) &#123;&#10;        theta = i * Math.PI / 8;&#10;        this.points[i] = this.x + (Math.sin(theta) * radius);&#10;        this.points[i+1] = this.y + (Math.cos(theta) * radius);&#10;    &#125;&#10;&#125;;&#10;&#10;Crafty.circle.prototype = &#123;&#10;    /**@&#10;     * #.containsPoint&#10;     * @comp Crafty.circle&#10;     * @sign public Boolean .containsPoint(Number x, Number y)&#10;     * @param x - X position of the point&#10;     * @param y - Y position of the point&#10;     *&#10;     * Method is used to determine if a given point is contained by the circle.&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * var circle = new Crafty.circle(0, 0, 10);
     * circle.containsPoint(0, 0); //TRUE
     * circle.containsPoint(50, 50); //FALSE
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;containsPoint: function (x, y) &#123;&#10;    var radius = this.radius,&#10;        sqrt = Math.sqrt,&#10;        deltaX = this.x - x,&#10;        deltaY = this.y - y;&#10;&#10;    return (deltaX * deltaX + deltaY * deltaY) &#60; (radius * radius);&#10;&#125;,&#10;&#10;/**@&#10; * #.shift&#10; * @comp Crafty.circle&#10; * @sign public void .shift(Number x, Number y)&#10; * @param x - Amount to shift the `x` axis&#10; * @param y - Amount to shift the `y` axis&#10; *&#10; * Shifts the circle by the specified amount.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * var circle = new Crafty.circle(0, 0, 10);
     * circle.shift(5,5);
     * //{x: 5, y: 5, radius: 10};
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    shift: function (x, y) &#123;&#10;        this.x += x;&#10;        this.y += y;&#10;&#10;        var i = 0, p = this.points,&#10;            l = p.length,&#10;            current;&#10;        for (; i &#60; l; i+=2) &#123;&#10;            p[i] += x;&#10;            p[i+1] += y;&#10;        &#125;&#10;    &#125;,&#10;&#10;    rotate: function () &#123;&#10;        // We are a circle, we don&#39;t have to rotate :)&#10;    &#125;&#10;&#125;;&#10;&#10;&#10;Crafty.matrix = function (m) &#123;&#10;    this.mtx = m;&#10;    this.width = m[0].length;&#10;    this.height = m.length;&#10;&#125;;&#10;&#10;Crafty.matrix.prototype = &#123;&#10;    x: function (other) &#123;&#10;        if (this.width != other.height) &#123;&#10;            return;&#10;        &#125;&#10;&#10;        var result = [];&#10;        for (var i = 0; i &#60; this.height; i++) &#123;&#10;            result[i] = [];&#10;            for (var j = 0; j &#60; other.width; j++) &#123;&#10;                var sum = 0;&#10;                for (var k = 0; k &#60; this.width; k++) &#123;&#10;                    sum += this.mtx[i][k] * other.mtx[k][j];&#10;                &#125;&#10;                result[i][j] = sum;&#10;            &#125;&#10;        &#125;&#10;        return new Crafty.matrix(result);&#10;    &#125;,&#10;&#10;&#10;    e: function (row, col) &#123;&#10;        //test if out of bounds&#10;        if (row &#60; 1 || row &#62; this.mtx.length || col &#60; 1 || col &#62; this.mtx[0].length) return null;&#10;        return this.mtx[row - 1][col - 1];&#10;    &#125;&#10;&#125;;&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7,&#34;./spatial-grid.js&#34;:43&#125;],40:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;),&#10;    DEG_TO_RAD = Math.PI / 180;&#10;&#10;/**@&#10; * #Collision&#10; * @category 2D&#10; * @trigger HitOn - Triggered when collisions occur. Will not trigger again until collisions of this type cease, or an event is requested once more (using `resetHitChecks(component)`). - &#123; hitData &#125;&#10; * @trigger HitOff - Triggered when collision with a specific component type ceases - String - componentName&#10; *&#10; * Component to detect collision between any two convex polygons.&#10; *&#10; * If collision checks are registered for multiple component and collisions with&#10; * multiple types occur simultaniously, each collision will cause an individual&#10; * event to fire.&#10; *&#10; * @note All data received from events is only valid for the duration of the event&#39;s callback.&#10; * If you wish to preserve the data, make a copy of it.&#10; *&#10; * For a description of collision event data (hitData above), see the documentation for&#10; * `.hit()`.&#10; *&#10; */&#10;Crafty.c(&#34;Collision&#34;, &#123;&#10;    init: function () &#123;&#10;        this.requires(&#34;2D&#34;);&#10;        this._collisionData = &#123;&#125;;&#10;&#10;        this.collision();&#10;    &#125;,&#10;&#10;    // Run by Crafty when the component is removed&#10;    remove: function() &#123;&#10;        this._cbr = null;&#10;        this.unbind(&#34;Resize&#34;, this._resizeMap);&#10;        this.unbind(&#34;Resize&#34;, this._checkBounds);&#10;    &#125;,&#10;&#10;    /**@&#10;     * #.collision&#10;     * @comp Collision&#10;     *&#10;     * @trigger NewHitbox - when a new hitbox is assigned - Crafty.polygon&#10;     *&#10;     * @sign public this .collision([Crafty.polygon polygon])&#10;     * @param polygon - Optional Crafty.polygon object that will act as the hit area.&#10;     *&#10;     * @sign public this .collision([Array coordinatePairs])&#10;     * @param coordinatePairs - Optional array of x, y coordinate pairs to generate a hit area polygon.&#10;     *&#10;     * @sign public this .collision([x1, y1,.., xN, yN])&#10;     * @param point# - Optional list of x, y coordinate pairs to generate a hit area polygon.&#10;     *&#10;     * Constructor that takes a polygon, an array of points or a list of points to use as the hit area,&#10;     * with points being relative to the object&#39;s position in its unrotated state.&#10;     *&#10;     * The hit area must be a convex shape and not concave for collision detection to work properly.&#10;     *&#10;     * If no parameter is passed, the x, y, w, h properties of the entity will be used, and the hitbox will be resized when the entity is.&#10;     *&#10;     * If a hitbox is set that is outside of the bounds of the entity itself, there will be a small performance penalty as it is tracked separately.&#10;     *&#10;     * In order for your custom hitbox to have any effect, you have to add the `Collision` component to all other entities this entity needs to collide with using this custom hitbox.&#10;     * On the contrary the collisions will be resolved using the default hitbox. See `.hit()` - `MBR` represents default hitbox collision, `SAT` represents custom hitbox collision.&#10;     *&#10;     * @example&#10;     *</span><br></pre></td></tr></table></figure>

     * Crafty.e("2D, Collision").collision(
     *     new Crafty.polygon([50, 0,  100, 100,  0, 100])
     * );
     *
     * Crafty.e("2D, Collision").collision([50, 0,  100, 100,  0, 100]);
     *
     * Crafty.e("2D, Collision").collision(50, 0,  100, 100,  0, 100);
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; * @see Crafty.polygon&#10; */&#10;collision: function (polygon) &#123;&#10;    // Unbind anything bound to &#34;Resize&#34;&#10;    this.unbind(&#34;Resize&#34;, this._resizeMap);&#10;    this.unbind(&#34;Resize&#34;, this._checkBounds);&#10;&#10;    if (!polygon) &#123;&#10;        // If no polygon is specified, then a polygon is created that matches the bounds of the entity&#10;        // It will be adjusted on a &#34;Resize&#34; event&#10;        polygon = new Crafty.polygon([0, 0, this._w, 0, this._w, this._h, 0, this._h]);&#10;        this.bind(&#34;Resize&#34;, this._resizeMap);&#10;        this._cbr = null;&#10;    &#125; else &#123;&#10;        // Otherwise, we set the specified hitbox, converting from a list of arguments to a polygon if necessary&#10;        if (arguments.length &#62; 1) &#123;&#10;            //convert args to array to create polygon&#10;            var args = Array.prototype.slice.call(arguments, 0);&#10;            polygon = new Crafty.polygon(args);&#10;        // Otherwise, we set the specified hitbox, converting from an array of points to a polygon if necessary&#10;        &#125; else if (polygon.constructor === Array) &#123;&#10;            //Clone the array so we don&#39;t modify it for anything else that might be using it&#10;            polygon = new Crafty.polygon(polygon.slice());&#10;        // Otherwise, we set the specified hitbox&#10;        &#125; else &#123;&#10;            //Clone the polygon so we don&#39;t modify it for anything else that might be using it&#10;            polygon = polygon.clone();&#10;        &#125;&#10;        // Check to see if the polygon sits outside the entity, and set _cbr appropriately&#10;        // On resize, the new bounds will be checked if necessary&#10;        this._findBounds(polygon.points);&#10;    &#125;&#10;&#10;    // If the entity is currently rotated, the points in the hitbox must also be rotated&#10;    if (this.rotation) &#123;&#10;        polygon.rotate(&#123;&#10;            cos: Math.cos(-this.rotation * DEG_TO_RAD),&#10;            sin: Math.sin(-this.rotation * DEG_TO_RAD),&#10;            o: &#123;&#10;                x: this._origin.x,&#10;                y: this._origin.y&#10;            &#125;&#10;        &#125;);&#10;    &#125;&#10;&#10;    // Finally, assign the hitbox, and attach it to the &#34;Collision&#34; entity&#10;    this.map = polygon;&#10;    this.attach(this.map);&#10;    this.map.shift(this._x, this._y);&#10;    this.trigger(&#34;NewHitbox&#34;, polygon);&#10;    return this;&#10;&#125;,&#10;&#10;// If the hitbox is set by hand, it might extend beyond the entity.&#10;// In such a case, we need to track this separately.&#10;// This function finds a (non-minimal) bounding circle around the hitbox.&#10;//&#10;// It uses a pretty naive algorithm to do so, for more complicated options see [wikipedia](http://en.wikipedia.org/wiki/Bounding_sphere).&#10;_findBounds: function(points) &#123;&#10;    var minX = Infinity, maxX = -Infinity, minY=Infinity, maxY=-Infinity;&#10;    var l = points.length;&#10;&#10;    // Calculate the MBR of the points by finding the min/max x and y&#10;    for (var i=0; i&#60;l; i+=2) &#123;&#10;        if (points[i] &#60; minX)&#10;            minX = points[i];&#10;        if (points[i] &#62; maxX)&#10;            maxX = points[i];&#10;        if (points[i+1] &#60; minY)&#10;            minY = points[i+1];&#10;        if (points[i+1] &#62; maxY)&#10;            maxY = points[i+1];&#10;    &#125;&#10;&#10;    // This describes a circle centered on the MBR of the points, with a diameter equal to its diagonal&#10;    // It will be used to find a rough bounding box round the points, even if they&#39;ve been rotated&#10;    var cbr = &#123;&#10;        cx: (minX + maxX) / 2,&#10;        cy: (minY + maxY) / 2,&#10;        r: Math.sqrt((maxX - minX)*(maxX - minX) + (maxY - minY)*(maxY - minY)) / 2&#10;    &#125;;&#10;&#10;    // We need to worry about resizing, but only if resizing could possibly change whether the hitbox is in or out of bounds&#10;    // Thus if the upper-left corner is out of bounds, then there&#39;s no need to recheck on resize&#10;    if (minX &#62;= 0 &#38;&#38; minY &#62;= 0) &#123;&#10;        this._checkBounds = function() &#123;&#10;            if (this._cbr === null &#38;&#38; this._w &#60; maxX || this._h &#60; maxY) &#123;&#10;               this._cbr = cbr;&#10;               this._calculateMBR();&#10;            &#125; else if (this._cbr) &#123;&#10;                this._cbr = null;&#10;                this._calculateMBR();&#10;            &#125;&#10;        &#125;;&#10;        this.bind(&#34;Resize&#34;, this._checkBounds);&#10;    &#125;&#10;&#10;    // If the hitbox is within the entity, _cbr is null&#10;    // Otherwise, set it, and immediately calculate the bounding box.&#10;    if (minX &#62;= 0 &#38;&#38; minY &#62;= 0 &#38;&#38; maxX &#60;= this._w &#38;&#38; maxY &#60;= this._h) &#123;&#10;        this._cbr = null;&#10;        return false;&#10;    &#125; else &#123;&#10;        this._cbr = cbr;&#10;        this._calculateMBR();&#10;        return true;&#10;    &#125;&#10;&#125;,&#10;&#10;// The default behavior is to match the hitbox to the entity.&#10;// This function will change the hitbox when a &#34;Resize&#34; event triggers.&#10;_resizeMap: function (e) &#123;&#10;    var dx, dy, rot = this.rotation * DEG_TO_RAD,&#10;        points = this.map.points;&#10;&#10;    // Depending on the change of axis, move the corners of the rectangle appropriately&#10;    if (e.axis === &#39;w&#39;) &#123;&#10;        if (rot) &#123;&#10;            dx = e.amount * Math.cos(rot);&#10;            dy = e.amount * Math.sin(rot);&#10;        &#125; else &#123;&#10;            dx = e.amount;&#10;            dy = 0;&#10;        &#125;&#10;&#10;        // &#34;top right&#34; point shifts on change of w&#10;        points[2] += dx;&#10;        points[3] += dy;&#10;    &#125; else &#123;&#10;        if (rot) &#123;&#10;            dy = e.amount * Math.cos(rot);&#10;            dx = -e.amount * Math.sin(rot);&#10;        &#125; else &#123;&#10;            dx = 0;&#10;            dy = e.amount;&#10;        &#125;&#10;&#10;        // &#34;bottom left&#34; point shifts on change of h&#10;        points[6] += dx;&#10;        points[7] += dy;&#10;    &#125;&#10;&#10;    // &#34;bottom right&#34; point shifts on either change&#10;    points[4] += dx;&#10;    points[5] += dy;&#10;&#125;,&#10;&#10;/**@&#10; * #.hit&#10; * @comp Collision&#10; * @sign public Boolean/Array hit(String component)&#10; * @param component - Check collision with entities that have this component&#10; * applied to them.&#10; * @return `false` if there is no collision. If a collision is detected,&#10; * returns an Array of collision data objects (see below).&#10; *&#10; * Tests for collisions with entities that have the specified component&#10; * applied to them.&#10; * If a collision is detected, data regarding the collision will be present in&#10; * the array returned by this method.&#10; * If no collisions occur, this method returns false.&#10; *&#10; * Following is a description of a collision data object that this method may&#10; * return: The returned collision data will be an Array of Objects with the&#10; * type of collision used, the object collided and if the type used was SAT (a polygon was used as the hitbox) then an amount of overlap.&#10; *</span><br></pre></td></tr></table></figure>

     * [{
     *    obj: [entity],
     *    type: ["MBR" or "SAT"],
     *    overlap: [number]
     * }]
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; * - **obj:** The entity with which the collision occured.&#10; * - **type:** Collision detection method used. One of:&#10; *   - *MBR:* Standard axis aligned rectangle intersection (`.intersect` in the 2D component).&#10; *   - *SAT:* Collision between any two convex polygons. Used when both colliding entities have the `Collision` component applied to them.&#10; * - **overlap:** If SAT collision was used, this will signify the overlap percentage between the colliding entities.&#10; *&#10; * Keep in mind that both entities need to have the `Collision` component, if you want to check for `SAT` (custom hitbox) collisions between them.&#10; *&#10; * If you want more fine-grained control consider using `Crafty.map.search()`.&#10; *&#10; * @see 2D&#10; */&#10;hit: function (component) &#123;&#10;    var area = this._cbr || this._mbr || this,&#10;        results = Crafty.map.search(area, false),&#10;        i = 0,&#10;        l = results.length,&#10;        dupes = &#123;&#125;,&#10;        id, obj, oarea, key,&#10;        overlap = Crafty.rectManager.overlap,&#10;        hasMap = (&#39;map&#39; in this &#38;&#38; &#39;containsPoint&#39; in this.map),&#10;        finalresult = [];&#10;&#10;    if (!l) &#123;&#10;        return false;&#10;    &#125;&#10;&#10;    for (; i &#60; l; ++i) &#123;&#10;        obj = results[i];&#10;        oarea = obj._cbr || obj._mbr || obj; //use the mbr&#10;&#10;        if (!obj) continue;&#10;        id = obj[0];&#10;&#10;        //check if not added to hash and that actually intersects&#10;        if (!dupes[id] &#38;&#38; this[0] !== id &#38;&#38; obj.__c[component] &#38;&#38; overlap(oarea, area))&#10;            dupes[id] = obj;&#10;    &#125;&#10;&#10;    for (key in dupes) &#123;&#10;        obj = dupes[key];&#10;&#10;        if (hasMap &#38;&#38; &#39;map&#39; in obj) &#123;&#10;            var SAT = this._SAT(this.map, obj.map);&#10;            SAT.obj = obj;&#10;            SAT.type = &#34;SAT&#34;;&#10;            if (SAT) finalresult.push(SAT);&#10;        &#125; else &#123;&#10;            finalresult.push(&#123;&#10;                obj: obj,&#10;                type: &#34;MBR&#34;&#10;            &#125;);&#10;        &#125;&#10;    &#125;&#10;&#10;    if (!finalresult.length) &#123;&#10;        return false;&#10;    &#125;&#10;&#10;    return finalresult;&#10;&#125;,&#10;&#10;/**@&#10; * #.onHit&#10; * @comp Collision&#10; * @sign public this .onHit(String component, Function callbackOn[, Function callbackOff])&#10; * @param component - Component to check collisions for.&#10; * @param callbackOn - Callback method to execute upon collision with component. Will be passed the results of the collision check in the same format documented for hit().&#10; * @param callbackOff - Callback method executed once as soon as collision stops.&#10; *&#10; * Creates an EnterFrame event calling `.hit()` each frame.  When a collision is detected the `callbackOn` will be invoked.&#10; * Note that the `callbackOn` will be invoked every frame the collision is active, not just the first time the collision occurs.&#10; *&#10; * If you want more fine-grained control consider using `.checkHits()`, `.hit()` or even `Crafty.map.search()`.&#10; *&#10; * @see .checkHits&#10; * @see .hit&#10; */&#10;onHit: function (component, callbackOn, callbackOff) &#123;&#10;    var justHit = false;&#10;    this.bind(&#34;EnterFrame&#34;, function () &#123;&#10;        var hitData = this.hit(component);&#10;        if (hitData) &#123;&#10;            justHit = true;&#10;            callbackOn.call(this, hitData);&#10;        &#125; else if (justHit) &#123;&#10;            if (typeof callbackOff == &#39;function&#39;) &#123;&#10;                callbackOff.call(this);&#10;            &#125;&#10;            justHit = false;&#10;        &#125;&#10;    &#125;);&#10;    return this;&#10;&#125;,&#10;&#10;/**&#10; * This is a helper method for creating collisions handlers set up by `checkHits`. Do not call this directly.&#10; *&#10; * @param &#123;String&#125; component - The name of the component for which this handler checks for collisions.&#10; * @param &#123;Object&#125; collisionData - Collision data object used to track collisions with the specified component.&#10; *&#10; * @see .checkHits&#10; */&#10;_createCollisionHandler: function(component, collisionData) &#123;&#10;    return function() &#123;&#10;        var hitData = this.hit(component);&#10;&#10;        if (collisionData.occurring === true) &#123;&#10;            if (hitData !== false) &#123;&#10;                // The collision is still in progress&#10;                return;&#10;            &#125;&#10;&#10;            collisionData.occurring = false;&#10;            this.trigger(&#34;HitOff&#34;, component);&#10;        &#125; else if (hitData !== false) &#123;&#10;            collisionData.occurring = true;&#10;            this.trigger(&#34;HitOn&#34;, hitData);&#10;        &#125;&#10;    &#125;;&#10;&#125;,&#10;&#10;/**@&#10; * #.checkHits&#10; * @comp Collision&#10; * @sign public this .checkHits(String componentList)&#10; * @param componentList - A comma seperated list of components to check for collisions with.&#10; * @sign public this .checkHits(String component1[, .., String componentN])&#10; * @param component# - A component to check for collisions with.&#10; *&#10; * Performs collision checks against all entities that have at least one of&#10; * the components specified when calling this method. If collisions occur,&#10; * a &#34;HitOn&#34; event containing the collision information will be fired for the&#10; * entity on which this method was invoked. See the documentation for `.hit()`&#10; * for a description of collision data contained in the event.&#10; * When a collision that was reported ends, a corresponding &#34;HitOff&#34; event&#10; * will be fired.&#10; *&#10; * Calling this method more than once for the same component type will not&#10; * cause redundant hit checks.&#10; *&#10; * If you want more fine-grained control consider using `.hit()` or even `Crafty.map.search()`.&#10; *&#10; * @note Hit checks are performed upon entering each new frame (using&#10; * the *EnterFrame* event). It is entirely possible for object to move in&#10; * said frame after the checks were performed (even if the more is the&#10; * result of *EnterFrame*, as handlers run in no particular order). In such&#10; * a case, the hit events will not fire until the next check is performed in&#10; * the following frame.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * Crafty.e("2D, Collision")
     *     .checkHits('Solid') // check for collisions with entities that have the Solid component in each frame
     *     .bind("HitOn", function(hitData) {
     *         Crafty.log("Collision with Solid entity occurred for the first time.");
     *     })
     *     .bind("HitOff", function(comp) {
     *         Crafty.log("Collision with Solid entity ended.");
     *     });
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> *&#10; * @see .hit&#10; */&#10;checkHits: function () &#123;&#10;    var components = arguments;&#10;    var i = 0;&#10;&#10;    if (components.length === 1) &#123;&#10;        components = components[0].split(/\s*,\s*/);&#10;    &#125;&#10;&#10;    for (; i &#60; components.length; ++i) &#123;&#10;        var component = components[i];&#10;        var collisionData = this._collisionData[component];&#10;&#10;        if (collisionData !== undefined) &#123;&#10;            // There is already a handler for collision with this component&#10;            continue;&#10;        &#125;&#10;&#10;        this._collisionData[component] = collisionData = &#123; occurring: false, handler: null &#125;;&#10;        collisionData.handler = this._createCollisionHandler(component, collisionData);&#10;&#10;        this.bind(&#34;EnterFrame&#34;, collisionData.handler);&#10;    &#125;&#10;&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.ignoreHits&#10; * @comp Collision&#10; *&#10; * @sign public this .ignoreHits()&#10; *&#10; * @sign public this .ignoreHits(String componentList)&#10; * @param componentList - A comma separated list of components to stop checking&#10; * for collisions with.&#10; *&#10; * @sign public this .ignoreHits(String component1[, .., String componentN])&#10; * @param component# - A component to stop checking for collisions with.&#10; *&#10; * Stops checking for collisions with all, or certain, components. If called&#10; * without arguments, this method will cause all collision checks on the&#10; * entity to cease. To disable checks for collisions with specific&#10; * components, specify the components as a comma separated string or as&#10; * a set of arguments.&#10; *&#10; * Calling this method with component names for which there are no collision&#10; * checks has no effect.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * Crafty.e("2D, Collision")
     *     .checkHits('Solid')
     *     ...
     *     .ignoreHits('Solid'); // stop checking for collisions with entities that have the Solid component
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;ignoreHits: function () &#123;&#10;    var components = arguments;&#10;    var i = 0;&#10;    var collisionData;&#10;&#10;    if (components.length === 0) &#123;&#10;        for (collisionData in this._collisionData) &#123;&#10;            this.unbind(&#34;EnterFrame&#34;, collisionData.handler);&#10;        &#125;&#10;&#10;        this._collisionData = &#123;&#125;;&#10;    &#125;&#10;&#10;    if (components.length === 1) &#123;&#10;        components = components[0].split(/\s*,\s*/);&#10;    &#125;&#10;&#10;    for (; i &#60; components.length; ++i) &#123;&#10;        var component = components[i];&#10;        collisionData = this._collisionData[component];&#10;&#10;        if (collisionData === undefined) &#123;&#10;            continue;&#10;        &#125;&#10;&#10;        this.unbind(&#34;EnterFrame&#34;, collisionData.handler);&#10;        delete this._collisionData[component];&#10;    &#125;&#10;&#10;    return this;&#10;&#125;,&#10;&#10;/**@&#10; * #.resetHitChecks&#10; * @comp Collision&#10; * @sign public this .resetHitChecks()&#10; * @sign public this .resetHitChecks(String componentList)&#10; * @param componentList - A comma seperated list of components to re-check&#10; * for collisions with.&#10; * @sign public this .resetHitChecks(String component1[, .., String componentN])&#10; * @param component# - A component to re-check for collisions with.&#10; *&#10; * Causes collision events to be received for collisions that are already&#10; * taking place (normally, an additional event would not fire before said&#10; * collisions cease and happen another time).&#10; * If called without arguments, this method will cause all collision checks on the&#10; * entity to fire events once more. To re-check for collisions with specific&#10; * components, specify the components as a comma separated string or as&#10; * a set of arguments.&#10; *&#10; * Calling this method with component names for which there are no collision&#10; * checks has no effect.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

     * // this example fires the HitOn event each frame the collision with the Solid entity is active, instead of just the first time the collision occurs.
     * Crafty.e("2D, Collision")
     *     .checkHits('Solid')
     *     .bind("HitOn", function(hitData) {
     *         Crafty.log("Collision with Solid entity was reported in this frame again!");
     *         this.resetHitChecks('Solid'); // fire the HitOn event in the next frame also, if the collision is still active.
     *     })
     * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">     */&#10;    resetHitChecks: function() &#123;&#10;        var components = arguments;&#10;        var i = 0;&#10;        var collisionData;&#10;&#10;        if (components.length === 0) &#123;&#10;            for (collisionData in this._collisionData) &#123;&#10;                this._collisionData[collisionData].occurring = false;&#10;            &#125;&#10;        &#125;&#10;&#10;        if (components.length === 1) &#123;&#10;            components = components[0].split(/\s*,\s*/);&#10;        &#125;&#10;&#10;        for (; i &#60; components.length; ++i) &#123;&#10;            var component = components[i];&#10;            collisionData = this._collisionData[component];&#10;&#10;            if (collisionData === undefined) &#123;&#10;                continue;&#10;            &#125;&#10;&#10;            collisionData.occurring = false;&#10;        &#125;&#10;&#10;        return this;&#10;    &#125;,&#10;&#10;    _SAT: function (poly1, poly2) &#123;&#10;        var i = 0,&#10;            points1 = poly1.points, points2 = poly2.points,&#10;            l = points1.length/2,&#10;            j, k = points2.length/2,&#10;            nx=0, ny=0,&#10;            length,&#10;            min1, min2,&#10;            max1, max2,&#10;            interval,&#10;            MTV = -Infinity,&#10;            MNx = null,&#10;            MNy = null,&#10;            dot,&#10;            np;&#10;&#10;        //loop through the edges of Polygon 1&#10;        for (; i &#60; l; i++) &#123;&#10;            np = (i == l - 1 ? 0 : i + 1);&#10;&#10;            //generate the normal for the current edge&#10;            nx = -(points1[2*i+1] - points1[2*np+1]);&#10;            ny = (points1[2*i] - points1[2*np]);&#10;&#10;            //normalize the vector&#10;            length = Math.sqrt(nx * nx + ny * ny);&#10;            nx /= length;&#10;            ny /= length;&#10;&#10;            //default min max&#10;            min1 = min2 = Infinity;&#10;            max1 = max2 = -Infinity;&#10;&#10;            //project all vertices from poly1 onto axis&#10;            for (j = 0; j &#60; l; ++j) &#123;&#10;                dot = points1[2*j] * nx + points1[2*j+1] * ny;&#10;                if (dot &#62; max1) max1 = dot;&#10;                if (dot &#60; min1) min1 = dot;&#10;            &#125;&#10;&#10;            //project all vertices from poly2 onto axis&#10;            for (j = 0; j &#60; k; ++j) &#123;&#10;                dot = points2[2*j] * nx + points2[2*j+1] * ny;&#10;                if (dot &#62; max2) max2 = dot;&#10;                if (dot &#60; min2 ) min2 = dot;&#10;            &#125;&#10;&#10;            //calculate the minimum translation vector should be negative&#10;            if (min1 &#60; min2) &#123;&#10;                interval = min2 - max1;&#10;                nx = -nx;&#10;                ny = -ny;&#10;            &#125; else &#123;&#10;                interval = min1 - max2;&#10;            &#125;&#10;&#10;            //exit early if positive&#10;            if (interval &#62;= 0) &#123;&#10;                return false;&#10;            &#125;&#10;&#10;            if (interval &#62; MTV) &#123;&#10;                MTV = interval;&#10;                MNx = nx;&#10;                MNy = ny;&#10;            &#125;&#10;        &#125;&#10;&#10;        //loop through the edges of Polygon 2&#10;        for (i = 0; i &#60; k; i++) &#123;&#10;            np = (i == k - 1 ? 0 : i + 1);&#10;&#10;            //generate the normal for the current edge&#10;            nx = -(points2[2*i+1] - points2[2*np+1]);&#10;            ny = (points2[2*i] - points2[2*np]);&#10;&#10;            //normalize the vector&#10;            length = Math.sqrt(nx * nx + ny * ny);&#10;            nx /= length;&#10;            ny /= length;&#10;&#10;            //default min max&#10;            min1 = min2 = Infinity;&#10;            max1 = max2 = -Infinity;&#10;&#10;            //project all vertices from poly1 onto axis&#10;            for (j = 0; j &#60; l; ++j) &#123;&#10;                dot = points1[2*j] * nx + points1[2*j+1] * ny;&#10;                if (dot &#62; max1) max1 = dot;&#10;                if (dot &#60; min1) min1 = dot;&#10;            &#125;&#10;&#10;            //project all vertices from poly2 onto axis&#10;            for (j = 0; j &#60; k; ++j) &#123;&#10;                dot = points2[2*j] * nx + points2[2*j+1] * ny;&#10;                if (dot &#62; max2) max2 = dot;&#10;                if (dot &#60; min2) min2 = dot;&#10;            &#125;&#10;&#10;            //calculate the minimum translation vector should be negative&#10;            if (min1 &#60; min2) &#123;&#10;                interval = min2 - max1;&#10;                nx = -nx;&#10;                ny = -ny;&#10;            &#125; else &#123;&#10;                interval = min1 - max2;&#10;            &#125;&#10;&#10;            //exit early if positive&#10;            if (interval &#62;= 0) &#123;&#10;                return false;&#10;            &#125;&#10;&#10;            if (interval &#62; MTV) &#123;&#10;                MTV = interval;&#10;                MNx = nx;&#10;                MNy = ny;&#10;            &#125;&#10;        &#125;&#10;&#10;        return &#123;&#10;            overlap: MTV,&#10;            normal: &#123;&#10;                x: MNx,&#10;                y: MNy&#10;            &#125;&#10;        &#125;;&#10;    &#125;&#10;&#125;);&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],41:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;&#10;/**@&#10; * #Crafty.math&#10; * @category Utilities&#10; *&#10; * A set of utility functions for common (and not so common) operations.&#10; */&#10;Crafty.math = &#123;&#10;    /**@&#10;     * #Crafty.math.abs&#10;     * @comp Crafty.math&#10;     * @sign public this Crafty.math.abs(Number n)&#10;     * @param n - Some value.&#10;     * @return Absolute value.&#10;     *&#10;     * Returns the absolute value.&#10;     */&#10;    abs: function (x) &#123;&#10;        return x &#60; 0 ? -x : x;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #Crafty.math.amountOf&#10;     * @comp Crafty.math&#10;     * @sign public Number Crafty.math.amountOf(Number checkValue, Number minValue, Number maxValue)&#10;     * @param checkValue - Value that should checked with minimum and maximum.&#10;     * @param minValue - Bottom of the range&#10;     * @param maxValue - Top of the range&#10;     * @return The position of the checked value in a coordinate system normalized such that `minValue` is 0 and `maxValue` is 1.&#10;     *&#10;     * If checkValue is within the range, this will return a number between 0 and 1.&#10;     */&#10;    amountOf: function (checkValue, minValue, maxValue) &#123;&#10;        if (minValue &#60; maxValue)&#10;            return (checkValue - minValue) / (maxValue - minValue);&#10;        else&#10;            return (checkValue - maxValue) / (minValue - maxValue);&#10;    &#125;,&#10;&#10;&#10;    /**@&#10;     * #Crafty.math.clamp&#10;     * @comp Crafty.math&#10;     * @sign public Number Crafty.math.clamp(Number value, Number min, Number max)&#10;     * @param value - A value.&#10;     * @param max - Maximum that value can be.&#10;     * @param min - Minimum that value can be.&#10;     * @return The value between minimum and maximum.&#10;     *&#10;     * Restricts a value to be within a specified range.&#10;     */&#10;    clamp: function (value, min, max) &#123;&#10;        if (value &#62; max)&#10;            return max;&#10;        else if (value &#60; min)&#10;            return min;&#10;        else&#10;            return value;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #Crafty.math.degToRad&#10;     * Converts angle from degree to radian.&#10;     * @comp Crafty.math&#10;     * @sign public Number degToRad(angleInDeg)&#10;     * @param angleInDeg - The angle in degrees.&#10;     * @return The angle in radians.&#10;     */&#10;    degToRad: function (angleInDeg) &#123;&#10;        return angleInDeg * Math.PI / 180;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #Crafty.math.distance&#10;     * @comp Crafty.math&#10;     * @sign public Number Crafty.math.distance(Number x1, Number y1, Number x2, Number y2)&#10;     * @param x1 - First x coordinate.&#10;     * @param y1 - First y coordinate.&#10;     * @param x2 - Second x coordinate.&#10;     * @param y2 - Second y coordinate.&#10;     * @return The distance between the two points.&#10;     *&#10;     * Distance between two points.&#10;     */&#10;    distance: function (x1, y1, x2, y2) &#123;&#10;        var squaredDistance = Crafty.math.squaredDistance(x1, y1, x2, y2);&#10;        return Math.sqrt(parseFloat(squaredDistance));&#10;    &#125;,&#10;&#10;    /**@&#10;     * #Crafty.math.lerp&#10;     * @comp Crafty.math&#10;     * @sign public Number Crafty.math.lerp(Number value1, Number value2, Number amount)&#10;     * @param value1 - One value.&#10;     * @param value2 - Another value.&#10;     * @param amount - Amount of value2 to value1.&#10;     * @return Linear interpolated value.&#10;     *&#10;     * Linear interpolation. Passing amount with a value of 0 will cause value1 to be returned,&#10;     * a value of 1 will cause value2 to be returned.&#10;     */&#10;    lerp: function (value1, value2, amount) &#123;&#10;        return value1 + (value2 - value1) * amount;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #Crafty.math.negate&#10;     * @comp Crafty.math&#10;     * @sign public Number Crafty.math.negate(Number percent)&#10;     * @param percent - The probability of returning `-1`&#10;     * @return 1 or -1.&#10;     *&#10;     * Returns `1` or `-1` randomly.&#10;     */&#10;    negate: function (percent) &#123;&#10;        if (Math.random() &#60; percent)&#10;            return -1;&#10;        else&#10;            return 1;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #Crafty.math.radToDeg&#10;     * @comp Crafty.math&#10;     * @sign public Number Crafty.math.radToDeg(Number angle)&#10;     * @param angleInRad - The angle in radian.&#10;     * @return The angle in degree.&#10;     *&#10;     * Converts angle from radian to degree.&#10;     */&#10;    radToDeg: function (angleInRad) &#123;&#10;        return angleInRad * 180 / Math.PI;&#10;    &#125;,&#10;&#10;    /**@&#10;     * #Crafty.math.randomElementOfArray&#10;     * @comp Crafty.math&#10;     * @sign public Object Crafty.math.randomElementOfArray(Array array)&#10;     * @param array - A specific array.&#10;     * @return A random element of a specific array.&#10;     *&#10;     * Returns a random element of a specific array.&#10;     */&#10;    randomElementOfArray: function (array) &#123;&#10;        return array[Math.floor(array.length * Math.random())];&#10;    &#125;,&#10;&#10;    /**@&#10;     * #Crafty.math.randomInt&#10;     * @comp Crafty.math&#10;     * @sign public Number Crafty.math.randomInt(Number start, Number end)&#10;     * @param start - Smallest int value that can be returned.&#10;     * @param end - Biggest int value that can be returned.&#10;     * @return A random int.&#10;     *&#10;     * Returns a random int within a specific range.&#10;     */&#10;    randomInt: function (start, end) &#123;&#10;        return start + Math.floor((1 + end - start) * Math.random());&#10;    &#125;,&#10;&#10;    /**@&#10;     * #Crafty.math.randomNumber&#10;     * @comp Crafty.math&#10;     * @sign public Number Crafty.math.randomInt(Number start, Number end)&#10;     * @param start - Smallest number value that can be returned.&#10;     * @param end - Biggest number value that can be returned.&#10;     * @return A random number.&#10;     *&#10;     * Returns a random number in within a specific range.&#10;     */&#10;    randomNumber: function (start, end) &#123;&#10;        return start + (end - start) * Math.random();&#10;    &#125;,&#10;&#10;    /**@&#10;     * #Crafty.math.squaredDistance&#10;     * @comp Crafty.math&#10;     * @sign public Number Crafty.math.squaredDistance(Number x1, Number y1, Number x2, Number y2)&#10;     * @param x1 - First x coordinate.&#10;     * @param y1 - First y coordinate.&#10;     * @param x2 - Second x coordinate.&#10;     * @param y2 - Second y coordinate.&#10;     * @return The squared distance between the two points.&#10;     *&#10;     * Squared distance between two points.&#10;     */&#10;    squaredDistance: function (x1, y1, x2, y2) &#123;&#10;        return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);&#10;    &#125;,&#10;&#10;    /**@&#10;     * #Crafty.math.withinRange&#10;     * @comp Crafty.math&#10;     * @sign public Boolean Crafty.math.withinRange(Number value, Number min, Number max)&#10;     * @param value - The specific value.&#10;     * @param min - Minimum value.&#10;     * @param max - Maximum value.&#10;     * @return Returns true if value is within a specific range.&#10;     *&#10;     * Check if a value is within a specific range.&#10;     */&#10;    withinRange: function (value, min, max) &#123;&#10;        return (value &#62;= min &#38;&#38; value &#60;= max);&#10;    &#125;&#10;&#125;;&#10;&#10;Crafty.math.Vector2D = (function () &#123;&#10;    /**@&#10;     * #Crafty.math.Vector2D&#10;     * @category 2D&#10;     * @class This is a general purpose 2D vector class&#10;     *&#10;     * Vector2D uses the following form:&#10;     * &#60;x, y&#62;&#10;     *&#10;     * @public&#10;     * @sign public &#123;Vector2D&#125; Vector2D();&#10;     * @sign public &#123;Vector2D&#125; Vector2D(Vector2D);&#10;     * @sign public &#123;Vector2D&#125; Vector2D(Number, Number);&#10;     * @param &#123;Vector2D|Number=0&#125; x&#10;     * @param &#123;Number=0&#125; y&#10;     */&#10;&#10;    function Vector2D(x, y) &#123;&#10;        if (x instanceof Vector2D) &#123;&#10;            this.x = x.x;&#10;            this.y = x.y;&#10;        &#125; else if (arguments.length === 2) &#123;&#10;            this.x = x;&#10;            this.y = y;&#10;        &#125; else if (arguments.length &#62; 0)&#10;            throw &#34;Unexpected number of arguments for Vector2D()&#34;;&#10;    &#125; // class Vector2D&#10;&#10;    Vector2D.prototype.x = 0;&#10;    Vector2D.prototype.y = 0;&#10;&#10;    /**@&#10;     * #.add&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Adds the passed vector to this vector&#10;     *&#10;     * @public&#10;     * @sign public &#123;Vector2D&#125; add(Vector2D);&#10;     * @param &#123;vector2D&#125; vecRH&#10;     * @returns &#123;Vector2D&#125; this after adding&#10;     */&#10;    Vector2D.prototype.add = function (vecRH) &#123;&#10;        this.x += vecRH.x;&#10;        this.y += vecRH.y;&#10;        return this;&#10;    &#125;; // add&#10;&#10;    /**@&#10;     * #.angleBetween&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Calculates the angle between the passed vector and this vector, using &#60;0,0&#62; as the point of reference.&#10;     * Angles returned have the range (&#8722;&#960;, &#960;].&#10;     *&#10;     * @public&#10;     * @sign public &#123;Number&#125; angleBetween(Vector2D);&#10;     * @param &#123;Vector2D&#125; vecRH&#10;     * @returns &#123;Number&#125; the angle between the two vectors in radians&#10;     */&#10;    Vector2D.prototype.angleBetween = function (vecRH) &#123;&#10;        return Math.atan2(this.x * vecRH.y - this.y * vecRH.x, this.x * vecRH.x + this.y * vecRH.y);&#10;    &#125;; // angleBetween&#10;&#10;    /**@&#10;     * #.angleTo&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Calculates the angle to the passed vector from this vector, using this vector as the point of reference.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Number&#125; angleTo(Vector2D);&#10;     * @param &#123;Vector2D&#125; vecRH&#10;     * @returns &#123;Number&#125; the angle to the passed vector in radians&#10;     */&#10;    Vector2D.prototype.angleTo = function (vecRH) &#123;&#10;        return Math.atan2(vecRH.y - this.y, vecRH.x - this.x);&#10;    &#125;;&#10;&#10;    /**@&#10;     * #.clone&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Creates and exact, numeric copy of this vector&#10;     *&#10;     * @public&#10;     * @sign public &#123;Vector2D&#125; clone();&#10;     * @returns &#123;Vector2D&#125; the new vector&#10;     */&#10;    Vector2D.prototype.clone = function () &#123;&#10;        return new Vector2D(this);&#10;    &#125;; // clone&#10;&#10;    /**@&#10;     * #.distance&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Calculates the distance from this vector to the passed vector.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Number&#125; distance(Vector2D);&#10;     * @param &#123;Vector2D&#125; vecRH&#10;     * @returns &#123;Number&#125; the distance between the two vectors&#10;     */&#10;    Vector2D.prototype.distance = function (vecRH) &#123;&#10;        return Math.sqrt((vecRH.x - this.x) * (vecRH.x - this.x) + (vecRH.y - this.y) * (vecRH.y - this.y));&#10;    &#125;; // distance&#10;&#10;    /**@&#10;     * #.distanceSq&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Calculates the squared distance from this vector to the passed vector.&#10;     * This function avoids calculating the square root, thus being slightly faster than .distance( ).&#10;     *&#10;     * @public&#10;     * @sign public &#123;Number&#125; distanceSq(Vector2D);&#10;     * @param &#123;Vector2D&#125; vecRH&#10;     * @returns &#123;Number&#125; the squared distance between the two vectors&#10;     * @see .distance&#10;     */&#10;    Vector2D.prototype.distanceSq = function (vecRH) &#123;&#10;        return (vecRH.x - this.x) * (vecRH.x - this.x) + (vecRH.y - this.y) * (vecRH.y - this.y);&#10;    &#125;; // distanceSq&#10;&#10;    /**@&#10;     * #.divide&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Divides this vector by the passed vector.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Vector2D&#125; divide(Vector2D);&#10;     * @param &#123;Vector2D&#125; vecRH&#10;     * @returns &#123;Vector2D&#125; this vector after dividing&#10;     */&#10;    Vector2D.prototype.divide = function (vecRH) &#123;&#10;        this.x /= vecRH.x;&#10;        this.y /= vecRH.y;&#10;        return this;&#10;    &#125;; // divide&#10;&#10;    /**@&#10;     * #.dotProduct&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Calculates the dot product of this and the passed vectors&#10;     *&#10;     * @public&#10;     * @sign public &#123;Number&#125; dotProduct(Vector2D);&#10;     * @param &#123;Vector2D&#125; vecRH&#10;     * @returns &#123;Number&#125; the resultant dot product&#10;     */&#10;    Vector2D.prototype.dotProduct = function (vecRH) &#123;&#10;        return this.x * vecRH.x + this.y * vecRH.y;&#10;    &#125;; // dotProduct&#10;&#10;    /**@&#10;     * #.crossProduct&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Calculates the z component of the cross product of the two vectors augmented to 3D.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Number&#125; crossProduct(Vector2D);&#10;     * @param &#123;Vector2D&#125; vecRH&#10;     * @returns &#123;Number&#125; the resultant cross product&#10;     */&#10;    Vector2D.prototype.crossProduct = function (vecRH) &#123;&#10;        return this.x * vecRH.y - this.y * vecRH.x;&#10;    &#125;; // crossProduct&#10;&#10;    /**@&#10;     * #.equals&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Determines if this vector is numerically equivalent to the passed vector.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Boolean&#125; equals(Vector2D);&#10;     * @param &#123;Vector2D&#125; vecRH&#10;     * @returns &#123;Boolean&#125; true if the vectors are equivalent&#10;     */&#10;    Vector2D.prototype.equals = function (vecRH) &#123;&#10;        return vecRH instanceof Vector2D &#38;&#38;&#10;            this.x == vecRH.x &#38;&#38; this.y == vecRH.y;&#10;    &#125;; // equals&#10;&#10;    /**@&#10;     * #.perpendicular&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Calculates a new vector that is perpendicular to this vector.&#10;     * The perpendicular vector has the same magnitude as this vector and is obtained by a counter-clockwise rotation of 90&#176; of this vector.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Vector2D&#125; perpendicular([Vector2D]);&#10;     * @param &#123;Vector2D&#125; [result] - An optional parameter to save the result in&#10;     * @returns &#123;Vector2D&#125; the perpendicular vector&#10;     */&#10;    Vector2D.prototype.perpendicular = function (result) &#123;&#10;        result = result || new Vector2D();&#10;        return result.setValues(-this.y, this.x);&#10;    &#125;; // perpendicular&#10;&#10;    /**@&#10;     * #.getNormal&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Calculates a new right-handed unit vector that is perpendicular to the line created by this and the passed vector.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Vector2D&#125; getNormal(Vector2D[, Vector2D]);&#10;     * @param &#123;Vector2D&#125; vecRH&#10;     * @param &#123;Vector2D&#125; [result] - An optional parameter to save the result in&#10;     * @returns &#123;Vector2D&#125; the new normal vector&#10;     */&#10;    Vector2D.prototype.getNormal = function (vecRH, result) &#123;&#10;        result = result || new Vector2D();&#10;        return result.setValues(vecRH.y - this.y, this.x - vecRH.x).normalize();&#10;    &#125;; // getNormal&#10;&#10;    /**@&#10;     * #.isZero&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Determines if this vector is equal to &#60;0,0&#62;&#10;     *&#10;     * @public&#10;     * @sign public &#123;Boolean&#125; isZero();&#10;     * @returns &#123;Boolean&#125; true if this vector is equal to &#60;0,0&#62;&#10;     */&#10;    Vector2D.prototype.isZero = function () &#123;&#10;        return this.x === 0 &#38;&#38; this.y === 0;&#10;    &#125;; // isZero&#10;&#10;    /**@&#10;     * #.magnitude&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Calculates the magnitude of this vector.&#10;     * Note: Function objects in JavaScript already have a &#39;length&#39; member, hence the use of magnitude instead.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Number&#125; magnitude();&#10;     * @returns &#123;Number&#125; the magnitude of this vector&#10;     */&#10;    Vector2D.prototype.magnitude = function () &#123;&#10;        return Math.sqrt(this.x * this.x + this.y * this.y);&#10;    &#125;; // magnitude&#10;&#10;    /**@&#10;     * #.magnitudeSq&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Calculates the square of the magnitude of this vector.&#10;     * This function avoids calculating the square root, thus being slightly faster than .magnitude( ).&#10;     *&#10;     * @public&#10;     * @sign public &#123;Number&#125; magnitudeSq();&#10;     * @returns &#123;Number&#125; the square of the magnitude of this vector&#10;     * @see .magnitude&#10;     */&#10;    Vector2D.prototype.magnitudeSq = function () &#123;&#10;        return this.x * this.x + this.y * this.y;&#10;    &#125;; // magnitudeSq&#10;&#10;    /**@&#10;     * #.multiply&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Multiplies this vector by the passed vector&#10;     *&#10;     * @public&#10;     * @sign public &#123;Vector2D&#125; multiply(Vector2D);&#10;     * @param &#123;Vector2D&#125; vecRH&#10;     * @returns &#123;Vector2D&#125; this vector after multiplying&#10;     */&#10;    Vector2D.prototype.multiply = function (vecRH) &#123;&#10;        this.x *= vecRH.x;&#10;        this.y *= vecRH.y;&#10;        return this;&#10;    &#125;; // multiply&#10;&#10;    /**@&#10;     * #.negate&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Negates this vector (ie. &#60;-x,-y&#62;)&#10;     *&#10;     * @public&#10;     * @sign public &#123;Vector2D&#125; negate();&#10;     * @returns &#123;Vector2D&#125; this vector after negation&#10;     */&#10;    Vector2D.prototype.negate = function () &#123;&#10;        this.x = -this.x;&#10;        this.y = -this.y;&#10;        return this;&#10;    &#125;; // negate&#10;&#10;    /**@&#10;     * #.normalize&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Normalizes this vector (scales the vector so that its new magnitude is 1)&#10;     * For vectors where magnitude is 0, &#60;1,0&#62; is returned.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Vector2D&#125; normalize();&#10;     * @returns &#123;Vector2D&#125; this vector after normalization&#10;     */&#10;    Vector2D.prototype.normalize = function () &#123;&#10;        var lng = Math.sqrt(this.x * this.x + this.y * this.y);&#10;&#10;        if (lng === 0) &#123;&#10;            // default due East&#10;            this.x = 1;&#10;            this.y = 0;&#10;        &#125; else &#123;&#10;            this.x /= lng;&#10;            this.y /= lng;&#10;        &#125; // else&#10;&#10;        return this;&#10;    &#125;; // normalize&#10;&#10;    /**@&#10;     * #.scale&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Scales this vector by the passed amount(s)&#10;     * If scalarY is omitted, scalarX is used for both axes&#10;     *&#10;     * @public&#10;     * @sign public &#123;Vector2D&#125; scale(Number[, Number]);&#10;     * @param &#123;Number&#125; scalarX&#10;     * @param &#123;Number&#125; [scalarY]&#10;     * @returns &#123;Vector2D&#125; this after scaling&#10;     */&#10;    Vector2D.prototype.scale = function (scalarX, scalarY) &#123;&#10;        if (scalarY === undefined)&#10;            scalarY = scalarX;&#10;&#10;        this.x *= scalarX;&#10;        this.y *= scalarY;&#10;&#10;        return this;&#10;    &#125;; // scale&#10;&#10;    /**@&#10;     * #.scaleToMagnitude&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Scales this vector such that its new magnitude is equal to the passed value.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Vector2D&#125; scaleToMagnitude(Number);&#10;     * @param &#123;Number&#125; mag&#10;     * @returns &#123;Vector2D&#125; this vector after scaling&#10;     */&#10;    Vector2D.prototype.scaleToMagnitude = function (mag) &#123;&#10;        var k = mag / this.magnitude();&#10;        this.x *= k;&#10;        this.y *= k;&#10;        return this;&#10;    &#125;; // scaleToMagnitude&#10;&#10;    /**@&#10;     * #.setValues&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Sets the values of this vector using a passed vector or pair of numbers.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Vector2D&#125; setValues(Vector2D);&#10;     * @sign public &#123;Vector2D&#125; setValues(Number, Number);&#10;     * @param &#123;Number|Vector2D&#125; x&#10;     * @param &#123;Number&#125; y&#10;     * @returns &#123;Vector2D&#125; this vector after setting of values&#10;     */&#10;    Vector2D.prototype.setValues = function (x, y) &#123;&#10;        if (x instanceof Vector2D) &#123;&#10;            this.x = x.x;&#10;            this.y = x.y;&#10;        &#125; else &#123;&#10;            this.x = x;&#10;            this.y = y;&#10;        &#125; // else&#10;&#10;        return this;&#10;    &#125;; // setValues&#10;&#10;    /**@&#10;     * #.subtract&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Subtracts the passed vector from this vector.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Vector2D&#125; subtract(Vector2D);&#10;     * @param &#123;Vector2D&#125; vecRH&#10;     * @returns &#123;vector2D&#125; this vector after subtracting&#10;     */&#10;    Vector2D.prototype.subtract = function (vecRH) &#123;&#10;        this.x -= vecRH.x;&#10;        this.y -= vecRH.y;&#10;        return this;&#10;    &#125;; // subtract&#10;&#10;    /**@&#10;     * #.toString&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Returns a string representation of this vector.&#10;     *&#10;     * @public&#10;     * @sign public &#123;String&#125; toString();&#10;     * @returns &#123;String&#125;&#10;     */&#10;    Vector2D.prototype.toString = function () &#123;&#10;        return &#34;Vector2D(&#34; + this.x + &#34;, &#34; + this.y + &#34;)&#34;;&#10;    &#125;; // toString&#10;&#10;    /**@&#10;     * #.translate&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Translates (moves) this vector by the passed amounts.&#10;     * If dy is omitted, dx is used for both axes.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Vector2D&#125; translate(Number[, Number]);&#10;     * @param &#123;Number&#125; dx&#10;     * @param &#123;Number&#125; [dy]&#10;     * @returns &#123;Vector2D&#125; this vector after translating&#10;     */&#10;    Vector2D.prototype.translate = function (dx, dy) &#123;&#10;        if (dy === undefined)&#10;            dy = dx;&#10;&#10;        this.x += dx;&#10;        this.y += dy;&#10;&#10;        return this;&#10;    &#125;; // translate&#10;&#10;    /**@&#10;     * #.tripleProduct&#10;     * @comp Crafty.math.Vector2D&#10;     *&#10;     * Calculates the triple product of three vectors.&#10;     * triple vector product = b(a&#8226;c) - a(b&#8226;c)&#10;     *&#10;     * @public&#10;     * @static&#10;     * @sign public &#123;Vector2D&#125; tripleProduct(Vector2D, Vector2D, Vector2D, [Vector2D]);&#10;     * @param &#123;Vector2D&#125; a&#10;     * @param &#123;Vector2D&#125; b&#10;     * @param &#123;Vector2D&#125; c&#10;     * @param &#123;Vector2D&#125; [result] - An optional parameter to save the result in&#10;     * @return &#123;Vector2D&#125; the triple product as a new vector&#10;     */&#10;    Vector2D.tripleProduct = function (a, b, c, result) &#123;&#10;        result = result || new Crafty.math.Vector2D();&#10;        var ac = a.dotProduct(c);&#10;        var bc = b.dotProduct(c);&#10;        return result.setValues(b.x * ac - a.x * bc, b.y * ac - a.y * bc);&#10;    &#125;;&#10;&#10;    return Vector2D;&#10;&#125;)();&#10;&#10;Crafty.math.Matrix2D = (function () &#123;&#10;    /**@&#10;     * #Crafty.math.Matrix2D&#10;     * @category 2D&#10;     *&#10;     * @class This is a 2D Matrix2D class. It is 3x3 to allow for affine transformations in 2D space.&#10;     * The third row is always assumed to be [0, 0, 1].&#10;     *&#10;     * Matrix2D uses the following form, as per the whatwg.org specifications for canvas.transform():&#10;     * [a, c, e]&#10;     * [b, d, f]&#10;     * [0, 0, 1]&#10;     *&#10;     * @public&#10;     * @sign public &#123;Matrix2D&#125; new Matrix2D();&#10;     * @sign public &#123;Matrix2D&#125; new Matrix2D(Matrix2D);&#10;     * @sign public &#123;Matrix2D&#125; new Matrix2D(Number, Number, Number, Number, Number, Number);&#10;     * @param &#123;Matrix2D|Number=1&#125; a&#10;     * @param &#123;Number=0&#125; b&#10;     * @param &#123;Number=0&#125; c&#10;     * @param &#123;Number=1&#125; d&#10;     * @param &#123;Number=0&#125; e&#10;     * @param &#123;Number=0&#125; f&#10;     */&#10;    Matrix2D = function (a, b, c, d, e, f) &#123;&#10;        if (a instanceof Matrix2D) &#123;&#10;            this.a = a.a;&#10;            this.b = a.b;&#10;            this.c = a.c;&#10;            this.d = a.d;&#10;            this.e = a.e;&#10;            this.f = a.f;&#10;        &#125; else if (arguments.length === 6) &#123;&#10;            this.a = a;&#10;            this.b = b;&#10;            this.c = c;&#10;            this.d = d;&#10;            this.e = e;&#10;            this.f = f;&#10;        &#125; else if (arguments.length &#62; 0)&#10;            throw &#34;Unexpected number of arguments for Matrix2D()&#34;;&#10;    &#125;; // class Matrix2D&#10;&#10;    Matrix2D.prototype.a = 1;&#10;    Matrix2D.prototype.b = 0;&#10;    Matrix2D.prototype.c = 0;&#10;    Matrix2D.prototype.d = 1;&#10;    Matrix2D.prototype.e = 0;&#10;    Matrix2D.prototype.f = 0;&#10;&#10;    /**@&#10;     * #.apply&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Applies the matrix transformations to the passed object&#10;     *&#10;     * @public&#10;     * @sign public &#123;Vector2D&#125; apply(Vector2D);&#10;     * @param &#123;Vector2D&#125; vecRH - vector to be transformed&#10;     * @returns &#123;Vector2D&#125; the passed vector object after transforming&#10;     */&#10;    Matrix2D.prototype.apply = function (vecRH) &#123;&#10;        // I&#39;m not sure of the best way for this function to be implemented. Ideally&#10;        // support for other objects (rectangles, polygons, etc) should be easily&#10;        // addable in the future. Maybe a function (apply) is not the best way to do&#10;        // this...?&#10;&#10;        var tmpX = vecRH.x;&#10;        vecRH.x = tmpX * this.a + vecRH.y * this.c + this.e;&#10;        vecRH.y = tmpX * this.b + vecRH.y * this.d + this.f;&#10;        // no need to homogenize since the third row is always [0, 0, 1]&#10;&#10;        return vecRH;&#10;    &#125;; // apply&#10;&#10;    /**@&#10;     * #.clone&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Creates an exact, numeric copy of the current matrix&#10;     *&#10;     * @public&#10;     * @sign public &#123;Matrix2D&#125; clone();&#10;     * @returns &#123;Matrix2D&#125;&#10;     */&#10;    Matrix2D.prototype.clone = function () &#123;&#10;        return new Matrix2D(this);&#10;    &#125;; // clone&#10;&#10;    /**@&#10;     * #.combine&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Multiplies this matrix with another, overriding the values of this matrix.&#10;     * The passed matrix is assumed to be on the right-hand side.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Matrix2D&#125; combine(Matrix2D);&#10;     * @param &#123;Matrix2D&#125; mtrxRH&#10;     * @returns &#123;Matrix2D&#125; this matrix after combination&#10;     */&#10;    Matrix2D.prototype.combine = function (mtrxRH) &#123;&#10;        var tmp = this.a;&#10;        this.a = tmp * mtrxRH.a + this.b * mtrxRH.c;&#10;        this.b = tmp * mtrxRH.b + this.b * mtrxRH.d;&#10;        tmp = this.c;&#10;        this.c = tmp * mtrxRH.a + this.d * mtrxRH.c;&#10;        this.d = tmp * mtrxRH.b + this.d * mtrxRH.d;&#10;        tmp = this.e;&#10;        this.e = tmp * mtrxRH.a + this.f * mtrxRH.c + mtrxRH.e;&#10;        this.f = tmp * mtrxRH.b + this.f * mtrxRH.d + mtrxRH.f;&#10;        return this;&#10;    &#125;; // combine&#10;&#10;    /**@&#10;     * #.equals&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Checks for the numeric equality of this matrix versus another.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Boolean&#125; equals(Matrix2D);&#10;     * @param &#123;Matrix2D&#125; mtrxRH&#10;     * @returns &#123;Boolean&#125; true if the two matrices are numerically equal&#10;     */&#10;    Matrix2D.prototype.equals = function (mtrxRH) &#123;&#10;        return mtrxRH instanceof Matrix2D &#38;&#38;&#10;            this.a == mtrxRH.a &#38;&#38; this.b == mtrxRH.b &#38;&#38; this.c == mtrxRH.c &#38;&#38;&#10;            this.d == mtrxRH.d &#38;&#38; this.e == mtrxRH.e &#38;&#38; this.f == mtrxRH.f;&#10;    &#125;; // equals&#10;&#10;    /**@&#10;     * #.determinant&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Calculates the determinant of this matrix&#10;     *&#10;     * @public&#10;     * @sign public &#123;Number&#125; determinant();&#10;     * @returns &#123;Number&#125; det(this matrix)&#10;     */&#10;    Matrix2D.prototype.determinant = function () &#123;&#10;        return this.a * this.d - this.b * this.c;&#10;    &#125;; // determinant&#10;&#10;    /**@&#10;     * #.invert&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Inverts this matrix if possible&#10;     *&#10;     * @public&#10;     * @sign public &#123;Matrix2D&#125; invert();&#10;     * @returns &#123;Matrix2D&#125; this inverted matrix or the original matrix on failure&#10;     * @see .isInvertible&#10;     */&#10;    Matrix2D.prototype.invert = function () &#123;&#10;        var det = this.determinant();&#10;&#10;        // matrix is invertible if its determinant is non-zero&#10;        if (det !== 0) &#123;&#10;            var old = &#123;&#10;                a: this.a,&#10;                b: this.b,&#10;                c: this.c,&#10;                d: this.d,&#10;                e: this.e,&#10;                f: this.f&#10;            &#125;;&#10;            this.a = old.d / det;&#10;            this.b = -old.b / det;&#10;            this.c = -old.c / det;&#10;            this.d = old.a / det;&#10;            this.e = (old.c * old.f - old.e * old.d) / det;&#10;            this.f = (old.e * old.b - old.a * old.f) / det;&#10;        &#125; // if&#10;&#10;        return this;&#10;    &#125;; // invert&#10;&#10;    /**@&#10;     * #.isIdentity&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Returns true if this matrix is the identity matrix&#10;     *&#10;     * @public&#10;     * @sign public &#123;Boolean&#125; isIdentity();&#10;     * @returns &#123;Boolean&#125;&#10;     */&#10;    Matrix2D.prototype.isIdentity = function () &#123;&#10;        return this.a === 1 &#38;&#38; this.b === 0 &#38;&#38; this.c === 0 &#38;&#38; this.d === 1 &#38;&#38; this.e === 0 &#38;&#38; this.f === 0;&#10;    &#125;; // isIdentity&#10;&#10;    /**@&#10;     * #.isInvertible&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Determines is this matrix is invertible.&#10;     *&#10;     * @public&#10;     * @sign public &#123;Boolean&#125; isInvertible();&#10;     * @returns &#123;Boolean&#125; true if this matrix is invertible&#10;     * @see .invert&#10;     */&#10;    Matrix2D.prototype.isInvertible = function () &#123;&#10;        return this.determinant() !== 0;&#10;    &#125;; // isInvertible&#10;&#10;    /**@&#10;     * #.preRotate&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Applies a counter-clockwise pre-rotation to this matrix&#10;     *&#10;     * @public&#10;     * @sign public &#123;Matrix2D&#125; preRotate(Number);&#10;     * @param &#123;number&#125; rads - angle to rotate in radians&#10;     * @returns &#123;Matrix2D&#125; this matrix after pre-rotation&#10;     */&#10;    Matrix2D.prototype.preRotate = function (rads) &#123;&#10;        var nCos = Math.cos(rads);&#10;        var nSin = Math.sin(rads);&#10;&#10;        var tmp = this.a;&#10;        this.a = nCos * tmp - nSin * this.b;&#10;        this.b = nSin * tmp + nCos * this.b;&#10;        tmp = this.c;&#10;        this.c = nCos * tmp - nSin * this.d;&#10;        this.d = nSin * tmp + nCos * this.d;&#10;&#10;        return this;&#10;    &#125;; // preRotate&#10;&#10;    /**@&#10;     * #.preScale&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Applies a pre-scaling to this matrix&#10;     *&#10;     * @public&#10;     * @sign public &#123;Matrix2D&#125; preScale(Number[, Number]);&#10;     * @param &#123;Number&#125; scalarX&#10;     * @param &#123;Number&#125; [scalarY] scalarX is used if scalarY is undefined&#10;     * @returns &#123;Matrix2D&#125; this after pre-scaling&#10;     */&#10;    Matrix2D.prototype.preScale = function (scalarX, scalarY) &#123;&#10;        if (scalarY === undefined)&#10;            scalarY = scalarX;&#10;&#10;        this.a *= scalarX;&#10;        this.b *= scalarY;&#10;        this.c *= scalarX;&#10;        this.d *= scalarY;&#10;&#10;        return this;&#10;    &#125;; // preScale&#10;&#10;    /**@&#10;     * #.preTranslate&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Applies a pre-translation to this matrix&#10;     *&#10;     * @public&#10;     * @sign public &#123;Matrix2D&#125; preTranslate(Vector2D);&#10;     * @sign public &#123;Matrix2D&#125; preTranslate(Number, Number);&#10;     * @param &#123;Number|Vector2D&#125; dx&#10;     * @param &#123;Number&#125; dy&#10;     * @returns &#123;Matrix2D&#125; this matrix after pre-translation&#10;     */&#10;    Matrix2D.prototype.preTranslate = function (dx, dy) &#123;&#10;        if (typeof dx === &#34;number&#34;) &#123;&#10;            this.e += dx;&#10;            this.f += dy;&#10;        &#125; else &#123;&#10;            this.e += dx.x;&#10;            this.f += dx.y;&#10;        &#125; // else&#10;&#10;        return this;&#10;    &#125;; // preTranslate&#10;&#10;    /**@&#10;     * #.rotate&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Applies a counter-clockwise post-rotation to this matrix&#10;     *&#10;     * @public&#10;     * @sign public &#123;Matrix2D&#125; rotate(Number);&#10;     * @param &#123;Number&#125; rads - angle to rotate in radians&#10;     * @returns &#123;Matrix2D&#125; this matrix after rotation&#10;     */&#10;    Matrix2D.prototype.rotate = function (rads) &#123;&#10;        var nCos = Math.cos(rads);&#10;        var nSin = Math.sin(rads);&#10;&#10;        var tmp = this.a;&#10;        this.a = nCos * tmp - nSin * this.b;&#10;        this.b = nSin * tmp + nCos * this.b;&#10;        tmp = this.c;&#10;        this.c = nCos * tmp - nSin * this.d;&#10;        this.d = nSin * tmp + nCos * this.d;&#10;        tmp = this.e;&#10;        this.e = nCos * tmp - nSin * this.f;&#10;        this.f = nSin * tmp + nCos * this.f;&#10;&#10;        return this;&#10;    &#125;; // rotate&#10;&#10;    /**@&#10;     * #.scale&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Applies a post-scaling to this matrix&#10;     *&#10;     * @public&#10;     * @sign public &#123;Matrix2D&#125; scale(Number[, Number]);&#10;     * @param &#123;Number&#125; scalarX&#10;     * @param &#123;Number&#125; [scalarY] scalarX is used if scalarY is undefined&#10;     * @returns &#123;Matrix2D&#125; this after post-scaling&#10;     */&#10;    Matrix2D.prototype.scale = function (scalarX, scalarY) &#123;&#10;        if (scalarY === undefined)&#10;            scalarY = scalarX;&#10;&#10;        this.a *= scalarX;&#10;        this.b *= scalarY;&#10;        this.c *= scalarX;&#10;        this.d *= scalarY;&#10;        this.e *= scalarX;&#10;        this.f *= scalarY;&#10;&#10;        return this;&#10;    &#125;; // scale&#10;&#10;    /**@&#10;     * #.setValues&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Sets the values of this matrix&#10;     *&#10;     * @public&#10;     * @sign public &#123;Matrix2D&#125; setValues(Matrix2D);&#10;     * @sign public &#123;Matrix2D&#125; setValues(Number, Number, Number, Number, Number, Number);&#10;     * @param &#123;Matrix2D|Number&#125; a&#10;     * @param &#123;Number&#125; b&#10;     * @param &#123;Number&#125; c&#10;     * @param &#123;Number&#125; d&#10;     * @param &#123;Number&#125; e&#10;     * @param &#123;Number&#125; f&#10;     * @returns &#123;Matrix2D&#125; this matrix containing the new values&#10;     */&#10;    Matrix2D.prototype.setValues = function (a, b, c, d, e, f) &#123;&#10;        if (a instanceof Matrix2D) &#123;&#10;            this.a = a.a;&#10;            this.b = a.b;&#10;            this.c = a.c;&#10;            this.d = a.d;&#10;            this.e = a.e;&#10;            this.f = a.f;&#10;        &#125; else &#123;&#10;            this.a = a;&#10;            this.b = b;&#10;            this.c = c;&#10;            this.d = d;&#10;            this.e = e;&#10;            this.f = f;&#10;        &#125; // else&#10;&#10;        return this;&#10;    &#125;; // setValues&#10;&#10;    /**@&#10;     * #.toString&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Returns the string representation of this matrix.&#10;     *&#10;     * @public&#10;     * @sign public &#123;String&#125; toString();&#10;     * @returns &#123;String&#125;&#10;     */&#10;    Matrix2D.prototype.toString = function () &#123;&#10;        return &#34;Matrix2D([&#34; + this.a + &#34;, &#34; + this.c + &#34;, &#34; + this.e +&#10;            &#34;] [&#34; + this.b + &#34;, &#34; + this.d + &#34;, &#34; + this.f + &#34;] [0, 0, 1])&#34;;&#10;    &#125;; // toString&#10;&#10;    /**@&#10;     * #.translate&#10;     * @comp Crafty.math.Matrix2D&#10;     *&#10;     * Applies a post-translation to this matrix&#10;     *&#10;     * @public&#10;     * @sign public &#123;Matrix2D&#125; translate(Vector2D);&#10;     * @sign public &#123;Matrix2D&#125; translate(Number, Number);&#10;     * @param &#123;Number|Vector2D&#125; dx&#10;     * @param &#123;Number&#125; dy&#10;     * @returns &#123;Matrix2D&#125; this matrix after post-translation&#10;     */&#10;    Matrix2D.prototype.translate = function (dx, dy) &#123;&#10;        if (typeof dx === &#34;number&#34;) &#123;&#10;            this.e += this.a * dx + this.c * dy;&#10;            this.f += this.b * dx + this.d * dy;&#10;        &#125; else &#123;&#10;            this.e += this.a * dx.x + this.c * dx.y;&#10;            this.f += this.b * dx.x + this.d * dx.y;&#10;        &#125; // else&#10;&#10;        return this;&#10;    &#125;; // translate&#10;&#10;    return Matrix2D;&#10;&#125;)();&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],42:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;&#10;/**@&#10; * #Crafty.rectManager&#10; * @category 2D&#10; *&#10; * Collection of methods for handling rectangles&#10; */&#10;Crafty.extend(&#123;&#10;    /** recManager: an object for managing dirty rectangles. */&#10;   rectManager: &#123;&#10;       /** Finds smallest rectangles that overlaps a and b, merges them into target */&#10;       merge: function (a, b, target) &#123;&#10;           if (typeof target === &#39;undefined&#39;)&#10;               target = &#123;&#125;;&#10;           // Doing it in this order means we can use either a or b as the target, with no conflict&#10;           target._h = Math.max(a._y + a._h, b._y + b._h);&#10;           target._w = Math.max(a._x + a._w, b._x + b._w);&#10;           target._x = Math.min(a._x, b._x);&#10;           target._y = Math.min(a._y, b._y);&#10;           target._w -= target._x;&#10;           target._h -= target._y;&#10;&#10;           return target;&#10;       &#125;,&#10;&#10;      /**@&#10;       * #Crafty.rectManager.overlap&#10;       * @comp Crafty.rectManager&#10;       * @sign public Boolean Crafty.rectManager.overlap(Object rectA, Object rectA)&#10;       * @param rectA - An object that must have the `_x, _y, _w, _h` values as properties&#10;       * @param rectB - An object that must have the `_x, _y, _w, _h` values as properties&#10;       * @return true if the rectangles overlap; false otherwise&#10;       *&#10;       * Checks whether two rectangles overlap.&#10;       */&#10;      overlap: function (rectA, rectB) &#123;&#10;        return (rectA._x &#60; rectB._x + rectB._w &#38;&#38; rectA._x + rectA._w &#62; rectB._x &#38;&#38;&#10;                rectA._y &#60; rectB._y + rectB._h &#38;&#38; rectA._y + rectA._h &#62; rectB._y);&#10;      &#125;,&#10;&#10;      /**@&#10;      * #Crafty.rectManager.mergeSet&#10;      * @comp Crafty.rectManager&#10;      * @sign public Object Crafty.rectManager.mergeSet(Object set)&#10;      * @param set - an array of rectangular regions&#10;      *&#10;      * Merge any consecutive, overlapping rects into each other.&#10;      * Its an optimization for the redraw regions.&#10;      *&#10;      * The order of set isn&#39;t strictly meaningful,&#10;      * but overlapping objects will often cause each other to change,&#10;      * and so might be consecutive.&#10;      */&#10;      mergeSet: function (set) &#123;&#10;          var i = 0;&#10;          while (i &#60; set.length - 1) &#123;&#10;              // If current and next overlap, merge them together into the first, removing the second&#10;              // Then skip the index backwards to compare the previous pair.&#10;              // Otherwise skip forward&#10;              if (this.overlap(set[i], set[i + 1])) &#123;&#10;                  this.merge(set[i], set[i + 1], set[i]);&#10;                  set.splice(i + 1, 1);&#10;                  if (i &#62; 0) &#123;&#10;                    i--;&#10;                  &#125;&#10;              &#125; else &#123;&#10;                  i++;&#10;              &#125;&#10;          &#125;&#10;&#10;          return set;&#10;      &#125;,&#10;&#10;      /**@&#10;       * #Crafty.rectManager.boundingRect&#10;       * @comp Crafty.rectManager&#10;       * @sign public Crafty.rectManager.boundingRect(set)&#10;       * @param set - An array of rectangles&#10;       *&#10;       * - Calculate the common bounding rect of multiple canvas entities.&#10;       * - Returns coords&#10;       */&#10;      boundingRect: function (set) &#123;&#10;          if (!set || !set.length) return;&#10;          var newset = [],&#10;              i = 1,&#10;              l = set.length,&#10;              current, master = set[0],&#10;              tmp;&#10;          master = [master._x, master._y, master._x + master._w, master._y + master._h];&#10;          while (i &#60; l) &#123;&#10;              current = set[i];&#10;              tmp = [current._x, current._y, current._x + current._w, current._y + current._h];&#10;              if (tmp[0] &#60; master[0]) master[0] = tmp[0];&#10;              if (tmp[1] &#60; master[1]) master[1] = tmp[1];&#10;              if (tmp[2] &#62; master[2]) master[2] = tmp[2];&#10;              if (tmp[3] &#62; master[3]) master[3] = tmp[3];&#10;              i++;&#10;          &#125;&#10;          tmp = master;&#10;          master = &#123;&#10;              _x: tmp[0],&#10;              _y: tmp[1],&#10;              _w: tmp[2] - tmp[0],&#10;              _h: tmp[3] - tmp[1]&#10;          &#125;;&#10;&#10;          return master;&#10;      &#125;,&#10;&#10;      // Crafty.rectManager._rectPool&#10;      //&#10;      // This is a private object used internally by 2D methods&#10;      // Cascade and _attr need to keep track of an entity&#39;s old position,&#10;      // but we want to avoid creating temp objects every time an attribute is set.&#10;      // The solution is to have a pool of objects that can be reused.&#10;      //&#10;      // The current implementation makes a BIG ASSUMPTION:  that if multiple rectangles are requested,&#10;      // the later one is recycled before any preceding ones.  This matches how they are used in the code.&#10;      // Each rect is created by a triggered event, and will be recycled by the time the event is complete.&#10;      _pool: (function () &#123;&#10;          var pool = [],&#10;              pointer = 0;&#10;          return &#123;&#10;              get: function (x, y, w, h) &#123;&#10;                  if (pool.length &#60;= pointer)&#10;                      pool.push(&#123;&#125;);&#10;                  var r = pool[pointer++];&#10;                  r._x = x;&#10;                  r._y = y;&#10;                  r._w = w;&#10;                  r._h = h;&#10;                  return r;&#10;              &#125;,&#10;&#10;              copy: function (o) &#123;&#10;                  if (pool.length &#60;= pointer)&#10;                      pool.push(&#123;&#125;);&#10;                  var r = pool[pointer++];&#10;                  r._x = o._x;&#10;                  r._y = o._y;&#10;                  r._w = o._w;&#10;                  r._h = o._h;&#10;                  return r;&#10;              &#125;,&#10;&#10;              recycle: function (o) &#123;&#10;                  pointer--;&#10;              &#125;&#10;          &#125;;&#10;      &#125;)(),&#10;&#10;   &#125;&#10;&#10;&#10;&#125;);&#10;&#10;&#125;,&#123;&#34;../core/core.js&#34;:7&#125;],43:[function(require,module,exports)&#123;&#10;var Crafty = require(&#39;../core/core.js&#39;);&#10;&#10;&#10;/**&#10; * Spatial HashMap for broad phase collision&#10; *&#10; * @author Louis Stowasser&#10; */&#10;&#10;    /**@&#10;     * #Crafty.HashMap.constructor&#10;     * @comp Crafty.HashMap&#10;     * @sign public void Crafty.HashMap([cellsize])&#10;     * @param cellsize - the cell size. If omitted, `cellsize` is 64.&#10;     *&#10;     * Set `cellsize`.&#10;     * And create `this.map`.&#10;     */&#10;    var cellsize,&#10;&#10;        HashMap = function (cell) &#123;&#10;            cellsize = cell || 64;&#10;            this.map = &#123;&#125;;&#10;        &#125;,&#10;&#10;        SPACE = &#34; &#34;,&#10;        keyHolder = &#123;&#125;;&#10;&#10;    HashMap.prototype = &#123;&#10;        /**@&#10;         * #Crafty.map.insert&#10;         * @comp Crafty.map&#10;         * @sign public Object Crafty.map.insert(Object obj)&#10;         * @param obj - An entity to be inserted.&#10;         * @returns An object representing this object&#39;s entry in the HashMap&#10;         * &#10;         * `obj` is inserted in &#39;.map&#39; of the corresponding broad phase cells. An object of the following fields is returned.&#10;         *</span><br></pre></td></tr></table></figure>

         * {
         *   keys: the object that keep track of cells
         *   obj: The inserted object
         *   map: the HashMap object
         * }
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;insert: function (obj) &#123;&#10;    var keys = HashMap.key(obj),&#10;        entry = new Entry(keys, obj, this),&#10;        i = 0,&#10;        j,&#10;        hash;&#10;&#10;    //insert into all x buckets&#10;    for (i = keys.x1; i &#60;= keys.x2; i++) &#123;&#10;        //insert into all y buckets&#10;        for (j = keys.y1; j &#60;= keys.y2; j++) &#123;&#10;            hash = (i &#60;&#60; 16) ^ j;&#10;            if (!this.map[hash]) this.map[hash] = [];&#10;            this.map[hash].push(obj);&#10;        &#125;&#10;    &#125;&#10;&#10;    return entry;&#10;&#125;,&#10;&#10;/**@&#10; * #Crafty.map.search&#10; * @comp Crafty.map&#10; * @sign public Object Crafty.map.search(Object rect[, Boolean filter])&#10; * @param rect - the rectangular region to search for entities.&#10; * @param filter - If false, only performs a broad-phase collision check.  The default value is true.&#10; *&#10; * - If `filter` is `false`, just search for all the entries in the give `rect` region by broad phase collision. Entity may be returned duplicated.&#10; * - If `filter` is `true`, filter the above results by checking that they actually overlap `rect`.&#10; *&#10; * The easier usage is with `filter == true`. For performance reason, you may use `filter == false`, and filter the result yourself. See examples in drawing.js and collision.js&#10; */&#10;&#10;search: function (rect, filter) &#123;&#10;    var keys = HashMap.key(rect, keyHolder),&#10;        i, j, k, l, cell,&#10;        results = [];&#10;&#10;    if (filter === undefined) filter = true; //default filter to true&#10;&#10;    //search in all x buckets&#10;    for (i = keys.x1; i &#60;= keys.x2; i++) &#123;&#10;        //insert into all y buckets&#10;        for (j = keys.y1; j &#60;= keys.y2; j++) &#123;&#10;            cell = this.map[(i &#60;&#60; 16) ^ j];&#10;            if (cell) &#123;&#10;                for (k = 0; k &#60; cell.length; k++)&#10;                    results.push(cell[k]);&#10;            &#125;&#10;        &#125;&#10;    &#125;&#10;&#10;    if (filter) &#123;&#10;        var obj, id, finalresult = [],&#10;            found = &#123;&#125;;&#10;        //add unique elements to lookup table with the entity ID as unique key&#10;        for (i = 0, l = results.length; i &#60; l; i++) &#123;&#10;            obj = results[i];&#10;            if (!obj) continue; //skip if deleted&#10;            id = obj[0]; //unique ID&#10;            obj = obj._mbr || obj;&#10;            //check if not added to hash and that actually intersects&#10;            if (!found[id] &#38;&#38; obj._x &#60; rect._x + rect._w &#38;&#38; obj._x + obj._w &#62; rect._x &#38;&#38;&#10;                              obj._y &#60; rect._y + rect._h &#38;&#38; obj._y + obj._h &#62; rect._y)&#10;                found[id] = results[i];&#10;        &#125;&#10;&#10;        //loop over lookup table and copy to final array&#10;        for (obj in found) finalresult.push(found[obj]);&#10;&#10;        return finalresult;&#10;    &#125; else &#123;&#10;        return results;&#10;    &#125;&#10;&#125;,&#10;&#10;/**@&#10; * #Crafty.map.remove&#10; * @comp Crafty.map&#10; * @sign public void Crafty.map.remove([Object keys, ]Object obj)&#10; * @param keys - key region. If omitted, it will be derived from obj by `Crafty.HashMap.key`.&#10; * @param obj - An object to remove from the hashmap&#10; *&#10; * Remove an entity in a broad phase map.&#10; * - The second form is only used in Crafty.HashMap to save time for computing keys again, where keys were computed previously from obj. End users should not call this form directly.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * Crafty.map.remove(e);
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;remove: function (keys, obj) &#123;&#10;    var i = 0,&#10;        j, hash;&#10;&#10;    if (arguments.length == 1) &#123;&#10;        obj = keys;&#10;        keys = HashMap.key(obj, keyHolder);&#10;    &#125;&#10;&#10;    //search in all x buckets&#10;    for (i = keys.x1; i &#60;= keys.x2; i++) &#123;&#10;        //insert into all y buckets&#10;        for (j = keys.y1; j &#60;= keys.y2; j++) &#123;&#10;            hash = (i &#60;&#60; 16) ^ j;&#10;&#10;            if (this.map[hash]) &#123;&#10;                var cell = this.map[hash],&#10;                    m, n = cell.length;&#10;                //loop over objs in cell and delete&#10;                for (m = 0; m &#60; n; m++)&#10;                    if (cell[m] &#38;&#38; cell[m][0] === obj[0])&#10;                        cell.splice(m, 1);&#10;            &#125;&#10;        &#125;&#10;    &#125;&#10;&#125;,&#10;&#10;/**@&#10; * #Crafty.map.refresh&#10; * @comp Crafty.map&#10; * @sign public void Crafty.map.remove(Entry entry)&#10; * @param entry - An entry to update&#10; *&#10; * Update an entry&#39;s keys, and its position in the broad phrase map.&#10; *&#10; * @example&#10; *</span><br></pre></td></tr></table></figure>

         * Crafty.map.refresh(e);
         * <figure class="highlight plain"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line"> */&#10;refresh: function (entry) &#123;&#10;    var keys = entry.keys;&#10;    var obj = entry.obj;&#10;    var cell, i, j, m, n;&#10;&#10;    //First delete current object from appropriate cells&#10;    for (i = keys.x1; i &#60;= keys.x2; i++) &#123;&#10;        for (j = keys.y1; j &#60;= keys.y2; j++) &#123;&#10;            cell = this.map[(i &#60;&#60; 16) ^ j];&#10;            if (cell) &#123;&#10;                n = cell.length;&#10;                //loop over objs in cell and delete&#10;                for (m = 0; m &#60; n; m++)&#10;                    if (cell[m] &#38;&#38; cell[m][0] === obj[0])&#10;                        cell.splice(m, 1);&#10;            &#125;&#10;        &#125;&#10;    &#125;&#10;&#10;    //update keys&#10;    HashMap.key(obj, keys);&#10;&#10;    //insert into all rows and columns&#10;    for (i = keys.x1; i &#60;= keys.x2; i++) &#123;&#10;        for (j = keys.y1; j &#60;= keys.y2; j++) &#123;&#10;            cell = this.map[(i &#60;&#60; 16) ^ j];&#10;            if (!cell) cell = this.map[(i &#60;&#60; 16) ^ j] = [];&#10;            cell.push(obj);&#10;        &#125;&#10;    &#125;&#10;&#10;    return entry;&#10;&#125;,&#10;&#10;&#10;&#10;&#10;/**@&#10; * #Crafty.map.boundaries&#10; * @comp Crafty.map&#10; * @sign public Object Crafty.map.boundaries()&#10; * @returns An object with the following structure, which represents an MBR which contains all entities&#10; *&#10; *</span><br></pre></td></tr></table></figure>

         * {
         *   min: {
         *     x: val_x,
         *     y: val_y
         *   },
         *   max: {
         *     x: val_x,
         *     y: val_y
         *   }
         * }
         * ~~~
         */
        boundaries: function () {
            var k, ent,
                hash = {
                    max: {
                        x: -Infinity,
                        y: -Infinity
                    },
                    min: {
                        x: Infinity,
                        y: Infinity
                    }
                },
                coords = {
                    max: {
                        x: -Infinity,
                        y: -Infinity
                    },
                    min: {
                        x: Infinity,
                        y: Infinity
                    }
                };

            //Using broad phase hash to speed up the computation of boundaries.
            for (var h in this.map) {
                if (!this.map[h].length) continue;

                //broad phase coordinate
                var i = h >> 16,
                    j = (h << 16) >> 16;
                if (j < 0) {
                    i = i ^ -1;
                }
                if (i >= hash.max.x) {
                    hash.max.x = i;
                    for (k in this.map[h]) {
                        ent = this.map[h][k];
                        //make sure that this is a Crafty entity
                        if (typeof ent == 'object' && 'requires' in ent) {
                            coords.max.x = Math.max(coords.max.x, ent.x + ent.w);
                        }
                    }
                }
                if (i <= hash.min.x)="" {="" hash.min.x="i;" for="" (k="" in="" this.map[h])="" ent="this.map[h][k];" if="" (typeof="" 'object'="" &&="" 'requires'="" ent)="" coords.min.x="Math.min(coords.min.x," ent.x);="" }="" (j="">= hash.max.y) {
                    hash.max.y = j;
                    for (k in this.map[h]) {
                        ent = this.map[h][k];
                        if (typeof ent == 'object' && 'requires' in ent) {
                            coords.max.y = Math.max(coords.max.y, ent.y + ent.h);
                        }
                    }
                }
                if (j </=></=></=></r.length;o++)s(r[o]);return>