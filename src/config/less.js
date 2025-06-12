const less = require("less");
const { glob } = require("glob");
const fs = require("fs");
const path = require("path");

module.exports = async function () {
    // Make the public CSS directory. Prevents errors if we try writing to a directory that doesn't exist
    fs.mkdirSync("./public/assets/css", { recursive: true });

    // Make an array of objects containing LESS file path and the file contents
    const filenames = await glob("src/assets/less/**/*.less");
    const lessFiles = [];

    filenames.forEach((file) =>
        lessFiles.push({
            path: file,
            content: fs.readFileSync(file, "utf-8"),
        })
    );

    // Iterate over the LESS files, render them, and write to ./public
    lessFiles.forEach((file) => {
        less.render(file.content, {
            filename: file.path,
            sourceMap: {
                outputSourceFiles: true,
                sourceMapFileInline: true,
            },
        }).then(function (output) {
            const filename = path.basename(file.path, path.extname(file.path));

            fs.writeFileSync(`./public/assets/css/${filename}.css`, output.css);
            fs.writeFileSync(`./public/assets/css/${filename}.css.map`, output.map);
        });
    });
};
