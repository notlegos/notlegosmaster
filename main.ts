function pushPrint (lineNo: number, textLine: string) {
    if (textLine != pushPrintArray[lineNo]) {
        pushPrintArray[lineNo] = textLine
        notLegos.writeLine(lineNo, textLine)
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
    textIn = convertToText(Math.round(Math.max(Math.min(numberIn, 10 ** digits - 1), 0)))
    while (textIn.length < digits) {
        textIn = " " + textIn
    }
    return textIn
}
function buttonPress (button: string) {
    Connected.showUserText(6, "button: " + button)
}
function printSay () {
    if (isCastleSay) {
        pushPrint(1, "R" + padLimit(lastLaserR, 1) + " C" + padLimit(lastLaserC, 1) + " L" + padLimit(lastLaserL, 1))
        pushPrint(2, notLegos.getVolumes())
        pushPrint(3, "hunt: " + lastHunt)
        pushPrint(4, "mode: " + castleMode)
    } else {
        pushPrint(1, "Toggle:" + toggleButton)
    }
}
radio.onReceivedValue(function (name, value) {
    if (name.substr(0, btToken.length) == btToken) {
        theName = name.substr(btToken.length, name.length - btToken.length)
        if (isCastleSay) {
            if (theName == "wstar") {
                castleMode = "wait_start"
            } else if (theName == "") {
            	
            } else if (theName == "check") {
                notLegos.setEffect(notLegos.vfxRegion.CastleSayAll, notLegos.vfxEffect.off)
                radio.sendValue("" + btToken + "ready", 1)
            } else {
            	
            }
            notLegos.writeLine(5, "bt: " + theName + "=" + value)
        } else {
            if (theName == "ready") {
                radio.sendValue("" + btToken + "wstar", 1)
                notLegos.setEffect(notLegos.vfxRegion.KongFront, notLegos.vfxEffect.parade)
            } else if (theName == "boot") {
                notLegos.vfxReset(notLegos.vfxEffect.glow)
                notLegos.setEffect(notLegos.vfxRegion.CastleDoAll, notLegos.vfxEffect.glow)
            } else {
            	
            }
            notLegos.writeLine(5, "bt: " + theName + "=" + value)
        }
    }
})
input.onLogoEvent(TouchButtonEvent.Touched, function () {
    if (isCastleSay) {
        notLegos.mp3musicPlay(notLegos.musicGenre.awaiting)
    }
})
let iTook = 0
let theName = ""
let textIn = ""
let pushPrintArray: string[] = []
let toggleButton = false
let buttonRow = 0
let castleMode = ""
let trackNo = 0
let lastHunt = 0
let lastLaserC = 0
let lastLaserL = 0
let lastLaserR = 0
let lastHue = 0
let lastGesture = 0
let lastSonarRead = 0
let digits: Connected.TM1637LEDs = null
let isCastleSay = false
let btToken = ""
let lastVolumeRead = 0
pins.setAudioPinEnabled(false)
led.enable(false)
btToken = "KC$"
if (notLegos.SonarFirstRead(DigitalPin.P8, DigitalPin.P9) > 0) {
    isCastleSay = true
}
radio.setGroup(171)
notLegos.oledinit()
notLegos.printLine("SAY: " + convertToText(isCastleSay), 7)
if (isCastleSay) {
    pins.digitalWritePin(DigitalPin.P5, 1)
    notLegos.potSet(AnalogPin.P10)
    digits = Connected.tm1637Create(
    DigitalPin.P7,
    DigitalPin.P6
    )
    lastSonarRead = 0
    lastGesture = 0
    lastHue = 0
    lastLaserR = 0
    lastLaserL = 0
    lastLaserC = 0
    lastHunt = 0
    notLegos.mp3setPorts(notLegos.mp3type.music, SerialPin.P15)
    basic.pause(20)
    notLegos.setVolume(notLegos.mp3type.music, 84)
    trackNo = 1
    basic.pause(20)
    notLegos.updateVolumeGlobal()
    notLegos.castleSayLights(DigitalPin.P11, DigitalPin.P12, DigitalPin.P13)
    castleMode = "init"
} else {
    pins.digitalWritePin(DigitalPin.P2, 1)
    pins.digitalWritePin(DigitalPin.P8, 1)
    pins.digitalWritePin(DigitalPin.P12, 1)
    pins.digitalWritePin(DigitalPin.P13, 1)
    buttonRow = 0
    toggleButton = false
    notLegos.motorSet(notLegos.motors.redrack, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.shark, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.ghost, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.cannon, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.oarrack, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.shell, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.door, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.dragon, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.wheel, notLegos.motorState.min)
    notLegos.motorSet(notLegos.motors.fan, notLegos.motorState.min)
    notLegos.castleDoLights(DigitalPin.P14, DigitalPin.P15, DigitalPin.P16)
    radio.sendValue("" + btToken + "check", 1)
}
let iBegan = input.runningTimeMicros()
pushPrintArray = " . . . . . . . ".split(".")
let isReady = true
loops.everyInterval(500, function () {
    if (isCastleSay) {
        notLegos.updateVolumeGlobal()
    }
})
loops.everyInterval(2000, function () {
    notLegos.writeLine(6, "" + iTook + "")
})
loops.everyInterval(40, function () {
    iBegan = input.runningTime()
    if (isReady) {
        if (isCastleSay) {
            notLegos.castleSayTick()
            if (castleMode == "wait_start") {
                if (lastHunt == 1 && pins.digitalReadPin(DigitalPin.P4) == 1) {
                    castleMode = "idle"
                    radio.sendValue("" + btToken + "boot", 1)
                    notLegos.vfxReset(notLegos.vfxEffect.glow)
                    notLegos.setEffect(notLegos.vfxRegion.CastleSayAll, notLegos.vfxEffect.glow)
                    notLegos.printLine("said:" + "boot", 5)
                }
            } else if (castleMode == "wait_reg") {
            	
            } else if (castleMode == "wait_play") {
            	
            } else if (castleMode == "wait_laser") {
            	
            } else if (castleMode == "init") {
                radio.sendValue("" + btToken + "ready", 1)
            }
            lastHunt = pins.digitalReadPin(DigitalPin.P4)
            lastGesture = Connected.getGesture()
            lastHue = Connected.readColor()
            lastSonarRead = notLegos.SonarNextRead()
            lastLaserR = Math.round(pins.analogReadPin(AnalogReadWritePin.P1) / 80)
            lastLaserC = Math.round(pins.analogReadPin(AnalogReadWritePin.P2) / 80)
            lastLaserL = Math.round(pins.analogReadPin(AnalogReadWritePin.P3) / 80)
            notLegos.printLine("R" + Math.constrain(lastLaserR, 0, 9) + " C" + Math.constrain(lastLaserC, 0, 9) + " L" + Math.constrain(lastLaserL, 0, 9), 1)
            notLegos.printLine("S" + lastSonarRead + " H" + Math.round(lastHue) + " G" + lastGesture + " N" + lastHunt, 2)
            notLegos.changeThree()
        } else {
            notLegos.castleDoTick()
            toggleButton = pins.analogReadPin(AnalogReadWritePin.P0) <= 30
            buttonRow = pins.analogReadPin(AnalogReadWritePin.P1)
            if (buttonRow < 10) {
                buttonPress("A")
            } else if (buttonRow < 60) {
                buttonPress("B")
            } else if (buttonRow < 110) {
                buttonPress("C")
            } else if (buttonRow < 200) {
                buttonPress("D")
            } else if (buttonRow < 700) {
                buttonPress("E")
            }
            printSay()
        }
    }
    iTook = input.runningTime() - iBegan
})
