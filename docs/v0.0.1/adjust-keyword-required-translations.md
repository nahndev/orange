# Adjust keyword feature to require translations for all languages

## Currently

Dictionary keywords are created with only a key and an optional description; translation values per language are added afterward on the entry row and are optional. A keyword can currently be saved (created or updated) with empty or missing translation values for one or more configured languages.

## Acceptance Criteria

- [ ] Creating a keyword requires a non-empty translation value for every language configured on the dictionary
- [ ] Updating a keyword requires a non-empty translation value for every language configured on the dictionary
- [ ] Save is blocked with a validation error if any configured language is missing a translation value
- [ ] Existing keywords with missing translations for one or more languages are identified and backfilled/completed so all keywords include translations for all configured languages

## Solutions

- [ ] Add validation (frontend + backend) requiring all dictionary language keys to be present with non-empty values before create/update succeeds
- [ ] Surface inline errors/highlight missing language fields in the keyword create form and `DictionaryEntryRow`
- [ ] Update `create-dictionary-entry.dto` / `update-dictionary-entry.dto` to enforce a values map matching the dictionary's configured languages
- [ ] Add a migration/backfill step for existing dictionary entries missing translations for one or more languages
