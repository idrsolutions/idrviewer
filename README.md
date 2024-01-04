# IDRViewer - HTML5 Document Viewer for BuildVu

The IDRViewer is a pure HTML/JavaScript/CSS viewer designed to display PDF and Office documents in the browser. It works alongside [BuildVu](https://www.idrsolutions.com/buildvu/) which converts PDF documents to HTML5 or SVG pages.

The IDRViewer is the component responsible for loading and displaying the pages in the web browser. It also handles functionality such as zoom, page layouts, and selection mode.

## UI Templates
We also provide a number of user-interfaces that can be used as provided or used as a starting point for building your own user interface. The templates are built using webpack (see NPM Tasks below).

- Complete UI ([source](src/templates/complete/), [demo](https://files.idrsolutions.com/Examples/IDRViewerUI/complete/))
- Clean UI ([source](src/templates/clean/), [demo](https://files.idrsolutions.com/Examples/IDRViewerUI/clean/))
- Simple UI ([source](src/templates/simple/), [demo](https://files.idrsolutions.com/Examples/IDRViewerUI/simple/))
- Slideshow UI ([source](src/templates/slideshow/), [demo](https://files.idrsolutions.com/Examples/IDRViewerUI/slideshow/))

## Project Structure
```
examples/      - The built UI templates (Complete, Clean, Simple, Slideshow)
src/
   css/        - The CSS for page display, layouts (Continuous, Magazine, Presentation) and transition effects
   js/         - The main codebase (idrviewer.js) and other utilities (annotations, search, etc)
   templates/  - The UI templates that are compiled into a single index.html file with webpack
   test/
      document/   - The document used for testing
      js/         - Playwright tests
```

## External IDRViewer API
See [IDRViewer JavaScript API](https://support.idrsolutions.com/buildvu/api-documents/idrviewer-javascript-api).

## Annotations JSON API
See [Annotations JSON API](https://support.idrsolutions.com/buildvu/api-documents/annotations-json-api)

## NPM Tasks
1. Install [node.js](https://nodejs.org/)
2. Open terminal/command prompt & cd into idrviewer
3. Run `npm install`
4. To run the tasks, run `npm run <taskname>` where `<taskname>` is one of the following:
   - 'jshint' is for running static analysis on the JavaScript files.
   - 'playwright' is for running the automated IDRViewer tests (in /src/test/)
   - 'test' is for jshint and playwright tests
   - 'webpack' is for building the UIs
   - 'webpack-watch' is for building the UIs and watching for changes

## License

Copyright 2024 IDRsolutions

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
