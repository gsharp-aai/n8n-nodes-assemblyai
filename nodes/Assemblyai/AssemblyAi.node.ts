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
			// color: '#2545D3',
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
						name: 'LeMUR (Deprecated)',
						value: 'lemur',
						description: 'LeMUR is deprecated. Please use LLM Gateway instead.',
					},
					{
						name: 'LLM Gateway',
						value: 'llm_gateway',
					},
					{
						name: 'Transcript',
						value: 'transcript',
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
						displayName: 'Content Safety Confidence Threshold',
						name: 'content_safety_confidence',
						type: 'number',
						default: 50,
						typeOptions: {
							minValue: 25,
							maxValue: 100,
						},
						displayOptions: {
							show: {
								content_safety: [true],
							},
						},
						description: 'Confidence threshold for Content Moderation (25-100)',
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
						displayName: 'Language Codes (Code Switching)',
						name: 'language_codes',
						type: 'string',
						default: '',
						description:
							'Comma-separated language codes for code switching transcription (e.g., "en,es"). One value must be "en".',
						placeholder: 'en,es',
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
					// Advanced Language Detection Options
					{
						displayName: 'Language Detection Options',
						name: 'language_detection_options',
						type: 'fixedCollection',
						default: {},
						displayOptions: {
							show: {
								language_detection: [true],
							},
						},
						description: 'Advanced options for automatic language detection',
						options: [
							{
								name: 'options',
								displayName: 'Options',
								values: [
									{
										displayName: 'Expected Languages',
										name: 'expected_languages',
										type: 'string',
										default: '',
										description:
											'Comma-separated list of language codes expected in the audio (e.g., "en,es,fr"). Leave empty for all languages.',
										placeholder: 'en,es,fr',
									},
									{
										displayName: 'Fallback Language',
										name: 'fallback_language',
										type: 'string',
										default: 'auto',
										description:
											'Language to use if detected language is not in expected list. Use "auto" to let the model choose.',
									},
									{
										displayName: 'Enable Code Switching',
										name: 'code_switching',
										type: 'boolean',
										default: false,
										description: 'Whether to detect when the speaker switches between languages',
									},
									{
										displayName: 'Code Switching Confidence Threshold',
										name: 'code_switching_confidence_threshold',
										type: 'number',
										default: 0.3,
										typeOptions: {
											minValue: 0,
											maxValue: 1,
											numberStepSize: 0.1,
										},
										displayOptions: {
											show: {
												code_switching: [true],
											},
										},
										description: 'Confidence threshold for detecting code switching (0-1)',
									},
								],
							},
						],
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
						displayName: 'Redact PII Audio Options',
						name: 'redact_pii_audio_options',
						type: 'fixedCollection',
						default: {},
						displayOptions: {
							show: {
								redact_pii_audio: [true],
							},
						},
						description: 'Options for PII redacted audio files',
						options: [
							{
								name: 'options',
								displayName: 'Options',
								values: [
									{
										displayName: 'Return Redacted No Speech Audio',
										name: 'return_redacted_no_speech_audio',
										type: 'boolean',
										default: false,
										description:
											'Whether to receive redacted audio URLs even for silent audio files without dialogue',
									},
								],
							},
						],
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
							{ name: 'Account Number', value: 'account_number' },
							{ name: 'Banking Information', value: 'banking_information' },
							{ name: 'Blood Type', value: 'blood_type' },
							{ name: 'Credit Card CVV', value: 'credit_card_cvv' },
							{ name: 'Credit Card Expiration', value: 'credit_card_expiration' },
							{ name: 'Credit Card Number', value: 'credit_card_number' },
							{ name: 'Date', value: 'date' },
							{ name: 'Date Interval', value: 'date_interval' },
							{ name: 'Date of Birth', value: 'date_of_birth' },
							{ name: 'Drivers License', value: 'drivers_license' },
							{ name: 'Drug', value: 'drug' },
							{ name: 'Duration', value: 'duration' },
							{ name: 'Email Address', value: 'email_address' },
							{ name: 'Event', value: 'event' },
							{ name: 'Filename', value: 'filename' },
							{ name: 'Gender/Sexuality', value: 'gender_sexuality' },
							{ name: 'Healthcare Number', value: 'healthcare_number' },
							{ name: 'Injury', value: 'injury' },
							{ name: 'IP Address', value: 'ip_address' },
							{ name: 'Language', value: 'language' },
							{ name: 'Location', value: 'location' },
							{ name: 'Marital Status', value: 'marital_status' },
							{ name: 'Medical Condition', value: 'medical_condition' },
							{ name: 'Medical Process', value: 'medical_process' },
							{ name: 'Money Amount', value: 'money_amount' },
							{ name: 'Nationality', value: 'nationality' },
							{ name: 'Number Sequence', value: 'number_sequence' },
							{ name: 'Occupation', value: 'occupation' },
							{ name: 'Organization', value: 'organization' },
							{ name: 'Passport Number', value: 'passport_number' },
							{ name: 'Password', value: 'password' },
							{ name: 'Person Age', value: 'person_age' },
							{ name: 'Person Name', value: 'person_name' },
							{ name: 'Phone Number', value: 'phone_number' },
							{ name: 'Physical Attribute', value: 'physical_attribute' },
							{ name: 'Political Affiliation', value: 'political_affiliation' },
							{ name: 'Religion', value: 'religion' },
							{ name: 'Statistics', value: 'statistics' },
							{ name: 'Time', value: 'time' },
							{ name: 'URL', value: 'url' },
							{ name: 'US Driver License', value: 'us_driver_license' },
							{ name: 'US Healthcare Number', value: 'us_healthcare_number' },
							{ name: 'US Social Security Number', value: 'us_social_security_number' },
							{ name: 'Username', value: 'username' },
							{ name: 'Vehicle ID', value: 'vehicle_id' },
							{ name: 'Zodiac Sign', value: 'zodiac_sign' },
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
					// Speaker Options
					{
						displayName: 'Speaker Options',
						name: 'speaker_options',
						type: 'fixedCollection',
						default: {},
						displayOptions: {
							show: {
								speaker_labels: [true],
							},
						},
						description: 'Advanced speaker diarization options',
						options: [
							{
								name: 'options',
								displayName: 'Options',
								values: [
									{
										displayName: 'Minimum Speakers Expected',
										name: 'min_speakers_expected',
										type: 'number',
										default: 1,
										description: 'The minimum number of speakers expected in the audio file',
									},
									{
										displayName: 'Maximum Speakers Expected',
										name: 'max_speakers_expected',
										type: 'number',
										default: 10,
										description:
											'The maximum number of speakers expected. Setting this too high may hurt accuracy.',
									},
								],
							},
						],
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
					// Multiple Speech Models
					{
						displayName: 'Speech Models (Priority Order)',
						name: 'speech_models',
						type: 'string',
						default: '',
						description:
							'Comma-separated list of speech models in priority order for automatic routing',
						placeholder: 'universal,slam-1',
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
					// Speech Understanding - Custom Formatting
					{
						displayName: 'Speech Understanding - Custom Formatting',
						name: 'speech_understanding_formatting',
						type: 'fixedCollection',
						default: {},
						description:
							'Apply custom formatting to dates, phone numbers, and emails in the transcript',
						options: [
							{
								name: 'custom_formatting',
								displayName: 'Custom Formatting',
								values: [
									{
										displayName: 'Date Format',
										name: 'date_format',
										type: 'string',
										default: '',
										description: "Date format pattern (e.g., 'mm/dd/yyyy' or 'yyyy-mm-dd')",
										placeholder: 'mm/dd/yyyy',
									},
									{
										displayName: 'Email Format',
										name: 'email_format',
										type: 'string',
										default: '',
										description: "Email format pattern (e.g., 'username@domain.com')",
										placeholder: 'username@domain.com',
									},
									{
										displayName: 'Phone Number Format',
										name: 'phone_number_format',
										type: 'string',
										default: '',
										description: "Phone number format pattern (e.g., '(xxx)xxx-xxxx')",
										placeholder: '(xxx)xxx-xxxx',
									},
								],
							},
						],
					},
					// Speech Understanding - Speaker Identification
					{
						displayName: 'Speech Understanding - Speaker Identification',
						name: 'speech_understanding_speaker_id',
						type: 'fixedCollection',
						default: {},
						description:
							'Identify speakers by name or role in the transcript',
						options: [
							{
								name: 'speaker_identification',
								displayName: 'Speaker Identification',
								values: [
									{
										displayName: 'Speaker Type',
										name: 'speaker_type',
										type: 'options',
										default: 'role',
										options: [
											{
												name: 'Name',
												value: 'name',
											},
											{
												name: 'Role',
												value: 'role',
											},
										],
										description: 'Type of speaker identification to perform',
										hint: 'Requires the transcript to have Speaker Labels enabled.',
									},
									{
										displayName: 'Known Speaker Values',
										name: 'known_values',
										type: 'string',
										default: '',
										description:
											"Comma-separated list of known speaker roles (required for 'role' type, max 35 chars each)",
										placeholder: 'host,guest,caller',
										hint: 'Requires the transcript to have Speaker Labels enabled.',
									},
								],
							},
						],
					},
					// Speech Understanding - Translation
					{
						displayName: 'Speech Understanding - Translation',
						name: 'speech_understanding_translation',
						type: 'fixedCollection',
						default: {},
						description:
							'Enable translation of the transcript into other languages',
						options: [
							{
								name: 'translation',
								displayName: 'Translation',
								values: [
									{
										displayName: 'Target Languages',
										name: 'target_languages',
										type: 'string',
										default: '',
										description: "Comma-separated list of target language codes (e.g., 'es,de,fr')",
										placeholder: 'es,de',
									},
									{
										displayName: 'Use Formal Language',
										name: 'formal',
										type: 'boolean',
										default: true,
										description: 'Whether to use formal language style in translations',
									},
									{
										displayName: 'Match Original Utterance',
										name: 'match_original_utterance',
										type: 'boolean',
										default: false,
										description:
											'Whether to return translated text in the utterances array when Speaker Labels is enabled',
										hint: 'Requires the transcript to have Speaker Labels enabled.',
									},
								],
							},
						],
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
			// LLM Gateway Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
					},
				},
				options: [
					{
						name: 'Chat Completion',
						value: 'chatCompletion',
						description: 'Send chat completion request to LLM',
						action: 'Chat completion',
					},
					{
						name: 'Speech Understanding',
						value: 'speechUnderstanding',
						description: 'Process speech understanding task on existing transcript',
						action: 'Speech understanding',
					},
				],
				default: 'chatCompletion',
			},
			// LLM Gateway - Chat Completion fields
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				default: 'claude-sonnet-4-5-20250929',
				required: true,
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
						operation: ['chatCompletion'],
					},
				},
				options: [
					{ name: 'Claude 3.0 Haiku', value: 'claude-3-haiku-20240307' },
					{ name: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku-20241022' },
					{ name: 'Claude 4 Opus', value: 'claude-opus-4-20250514' },
					{ name: 'Claude 4 Sonnet', value: 'claude-sonnet-4-20250514' },
					{ name: 'Claude 4.5 Haiku', value: 'claude-haiku-4-5-20251001' },
					{ name: 'Claude 4.5 Sonnet', value: 'claude-sonnet-4-5-20250929' },
					{ name: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
					{ name: 'Gemini 2.5 Flash-Lite', value: 'gemini-2.5-flash-lite' },
					{ name: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
					{ name: 'Gemini 3 Flash Preview', value: 'gemini-3-flash-preview' },
					{ name: 'Gemini 3 Pro Preview', value: 'gemini-3-pro-preview' },
					{ name: 'GPT OSS 120B', value: 'gpt-oss-120b' },
					{ name: 'GPT OSS 20B', value: 'gpt-oss-20b' },
					{ name: 'GPT-4.1', value: 'gpt-4.1' },
					{ name: 'GPT-5', value: 'gpt-5' },
					{ name: 'GPT-5 Mini', value: 'gpt-5-mini' },
					{ name: 'GPT-5 Nano', value: 'gpt-5-nano' },
					{ name: 'GPT-5.1', value: 'gpt-5.1' },
					{ name: 'GPT-5.2', value: 'gpt-5.2' },
				],
				description: 'The LLM model to use for chat completion',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
						operation: ['chatCompletion'],
					},
				},
				description: 'A simple text prompt (can be used with or without Messages)',
				placeholder: 'Write a haiku about coding',
			},
			{
				displayName: 'Messages',
				name: 'messages',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
						operation: ['chatCompletion'],
					},
				},
				description: 'Chat messages to send (can be used with or without Prompt)',
				options: [
					{
						name: 'message',
						displayName: 'Message',
						values: [
							{
								displayName: 'Role',
								name: 'role',
								type: 'options',
								default: 'user',
								options: [
									{ name: 'System', value: 'system' },
									{ name: 'User', value: 'user' },
									{ name: 'Assistant', value: 'assistant' },
								],
								description: 'Role of the message sender',
							},
							{
								displayName: 'Content',
								name: 'content',
								type: 'string',
								typeOptions: {
									rows: 4,
								},
								default: '',
								description: 'Message content',
								placeholder: 'Enter message content...',
							},
						],
					},
				],
			},
			{
				displayName: 'Additional Options',
				name: 'llmAdditionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
						operation: ['chatCompletion'],
					},
				},
				options: [
					{
						displayName: 'Max Tokens',
						name: 'max_tokens',
						type: 'number',
						default: 1024,
						description: 'Maximum number of tokens to generate',
					},
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						default: 1,
						typeOptions: {
							minValue: 0,
							maxValue: 2,
							numberStepSize: 0.1,
						},
						description: 'Temperature for response generation (0-2)',
					},
					{
						displayName: 'Tool Choice',
						name: 'tool_choice',
						type: 'options',
						default: 'auto',
						options: [
							{ name: 'Auto', value: 'auto', description: 'Let the model decide which tool to call' },
							{ name: 'None', value: 'none', description: 'Force the model to not call any tools' },
						],
						description: 'Controls which (if any) tool is called by the model. Use "auto" to let the model decide, or "none" to prevent tool calls.',
					},
					{
						displayName: 'Tools',
						name: 'tools',
						type: 'string',
						typeOptions: {
							rows: 10,
						},
						default: '',
						description: 'JSON array of tool/function definitions the model may call',
						placeholder: '[{"type": "function", "function": {"name": "get_weather", "description": "Get current weather", "parameters": {"type": "object", "properties": {"location": {"type": "string", "description": "City name"}}, "required": ["location"]}}}]',
					},
				],
			},
			// LLM Gateway - Speech Understanding fields
			{
				displayName: 'Transcript ID',
				name: 'su_transcript_id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
						operation: ['speechUnderstanding'],
					},
				},
				description: 'ID of the transcript to process',
			},
			{
				displayName: 'Task Type',
				name: 'understandingTaskType',
				type: 'options',
				default: 'translation',
				required: true,
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
						operation: ['speechUnderstanding'],
					},
				},
				options: [
					{ name: 'Translation', value: 'translation' },
					{ name: 'Speaker Identification', value: 'speaker_identification' },
					{ name: 'Custom Formatting', value: 'custom_formatting' },
				],
				description: 'Type of speech understanding task to perform',
			},
			// Translation options for Speech Understanding
			{
				displayName: 'Target Languages',
				name: 'su_target_languages',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
						operation: ['speechUnderstanding'],
						understandingTaskType: ['translation'],
					},
				},
				description: 'Comma-separated list of target language codes (e.g., "es,de,fr")',
				placeholder: 'es,de',
			},
			{
				displayName: 'Use Formal Language',
				name: 'su_formal',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
						operation: ['speechUnderstanding'],
						understandingTaskType: ['translation'],
					},
				},
				description: 'Whether to use formal language style in translations',
			},
			{
				displayName: 'Match Original Utterance',
				name: 'su_match_original_utterance',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
						operation: ['speechUnderstanding'],
						understandingTaskType: ['translation'],
					},
				},
				description: 'Whether to return translated text in the utterances array. Each utterance will include a translated_texts key containing translations for each target language.',
				hint: 'Requires the transcript to have Speaker Labels enabled.',
			},
			// Speaker Identification options for Speech Understanding
			{
				displayName: 'Speaker Type',
				name: 'su_speaker_type',
				type: 'options',
				default: 'role',
				required: true,
				options: [
					{ name: 'Role', value: 'role' },
					{ name: 'Name', value: 'name' },
				],
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
						operation: ['speechUnderstanding'],
						understandingTaskType: ['speaker_identification'],
					},
				},
				description: 'Type of speaker identification to perform',
				hint: 'Requires the transcript to have Speaker Labels enabled.',
			},
			{
				displayName: 'Known Speaker Values',
				name: 'su_known_values',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
						operation: ['speechUnderstanding'],
						understandingTaskType: ['speaker_identification'],
					},
				},
				description:
					'Comma-separated list of known speaker values. Required for "role" type (max 35 chars each). Optional for "name" type.',
				placeholder: 'host,guest,caller',
				hint: 'Requires the transcript to have Speaker Labels enabled.',
			},
			// Custom Formatting options for Speech Understanding
			{
				displayName: 'Date Format',
				name: 'su_date_format',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
						operation: ['speechUnderstanding'],
						understandingTaskType: ['custom_formatting'],
					},
				},
				description: 'Date format pattern (e.g., "mm/dd/yyyy" or "yyyy-mm-dd")',
				placeholder: 'mm/dd/yyyy',
			},
			{
				displayName: 'Phone Number Format',
				name: 'su_phone_number_format',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
						operation: ['speechUnderstanding'],
						understandingTaskType: ['custom_formatting'],
					},
				},
				description: 'Phone number format pattern (e.g., "(xxx)xxx-xxxx")',
				placeholder: '(xxx)xxx-xxxx',
			},
			{
				displayName: 'Email Format',
				name: 'su_email_format',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
						operation: ['speechUnderstanding'],
						understandingTaskType: ['custom_formatting'],
					},
				},
				description: 'Email format pattern (e.g., "username@domain.com")',
				placeholder: 'username@domain.com',
			},
		],
		usableAsTool: true,
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
						const binaryData = items[i].binary![fileInput];
						
						// Handle n8n v2.0 filesystem-based binary storage
						if (binaryData.id) {
							// Use n8n's helper to get the actual binary data from filesystem/database
							fileData = await this.helpers.getBinaryDataBuffer(i, fileInput);
						} else {
							// Legacy format: data is base64 encoded string
							fileData = Buffer.from(binaryData.data, 'base64');
						}
						} else {
							throw new NodeOperationError(
								this.getNode(),
								`No binary data found. Use a "Read/Write Files from Disk" node before this node.`,
								{ itemIndex: i },
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

						// Extract and remove the collections and complex fields from additionalFields
						const {
							keyterms_prompt,
							custom_spelling,
							language_detection_options,
							language_codes,
							speech_models,
							speaker_options,
							redact_pii_audio_options,
							speech_understanding_translation,
							speech_understanding_speaker_id,
							speech_understanding_formatting,
							...restAdditionalFields
						} = additionalFields;

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

						// Handle language_detection_options
						if (language_detection_options) {
							const options = (
								language_detection_options as {
									options?: {
										expected_languages?: string;
										fallback_language?: string;
										code_switching?: boolean;
										code_switching_confidence_threshold?: number;
									};
								}
							).options;
							if (options) {
								body.language_detection_options = {};
								if (options.expected_languages && body.language_detection_options) {
									body.language_detection_options.expected_languages = options.expected_languages
										.split(',')
										.map((s: string) => s.trim());
								}
								if (options.fallback_language && body.language_detection_options) {
									body.language_detection_options.fallback_language = options.fallback_language;
								}
								if (options.code_switching !== undefined && body.language_detection_options) {
									body.language_detection_options.code_switching = options.code_switching;
								}
								if (
									options.code_switching_confidence_threshold !== undefined &&
									body.language_detection_options
								) {
									body.language_detection_options.code_switching_confidence_threshold =
										options.code_switching_confidence_threshold;
								}
							}
						}

						// Handle language_codes
						if (language_codes && typeof language_codes === 'string') {
							body.language_codes = language_codes.split(',').map((s) => s.trim());
						}

						// Handle speech_models
						if (speech_models && typeof speech_models === 'string') {
							body.speech_models = speech_models.split(',').map((s) => s.trim());
						}

						// Handle speaker_options
						if (speaker_options) {
							const options = (
								speaker_options as {
									options?: { min_speakers_expected?: number; max_speakers_expected?: number };
								}
							).options;
							if (options) {
								body.speaker_options = {};
								if (options.min_speakers_expected !== undefined && body.speaker_options) {
									body.speaker_options.min_speakers_expected = options.min_speakers_expected;
								}
								if (options.max_speakers_expected !== undefined && body.speaker_options) {
									body.speaker_options.max_speakers_expected = options.max_speakers_expected;
								}
							}
						}

						// Handle redact_pii_audio_options
						if (redact_pii_audio_options) {
							const options = (
								redact_pii_audio_options as {
									options?: { return_redacted_no_speech_audio?: boolean };
								}
							).options;
							if (options) {
								body.redact_pii_audio_options = {};
								if (
									options.return_redacted_no_speech_audio !== undefined &&
									body.redact_pii_audio_options
								) {
									body.redact_pii_audio_options.return_redacted_no_speech_audio =
										options.return_redacted_no_speech_audio;
								}
							}
						}

						// Handle speech_understanding - support multiple tasks independently
						// Check if any speech understanding tasks are configured
						const hasTranslation =
							speech_understanding_translation?.translation &&
							speech_understanding_translation.translation.target_languages;
						const hasSpeakerIdentification =
							speech_understanding_speaker_id?.speaker_identification &&
							speech_understanding_speaker_id.speaker_identification.speaker_type;
						const hasCustomFormatting =
							speech_understanding_formatting?.custom_formatting &&
							(speech_understanding_formatting.custom_formatting.date_format ||
								speech_understanding_formatting.custom_formatting.phone_number_format ||
								speech_understanding_formatting.custom_formatting.email_format);

						if (hasTranslation || hasSpeakerIdentification || hasCustomFormatting) {
							body.speech_understanding = { request: {} };

							// Add translation if configured
							if (hasTranslation && speech_understanding_translation.translation) {
								const translation = speech_understanding_translation.translation;
								body.speech_understanding.request.translation = {
									target_languages: translation.target_languages!
										.split(',')
										.map((s: string) => s.trim()),
								};

								if (translation.formal !== undefined) {
									body.speech_understanding.request.translation.formal = translation.formal;
								}

								if (translation.match_original_utterance !== undefined) {
									body.speech_understanding.request.translation.match_original_utterance =
										translation.match_original_utterance;
								}
							}

							// Add speaker identification if configured
							if (
								hasSpeakerIdentification &&
								speech_understanding_speaker_id.speaker_identification
							) {
								const speakerIdent = speech_understanding_speaker_id.speaker_identification;
								body.speech_understanding.request.speaker_identification = {
									speaker_type: speakerIdent.speaker_type!,
								};

								// Add known_values if provided (required for 'role', optional for 'name')
								if (speakerIdent.known_values) {
									// Validate that known_values is provided when speaker_type is 'role'
									if (speakerIdent.speaker_type === 'role' && !speakerIdent.known_values.trim()) {
										throw new NodeOperationError(
											this.getNode(),
											'Known Speaker Values are required when Speaker Type is "role"',
											{ itemIndex: i },
										);
									}

									body.speech_understanding.request.speaker_identification.known_values =
										speakerIdent.known_values.split(',').map((s: string) => s.trim());
								} else if (speakerIdent.speaker_type === 'role') {
									throw new NodeOperationError(
										this.getNode(),
										'Known Speaker Values are required when Speaker Type is "role"',
										{ itemIndex: i },
									);
								}
							}

							// Add custom formatting if configured
							if (hasCustomFormatting && speech_understanding_formatting.custom_formatting) {
								const formatting = speech_understanding_formatting.custom_formatting;
								body.speech_understanding.request.custom_formatting = {};

								if (formatting.date_format) {
									body.speech_understanding.request.custom_formatting.date = formatting.date_format;
								}

								if (formatting.phone_number_format) {
									body.speech_understanding.request.custom_formatting.phone_number =
										formatting.phone_number_format;
								}

								if (formatting.email_format) {
									body.speech_understanding.request.custom_formatting.email = formatting.email_format;
								}
							}
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
				} else if (resource === 'llm_gateway') {
					const llmGatewayURL = 'https://llm-gateway.assemblyai.com/v1';

					if (operation === 'chatCompletion') {
						const model = this.getNodeParameter('model', i) as string;
						const llmAdditionalOptions = this.getNodeParameter('llmAdditionalOptions', i);

						const body: {
							model: string;
							messages?: Array<{ role: string; content: string }>;
							prompt?: string;
							temperature?: number;
							max_tokens?: number;
							tools?: unknown[];
							tool_choice?: string | Record<string, unknown>;
						} = {
							model,
						};

						// Add prompt if provided
						const promptValue = this.getNodeParameter('prompt', i, '') as string;
						if (promptValue) {
							body.prompt = promptValue;
						}

						// Add messages if provided
						const messagesCollection = this.getNodeParameter('messages', i);
						const msgCollection = messagesCollection as { message?: Array<{ role: string; content: string }> };
						if (msgCollection.message && Array.isArray(msgCollection.message) && msgCollection.message.length > 0) {
							const messages: Array<{ role: string; content: string }> = [];
							for (const msg of msgCollection.message) {
								messages.push({
									role: msg.role,
									content: msg.content,
								});
							}
							body.messages = messages;
						}

						// Add optional parameters
						const llmOptions = llmAdditionalOptions as {
							temperature?: number;
							max_tokens?: number;
							tools?: string;
							tool_choice?: string;
						};
						if (llmOptions.temperature !== undefined) {
							body.temperature = llmOptions.temperature;
						}
						if (llmOptions.max_tokens !== undefined) {
							body.max_tokens = llmOptions.max_tokens;
						}
						if (llmOptions.tools) {
							try {
								body.tools = JSON.parse(llmOptions.tools);
							} catch {
								throw new NodeOperationError(
									this.getNode(),
									'Invalid JSON in Tools field',
									{ itemIndex: i },
								);
							}
						}
						if (llmOptions.tool_choice !== undefined) {
							body.tool_choice = llmOptions.tool_choice;
						}

						responseData = await this.helpers.httpRequest({
							method: 'POST',
							url: `${llmGatewayURL}/chat/completions`,
							headers: {
								Authorization: apiKey,
								'Content-Type': 'application/json',
								'User-Agent': userAgent,
							},
							body: JSON.stringify(body),
						});
					} else if (operation === 'speechUnderstanding') {
						const transcriptId = this.getNodeParameter('su_transcript_id', i) as string;
						const taskType = this.getNodeParameter('understandingTaskType', i) as string;

						// Build speech_understanding request based on task type
						const speechUnderstanding: { request: Record<string, unknown> } = { request: {} };

						if (taskType === 'translation') {
							const targetLanguages = this.getNodeParameter('su_target_languages', i) as string;
							const formal = this.getNodeParameter('su_formal', i) as boolean;
							const matchOriginalUtterance = this.getNodeParameter(
								'su_match_original_utterance',
								i,
							) as boolean;

							speechUnderstanding.request.translation = {
								target_languages: targetLanguages.split(',').map((s) => s.trim()),
								formal,
								match_original_utterance: matchOriginalUtterance,
							};
						} else if (taskType === 'speaker_identification') {
							const speakerType = this.getNodeParameter('su_speaker_type', i) as 'role' | 'name';
							const knownValues = this.getNodeParameter('su_known_values', i) as string;

							// Validate that known_values is provided when speaker_type is 'role'
							if (speakerType === 'role' && !knownValues) {
								throw new NodeOperationError(
									this.getNode(),
									'Known Speaker Values are required when Speaker Type is "role"',
									{ itemIndex: i },
								);
							}

							speechUnderstanding.request.speaker_identification = {
								speaker_type: speakerType as 'role' | 'name',
							};

							// Add known_values if provided (required for 'role', optional for 'name')
							if (knownValues) {
								const speakerIdent = speechUnderstanding.request
									.speaker_identification as { speaker_type: 'role' | 'name'; known_values?: string[] };
								speakerIdent.known_values = knownValues.split(',').map((s) => s.trim());
							}
						} else if (taskType === 'custom_formatting') {
							const dateFormat = this.getNodeParameter('su_date_format', i) as string;
							const phoneFormat = this.getNodeParameter('su_phone_number_format', i) as string;
							const emailFormat = this.getNodeParameter('su_email_format', i) as string;

							speechUnderstanding.request.custom_formatting = {};

						const customFmt = speechUnderstanding.request.custom_formatting as { date?: string; phone_number?: string; email?: string };
							if (dateFormat) {
								customFmt.date = dateFormat;
							}
							if (phoneFormat) {
								customFmt.phone_number = phoneFormat;
							}
							if (emailFormat) {
								customFmt.email = emailFormat;
							}
						}

						// Build request body with transcript_id and speech_understanding
						const body = {
							transcript_id: transcriptId,
							speech_understanding: speechUnderstanding,
						};

						responseData = await this.helpers.httpRequest({
							method: 'POST',
							url: `${llmGatewayURL}/understanding`,
							headers: {
								Authorization: apiKey,
								'Content-Type': 'application/json',
								'User-Agent': userAgent,
							},
							body: JSON.stringify(body),
						});
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
					pairedItem: { item: i },
				});
			} catch (error) {
				// Extract detailed error message from API response
				let errorMessage = 'Unknown error occurred';
				let errorDetails: Record<string, unknown> = {};

				if (error instanceof Error) {
					errorMessage = error.message;

					// Check if it's an axios error with response data
					const axiosError = error as { response?: { data?: Record<string, unknown> } };
					if (axiosError.response?.data) {
						const apiError = axiosError.response.data;

						// AssemblyAI API typically returns { error: "message" } or { error: { message: "..." } }
						if (typeof apiError.error === 'string') {
							errorMessage = `AssemblyAI API Error: ${apiError.error}`;
							errorDetails = apiError;
						} else if (typeof apiError.error === 'object' && apiError.error !== null) {
							const errorObj = apiError.error as Record<string, unknown>;
							if (typeof errorObj.message === 'string') {
								errorMessage = `AssemblyAI API Error: ${errorObj.message}`;
								errorDetails = errorObj;
							}
						} else if (typeof apiError.message === 'string') {
							errorMessage = `AssemblyAI API Error: ${apiError.message}`;
							errorDetails = apiError;
						}
					}
				}

				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: errorMessage,
							details: errorDetails,
						},
						pairedItem: { item: i },
					});
					continue;
				}

				// Throw a more detailed error
				const description =
					typeof errorDetails.message === 'string'
						? errorDetails.message
						: typeof errorDetails.error === 'string'
							? errorDetails.error
							: undefined;

				throw new NodeOperationError(this.getNode(), errorMessage, {
					itemIndex: i,
					description,
				});
			}
		}

		return [returnData];
	}
}
