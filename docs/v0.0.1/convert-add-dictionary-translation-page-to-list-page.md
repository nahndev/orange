# Convert AddDictionaryTranslationPage into DictionaryTranslationPage with list all sentence

## Currently

`AddDictionaryTranslationPage` (`apps/frontend/src/app/dictionaries/[id]/page.tsx`) only renders a form (`DictionarySentenceForm`) to add a new sentence translation and a `DictionaryWordReferenceList` of pre-defined words. It does not display any existing sentences for the dictionary.

## Acceptance Criteria

- [ ] Update current layout, left is current page, right is new page with list all sentences (only load 50 records)
- [ ] When click on a Sentences translation -> Replace current creation from into update form.
- [ ] On top of list is filter with language selector and text input

## Solutions

- [ ] Add all sentence to meilisearch
- [ ] Filter using with meilisearch
- [ ] Update layout and logic base on acceptance criteria
