const fs = require("fs");
const path = require("path");

const input = process.argv[2];

if (!input) {
  console.log('Please provide page names. Example: npm run create-page -- "Contact, About, Services"');
  process.exit(1);
}

const pages = input.split(",").map((p) => p.trim());

const templatePath = path.join("src/content/pages", "_template.txt");
let template = fs.readFileSync(templatePath, "utf8");

pages.forEach((page) => {
  const slug = page
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) return;

  const htmlPath = path.join("src/content/pages", `${slug}.html`);
  const lessPath = path.join("src/assets/less", `${slug}.less`);

  // const pageTemplate = template.replaceAll("{{PAGE}}", slug);

  fs.writeFileSync(htmlPath, template);
  fs.writeFileSync(lessPath, "");

  console.log(`Created ${htmlPath} and ${lessPath}`);
});
