- Never fabricate model accuracy, data, municipal integrations or coordinates.
  Report only metrics we measured on a held-out test set.
- AI output is a suggestion. A human reviews it. The UI must say so.
- Label PLACEHOLDER data (authority table) and DEMO data (seed reports) everywhere.
- Never claim a work order was issued or a team was assigned.
- Reporter personal details are never public and never sent to an LLM.
- Nothing is DONE unless it runs and is tested.
- Never commit secrets, datasets, model weights, or files over 50 MB.
- Work only in your own folders. Request changes elsewhere via docs/status/<ID>.md.
- Categories: pothole, garbage. The model has exactly these two classes.
  Drainage obstruction is future work and must not appear in the UI as supported.
- Inspection-request drafts use a local Ollama model (chosen later) behind one
  function in services/llm, with a fixed-template fallback.
