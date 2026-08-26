import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectDirectory = process.cwd();
const candidates = [".env.local", ".env"];
let selectedPath;
let contents;

for (const candidate of candidates) {
  try {
    const path = resolve(projectDirectory, candidate);
    contents = await readFile(path, "utf8");
    selectedPath = path;
    break;
  } catch {
    // Try the next supported local environment file.
  }
}

if (!selectedPath || contents === undefined) {
  console.error("Nenhum arquivo .env.local ou .env foi encontrado.");
  process.exitCode = 1;
} else {
  const existingDirect = contents.match(/^DATABASE_URL_UNPOOLED=(.*)$/m)?.[1].trim();
  const pooledMatch = contents.match(/^DATABASE_URL=(.*)$/m);

  if (existingDirect) {
    console.log("DATABASE_URL_UNPOOLED já existe e não foi alterada.");
  } else if (!pooledMatch?.[1].trim()) {
    console.error("DATABASE_URL não está preenchida.");
    process.exitCode = 1;
  } else {
    try {
      const rawValue = pooledMatch[1].trim().replace(/^(["'])(.*)\1$/, "$2");
      const directUrl = new URL(rawValue);
      if (!directUrl.hostname.includes("-pooler.")) {
        throw new Error("pooled host expected");
      }
      directUrl.hostname = directUrl.hostname.replace("-pooler.", ".");

      const line = `DATABASE_URL_UNPOOLED=${directUrl.toString()}`;
      const newLine = contents.includes("\r\n") ? "\r\n" : "\n";
      const nextContents = /^DATABASE_URL_UNPOOLED=.*$/m.test(contents)
        ? contents.replace(/^DATABASE_URL_UNPOOLED=.*$/m, line)
        : contents.replace(/^DATABASE_URL=.*$/m, (match) => `${match}${newLine}${line}`);

      await writeFile(selectedPath, nextContents, "utf8");
      console.log(
        "DATABASE_URL_UNPOOLED foi derivada do endpoint pooled e salva sem exibir credenciais.",
      );
    } catch {
      console.error(
        "Não foi possível derivar a URL direct. Copie-a do Neon com pooling desligado.",
      );
      process.exitCode = 1;
    }
  }
}
