import fs from "fs";
import path from "path";

const root = process.cwd();

const standaloneDir = path.join(
  root,
  ".next",
  "standalone"
);

const staticSource = path.join(
  root,
  ".next",
  "static"
);

const staticDestination = path.join(
  standaloneDir,
  ".next",
  "static"
);

const publicSource = path.join(
  root,
  "public"
);

const publicDestination = path.join(
  standaloneDir,
  "public"
);

if (!fs.existsSync(standaloneDir)) {
  throw new Error(
    "Standalone build directory was not generated."
  );
}

if (fs.existsSync(publicSource)) {
  fs.cpSync(
    publicSource,
    publicDestination,
    {
      recursive: true,
      force: true,
    }
  );
}

if (fs.existsSync(staticSource)) {
  fs.mkdirSync(
    staticDestination,
    {
      recursive: true,
    }
  );

  fs.cpSync(
    staticSource,
    staticDestination,
    {
      recursive: true,
      force: true,
    }
  );
}

console.log(
  "Standalone Next.js deployment prepared successfully."
);