const fs = require('fs');

const TEST_DIR = "target/test";

if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, {recursive: true, force: true});
}