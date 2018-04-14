var board, pump0, pump1, pump2, pump3, pump4, pump5, pump6, pump7, pump8, pump9, stepper, endStopSwitch;

var five = require('johnny-five');
var config = require('config');

board = new five.Board();
board.on('ready', function () {

  if (config.has('Robot.multiGlassMode') &&
        config.get('Robot.multiGlassMode') == true) {
    initMultiGlassMode();
  }

  // Counting down pins because that's the orientation
  // that my Arduino happens to be in
  pump0 = new five.Led(7);
  pump1 = new five.Led(6);
  pump2 = new five.Led(5);
  pump3 = new five.Led(4);
  pump4 = new five.Led(3);
  pump5 = new five.Led(8);
  pump6 = new five.Led(9);
  pump7 = new five.Led(10);
  pump8 = new five.Led(11);
  pump9 = new five.Led(12);

  board.repl.inject({
    p0: pump0,
    p1: pump1,
    p2: pump2,
    p3: pump3,
    p4: pump4,
    p5: pump5,
    p6: pump6,
    p7: pump7,
    p8: pump8,
    p9: pump9
  });

  pump0.on();
  pump1.on();
  pump2.on();
  pump3.on();
  pump4.on();
  pump5.on();
  pump6.on();
  pump7.on();
  pump8.on();
  pump9.on();

  console.log("\033[31m[MSG] Bar Mixvah Ready\033[91m");
});

exports.pump = function (ingredients, cb) {
  console.log("Dispensing Drink");
  for (var i in ingredients) {
    (function (i) {
      setTimeout(function () {  // Delay implemented to have a top-biased mix
        pumpMilliseconds(ingredients[i].pump, ingredients[i].amount);
      }, ingredients[i].delay);
    })(i);
  }
  setTimeout(cb, ingredients[0].amount + ingredients[0].delay);
};

function initMultiGlassMode() {
  endStopSwitch = new five.Switch(2);

  // Test whether the switch is working properly
  endStopSwitch.on("open", function() {
    console.log('now open curcuit');
  });

  endStopSwitch.on("close", function() {
    console.log('now CLOSED curcuit');
  });

  stepper = new five.Stepper({
    type: five.Stepper.TYPE.DRIVER,
    stepsPerRev: 200,
    pins: {
      step: 10,
      dir: 11
    }
  });

  homeStepper(stepper);
}

function homeStepper(stpr, callback) {
    stpr.rpm(180).cw().accel(1600).decel(1600).step(1, function() {
      if (endStopSwitch.isOpen) {
        homeStepper(stpr, callback);
      } else {
        stpr.step({
          steps: 10,
          direction: five.Stepper.DIRECTION.CCW
        }, function() {
          console.log("Done homing stepper");
          if (typeof callback === "function") {
            callback();
          }
        });
      }
    });
}

exports.moveToSlot = function(slot, cb) {
  homeStepper(stepper, function() {
    console.log('im callback');
    var stepsPerMM = config.get('Robot.stepperStepsPerMM');
    var tubesOutputMountSizeMM =  config.get('Robot.tubesOutputMountSizeMM');  // TODO: What happens if the number of slots is bigger in case that the
    // slot is not big enough for the tubes output mount?
    var railSizeMM = config.get('Robot.railSizeMM');
    var numOfSlot = config.get('Robot.numOfSlots');;
    var slotMargin = railSizeMM/numOfSlot;

    var stepsToSlot = ((slotMargin/2 - tubesOutputMountSizeMM/2) +
      ((slot - 1) * slotMargin)) * stepsPerMM;
    console.log("Slot " + slot + " requires " + stepsToSlot + " steps from home position");
    stepper.step({
      steps: stepsToSlot,
      direction: five.Stepper.DIRECTION.CCW
    }, function() {
      console.log("Moved to slot " + slot);
      cb();
    });
  });
}

function pumpMilliseconds(pump, ms) {
  exports.startPump(pump);
  setTimeout(function () {
    exports.stopPump(pump);
  }, ms);
}

exports.startPump = function (pump) {
  console.log("\033[32m[PUMP] Starting " + pump + "\033[91m");
  var p = exports.usePump(pump);
  p.off();
}

exports.stopPump = function (pump) {
  console.log("\033[32m[PUMP] Stopping " + pump + "\033[91m");
  var p = exports.usePump(pump);
  p.on();
}

exports.usePump = function (pump) {
  var using;
  switch(pump) {
    case 'pump0':
      using = pump0;
      break;
    case 'pump1':
      using = pump1;
      break;
    case 'pump2':
      using = pump2;
      break;
    case 'pump3':
      using = pump3;
      break;
    case 'pump4':
      using = pump4;
      break;
    case 'pump5':
      using = pump5;
      break;
    case 'pump6':
      using = pump6;
      break;
    case 'pump7':
      using = pump7;
      break;
    case 'pump8':
      using = pump8;
      break;
    case 'pump9':
      using = pump9;
      break;
    default:
      using = null;
      break;
  }
  return using;
}
