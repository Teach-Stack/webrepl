# WebREPL
WebREPL is a simple web based HTML/CSS/JS REPL created using service workers.

## How
By using service workers there is no need server/backend for running any code, it is all done in the client's browser. This reduces complexity and make's it super portable. 

Code is stored locally in your browser using IndexedDB, so it persists between visits and never leaves your device. 

To share, the REPL is compressed utilizing [fflate](https://github.com/101arrowz/fflate), and URL-encoded into a single query parameter to produce a shareable link.

## Why
I primarily developed this for my own classroom when I teach a small HTML & CSS foundations unit, it allows me to introduce students to the HTML & CSS web development without needing to setup and entire development environment. 

## Current Limitations
- Simple file structures only
- No uploading of assets
