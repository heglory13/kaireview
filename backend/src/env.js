import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const envFiles = [
  fileURLToPath(new URL("../../.env", import.meta.url)),
  fileURLToPath(new URL("../.env", import.meta.url)),
];

const parseEnvLine = (line) => {
  const normalizedLine = line.trim();

  if (!normalizedLine || normalizedLine.startsWith("#")) {
    return null;
  }

  const assignment = normalizedLine.startsWith("export ")
    ? normalizedLine.slice("export ".length).trim()
    : normalizedLine;
  const separatorIndex = assignment.indexOf("=");

  if (separatorIndex <= 0) {
    return null;
  }

  const key = assignment.slice(0, separatorIndex).trim();
  let value = assignment.slice(separatorIndex + 1).trim();

  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
    return null;
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return [key, value];
};

for (const envFile of envFiles) {
  if (!existsSync(envFile)) {
    continue;
  }

  const lines = readFileSync(envFile, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const parsedLine = parseEnvLine(line);

    if (!parsedLine) {
      continue;
    }

    const [key, value] = parsedLine;
    process.env[key] ??= value;
  }
}
