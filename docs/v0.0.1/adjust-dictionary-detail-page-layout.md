# Adjust layout of detail page of dictionary

## Currently

The dictionary detail page (`apps/frontend/src/app/dashboard/dictionaries/[key]/page.tsx`) renders three sections — **Details**, **Languages**, and **Keywords** — each wrapped in its own `Card`, stacked vertically in a single-column `flex flex-col gap-6` container:

- **Details** (`DictionaryDetailsForm`): name/description fields, save and delete actions.
- **Languages** (`DictionaryLanguagesForm`): configures supported languages and default language.
- **Keywords** (`DictionaryEntries`): manages translated keywords for the dictionary.

All three cards currently take the full width of the page and appear in a fixed top-to-bottom order with no responsive column layout.

## Acceptance Criteria and solutions

- Design for layout
  - First row: [Detail][LanguageForm]
  - Second row: [keywords]
- Design for language form:
  - LanguageSelector - key input -> action
  - action using icon with custom color lucide
- Design of keywords as list
  - Column is language with name (instead of current is key) -> create new component LanguageName
  - row is all keyword, first is `key`
  - end row is action with delete icon
