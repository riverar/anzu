'use strict'

const win32 = require('./win32')

export const getPackageFullName = new NativeFunction(Module.findExportByName('kernel32.dll', 'GetPackageFullName'), 'long', ['int', 'pointer', 'pointer'])

export function getPackageFullNameForProcess(processHandle) {
    const PACKAGE_FULL_NAME_MAX_LENGTH = 127
    const APPMODEL_ERROR_NO_PACKAGE = 15700
    const SUCCESS = 0

    const packageFullNameLengthPtr = Memory.alloc(Process.pointerSize)
    Memory.writeUInt(packageFullNameLengthPtr, PACKAGE_FULL_NAME_MAX_LENGTH)

    const packageFullNamePtr = Memory.alloc(PACKAGE_FULL_NAME_MAX_LENGTH)
    
    let packageFullName = '';
    if(getPackageFullName(processHandle, packageFullNameLengthPtr, packageFullNamePtr) == SUCCESS) {
        packageFullName = Memory.readUtf16String(packageFullNamePtr)
    }

    return packageFullName;
}

export function getWindowsAppsPath() {
    // BUGBUG: Apps can be installed on other drives
    // https://gitlab.com/WithinRafael/anzu/issues/1
    const pathWithVarsPtr = Memory.allocUtf16String('%ProgramW6432%\\WindowsApps')
    const pathWithoutVarsPtr = Memory.alloc(win32.maxPath)
    win32.expandEnvironmentStrings(pathWithVarsPtr, pathWithoutVarsPtr, win32.maxPath)

    return Memory.readUtf16String(pathWithoutVarsPtr)
}