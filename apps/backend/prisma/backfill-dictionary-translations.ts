import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const dictionaries = await prisma.dictionary.findMany({
    include: { languages: true, entries: true },
  });

  let updatedEntries = 0;

  for (const dictionary of dictionaries) {
    const configuredKeys = dictionary.languages.map((language) => language.key);
    if (configuredKeys.length === 0) {
      continue;
    }

    const fallbackKey = dictionary.defaultLanguageKey ?? configuredKeys[0];

    for (const entry of dictionary.entries) {
      const values = (entry.values as Record<string, string>) ?? {};
      const missingKeys = configuredKeys.filter(
        (key) => !values[key] || values[key].trim().length === 0,
      );

      if (missingKeys.length === 0) {
        continue;
      }

      const fallbackValue = values[fallbackKey] ?? "";
      const nextValues = { ...values };
      for (const key of missingKeys) {
        nextValues[key] = fallbackValue;
      }

      await prisma.dictionaryEntry.update({
        where: { id: entry.id },
        data: { values: nextValues },
      });

      updatedEntries += 1;
      console.log(
        `Backfilled entry "${entry.key}" (${entry.id}) in dictionary "${dictionary.name}": ${missingKeys.join(", ")}`,
      );
    }
  }

  console.log(`Done. Backfilled ${updatedEntries} entr${updatedEntries === 1 ? "y" : "ies"}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
