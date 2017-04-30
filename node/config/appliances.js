var appliances = {
    "fridge": "off", "freezer": "off", "oven": "off", "stove": "off",
    "dishwasher": "off", "boiler": "off", "aircon": "off", "tv": "off",
    "stereo": "off", "pc": "off", "llr": "off", "lbr": "off", "lk": "off", "lb": "off", "hoover": "off"
};
var defaults = {
    "fridge": 12.5, "freezer": 18, "oven": 28, "dishwasher": 8, "stove": 23, "boiler": 10, "aircon": 30, "tv": 2, "stereo": 17.5, "pc": 3, "llr": 2, "lbr": 2,
    "lk": 4, "lb": 3, "hoover": 12
}

module.exports.appliances = appliances;
module.exports.defaults = defaults;