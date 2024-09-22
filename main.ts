function pushPrint (lineNo: number, textLine: string) {
    if (lineNo == 2) {
        if (textLine != pushPrint2) {
            pushPrint2 = textLine
            Connected.showUserText(lineNo, textLine)
        }
    } else {
    	
    }
}
function isNearly (reference: number, reading: number, tolerance: number) {
    if (reading >= reference - tolerance && reading <= reference + tolerance) {
        return true
    } else {
        return false
    }
}
function padLimit (numberIn: number, digits: number) {
    limitNines = 0
    textIn = convertToText(Math.round(Math.max(Math.min(numberIn, 10 ** digits - 1), 0)))
    while (textIn.length < digits) {
        textIn = " " + textIn
    }
    return textIn
}
function printSay () {
    if (isCastleSay) {
        pushPrint(2, "R" + padLimit(Math.round(lastLaserR / 100), 1) + " C" + padLimit(Math.round(lastLaserC / 100), 1) + " L" + padLimit(Math.round(lastLaserL / 100), 1))
    }
}
input.onLogoEvent(TouchButtonEvent.Touched, function () {
    notLegos.sendMP3fileFolder("1", "1", SerialPin.P15)
    basic.pause(2000)
    notLegos.sendMP3fileFolder("1", "2", SerialPin.P15)
})
let lastHue = 0
let lastGesture = 0
let lastSonarRead = 0
let lastVolumeRead = 0
let textIn = ""
let limitNines = 0
let pushPrint2 = ""
let lastLaserC = 0
let lastLaserL = 0
let lastLaserR = 0
let scoreCircle: Connected.Strip = null
let wheelLights: Connected.Strip = null
let sockLights: Connected.Strip = null
let digits: Connected.TM1637LEDs = null
let isCastleSay = false
pins.setAudioPinEnabled(false)
led.enable(false)
if (notLegos.SonarFirstRead(DigitalPin.P8, DigitalPin.P9) > 0) {
    isCastleSay = true
}
Connected.oledClear()
Connected.showUserText(1, "SAY: " + convertToText(isCastleSay))
if (isCastleSay) {
    notLegos.potSet(AnalogPin.P10)
    digits = Connected.tm1637Create(
    DigitalPin.P7,
    DigitalPin.P6
    )
    sockLights = Connected.create(Connected.DigitalRJPin.P11, 8, Connected.NeoPixelMode.RGB)
    sockLights.showRainbow(1, 360)
    sockLights.show()
    wheelLights = Connected.create(Connected.DigitalRJPin.P12, 18, Connected.NeoPixelMode.RGB)
    wheelLights.showRainbow(1, 360)
    wheelLights.show()
    scoreCircle = Connected.create(Connected.DigitalRJPin.P13, 8, Connected.NeoPixelMode.RGB)
    scoreCircle.showRainbow(1, 360)
    scoreCircle.show()
    lastLaserR = 0
    lastLaserL = 0
    lastLaserC = 0
} else {
	
}
pushPrint2 = ""
let isReady = true
loops.everyInterval(40, function () {
    while (isReady) {
        if (isCastleSay) {
            sockLights.rotate(1)
            wheelLights.rotate(1)
            scoreCircle.rotate(1)
            sockLights.show()
            wheelLights.show()
            scoreCircle.show()
            lastVolumeRead = notLegos.potRead()
            lastSonarRead = notLegos.SonarNextRead()
            lastLaserR = pins.analogReadPin(AnalogReadWritePin.P1)
            lastLaserC = pins.analogReadPin(AnalogReadWritePin.P2)
            lastLaserL = pins.analogReadPin(AnalogReadWritePin.P3)
            lastGesture = Connected.getGesture()
            lastHue = Connected.readColor()
            printSay()
        } else {
        	
        }
    }
})
