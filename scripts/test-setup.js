const fs = require('fs');

const TEST_DIR = "target/test";

fs.cpSync("src/test/javascript/document/", TEST_DIR, {recursive: true});
fs.cpSync("examples/complete/index.html", TEST_DIR + "/index.html");