function isNearly (reference: number, reading: number, tolerance: number) {
    if (reading >= reference - tolerance && reading <= reference + tolerance) {
        return true
    } else {
        return false
    }
}
input.onButtonPressed(Button.A, function () {
    basic.pause(notLegos.playFile2("1_1_25_100"))
})
input.onButtonPressed(Button.B, function () {
    basic.pause(notLegos.playFile("2_1_1"))
})
Connected.oledClear()
pins.setAudioPinEnabled(true)
led.enable(false)
basic.pause(100)
let digits = Connected.tm1637Create(
DigitalPin.P7,
DigitalPin.P6
)
basic.pause(1000)
let sockLights = Connected.create(Connected.DigitalRJPin.P11, 8, Connected.NeoPixelMode.RGB)
sockLights.showColor(Connected.colors(Connected.NeoPixelColors.Blue))
sockLights.show()
let wheelLights = Connected.create(Connected.DigitalRJPin.P12, 18, Connected.NeoPixelMode.RGB)
wheelLights.showColor(Connected.colors(Connected.NeoPixelColors.Blue))
wheelLights.show()
let scoreCircle = Connected.create(Connected.DigitalRJPin.P13, 8, Connected.NeoPixelMode.RGB)
scoreCircle.showColor(Connected.colors(Connected.NeoPixelColors.Blue))
scoreCircle.show()
notLegos.mp3setPorts(notLegos.mp3type.music, SerialPin.P15)
basic.pause(100)
notLegos.sendMP3fileFolder("001", "005", SerialPin.P15)
loops.everyInterval(500, function () {
    Connected.showUserText(1, "R" + pins.analogReadPin(AnalogReadWritePin.P1) + " C" + pins.analogReadPin(AnalogReadWritePin.P2) + " L" + pins.analogReadPin(AnalogReadWritePin.P3))
    Connected.showUserText(2, "hue " + Connected.readColor())
    Connected.showUserText(3, "distance " + Connected.ultrasoundSensor(DigitalPin.P8, DigitalPin.P9, Connected.Distance_Unit_List.Distance_Unit_cm))
    Connected.showUserText(4, "gesture " + Connected.getGesture())
})
