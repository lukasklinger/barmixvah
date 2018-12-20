var config = require('config');

/* GET home page. */
exports.access = function (Drink, Pump) {
  return function (req, res) {
    Drink.find({}, function (err, drinks) {
      Pump.find({}, function (err, pumps) {

        var isMultiGlass = config.has('Robot.multiGlassMode') &&
          config.get('Robot.multiGlassMode') == true;

        var numOfSlots = (isMultiGlass && config.has('Robot.numOfSlots') &&
          config.get('Robot.numOfSlots') > 1) ? config.get('Robot.numOfSlots') : 1;

        res.render('admin', {
          title: "Bar Roboter Admin" ,
          drinks: drinks,
          pumps: pumps,
          numOfSlots : numOfSlots
        });
      });
    });
  };
};

exports.updatePump = function (Pump) {
  return function (req, res) {
    Pump.findOneAndUpdate({ _id: req.body._id },
      {
        ingredients: req.body.ingredients
      },
      function (err, pump) {
        console.log(pump);
        console.log('====');
        console.log(err);
        console.log('request body');
        console.log(req.body);
        console.log(req.body.ingredients);
        if (pump == null) {
          Pump.create(req.body);
          pump = req.body;
          console.log('pump eq null');
        }
        res.send(pump);
    });
  }
}
