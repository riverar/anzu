# anzu

![Image of anzu dumping Astroneer](https://github.com/riverar/anzu/raw/master/gfx/example.png)

Dumps installed Universal Windows Platform app package contents, notably those that are encrypted, with some simple JavaScript.

Powered by [Frida](https://www.frida.re).
 
## Installation and usage ##
1. `npm install @withinrafael/anzu -g`
2. `icacls .\path\to\dest\folder /grant "ALL APPLICATION PACKAGES":(OI)(CI)F`
2. `anzu running-uwp-process.exe .\path\to\dest\folder`
3. Wait.
4. You're done, congratulations.

## Supported operating systems ##
- Windows 10

## Known issues ##
- anzu will not dump apps that are installed outside %ProgramFiles%\WindowsApps
- anzu currently requires manual DACL alteration (see install instructions)