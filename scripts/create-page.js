const fs = require("fs");
const path = require("path");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolvePath(p) {
  return path.join(process.cwd(), p);
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const input = process.argv[2];

  if (!input) {
    console.log('Please provide page names. Example: npm run create-page -- "Contact, About, Services"');
    process.exit(1);
  }

  const templatePath = resolvePath("src/content/pages/_template.txt");

  if (!fs.existsSync(templatePath)) {
    console.log(`Template not found: ${templatePath}`);
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf8");
  const pages = input.split(",").map((p) => p.trim());

  pages.forEach((page) => {
    const slug = slugify(page);

    if (!slug) return;

    const htmlPath = resolvePath(`src/content/pages/${slug}.html`);
    const lessPath = resolvePath(`src/assets/less/${slug}.less`);

    if (fs.existsSync(htmlPath)) {
      console.log(`Skipped ${slug}.html — already exists`);
      return;
    }

    fs.writeFileSync(htmlPath, template);
    fs.writeFileSync(lessPath, "");

    console.log(`Created ${htmlPath} and ${lessPath}`);
  });
}

main();
