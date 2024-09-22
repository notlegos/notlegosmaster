function isNearly (reference: number, reading: number, tolerance: number) {
    if (reading >= reference - tolerance && reading <= reference + tolerance) {
        return true
    } else {
        return false
    }
}
let scoreCircle: Connected.Strip = null
let wheelLights: Connected.Strip = null
let sockLights: Connected.Strip = null
let digits: Connected.TM1637LEDs = null
pins.setAudioPinEnabled(false)
led.enable(false)
let isCastleSay = false
if (notLegos.SonarFirstRead(DigitalPin.P8, DigitalPin.P9) > 0) {
    isCastleSay = true
}
Connected.oledClear()
Connected.showUserText(1, "SAY: " + convertToText(isCastleSay))
let lastLaserR = 0
let lastHue = 0
let lastGesture = 0
let lastLaserC = 0
let lastLaserL = 0
let lastSonarRead = 0
let lastVolumeRead = 0
if (isCastleSay) {
    notLegos.potSet(AnalogPin.P10)
    digits = Connected.tm1637Create(
    DigitalPin.P7,
    DigitalPin.P6
    )
    sockLights = Connected.create(Connected.DigitalRJPin.P11, 8, Connected.NeoPixelMode.RGB)
    sockLights.showColor(Connected.colors(Connected.NeoPixelColors.Blue))
    sockLights.show()
    wheelLights = Connected.create(Connected.DigitalRJPin.P12, 18, Connected.NeoPixelMode.RGB)
    wheelLights.showColor(Connected.colors(Connected.NeoPixelColors.Blue))
    wheelLights.show()
    scoreCircle = Connected.create(Connected.DigitalRJPin.P13, 8, Connected.NeoPixelMode.RGB)
    scoreCircle.showColor(Connected.colors(Connected.NeoPixelColors.Blue))
    scoreCircle.show()
    notLegos.sendMP3fileFolder("001", "005", SerialPin.P15)
} else {
	
}
let isReady = true
control.inBackground(function () {
    while (isReady) {
        if (isCastleSay) {
            lastVolumeRead = notLegos.potRead()
            lastSonarRead = notLegos.SonarNextRead()
            lastLaserR = pins.analogReadPin(AnalogReadWritePin.P1)
            lastLaserC = pins.analogReadPin(AnalogReadWritePin.P2)
            lastLaserL = pins.analogReadPin(AnalogReadWritePin.P3)
            lastHue = Connected.readColor()
            lastGesture = Connected.getGesture()
        } else {
        	
        }
        basic.pause(40)
    }
})
loops.everyInterval(200, function () {
    Connected.showUserText(2, "R" + lastLaserR + " C" + lastLaserC + " L" + lastLaserL)
    Connected.showUserText(3, "dist" + lastSonarRead + " vol" + lastVolumeRead)
    Connected.showUserText(4, "hue" + Math.round(lastHue) + " gest" + lastGesture)
})
