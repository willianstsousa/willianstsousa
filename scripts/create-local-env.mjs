import { randomBytes } from "node:crypto";
import { access, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectDirectory = process.cwd();
const templatePath = resolve(projectDirectory, ".env.example");
const targetPath = resolve(projectDirectory, ".env.local");
const fallbackPath = resolve(projectDirectory, ".env");

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

try {
  if (await exists(targetPath)) {
    throw Object.assign(new Error("local env exists"), { code: "EEXIST" });
  }
  if (await exists(fallbackPath)) {
    console.log(".env já existe e não foi alterado; o Next.js o carregará.");
    process.exit(0);
  }

  const template = await readFile(templatePath, "utf8");
  const authSecret = randomBytes(32).toString("base64url");
  const localEnvironment = template.replace(
    /^AUTH_SECRET=\s*$/m,
    `AUTH_SECRET=${authSecret}`,
  );

  if (localEnvironment === template) {
    throw new Error("AUTH_SECRET placeholder not found");
  }

  await writeFile(targetPath, localEnvironment, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });

  console.log(
    ".env.local criado com um AUTH_SECRET novo. Preencha apenas os valores externos restantes; nenhum segredo foi exibido.",
  );
} catch (error) {
  if (error && typeof error === "object" && "code" in error && error.code === "EEXIST") {
    console.error(".env.local já existe e não foi alterado.");
  } else {
    console.error("Não foi possível criar .env.local com segurança.");
  }
  process.exitCode = 1;
}
