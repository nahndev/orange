# Increase AI accuracy

## Currently

AI-assisted translation and dictionary context generation is powered by a local Ollama model (default `qwen2.5:1.5b`, configurable via `OLLAMA_MODEL`) in `apps/backend/src/modules/translation/api-translator.service.ts`. It is used to auto-fill missing sentence/keyword translations (the "AI" button in `dictionary-sentence-form.tsx`) and to generate dictionary context (description, keywords, related words) for a word. The model's output is requested via a single prompt per call with no accuracy evaluation, retries, or quality safeguards in place.

## Solutions

- [ ] Change api from /translate to /dictionaries/{id}/translations with current payload (include `text`)
- [ ] Base on id of dictionary load description and correct pre-define words (which same with `text`)
- [ ] Base on `text` (which need translate) -> search with similar in Meilisearch -> return 5 values
- [ ] Base on pre-defined words + similar sentences + text + description (of dictionary) -> build prompt
- [ ] Using prompt for AI translate
