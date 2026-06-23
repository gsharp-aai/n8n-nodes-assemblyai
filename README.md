# n8n-nodes-assemblyai
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./images/AAI_Dark_Mode.svg">
    <source media="(prefers-color-scheme: light)" srcset="./images/AAI_Light_Mode.svg">
    <img src="./images/AAI_Light_Mode.svg" alt="AssemblyAI Logo">
  </picture>
</p>
<div align="center">

[![npm version](https://badge.fury.io/js/n8n-nodes-assemblyai.svg)](https://www.npmjs.com/package/n8n-nodes-assemblyai)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-assemblyai.svg)](https://www.npmjs.com/package/n8n-nodes-assemblyai)

</div>

This is an n8n community node. It lets you use [AssemblyAI](https://www.assemblyai.com/) in your n8n workflows.

[AssemblyAI](https://www.assemblyai.com/) develops industry-leading Speech AI models for transcription and audio understanding, accessible through their API. It provides features like speaker diarization, sentiment analysis, entity detection, PII redaction, prompting (Universal-3 Pro), Medical Mode, and LLM Gateway capabilities for processing transcripts with AI.

## Resources
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [AssemblyAI API reference](https://www.assemblyai.com/docs/api-reference)
- [AssemblyAI API documentation](https://www.assemblyai.com/docs)
  - [AssemblyAI Speech-to-Text guide](https://www.assemblyai.com/docs/getting-started/transcribe-an-audio-file)
  - [AssemblyAI LLM Gateway guide](https://www.assemblyai.com/docs/llm-gateway/apply-llms-to-audio-files)

## Quick links
- [Installation](#installation)
- [Credentials](#credentials)
- [Operations](#operations)
- [Development](#development)
- [Support & Feedback](#support--feedback)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

To use this node, you need an AssemblyAI API key.

### Prerequisites

1. Sign up for a free account at [AssemblyAI](https://www.assemblyai.com/) and receive $50 in free credits.
2. Navigate to your [API Keys page](https://www.assemblyai.com/dashboard/api-keys) in the dashboard.

### Setup in n8n

1. In n8n, go to **Credentials** → **New**
2. Search for **AssemblyAI API** and select it
3. Enter your API key from the AssemblyAI dashboard
4. Choose your **Data Region** — `US (Default)` or `EU (Data Residency)`. The EU region routes every request to `api.eu.assemblyai.com` / `llm-gateway.eu.assemblyai.com`, keeping audio and transcription data within the European Union.
5. Click **Save**

Learn more about API keys in the [AssemblyAI documentation](https://www.assemblyai.com/docs/deployment/account-management#api-keys).

## Operations

### File ([API Reference](https://www.assemblyai.com/docs/api-reference/files/upload))

- **Upload**: Upload a media file to AssemblyAI for transcription

### Transcript ([API Reference](https://www.assemblyai.com/docs/api-reference/transcripts/submit))

- **Create**: Start a new transcription job with support for:
  - **Speech models**: set `speech_models` (priority list, e.g. `universal-3-5-pro,universal-3-pro,universal-2`) to choose a model. The API routes per language and falls back through the list. Available models: Universal, Universal-2, Universal-3 Pro, Universal-3.5 Pro. **`speech_models` is now the only way to select a model** — the legacy singular `speech_model` field was removed in v0.4.0 (the API rejected pro models on it). Leave empty to let the API choose.
  - **Prompting** (Universal-3 Pro / Universal-3.5 Pro): pass a `prompt` (up to 1500 words) to steer transcription style and accuracy
  - **Temperature** (Universal-3 Pro / Universal-3.5 Pro): sampling temperature 0.0–1.0
  - **Medical Mode**: set `domain` to `medical-v1` for specialised medical-terminology accuracy
  - **Remove Audio Tags** (Universal-3 Pro): strip inline annotations like `[laughter]`, `[music]`, and speaker cues
  - **Language detection** with `expected_languages`, `fallback_language`, `code_switching` boolean (Universal-2), `code_switching_confidence_threshold`
  - **Code-switching transcription** via the top-level `language_codes` field
  - **Speaker diarization** with `speakers_expected` and `speaker_options` (min/max speakers)
  - **PII redaction** with `redact_pii_return_unredacted`, `override_audio_redaction_method` (silence), and **Redact Static Entities** (custom label → terms map for literal find-and-replace)
  - **Keyterm prompting** to boost recognition of domain-specific terminology
  - **Profanity filtering**, sentiment analysis, entity detection, content safety, IAB categories
  - **Speech Understanding** at create time: translation, speaker identification, custom formatting
  - `auto_chapters`, `summarization`, `summary_model`, `summary_type` are still available but **deprecated** — use the LLM Gateway resource instead.
- **Get**: Retrieve a transcription by ID
- **Delete**: Delete a transcription
- **List**: List all your transcriptions, filtered by status, date, ID range, or `throttled_only`
- **Get Sentences**: Get transcript broken into sentences
- **Get Paragraphs**: Get transcript broken into paragraphs
- **Get Subtitles**: Export subtitles in SRT or VTT format
- **Get Redacted Audio**: Get redacted audio URL
- **Word Search**: Search for specific words in the transcript

### LLM Gateway ([API Reference](https://www.assemblyai.com/docs/api-reference/llm-gateway/create-chat-completion))

- **Chat Completion**: Send chat completion requests to LLMs (Claude, GPT, Gemini, Qwen, Kimi). See [available models](https://www.assemblyai.com/docs/llm-gateway/overview#available-models). Supports:
  - **Transcript injection**: pass `transcript_id` to substitute `{{ transcript }}` in your prompt with the transcript's text
  - **Tool calling**: provide a JSON `tools` array; force a specific function via `Tool Choice: Specific Function` and a function name; multi-turn round-trips via the `Tool` message role + `tool_call_id`
  - **JSON repair post-processing**: opt-in toggle that sends `post_processing_steps: [{ type: "json-repair" }]` to fix malformed JSON in tool-call arguments or structured outputs
- **Speech Understanding**: Process speech understanding tasks on existing transcripts:
  - **Translation**: Translate transcripts into multiple languages
  - **Speaker Identification**: Identify speakers by name or role
  - **Custom Formatting**: Apply custom formatting to dates, phone numbers, and emails

## Development

To work on this node locally, clone the repository and install dependencies:

```bash
git clone https://github.com/gsharp-aai/n8n-nodes-assemblyai.git
cd n8n-nodes-assemblyai
npm install
```

Build and run with linting:

```bash
npm run dev:fresh
```

The node will be available in n8n at http://localhost:5678

## Support & Feedback

Need help or have feedback? Reach out to [support@assemblyai.com](mailto:support@assemblyai.com).

Stay up to date with the latest features and improvements:
- [AssemblyAI Product Changelog](https://www.assemblyai.com/changelog)
- [AssemblyAI Product Roadmap](https://assemblyai.com/roadmap)

## n8n
[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## License

[MIT](LICENSE.md)

