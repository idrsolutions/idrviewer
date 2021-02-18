1. Install node.js https://nodejs.org/en/

2. Open terminal/command prompt & cd into idrviewer

3. Run 'npm install -g grunt-cli'

4. Run 'npm install'

5. To run grunt tasks, run 'grunt <taskname>' where <taskname> is one of the following:
    - 'jshint' is for running static analysis on the JavaScript files.
    - 'uglify' is for minifying the idrviewer.js file to idrviewer.min.js
    - 'qunit' is for running the automated IDRViewer tests (in /src/test/)