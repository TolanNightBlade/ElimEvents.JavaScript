ElimEvents
=====================

Simple javascript event handler system.

QUnit tests included in ElimEventsQunitTest.html. Tested in IE7-10, Chrome 28, FireFox 22, Opera 12.16.

Compiled Size: 1.18KB gzipped (3.15KB uncompressed) --according to Closure Compiler

<a href="//github.com/TolanNightBlade/ElimEvents.JavaScript/blob/master/ElimEvents.JavaScript/elim.events.js">Main JS file</a>

memorise
-
Setting memorise on an event object, will cause events to be fired after registering, if they have already been run (example: registering an event after onload event has occured will still cause the callback to be called)

ElimSignals - Methods
-

    setEnabled(name, isEnabled) --set an event to enabled / disabled
    isEnabled(name) --get event is enabled (true, false, null (if event does not exist))
    setContext(value) -- set the default context to use
    getHandler(name) -- returns Null or ElimEventItems
    trigger(name, context, ... args) -- trigger event, context is optional
    on(name, cb, isOnce, context) -- register callback for event, isOnce and context are optional
    off(name, cb, context) --remove callback for event, context is required if you specified a different context within 'on'
    destroy() --clear and destroy
    
ElimEventItems - Methods
-
    
    name()
    add(cb, isOnce, context)
    remove(cb, context)
    count()
    find(cb, context)
    findIndex(cb, context)
    execute(context, .... args)
    destroy()

Sample
-------

    function MyItemWithEvent(){
      //passing "this" into ElimSignals will set the default context to MyItemWithEvent
      this.events = new ElimSignals(this, { errorOnNullHandler: true });
    }
    
    //Add ElimSignals methods to existing class
    function MyItemWithEvent2(){
      ElimSignals.util.createOn(this);
    }
  
    MyItemWithEvent.prototype = {
      someCallBack: function(event, arg1){
        //event will be an object of type 'EventData'
        event.cancelBubble(); //prevent propogation of events
        event.value = 'MyReturn Value'; //return a value
        //event.context
        console.log(event.name, arg1);
        return false //return false will prevent any other callbacks being run
      }
    }
  
    var obj = new MyItemWithEvent();
    var altContext = new Object();
  
    //Register event
    obj.events.on('eventOne', obj.someCallBack);
  
    //Register event with differenet context (this within obj.someBacllback will now refer to altContext)
    obj.events.on('eventOne', obj.someCallBack, false, altContext);
  
    //Register event, as called Once (will be removed after it is first called)
    obj.events.on('eventOne', obj.someCallBack, true);
    
    //Register multiple events using the same callback, just pass a space separated string of names
    obj.events.on('eventOne eventTwo eventThree', obj.someCallBack);
    
    //Trigger an event - with no arguments
    var ret1 = obj.events.trigger('eventOne');
    //Trigger an event - with 1 argument
    var ret2 = obj.events.trigger('eventOne', 'Argument One');
    //Trigger an event - with 2 arguments
    var ret3 = obj.events.trigger('eventOne', 'Argument One', 'Argument Two');
    
Sample - remove events
-----

    obj.events.off('eventOne', obj.someCallBack);
    obj.events.off('eventOne', obj.someCallBack, someContext);
