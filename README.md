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

[AssemblyAI](https://www.assemblyai.com/) develops industry-leading Speech AI models for transcription and audio understanding, accessible through their API. It provides features like speaker diarization, sentiment analysis, entity detection, PII redaction, and LLM Gateway capabilities for processing transcripts with AI.

## Resources
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [AssemblyAI API reference](https://www.assemblyai.com/docs/api-reference)
- [AssemblyAI API documentation](https://www.assemblyai.com/docs)
  - [AssemblyAI Speech-to-Text guide](https://www.assemblyai.com/docs/getting-started/transcribe-an-audio-file)
  - [AssemblyAI LLM Gateway guide](https://www.assemblyai.com/docs/llm-gateway/apply-llms-to-audio-files)
  - [AssemblyAI LeMUR guide](https://www.assemblyai.com/docs/lemur) - ⚠️ **Deprecated**: LeMUR is deprecated. Please use LLM Gateway instead.

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
4. Click **Save**

Learn more about API keys in the [AssemblyAI documentation](https://www.assemblyai.com/docs/deployment/account-management#api-keys).

## Operations

### File ([API Reference](https://www.assemblyai.com/docs/api-reference/files/upload))

- **Upload**: Upload a media file to AssemblyAI for transcription

### Transcript ([API Reference](https://www.assemblyai.com/docs/api-reference/transcripts/submit))

- **Create**: Start a new transcription job with support for:
  - Language detection
  - Speaker diarization
  - PII redaction and profanity filtering
  - **Speech Understanding**:
    - Enable translation, speaker identification, and/or custom formatting during transcription
    - Keyterm prompting, punctuation, disfluencies, formatting, sentiment analysis, entity detection, chapterization, etc.
- **Get**: Retrieve a transcription by ID
- **Delete**: Delete a transcription
- **List**: List all your transcriptions
- **Get Sentences**: Get transcript broken into sentences
- **Get Paragraphs**: Get transcript broken into paragraphs
- **Get Subtitles**: Export subtitles in SRT or VTT format
- **Get Redacted Audio**: Get redacted audio URL
- **Word Search**: Search for specific words in the transcript

### LLM Gateway ([API Reference](https://www.assemblyai.com/docs/api-reference/llm-gateway/create-chat-completion))

- **Chat Completion**: Send chat completion requests to LLMs (Claude, GPT, Gemini models). See [available models](https://www.assemblyai.com/docs/llm-gateway/overview#available-models).
- **Speech Understanding**: Process speech understanding tasks on existing transcripts:
  - **Translation**: Translate transcripts into multiple languages
  - **Speaker Identification**: Identify speakers by name or role
  - **Custom Formatting**: Apply custom formatting to dates, phone numbers, and emails

### LeMUR

⚠️ **Deprecated**: LeMUR is deprecated. Please use LLM Gateway instead.

- **Summary**: Generate AI summaries of transcripts
- **Question & Answer**: Ask questions about your transcripts
- **Custom Task**: Run custom AI tasks on transcripts
- **Get Response**: Retrieve a LeMUR response by ID
- **Purge Data**: Delete LeMUR request data

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

