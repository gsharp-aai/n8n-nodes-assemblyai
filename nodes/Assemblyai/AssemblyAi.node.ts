import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import {
	IAdditionalFields,
	IKeyTermsCollection,
	ICustomSpellingCollection,
	IWordsCollection,
	IQuestionsCollection,
	IQueryParams,
	ITranscriptCreateBody,
	ILemurBaseBody,
	IListAdditionalFields,
} from './AssemblyAi.types';

import { AAI_NODE_VERSION } from './version';

export class AssemblyAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AssemblyAI',
		name: 'assemblyAi',
		icon: {
			light: 'file:assemblyai.light.svg',
			dark: 'file:assemblyai.dark.svg',
		},
		group: [],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			"Transcribe audio and video files using AssemblyAI's speech-to-text and speech understanding AI models.",
		defaults: {
			name: 'AssemblyAI',
      // color: '#FF5722', 
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'assemblyAiApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'File',
						value: 'file',
					},
					{
						name: 'Transcript',
						value: 'transcript',
					},
					{
						name: 'LeMUR',
						value: 'lemur',
					},
				],
				default: 'transcript',
			},
			// File Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['file'],
					},
				},
				options: [
					{
						name: 'Upload',
						value: 'upload',
						description: 'Upload a media file to AssemblyAI',
						action: 'Upload a file',
					},
				],
				default: 'upload',
			},
			// Transcript Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['transcript'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new transcription',
						action: 'Create a transcription',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a transcription',
						action: 'Delete a transcription',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a transcription by ID',
						action: 'Get a transcription',
					},
					{
						name: 'Get Paragraphs',
						value: 'getParagraphs',
						description: 'Get paragraphs from transcription',
						action: 'Get paragraphs',
					},
					{
						name: 'Get Redacted Audio',
						value: 'getRedactedAudio',
						description: 'Get redacted audio URL',
						action: 'Get redacted audio',
					},
					{
						name: 'Get Sentences',
						value: 'getSentences',
						description: 'Get sentences from transcription',
						action: 'Get sentences',
					},
					{
						name: 'Get Subtitles',
						value: 'getSubtitles',
						description: 'Get subtitles for a transcription',
						action: 'Get subtitles',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all transcriptions',
						action: 'List transcriptions',
					},
          {
            name: 'Wait for Completion',
            value: 'waitForCompletion',
            description: 'Wait for a transcript to complete processing',
            action: 'Wait for transcript completion',
          },
					{
						name: 'Word Search',
						value: 'wordSearch',
						description: 'Search for words in transcript',
						action: 'Search words',
					},
				],
				default: 'create',
			},
			// LeMUR Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['lemur'],
					},
				},
				options: [
					{
						name: 'Custom Task',
						value: 'task',
						description: 'Run a custom LeMUR task',
						action: 'Run custom task',
					},
					{
						name: 'Get Response',
						value: 'getResponse',
						description: 'Get a LeMUR response by ID',
						// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
						action: 'Get LeMUR response',
					},
					{
						name: 'Purge Data',
						value: 'purgeData',
						description: 'Delete LeMUR request data',
						// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
						action: 'Purge LeMUR data',
					},
					{
						name: 'Question & Answer',
						value: 'questionAnswer',
						description: 'Ask questions about your transcript',
						action: 'Question and answer',
					},
					{
						name: 'Summary',
						value: 'summary',
						description: 'Generate a summary using LeMUR',
						action: 'Generate summary',
					},
				],
				default: 'summary',
			},
			// File Upload fields
			{
				displayName: 'File Path or Binary Data',
				name: 'fileInput',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['upload'],
					},
				},
				description: 'Path to the file to upload or binary data property name',
			},
			// Transcript Create fields
			{
				displayName: 'Audio URL',
				name: 'audioUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['transcript'],
						operation: ['create'],
					},
				},
				description: 'URL of the audio file to transcribe',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['transcript'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Audio End At (Ms)',
						name: 'audio_end_at',
						type: 'number',
						default: '',
						description: 'Stop transcribing at this time in milliseconds',
					},
					{
						displayName: 'Audio Start From (Ms)',
						name: 'audio_start_from',
						type: 'number',
						default: '',
						description: 'Start transcribing from this time in milliseconds',
					},
					{
						displayName: 'Auto Chapters',
						name: 'auto_chapters',
						type: 'boolean',
						default: false,
						description: 'Whether to automatically generate chapters',
					},
					{
						displayName: 'Auto Highlights',
						name: 'auto_highlights',
						type: 'boolean',
						default: false,
						description: 'Whether to automatically highlight key phrases',
					},
					{
						displayName: 'Content Safety',
						name: 'content_safety',
						type: 'boolean',
						default: false,
						description: 'Whether to detect sensitive content',
					},
					{
						displayName: 'Custom Spelling',
						name: 'custom_spelling',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Custom word replacements',
						options: [
							{
								name: 'spelling',
								displayName: 'Spelling Rule',
								values: [
									{
										displayName: 'From',
										name: 'from',
										type: 'string',
										default: '',
										description: 'Word(s) to replace',
									},
									{
										displayName: 'To',
										name: 'to',
										type: 'string',
										default: '',
										description: 'Replacement word (single word only)',
									},
								],
							},
						],
					},
					{
						displayName: 'Disfluencies',
						name: 'disfluencies',
						type: 'boolean',
						default: false,
						description: "Whether to transcribe filler words like 'umm'",
					},
					{
						displayName: 'Dual Channel',
						name: 'dual_channel',
						type: 'boolean',
						default: false,
						description:
							'Whether to transcribe each audio channel independently (deprecated, use multichannel)',
					},
					{
						displayName: 'Entity Detection',
						name: 'entity_detection',
						type: 'boolean',
						default: false,
						description: 'Whether to detect entities (persons, locations, organizations)',
					},
					{
						displayName: 'Filter Profanity',
						name: 'filter_profanity',
						type: 'boolean',
						default: false,
						description: 'Whether to filter profanity from transcript',
					},
					{
						displayName: 'Format Text',
						name: 'format_text',
						type: 'boolean',
						default: true,
						description: 'Whether to format text (e.g., dollar amounts, phone numbers)',
					},
					{
						displayName: 'IAB Categories',
						name: 'iab_categories',
						type: 'boolean',
						default: false,
						description: 'Whether to classify content into IAB categories',
					},
					{
						displayName: 'Key Terms',
						name: 'keyterms_prompt',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description:
							'Domain-specific terms to improve accuracy (up to 1000 for Slam-1, 200 for Universal)',
						options: [
							{
								name: 'term',
								displayName: 'Key Term',
								values: [
									{
										displayName: 'Term or Phrase',
										name: 'value',
										type: 'string',
										default: '',
										description: 'Word or phrase (max 6 words) that may appear in audio',
										placeholder: 'e.g., differential diagnosis, hypertension',
									},
								],
							},
						],
					},
					{
						displayName: 'Language Code',
						name: 'language_code',
						type: 'options',
						default: 'en',
						options: [
							{ name: 'Chinese', value: 'zh' },
							{ name: 'Dutch', value: 'nl' },
							{ name: 'English', value: 'en' },
							{ name: 'Finnish', value: 'fi' },
							{ name: 'French', value: 'fr' },
							{ name: 'German', value: 'de' },
							{ name: 'Hindi', value: 'hi' },
							{ name: 'Italian', value: 'it' },
							{ name: 'Japanese', value: 'ja' },
							{ name: 'Korean', value: 'ko' },
							{ name: 'Polish', value: 'pl' },
							{ name: 'Portuguese', value: 'pt' },
							{ name: 'Russian', value: 'ru' },
							{ name: 'Spanish', value: 'es' },
							{ name: 'Turkish', value: 'tr' },
							{ name: 'Ukrainian', value: 'uk' },
							{ name: 'Vietnamese', value: 'vi' },
						],
						description: 'Language of the audio file',
					},
					{
						displayName: 'Language Confidence Threshold',
						name: 'language_confidence_threshold',
						type: 'number',
						default: 0,
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberStepSize: 0.1,
						},
						displayOptions: {
							show: {
								language_detection: [true],
							},
						},
						description: 'Confidence threshold for detected language (0-1)',
					},
					{
						displayName: 'Language Detection',
						name: 'language_detection',
						type: 'boolean',
						default: false,
						description: 'Whether to enable automatic language detection',
					},
					{
						displayName: 'Max Speakers',
						name: 'speakers_expected',
						type: 'number',
						default: 2,
						description: 'Maximum number of speakers expected',
						displayOptions: {
							show: {
								speaker_labels: [true],
							},
						},
					},
					{
						displayName: 'Multichannel',
						name: 'multichannel',
						type: 'boolean',
						default: false,
						description: 'Whether to enable multichannel transcription',
					},
					{
						displayName: 'Punctuate',
						name: 'punctuate',
						type: 'boolean',
						default: true,
						description: 'Whether to add punctuation to the transcript',
					},
					{
						displayName: 'Redact PII',
						name: 'redact_pii',
						type: 'boolean',
						default: false,
						description: 'Whether to redact personally identifiable information',
					},
					{
						displayName: 'Redact PII Audio',
						name: 'redact_pii_audio',
						type: 'boolean',
						default: false,
						description: 'Whether to redact PII from audio file',
					},
					{
						displayName: 'Redact PII Audio Quality',
						name: 'redact_pii_audio_quality',
						type: 'options',
						default: 'mp3',
						options: [
							{ name: 'MP3', value: 'mp3' },
							{ name: 'WAV', value: 'wav' },
						],
						displayOptions: {
							show: {
								redact_pii_audio: [true],
							},
						},
						description: 'Quality of redacted audio file',
					},
					{
						displayName: 'Redact PII Policies',
						name: 'redact_pii_policies',
						type: 'multiOptions',
						default: [],
						options: [
							{ name: 'Credit Card CVV', value: 'credit_card_cvv' },
							{ name: 'Credit Card Expiration', value: 'credit_card_expiration' },
							{ name: 'Credit Card Number', value: 'credit_card_number' },
							{ name: 'Date of Birth', value: 'date_of_birth' },
							{ name: 'Email Address', value: 'email_address' },
							{ name: 'Injury', value: 'injury' },
							{ name: 'Medical Condition', value: 'medical_condition' },
							{ name: 'Person Name', value: 'person_name' },
							{ name: 'Phone Number', value: 'phone_number' },
							{ name: 'US Social Security Number', value: 'us_social_security_number' },
						],
						displayOptions: {
							show: {
								redact_pii: [true],
							},
						},
						description: 'Types of PII to redact',
					},
					{
						displayName: 'Redact PII Substitution',
						name: 'redact_pii_sub',
						type: 'options',
						default: 'hash',
						options: [
							{ name: 'Hash (####)', value: 'hash' },
							{ name: 'Entity Name ([PERSON_NAME])', value: 'entity_name' },
						],
						displayOptions: {
							show: {
								redact_pii: [true],
							},
						},
						description: 'How to replace redacted PII in transcript',
					},
					{
						displayName: 'Sentiment Analysis',
						name: 'sentiment_analysis',
						type: 'boolean',
						default: false,
						description: 'Whether to analyze sentiment of transcript',
					},
					{
						displayName: 'Speaker Labels',
						name: 'speaker_labels',
						type: 'boolean',
						default: false,
						description: 'Whether to identify different speakers',
					},
					{
						displayName: 'Speech Model',
						name: 'speech_model',
						type: 'options',
						default: 'universal',
						options: [
							{ name: 'Universal', value: 'universal' },
							{ name: 'Slam-1', value: 'slam-1' },
						],
						description: 'The speech model to use for transcription',
					},
					{
						displayName: 'Speech Threshold',
						name: 'speech_threshold',
						type: 'number',
						default: '',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberStepSize: 0.1,
						},
						description: 'Reject audio with less than this fraction of speech (0-1)',
					},
					{
						displayName: 'Summarization',
						name: 'summarization',
						type: 'boolean',
						default: false,
						description: 'Whether to generate a summary of the transcript',
					},
					{
						displayName: 'Summary Model',
						name: 'summary_model',
						type: 'options',
						default: 'informative',
						options: [
							{ name: 'Informative', value: 'informative' },
							{ name: 'Conversational', value: 'conversational' },
							{ name: 'Catchy', value: 'catchy' },
						],
						displayOptions: {
							show: {
								summarization: [true],
							},
						},
						description: 'Type of summary to generate',
					},
					{
						displayName: 'Summary Type',
						name: 'summary_type',
						type: 'options',
						default: 'bullets',
						options: [
							{ name: 'Bullets', value: 'bullets' },
							{ name: 'Bullets (Verbose)', value: 'bullets_verbose' },
							{ name: 'Gist', value: 'gist' },
							{ name: 'Headline', value: 'headline' },
							{ name: 'Paragraph', value: 'paragraph' },
						],
						displayOptions: {
							show: {
								summarization: [true],
							},
						},
						description: 'Format of the summary',
					},
					{
						displayName: 'Webhook Auth Header',
						name: 'webhook_auth_header_name',
						type: 'string',
						default: '',
						description: 'Name of the auth header for webhook',
					},
					{
						displayName: 'Webhook Auth Value',
						name: 'webhook_auth_header_value',
						type: 'string',
						default: '',
						description: 'Value of the auth header for webhook',
					},
					{
						displayName: 'Webhook URL',
						name: 'webhook_url',
						type: 'string',
						default: '',
						description: 'URL to send webhook when transcription is complete',
					},
				],
			},
			// Transcript Get fields
			{
				displayName: 'Transcript ID',
				name: 'transcriptId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['transcript'],
						operation: [
							'get',
							'delete',
							'getSentences',
							'getParagraphs',
							'getRedactedAudio',
              'waitForCompletion',
							'wordSearch',
						],
					},
				},
				description: 'ID of the transcript',
			},
			// Transcript List fields
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				displayOptions: {
					show: {
						resource: ['transcript'],
						operation: ['list'],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Additional Fields',
				name: 'listAdditionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['transcript'],
						operation: ['list'],
					},
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						default: '',
						options: [
							{ name: 'All', value: '' },
							{ name: 'Completed', value: 'completed' },
							{ name: 'Error', value: 'error' },
							{ name: 'Processing', value: 'processing' },
							{ name: 'Queued', value: 'queued' },
						],
						description: 'Filter by transcript status',
					},
					{
						displayName: 'Created On (After)',
						name: 'created_on',
						type: 'dateTime',
						default: '',
						description: 'Only get transcripts created after this date',
					},
					{
						displayName: 'Before ID',
						name: 'before_id',
						type: 'string',
						default: '',
						description: 'Get transcripts before this ID (for pagination)',
					},
					{
						displayName: 'After ID',
						name: 'after_id',
						type: 'string',
						default: '',
						description: 'Get transcripts after this ID (for pagination)',
					},
				],
			},
			// Subtitles fields
			{
				displayName: 'Transcript ID',
				name: 'subtitlesTranscriptId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['transcript'],
						operation: ['getSubtitles'],
					},
				},
				description: 'ID of the transcript to get subtitles for',
			},
			{
				displayName: 'Format',
				name: 'subtitlesFormat',
				type: 'options',
				default: 'srt',
				displayOptions: {
					show: {
						resource: ['transcript'],
						operation: ['getSubtitles'],
					},
				},
				options: [
					{ name: 'SRT', value: 'srt' },
					{ name: 'VTT', value: 'vtt' },
				],
				description: 'Format of the subtitles',
			},
			{
				displayName: 'Characters Per Caption',
				name: 'chars_per_caption',
				type: 'number',
				default: 32,
				displayOptions: {
					show: {
						resource: ['transcript'],
						operation: ['getSubtitles'],
					},
				},
				description: 'Maximum number of characters per caption',
			},
			// Word Search fields
			{
				displayName: 'Input Type',
				name: 'wordsInputType',
				type: 'options',
				default: 'list',
				displayOptions: {
					show: {
						resource: ['transcript'],
						operation: ['wordSearch'],
					},
				},
				options: [
					{
						name: 'Comma-Separated List',
						value: 'list',
						description: 'Enter words as a comma-separated string',
					},
					{
						name: 'Individual Terms',
						value: 'collection',
						description: 'Add each search term individually',
					},
				],
				description: 'Choose how to input your search terms',
			},
			// Word Search - Comma-separated input
			{
				displayName: 'Words to Search',
				name: 'wordsList',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['transcript'],
						operation: ['wordSearch'],
						wordsInputType: ['list'],
					},
				},
				description: 'Comma-separated list of words to search for',
				placeholder: 'foo, bar, hello world, 42',
			},
			// Word Search - Collection input
			{
				displayName: 'Words to Search',
				name: 'wordsCollection',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				required: true,
				displayOptions: {
					show: {
						resource: ['transcript'],
						operation: ['wordSearch'],
						wordsInputType: ['collection'],
					},
				},
				description: 'Words, numbers, or phrases to search for',
				options: [
					{
						name: 'word',
						displayName: 'Search Term',
						values: [
							{
								displayName: 'Term',
								name: 'term',
								type: 'string',
								default: '',
								description: 'Word, number, or phrase to search for',
								placeholder: 'e.g., foo, bar, hello world',
							},
						],
					},
				],
			},
			// LeMUR fields
			{
				displayName: 'Transcript IDs',
				name: 'lemurTranscriptIds',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['lemur'],
						operation: ['summary', 'questionAnswer', 'task'],
					},
				},
				description: 'Comma-separated list of transcript IDs to use',
			},
			{
				displayName: 'LeMUR Request ID',
				name: 'lemurRequestId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['lemur'],
						operation: ['getResponse', 'purgeData'],
					},
				},
				description: 'ID of the LeMUR request',
			},
			{
				displayName: 'Context',
				name: 'context',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				displayOptions: {
					show: {
						resource: ['lemur'],
						operation: ['summary', 'questionAnswer'],
					},
				},
				description: 'Additional context about the transcript',
			},
			{
				displayName: 'Final Model',
				name: 'final_model',
				type: 'options',
				required: true,
				default: 'anthropic/claude-sonnet-4-20250514',
				displayOptions: {
					show: {
						resource: ['lemur'],
						operation: ['summary', 'questionAnswer', 'task'],
					},
				},
				options: [
					{ name: 'Claude 3 Haiku', value: 'anthropic/claude-3-haiku' },
					{ name: 'Claude 3 Opus', value: 'anthropic/claude-3-opus' },
					{ name: 'Claude 3.5 Haiku', value: 'anthropic/claude-3-5-haiku-20241022' },
					{ name: 'Claude 4 Opus', value: 'anthropic/claude-opus-4-20250514' },
					{ name: 'Claude 4 Sonnet', value: 'anthropic/claude-sonnet-4-20250514' },
				],
				description: 'LLM model to use for the task',
			},
			// LeMUR Q&A fields
			{
				displayName: 'Questions',
				name: 'questions',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['lemur'],
						operation: ['questionAnswer'],
					},
				},
				default: {},
				options: [
					{
						name: 'question',
						displayName: 'Question',
						values: [
							{
								displayName: 'Question Text',
								name: 'question',
								type: 'string',
								default: '',
								description: 'The question you wish to ask',
							},
							{
								displayName: 'Answer Type',
								name: 'answerType',
								type: 'options',
								default: 'format',
								options: [
									{ name: 'Answer Format (Free Text)', value: 'format' },
									{
										name: 'Answer Options (Discrete Choices)',
										value: 'options',
									},
								],
								description: 'Choose whether to specify a format or provide discrete options',
							},
							{
								displayName: 'Answer Format',
								name: 'answer_format',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										answerType: ['format'],
									},
								},
								description:
									"How you want the answer returned (e.g., 'short sentence', 'bullet points')",
								placeholder: 'short sentence',
							},
							{
								displayName: 'Answer Options',
								name: 'answer_options',
								type: 'fixedCollection',
								typeOptions: {
									multipleValues: true,
								},
								default: {},
								displayOptions: {
									show: {
										answerType: ['options'],
									},
								},
								description: 'Discrete options for the answer',
								options: [
									{
										name: 'option',
										displayName: 'Option',
										values: [
											{
												displayName: 'Option Text',
												name: 'value',
												type: 'string',
												default: '',
												description: 'A possible answer option',
												placeholder: 'Yes',
											},
										],
									},
								],
							},
						],
					},
				],
			},
			// LeMUR Custom Task fields
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['lemur'],
						operation: ['task'],
					},
				},
				description: 'Custom prompt for LeMUR to execute',
			},
			{
				displayName: 'Temperature',
				name: 'temperature',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				displayOptions: {
					show: {
						resource: ['lemur'],
						operation: ['summary', 'questionAnswer', 'task'],
					},
				},
				description: 'Temperature for response generation (0-1)',
			},
			{
				displayName: 'Max Output Size',
				name: 'max_output_size',
				type: 'number',
				default: 2000,
				displayOptions: {
					show: {
						resource: ['lemur'],
						operation: ['summary', 'questionAnswer', 'task'],
					},
				},
				description: 'Maximum number of tokens in the response',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('assemblyAiApi');
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

    const userAgent = `n8n-assemblyai-node/${AAI_NODE_VERSION}`;
		const apiKey = credentials.apiKey as string;
		const baseURL = 'https://api.assemblyai.com/v2';
		const baseLemurURL = 'https://api.assemblyai.com/lemur/v3';

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				if (resource === 'file') {
					if (operation === 'upload') {
						const fileInput = this.getNodeParameter('fileInput', i) as string;

						let fileData: Buffer;

						// Check if it's a binary data property name or file path
						if (items[i].binary && items[i].binary![fileInput]) {
							fileData = Buffer.from(items[i].binary![fileInput].data, 'base64');
						} else {
              throw new NodeOperationError(
                  this.getNode(),
                  `No binary data found. Use a "Read/Write Files from Disk" node before this node.`,
                );
						}

						responseData = await this.helpers.httpRequest({
							method: 'POST',
							url: `${baseURL}/upload`,
							headers: {
								Authorization: apiKey,
								'Content-Type': 'application/octet-stream',
								'User-Agent': userAgent,
							},
							body: fileData,
						});
					}
				} else if (resource === 'transcript') {
					if (operation === 'create') {
						const audioUrl = this.getNodeParameter('audioUrl', i) as string;
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
						) as IAdditionalFields;

						// Extract and remove the collections from additionalFields
						const { keyterms_prompt, custom_spelling, ...restAdditionalFields } = additionalFields;

						const body: ITranscriptCreateBody = {
							audio_url: audioUrl,
							...restAdditionalFields, // Spread without the collections
						};

						// Handle keyterms_prompt
						if (keyterms_prompt) {
							const keytermsCollection = keyterms_prompt as IKeyTermsCollection;
							const keytermsArray = keytermsCollection.term || [];
							body.keyterms_prompt = keytermsArray.map((item) => item.value);
						}

						// Handle custom_spelling
						if (custom_spelling) {
							const customSpellingCollection = custom_spelling as ICustomSpellingCollection;
							const customSpellingArray = customSpellingCollection.spelling || [];
							body.custom_spelling = customSpellingArray.map((item) => ({
								from: [item.from], // Convert to array as API expects
								to: item.to,
							}));
						}

						responseData = await this.helpers.httpRequest({
							method: 'POST',
							url: `${baseURL}/transcript`,
							headers: {
								Authorization: apiKey,
								'Content-Type': 'application/json',
								'User-Agent': userAgent,
							},
							body: JSON.stringify(body),
						});
					} else if (operation === 'get') {
						const transcriptId = this.getNodeParameter('transcriptId', i) as string;

						responseData = await this.helpers.httpRequest({
							method: 'GET',
							url: `${baseURL}/transcript/${transcriptId}`,
							headers: {
								Authorization: apiKey,
							  'User-Agent': userAgent,
							},
							json: true,
						});
					} else if (operation === 'delete') {
						const transcriptId = this.getNodeParameter('transcriptId', i) as string;

						responseData = await this.helpers.httpRequest({
							method: 'DELETE',
							url: `${baseURL}/transcript/${transcriptId}`,
							headers: {
								Authorization: apiKey,
								'User-Agent': userAgent,
							},
							json: true,
						});
					} else if (operation === 'list') {
						const limit = this.getNodeParameter('limit', i) as number;
						const listAdditionalFields = this.getNodeParameter(
							'listAdditionalFields',
							i,
						) as IListAdditionalFields;

						const qs: IQueryParams = {
							limit,
						};

						// Add optional list parameters
						if (listAdditionalFields.status) {
							qs.status = listAdditionalFields.status;
						}
						if (listAdditionalFields.created_on) {
							qs.created_on = listAdditionalFields.created_on;
						}
						if (listAdditionalFields.before_id) {
							qs.before_id = listAdditionalFields.before_id;
						}
						if (listAdditionalFields.after_id) {
							qs.after_id = listAdditionalFields.after_id;
						}

						responseData = await this.helpers.httpRequest({
							method: 'GET',
							url: `${baseURL}/transcript`,
							headers: {
								Authorization: apiKey,
								'User-Agent': userAgent,
							},
							qs,
							json: true,
						});
					} else if (operation === 'getSubtitles') {
						const transcriptId = this.getNodeParameter('subtitlesTranscriptId', i) as string;
						const format = this.getNodeParameter('subtitlesFormat', i) as string;
						const charsPerCaption = this.getNodeParameter('chars_per_caption', i) as number;

						const qs: IQueryParams = {};
						if (charsPerCaption !== 32) {
							qs.chars_per_caption = charsPerCaption;
						}

						responseData = await this.helpers.httpRequest({
							method: 'GET',
							url: `${baseURL}/transcript/${transcriptId}/${format}`,
							headers: {
								Authorization: apiKey,
								'User-Agent': userAgent,
							},
							qs,
						});
					} else if (operation === 'getSentences') {
						const transcriptId = this.getNodeParameter('transcriptId', i) as string;

						responseData = await this.helpers.httpRequest({
							method: 'GET',
							url: `${baseURL}/transcript/${transcriptId}/sentences`,
							headers: {
								Authorization: apiKey,
								'User-Agent': userAgent,
							},
							json: true,
						});
					} else if (operation === 'getParagraphs') {
						const transcriptId = this.getNodeParameter('transcriptId', i) as string;

						responseData = await this.helpers.httpRequest({
							method: 'GET',
							url: `${baseURL}/transcript/${transcriptId}/paragraphs`,
							headers: {
								Authorization: apiKey,
								'User-Agent': userAgent,
							},
							json: true,
						});
					} else if (operation === 'getRedactedAudio') {
						const transcriptId = this.getNodeParameter('transcriptId', i) as string;

						responseData = await this.helpers.httpRequest({
							method: 'GET',
							url: `${baseURL}/transcript/${transcriptId}/redacted-audio`,
							headers: {
								Authorization: apiKey,
								'User-Agent': userAgent,
							},
							json: true,
						});
					} else if (operation === 'wordSearch') {
						const transcriptId = this.getNodeParameter('transcriptId', i) as string;
						const inputType = this.getNodeParameter('wordsInputType', i) as string;

						let words: string;

						if (inputType === 'list') {
							// Handle comma-separated list
							words = this.getNodeParameter('wordsList', i) as string;
						} else {
							// Handle collection
							const wordsCollection = this.getNodeParameter(
								'wordsCollection',
								i,
							) as IWordsCollection;
							const wordsArray = wordsCollection.word || [];
							words = wordsArray.map((item: { term: string }) => item.term).join(',');
						}

						responseData = await this.helpers.httpRequest({
							method: 'GET',
							url: `${baseURL}/transcript/${transcriptId}/word-search`,
							headers: {
								Authorization: apiKey,
								'User-Agent': userAgent,
							},
							qs: {
								words: words,
							},
							json: true,
						});
					} else if (operation === 'waitForCompletion') {
						const transcriptId = this.getNodeParameter('transcriptId', i) as string;
            const pollingInterval = 3000; // 3 seconds
						const maxAttempts = 600; // 30 minutes with 3 second intervals
						let attempts = 0;

						while (attempts < maxAttempts) {
							const response = await this.helpers.request({
								method: 'GET',
								url: `${baseURL}/transcript/${transcriptId}`,
								headers: { Authorization: apiKey },
								json: true,
							});

							if (response.status === 'completed' || response.status === 'error') {
								responseData = response;
								break;
							}

							// Wait pollingInterval seconds before next poll if still queued or processing.
							await new Promise((resolve) => setTimeout(resolve, pollingInterval));
							attempts++;
						}

						if (attempts >= maxAttempts) {
							throw new NodeOperationError(
								this.getNode(),
								'Transcript did not complete within timeout period',
                { itemIndex: i }
							);
						}
					}
				} else if (resource === 'lemur') {
					if (operation === 'getResponse') {
						const requestId = this.getNodeParameter('lemurRequestId', i) as string;

						responseData = await this.helpers.httpRequest({
							method: 'GET',
							url: `${baseLemurURL}/${requestId}`,
							headers: {
								Authorization: apiKey,
								'User-Agent': userAgent,
							},
							json: true,
						});
					} else if (operation === 'purgeData') {
						const requestId = this.getNodeParameter('lemurRequestId', i) as string;

						responseData = await this.helpers.httpRequest({
							method: 'DELETE',
							url: `${baseLemurURL}/${requestId}`,
							headers: {
								Authorization: apiKey,
								'User-Agent': userAgent,
							},
							json: true,
						});
					} else {
						// All other LeMUR operations require transcript IDs
						const transcriptIds = this.getNodeParameter('lemurTranscriptIds', i) as string;
						const finalModel = this.getNodeParameter('final_model', i) as string;
						const temperature = this.getNodeParameter('temperature', i) as number;
						const maxOutputSize = this.getNodeParameter('max_output_size', i) as number;

						const baseBody: ILemurBaseBody = {
							transcript_ids: transcriptIds.split(',').map((id) => id.trim()),
							final_model: finalModel,
							temperature,
							max_output_size: maxOutputSize,
						};

						// Only get context for operations that support it
						if (['summary', 'questionAnswer'].includes(operation)) {
							const context = this.getNodeParameter('context', i) as string;
							if (context && context.trim()) {
								baseBody.context = context;
							}
						}

						if (operation === 'summary') {
							responseData = await this.helpers.httpRequest({
								method: 'POST',
								url: `${baseLemurURL}/generate/summary`,
								headers: {
									Authorization: apiKey,
									'Content-Type': 'application/json',
									'User-Agent': userAgent,
								},
								body: JSON.stringify(baseBody),
							});
						} else if (operation === 'questionAnswer') {
							const questionsCollection = this.getNodeParameter(
								'questions',
								i,
							) as IQuestionsCollection;
							const questionsArray = questionsCollection.question || [];

							const processedQuestions = questionsArray.map(
								(q: {
									question: string;
									answerType: string;
									answer_format?: string;
									answer_options?: {
										option?: Array<{ value: string }>;
									};
								}) => {
									const questionObj: Record<string, string | string[]> = {
										question: q.question,
									};

									if (q.answerType === 'format' && q.answer_format) {
										questionObj.answer_format = q.answer_format;
									} else if (q.answerType === 'options' && q.answer_options) {
										const optionsArray = q.answer_options.option || [];
										questionObj.answer_options = optionsArray.map(
											(opt: { value: string }) => opt.value,
										);
									}

									return questionObj;
								},
							);

							const body = {
								...baseBody,
								questions: processedQuestions,
							};

							responseData = await this.helpers.httpRequest({
								method: 'POST',
								url: `https://api.assemblyai.com/lemur/v3/generate/question-answer`,
								headers: {
									Authorization: apiKey,
									'Content-Type': 'application/json',
									'User-Agent': userAgent,
								},
								body: JSON.stringify(body),
							});
						} else if (operation === 'task') {
							const prompt = this.getNodeParameter('prompt', i) as string;

							const body = {
								...baseBody,
								prompt,
							};

							responseData = await this.helpers.httpRequest({
								method: 'POST',
								url: `${baseLemurURL}/generate/task`,
								headers: {
									Authorization: apiKey,
									'Content-Type': 'application/json',
									'User-Agent': userAgent,
								},
								body: JSON.stringify(body),
							});
						}
					}
				}

				if (typeof responseData === 'string') {
					try {
						responseData = JSON.parse(responseData);
					} catch {
						// Keep as string if not JSON
					}
				}

				returnData.push({
					json: typeof responseData === 'object' ? responseData : { data: responseData },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
					returnData.push({
						json: {
							error: errorMessage,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
