// Import Cantabile API library
const Cantabile = require("./CantabileApi");

// Create an instance
var C = new Cantabile();

/*
C.bindings.watch("global.masterLevels.outputGain", null, null, function(value) {
    console.log("Master output gain changed to:", value);
});
*/

C.bindings.watch("midiInputPort.Onscreen Keyboard", null, {
    channel: 0,
    kind: "ProgramChange",
    controller: -1,
}, function(value) {
    console.log("Program Change: ", value);
})
C.bindings.open();

// Connect to Cantabile
C.connect();



