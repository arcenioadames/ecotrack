import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type Finding = {
  model: string;
  field: string;
  reason: string;
};

const SENSITIVE_PATTERNS = [
  { pattern: /email/i, reason: "possible email field" },
  { pattern: /phone/i, reason: "possible phone field" },
  { pattern: /address/i, reason: "possible address field" },
  { pattern: /document/i, reason: "possible document/ID field" },
  { pattern: /name/i, reason: "possible name field" },
];

function parsePrismaModels(schema: string): Array<{ model: string; fields: string[] }> {
  const modelRegex = /model\s+(\w+)\s+\{([\s\S]*?)\n\}/g;
  const result: Array<{ model: string; fields: string[] }> = [];
  let match: RegExpExecArray | null;

  while ((match = modelRegex.exec(schema)) !== null) {
    const model = match[1];
    const block = match[2];
    const fields = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !line.startsWith("//") && !line.startsWith("@@"))
      .map((line) => line.split(/\s+/)[0])
      .filter(Boolean);

    result.push({ model, fields });
  }

  return result;
}

function auditSchema(schemaPath: string) {
  const schema = readFileSync(schemaPath, "utf8");
  const models = parsePrismaModels(schema);
  const findings: Finding[] = [];

  for (const model of models) {
    for (const field of model.fields) {
      for (const entry of SENSITIVE_PATTERNS) {
        if (entry.pattern.test(field)) {
          findings.push({ model: model.model, field, reason: entry.reason });
          break;
        }
      }
    }
  }

  return { schemaPath, scannedModels: models.length, findings };
}

function main() {
  const schemaPath = resolve(process.cwd(), "prisma", "schema.prisma");
  const report = auditSchema(schemaPath);
  const output = JSON.stringify(report, null, 2);

  console.log(output);

  const outputPath = process.env.PII_AUDIT_OUTPUT;
  if (outputPath) {
    writeFileSync(outputPath, `${output}\n`, "utf8");
  }
}

if (require.main === module) {
  main();
}
