console.log("Starting vue vm...");

function formatNumber(num) {
  return num.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

var vm = new Vue({
    el: "#app",
    data : {
        mass: 1000,
        items : [
            {
                name : "Quantanium",
                price : 88.09,
                percentage : 0,
                color : "green"
            },
            {
                name : "Bexalite",
                price : 40.48,
                percentage : 0,
                color : "green"
            },
            {
                name : "Taranite",
                price : 32.45,
                percentage : 0,
                color : "green"
            },
            {
                name : "Borase",
                price : 32.44,
                percentage : 0,
                color : "green"
            },
            {
                name : "Laranite",
                price : 30.25,
                percentage : 0,
                color : "green"
            },
            {
                name : "Agricium",
                price : 26.88,
                percentage : 0,
                color : "green"
            },
            {
                name : "Hephaestanite",
                price : 14.64,
                percentage : 0,
                color : "MediumSeaGreen"
            },
            {
                name : "Titanium",
                price : 8.67,
                percentage : 0,
                color : "MediumSeaGreen"
            },
            {
                name : "Diamond",
                price : 7.17,
                percentage : 0,
                color : "MediumSeaGreen"
            },
            {
                name : "Gold",
                price : 6.42,
                percentage : 0,
                color : "Orange"
            },
            {
                name : "Copper",
                price : 5.69,
                percentage : 0,
                color : "Orange"
            },
            {
                name : "Beryl",
                price : 4.30,
                percentage : 0,
                color : "red"
            },
            {
                name : "Tungsten",
                price : 3.99,
                percentage : 0,
                color : "red"
            },
            {
                name : "Corundum",
                price : 2.65,
                percentage : 0,
                color : "red"
            },
            {
                name : "Quartz",
                price : 1.51,
                percentage : 0,
                color : "red"
            },
            {
                name : "Aluminium",
                price : 1.27,
                percentage : 0,
                color : "red"
            },
        ],
        cargo : [],
        summaryMap: new Map()
    },
    methods : {
        _units: function(mass) {
            return parseFloat(mass) * 2;
        },
        _rockValue: function (item, mass) {
            let _perc  = parseFloat(item.percentage)
            let _price = parseFloat(item.price)
            return this._units(mass) * (_perc / 100) * _price
        },
        rockValue: function (item) {
            let _mass  = parseInt(this.mass)
            return this._rockValue(item, _mass)
        },
        _formatRockValue: function (item, mass) {
            return formatNumber(this._rockValue(item, mass))
        },
        formatRockValue: function (item) {
            return formatNumber(this.rockValue(item))
        },
        addCurrentRockToCargo: function() {

            let rockSnapshot = {
                mass: this.mass,
                units: this._units(this.mass),
                worthMaterial : this.worthMaterial,
                inertMaterial : this.inertMaterial,
                value: this.total,
                formattedValue: this.numericTotal,
                quantaniumSCU: this.items.filter(item => item.name == "Quantanium").map(item => formatNumber(item.percentage * this.mass / 100 / 50)).shift(),
                composition: this.items.filter(item => item.percentage != 0).map(item => this.takeRockSnapshot(item)),
            }

            this.cargo.push(rockSnapshot);
            this.addRockSnapshotToSummary(rockSnapshot);
            this.clearData();

        },
        takeRockSnapshot: function(item) {
            return JSON.parse(JSON.stringify(item));
        },
        clearData: function() {
            this.mass = 1000
            this.items.forEach(item => item.percentage = 0)
            // /
        },
        clearCargo: function() {
            this.cargo.splice(0, this.cargo.length);
            this.summaryMap = new Map();
        },
        addRockSnapshotToSummary: function(rock) {

            rock.composition.forEach((element, i) => {
                if (this.summaryMap.get(element.name) == null) {
                    this.summaryMap.set(element.name, {
                        name: element.name,
                        mass: 0,
                        units: 0,
                        percentage: 0,
                        formattedPercentage: 0,
                        refinedValue: 0,
                        formattedValue: 0,
                        scu: 0,
                        formattedSCU: formatNumber(0)
                    });
                }

                let elementMass = rock.mass * element.percentage / 100;
                let cachedElement = this.summaryMap.get(element.name);
                let updatedValue = cachedElement.refinedValue + this._rockValue(element, rock.mass);
                let updatedPercentage = 100 / this.cargoMass * (cachedElement.mass + elementMass);
                let updatedMass = cachedElement.mass + elementMass;
                let updatedSCU = updatedMass / 50
                let updatedElement = {
                    name: element.name,
                    mass: updatedMass,
                    units: cachedElement.units + this._units(elementMass),
                    percentage: updatedPercentage,
                    formattedPercentage: formatNumber(updatedPercentage),
                    refinedValue: updatedValue,
                    formattedValue: formatNumber(updatedValue),
                    scu: updatedSCU,
                    formattedSCU: formatNumber(updatedSCU)
                };

                this.summaryMap.set(element.name, updatedElement);
            });
            // Update percentage also for previous elements
            Array.from(this.summaryMap.values()).forEach((item, i) => {
                let updatedPercentage = item.mass / this.cargoMass * 100;
                this.summaryMap.set(item.name, {
                    name: item.name,
                    mass: item.mass,
                    units: item.units,
                    percentage: updatedPercentage,
                    formattedPercentage: formatNumber(updatedPercentage),
                    refinedValue: item.refinedValue,
                    formattedValue: item.formattedValue,
                    scu: item.scu,
                    formattedSCU: item.formattedSCU
                });
            });
        }
    },
    computed : {
        total : function() {
            return this.items.map(item => this.rockValue(item)).reduce(function(a, b) {
                return a + b;
            });
        },
        numericTotal: function() {
            return formatNumber(this.total)
        },
        worthMaterial : function() {
            return this.items.map(item => parseFloat(item.percentage)).reduce(function(a, b) {
                return a + b;
            });
        },
        inertMaterial : function() {
            return 100 - this.worthMaterial;
        },
        cargoValue: function() {

            if (Array.isArray(this.cargo) && this.cargo.length) {
                return this.cargo.map(cargoItem => parseFloat(cargoItem.value)).reduce(function(a, b) {
                    return a + b;
                });
            } else {
                return 0;
            }


        },
        numericCargoValue: function() {
            return formatNumber(this.cargoValue);
        },
        cargoMass: function() {
            if (Array.isArray(this.cargo) && this.cargo.length) {
                return this.cargo.map(cargoItem =>  parseFloat(cargoItem.mass)).reduce(function(a, b) {
                    return a + b;
                });
            } else {
                return 0;
            }
        },
        numericCargoMass: function() {
            return formatNumber(this.cargoMass)
        },
        cargoWorth: function() {

            if (Array.isArray(this.cargo) && this.cargo.length) {
                return this.cargo.map(cargoItem =>  parseFloat(cargoItem.worthMaterial) / cargoItem.mass * 100).reduce(function(a, b) {
                    return a + b;
                });
            } else {
                return 0;
            }

        },
        cargoInert: function() {
            if (Array.isArray(this.cargo) && this.cargo.length) {
                return 100 - this.cargoWorth
            } else {
                return 0;
            }
        },
        cargoSummary: function() {
            if (Array.isArray(this.cargo) && this.cargo.length) {
                return Array.from(this.summaryMap.values());
            } else {
                return [];
            }
        }
    }
})
