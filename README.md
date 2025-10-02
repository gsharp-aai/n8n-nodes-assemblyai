# n8n-nodes-assemblyai
This is an n8n community node. It lets you use [AssemblyAI](https://www.assemblyai.com/) in your n8n workflows.

[AssemblyAI](https://www.assemblyai.com/) develops industry-leading Speech AI models for transcription and audio understanding, accessible through their API. It provides features like speaker diarization, sentiment analysis, entity detection, PII redaction, and LeMUR (LLM framework) capabilities for processing transcripts.

## Resources
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [AssemblyAI API reference](https://www.assemblyai.com/docs/api-reference)
- [AssemblyAI API documentation](https://www.assemblyai.com/docs)
  - [AssemblyAI Speech-to-Text guide](https://www.assemblyai.com/docs/getting-started/transcribe-an-audio-file)
  - [AssemblyAI LeMUR guide](https://www.assemblyai.com/docs/lemur)

## Quick links
[Installation](#installation)  
[Example workflows](#example-workflows)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Version history](#version-history)

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

### File

- **Upload**: Upload a media file to AssemblyAI for transcription

### Transcript

- **Create**: Start a new transcription job
- **Get**: Retrieve a transcription by ID
- **Delete**: Delete a transcription
- **List**: List all your transcriptions
- **Get Sentences**: Get transcript broken into sentences
- **Get Paragraphs**: Get transcript broken into paragraphs
- **Get Subtitles**: Export subtitles in SRT or VTT format
- **Get Redacted Audio**: Get redacted audio URL
- **Word Search**: Search for specific words in the transcript

### LeMUR

- **Summary**: Generate AI summaries of transcripts
- **Question & Answer**: Ask questions about your transcripts
- **Custom Task**: Run custom AI tasks on transcripts
- **Get Response**: Retrieve a LeMUR response by ID
- **Purge Data**: Delete LeMUR request data

### Example workflows

You can import these example workflows directly into n8n:

- [All nodes example](./examples/all-nodes.json) - Runs through all possible AssemblyAI operations.

To use: Download the JSON file, then in n8n go to **Workflows** → **Import from File**

Basic transcription workflow:

1. **Read/Write Files from Disk** node → Set file path to your audio file
2. **AssemblyAI** node → Select "Upload" operation, use `data` as input
3. **AssemblyAI** node → Select "Create" transcription, use the upload URL from step 2. Alternatively, use a public URL and skip steps 1 and 2.

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

## n8n
[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## License

[MIT](LICENSE.md)

## Version history

Current version: 0.1.0