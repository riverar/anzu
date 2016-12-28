'use strict'

export const expandEnvironmentStrings = new NativeFunction(Module.findExportByName('kernel32.dll', 'ExpandEnvironmentStringsW'), 'uint', ['pointer', 'pointer', 'uint'])
export const getCurrentProcess = new NativeFunction(Module.findExportByName('kernel32.dll', 'GetCurrentProcess'), 'int', [])
export const findFirstFile = new NativeFunction(Module.findExportByName('kernel32.dll', 'FindFirstFileW'), 'pointer', ['pointer', 'pointer'])
export const findNextFile = new NativeFunction(Module.findExportByName('kernel32.dll', 'FindNextFileW'), 'int', ['pointer', 'pointer'])
export const findClose = new NativeFunction(Module.findExportByName('kernel32.dll', 'FindClose'), 'int', ['pointer'])
export const createFile = new NativeFunction(Module.findExportByName('kernel32.dll', 'CreateFileW'), 'pointer', ['pointer', 'uint', 'uint', 'pointer', 'uint', 'uint', 'pointer'])
export const shCreateDirectoryEx = new NativeFunction(Module.findExportByName('shell32.dll', 'SHCreateDirectoryExW'), 'int', ['pointer', 'pointer', 'pointer'])

// minwinbase.h
export class WIN32_FIND_DATA {
    static size() { return 592 }

    constructor(pointer) {
        this.fileAttributes = Memory.readUInt(pointer)
        this.isDirectory = ((this.fileAttributes & 16) === 16)
        this.isFile = !this.isDirectory
        this.creationTime = {}
        this.creationTime.low = Memory.readUInt(pointer.add(4))
        this.creationTime.high = Memory.readUInt(pointer.add(8))
        this.accessTime = {}
        this.accessTime.low = Memory.readUInt(pointer.add(12))
        this.accessTime.high = Memory.readUInt(pointer.add(16))
        this.writeTime = {}
        this.writeTime.low = Memory.readUInt(pointer.add(20))
        this.writeTime.high = Memory.readUInt(pointer.add(24))
        this.fileSize = {};
        this.fileSize.high = Memory.readUInt(pointer.add(28))
        this.fileSize.low = Memory.readUInt(pointer.add(32))

        var scratch = Memory.alloc(8)
        Memory.writeInt(scratch, this.fileSize.low)
        Memory.writeInt(scratch.add(4), this.fileSize.high)
        this.fileSize = Memory.readU64(scratch)

        this.fileName = Memory.readUtf16String(pointer.add(44))
        this.alternateFileName = Memory.readUtf16String(pointer.add(48))
    }
}

// minwindef.h
export const maxPath = 260

// winnt.h
export const access = {
    read: 0x80000000,
    write: 0x40000000,
    execute: 0x20000000,
    all: 0x10000000
}

export const share = {
    read: 0x00000001,
    write: 0x00000002,
    delete: 0x00000004
}

export const disposition = {
    createNew: 1,
    createAlways: 2,
    openExisting: 3,
    openAlways: 4,
    truncateExisting: 5
}