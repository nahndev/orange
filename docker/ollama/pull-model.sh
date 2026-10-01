#!/bin/sh
# Pulls the model used by the AI translation feature into the running ollama container.
docker exec -it orange-ollama-1 ollama pull qwen2.5:7b
