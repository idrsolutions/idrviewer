# IDRViewer - HTML5 Document Viewer for BuildVu

The IDRViewer is a pure HTML/JavaScript/CSS viewer designed to display PDF and Office documents in the browser. It works alongside [BuildVu](https://www.idrsolutions.com/buildvu/) which converts PDF documents to HTML5 or SVG pages.

The IDRViewer is the component responsible for loading and displaying the pages in the web browser. It also handles functionality such as zoom, page layouts, and selection mode.

## UI Templates
We also provide a number of user-interfaces that can be used as provided or used as a starting point for building your own user interface.

- Complete UI ([source](blob/master/src/examples/complete/index.html), [demo](https://files.idrsolutions.com/Examples/IDRViewerUI/complete/))
- Clean UI ([source](blob/master/src/examples/clean/index.html), [demo](https://files.idrsolutions.com/Examples/IDRViewerUI/clean/))
- Simple UI ([source](blob/master/src/examples/simple/index.html), [demo](https://files.idrsolutions.com/Examples/IDRViewerUI/simple/))
- Slideshow UI ([source](blob/master/src/examples/slideshow/index.html), [demo](https://files.idrsolutions.com/Examples/IDRViewerUI/slideshow/))

## Project Structure
```
src/
   css/        - The CSS required for page display, layouts (Continuous, Magazine and Presentation) and transition effects
   examples/   - The standard UI templates (Complete, Clean, Simple & Slideshow)
   js/         - The main codebase (idrviewer.js) and other utilities (annotations, search, etc).
test/
   document/   - The document used for testing
   js/         - Qunit tests

```

## External IDRViewer API
See [IDRViewer JavaScript API](https://support.idrsolutions.com/buildvu/api-documents/idrviewer-javascript-api).

## Annotations JSON API
See [Annotations JSON API](https://support.idrsolutions.com/buildvu/api-documents/annotations-json-api)

## Grunt Tasks
1. Install [node.js](https://nodejs.org/)
2. Open terminal/command prompt & cd into idrviewer
3. Run `npm install -g grunt-cli`
4. Run `npm install`
5. To run grunt tasks, run `grunt <taskname>` where `<taskname>` is one of the following:
    - `jshint` is for running static analysis on the JavaScript files.
    - `uglify` is for minifying the idrviewer.js file to idrviewer.min.js
    - `qunit` is for running the automated IDRViewer tests (in /src/test/)

## License

Copyright 2021 IDRsolutions

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
