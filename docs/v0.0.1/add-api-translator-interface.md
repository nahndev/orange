# Add ApiTranslatorInterface for backend support translate multiple language with context

## Currently

The backend does not have a dedicated interface for translating text across multiple languages with contextual information.

## Acceptance Criteria

- [x] `ApiTranslatorInterface` defines a contract for translating a word/text into all configured dictionary languages, optionally using descriptive context to disambiguate meaning
- [x] `ApiTranslator` implements `ApiTranslatorInterface` by calling the local Ollama model (`OLLAMA_HOST`/`OLLAMA_MODEL`)
- [x] A new `DictionaryContext` persists, per dictionary entry: a generated description, keywords, and 5 related words with translated values for every language configured on the dictionary
- [x] Generating a `DictionaryContext` uses `ApiTranslator` to produce the description/keywords/related words and to translate the related words
- [x] `WordRankingInterface` (typo "WorkRankingInterface" in the original request) defines a contract for retrieving up to 5 words similar to a given word, and for indexing/removing dictionary entries
- [x] A Meilisearch-backed implementation of `WordRankingInterface` ranks/searches only entries within the same dictionary as the input word
- [x] Creating a dictionary entry automatically indexes it (key, description, translated values) into Meilisearch
- [x] Updating a dictionary entry keeps its Meilisearch index in sync; deleting a dictionary entry removes it from the index

## Solutions

- [x] Define `ApiTranslatorInterface` (`translate`, `generateContext`) in the translation module
- [x] Implement `ApiTranslator` using the Ollama HTTP API (`/api/generate`, JSON mode)
- [x] Add `DictionaryContext` Prisma model (1:1 with `DictionaryEntry`) + migration
- [x] Add `DictionaryService.generateContext`/`getContext` + controller endpoints, backed by `ApiTranslator`
- [x] Define `WordRankingInterface` (`indexEntry`, `removeEntry`, `findSimilarWords`) in the search module
- [x] Implement a Meilisearch-backed `WordRankingInterface` over Meilisearch's REST API
- [x] Wire `DictionaryService.addEntry`/`updateEntry`/`removeEntry` to auto-index/remove via `WordRankingInterface`
- [x] Add a `GET /dictionaries/:id/word-ranking` endpoint returning up to 5 similar words for a given word
