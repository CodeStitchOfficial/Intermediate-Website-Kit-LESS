const { glob } = require("glob");
const fs = require("fs");
const path = require("path");

const less = require("less");
const postcss = require("postcss");

const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

const isProduction = process.env.ELEVENTY_ENV === "PROD";

// PostCSS processor - add more plugins here as you see fit. cssnano won't run in development.
const processor = postcss([autoprefixer(), ...(isProduction ? [cssnano({ preset: "default" })] : [])]);

module.exports = async function () {
    // Make the public CSS directory
    fs.mkdirSync("./public/assets/css", { recursive: true });

    // Get LESS files
    const filenames = await glob("src/assets/less/**/*.less");
    const lessFiles = filenames.map((file) => ({
        path: file,
        content: fs.readFileSync(file, "utf-8"),
    }));

    // Setup an array of promises for better build performance.
    const processPromises = lessFiles.map(async (file) => {
        try {
            const filename = path.basename(file.path, path.extname(file.path));
            const cssPath = `./public/assets/css/${filename}.css`;
            const mapPath = `./public/assets/css/${filename}.css.map`;

            // Step 1 - Parse the LESS. Generate a source map if we're in development
            const lessOutput = await less.render(file.content, {
                filename: file.path,
                sourceMap: isProduction
                    ? false
                    : {
                          outputSourceFiles: true,
                          sourceMapFileInline: true,
                      },
            });

            // Step 2 - Run the generated CSS through PostCSS for autoprefixer. Generate a source map (based on the LESS map) if we're in development
            const postcssResult = await processor.process(lessOutput.css, {
                from: file.path,
                to: cssPath,
                map: isProduction
                    ? false
                    : {
                          prev: lessOutput.map,
                          inline: true,
                          annotation: true,
                      },
            });

            // Step 3 - Write the CSS to a file
            fs.writeFileSync(cssPath, postcssResult.css);

            // Step 4 - If there's a map, write that too
            if (postcssResult.map) {
                fs.writeFileSync(mapPath, postcssResult.map.toString());
            }
        } catch (error) {
            console.error(`Error processing ${file.path}:`, error);
        }
    });

    await Promise.all(processPromises);
};
