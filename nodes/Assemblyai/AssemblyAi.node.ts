import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

import {
	IAdditionalFields,
	IKeyTermsCollection,
	ICustomSpellingCollection,
	IWordsCollection,
	IQueryParams,
	ITranscriptCreateBody,
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
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
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
						displayName: 'Auto Chapters (Deprecated)',
						name: 'auto_chapters',
						type: 'boolean',
						default: false,
						description: 'Whether to automatically generate chapters. Deprecated and will be removed in a later release. Use the LLM Gateway resource (Chat Completion) for chapter summaries instead.',
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
						displayName: 'Domain',
						name: 'domain',
						type: 'options',
						default: '',
						options: [
							{ name: 'None', value: '' },
							{ name: 'Medical (Medical-V1)', value: 'medical-v1' },
						],
						description: 'Domain-specific transcription mode. Supported with Universal-2 and Universal-3 Pro.',
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
										displayName: 'Code Switching',
										name: 'code_switching',
										type: 'boolean',
										default: false,
										description: 'Whether to enable code-switching detection (mid-stream language changes). Supported on Universal-2; the field is silently ignored on accounts that do not have the feature enabled.',
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
										description: 'Confidence threshold for detecting code switching (0-1). Only takes effect when Code Switching is enabled.',
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
						displayName: 'Prompt',
						name: 'prompt',
						type: 'string',
						typeOptions: {
							rows: 4,
						},
						default: '',
						description: 'Context prompt used to steer transcription style and accuracy. Supported on Universal-3 Pro. Max 1500 words. Mutually exclusive with Key Terms.',
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
									{
										displayName: 'Override Audio Redaction Method',
										name: 'override_audio_redaction_method',
										type: 'options',
										default: '',
										options: [
											{ name: 'Default (Beep)', value: '' },
											{ name: 'Silence', value: 'silence' },
										],
										description: 'Method used to redact PII in the audio. Set to Silence to replace PII with silence instead of the default beep.',
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
						displayName: 'Redact PII Return Unredacted',
						name: 'redact_pii_return_unredacted',
						type: 'boolean',
						default: false,
						displayOptions: {
							show: {
								redact_pii: [true],
							},
						},
						description: 'Whether to also return the unredacted transcript alongside the redacted one',
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
						displayName: 'Redact Static Entities',
						name: 'redact_static_entities',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						displayOptions: {
							show: {
								redact_pii: [true],
							},
						},
						description: 'Custom redaction labels with exact-match terms. Each label maps to a list of literal strings that will be replaced in the transcript (and audio, if Redact PII Audio is enabled). Requires Redact PII to be enabled.',
						options: [
							{
								name: 'entries',
								displayName: 'Entity',
								values: [
									{
										displayName: 'Label',
										name: 'label',
										type: 'string',
										default: '',
										description: 'Custom redaction label (e.g. INTERNAL_TOOL)',
										placeholder: 'INTERNAL_TOOL',
									},
									{
										displayName: 'Examples',
										name: 'examples',
										type: 'string',
										default: '',
										description: 'Comma-separated list of exact terms to redact under this label',
										placeholder: 'Bearclaw, Cubclaw',
									},
								],
							},
						],
					},
					{
						displayName: 'Remove Audio Tags',
						name: 'remove_audio_tags',
						type: 'options',
						default: '',
						options: [
							{ name: 'None', value: '' },
							{ name: 'All', value: 'all' },
						],
						description: 'Strip inline audio tags like [laughter], [music], and speaker cues from the transcript output. Universal-3 Pro only.',
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
										displayName: 'Maximum Speakers Expected',
										name: 'max_speakers_expected',
										type: 'number',
										default: 10,
										description: 'The maximum number of speakers expected. Setting this too high may hurt accuracy.',
									},
									{
										displayName: 'Minimum Speakers Expected',
										name: 'min_speakers_expected',
										type: 'number',
										default: 1,
										description: 'The minimum number of speakers expected in the audio file',
									},
								],
							},
						],
					},
					{
						displayName: 'Speakers Expected',
						name: 'speakers_expected',
						type: 'number',
						default: 0,
						typeOptions: {
							minValue: 0,
						},
						displayOptions: {
							show: {
								speaker_labels: [true],
							},
						},
						description: 'Expected total number of speakers. Leave at 0 to let the model decide. Mutually exclusive with the min/max values in Speaker Options.',
					},
					// Speech Models
					{
						displayName: 'Speech Models (Priority Order)',
						name: 'speech_models',
						type: 'string',
						default: '',
						description:
							'Comma-separated list of speech models in priority order. The API routes per language and falls back through the list. Example: "universal-3-5-pro,universal-3-pro,universal-2". Leave empty to let the API choose. This is the only way to select a model — the legacy single speech_model parameter is no longer supported.',
						placeholder: 'universal-3-5-pro,universal-3-pro,universal-2',
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
						displayName: 'Summarization (Deprecated)',
						name: 'summarization',
						type: 'boolean',
						default: false,
						description: 'Whether to generate a summary of the transcript. Deprecated and will be removed in a later release. Use the LLM Gateway resource (Chat Completion) for summarization.',
					},
					{
						displayName: 'Summary Model (Deprecated)',
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
						description: 'Deprecated. Will be removed in a later release. Use the LLM Gateway resource (Chat Completion) for summarization.',
					},
					{
						displayName: 'Summary Type (Deprecated)',
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
						description: 'Deprecated. Will be removed in a later release. Use the LLM Gateway resource (Chat Completion) for summarization.',
					},
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						default: '',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberStepSize: 0.1,
						},
						description: 'Sampling temperature for transcription (0-1). Only valid with Universal-3 Pro or Universal-3.5 Pro speech models.',
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
						displayName: 'After ID',
						name: 'after_id',
						type: 'string',
						default: '',
						description: 'Get transcripts after this ID (for pagination)',
					},
					{
						displayName: 'Before ID',
						name: 'before_id',
						type: 'string',
						default: '',
						description: 'Get transcripts before this ID (for pagination)',
					},
					{
						displayName: 'Created On (After)',
						name: 'created_on',
						type: 'dateTime',
						default: '',
						description: 'Only get transcripts created after this date',
					},
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
						displayName: 'Throttled Only',
						name: 'throttled_only',
						type: 'boolean',
						default: false,
						description: 'Whether to only return throttled transcripts. Overrides the status filter.',
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
				displayName: 'Transcript ID',
				name: 'chatTranscriptId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['llm_gateway'],
						operation: ['chatCompletion'],
					},
				},
				description: 'Optional. AssemblyAI transcript ID. The first occurrence of the literal tag {{ transcript }} in the first message that contains it (or in the Prompt) is replaced with the transcript text before the completion runs.',
				placeholder: 'YOUR_TRANSCRIPT_ID',
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
									{ name: 'Assistant', value: 'assistant' },
									{ name: 'System', value: 'system' },
									{ name: 'Tool', value: 'tool' },
									{ name: 'User', value: 'user' },
								],
								description: 'Role of the message sender. Use "Tool" to return a tool/function call result back to the model.',
							},
							{
								displayName: 'Content',
								name: 'content',
								type: 'string',
								typeOptions: {
									rows: 4,
								},
								default: '',
								description: 'Message content. For role "Tool", this is the JSON-serialized result of the tool call.',
								placeholder: 'Enter message content...',
							},
							{
								displayName: 'Tool Call ID',
								name: 'tool_call_id',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										role: ['tool'],
									},
								},
								description: 'Required when Role is "Tool". The ID of the tool call this message is responding to (returned by the model in a prior tool_calls response).',
								placeholder: 'call_abc123',
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
						displayName: 'JSON Repair Post-Processing',
						name: 'json_repair',
						type: 'boolean',
						default: false,
						// When more post_processing_steps types are added by the API, convert this to a multiOptions dropdown.
						description: 'Whether to apply JSON repair post-processing. Useful for fixing malformed JSON in tool-call arguments or structured outputs.',
					},
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
							{ name: 'Specific Function', value: 'function', description: 'Force the model to call the function named in Tool Choice Function Name' },
						],
						description: 'Controls which (if any) tool is called by the model',
					},
					{
						displayName: 'Tool Choice Function Name',
						name: 'tool_choice_function_name',
						type: 'string',
						default: '',
						displayOptions: {
							show: {
								tool_choice: ['function'],
							},
						},
						description: 'Name of the function the model must call. Must match a function name in the Tools array.',
						placeholder: 'get_weather',
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
					{ name: 'Custom Formatting', value: 'custom_formatting' },
					{ name: 'Speaker Identification', value: 'speaker_identification' },
					{ name: 'Translation', value: 'translation' },
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
					{ name: 'Name', value: 'name' },
					{ name: 'Role', value: 'role' },
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
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Region is the only credential field we read directly — the Authorization header
		// is still injected by httpRequestWithAuthentication via the credential's
		// authenticate block. We only need the region to pick the right base URL.
		const credentials = await this.getCredentials('assemblyAiApi');
		const region = (credentials.region as string | undefined) ?? 'us';
		const transcriptHost = region === 'eu' ? 'https://api.eu.assemblyai.com' : 'https://api.assemblyai.com';
		const llmGatewayHost = region === 'eu' ? 'https://llm-gateway.eu.assemblyai.com' : 'https://llm-gateway.assemblyai.com';

		const userAgent = `n8n-assemblyai-node/${AAI_NODE_VERSION}`;
		const baseURL = `${transcriptHost}/v2`;

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

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'assemblyAiApi', {
							method: 'POST',
							url: `${baseURL}/upload`,
							headers: {
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
							redact_static_entities,
							speech_understanding_translation,
							speech_understanding_speaker_id,
							speech_understanding_formatting,
							...restAdditionalFields
						} = additionalFields;

						const body: ITranscriptCreateBody = {
							audio_url: audioUrl,
							...restAdditionalFields, // Spread without the collections
						};

						// Drop empty-string defaults from option-typed fields so the API uses its own defaults
						if (body.domain === ('' as unknown as 'medical-v1')) {
							delete body.domain;
						}
						if (body.remove_audio_tags === ('' as unknown as 'all')) {
							delete body.remove_audio_tags;
						}
						// speakers_expected of 0 means "let the model decide"
						if (body.speakers_expected === 0) {
							delete body.speakers_expected;
						}
						// temperature is an empty string when the user did not set it — drop it
						if (body.temperature === ('' as unknown as number)) {
							delete body.temperature;
						}

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
									options?: {
										min_speakers_expected?: number;
										max_speakers_expected?: number;
									};
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
									options?: {
										return_redacted_no_speech_audio?: boolean;
										override_audio_redaction_method?: 'silence' | '';
									};
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
								if (
									options.override_audio_redaction_method &&
									body.redact_pii_audio_options
								) {
									body.redact_pii_audio_options.override_audio_redaction_method =
										options.override_audio_redaction_method as 'silence';
								}
							}
						}

						// Handle redact_static_entities — UI fixedCollection -> { LABEL: ["term1", "term2"], ... }
						if (redact_static_entities) {
							const entries = (
								redact_static_entities as {
									entries?: Array<{ label?: string; examples?: string }>;
								}
							).entries;
							if (entries && entries.length > 0) {
								const staticMap: Record<string, string[]> = {};
								for (const entry of entries) {
									const label = (entry.label ?? '').trim();
									const examples = (entry.examples ?? '')
										.split(',')
										.map((s) => s.trim())
										.filter(Boolean);
									if (label && examples.length > 0) {
										staticMap[label] = examples;
									}
								}
								if (Object.keys(staticMap).length > 0) {
									body.redact_static_entities = staticMap;
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

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'assemblyAiApi', {
							method: 'POST',
							url: `${baseURL}/transcript`,
							headers: {
									'Content-Type': 'application/json',
								'User-Agent': userAgent,
							},
							body: JSON.stringify(body),
						});
					} else if (operation === 'get') {
						const transcriptId = this.getNodeParameter('transcriptId', i) as string;

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'assemblyAiApi', {
							method: 'GET',
							url: `${baseURL}/transcript/${transcriptId}`,
							headers: {
									'User-Agent': userAgent,
							},
							json: true,
						});
					} else if (operation === 'delete') {
						const transcriptId = this.getNodeParameter('transcriptId', i) as string;

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'assemblyAiApi', {
							method: 'DELETE',
							url: `${baseURL}/transcript/${transcriptId}`,
							headers: {
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
						if (listAdditionalFields.throttled_only) {
							qs.throttled_only = listAdditionalFields.throttled_only;
						}

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'assemblyAiApi', {
							method: 'GET',
							url: `${baseURL}/transcript`,
							headers: {
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

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'assemblyAiApi', {
							method: 'GET',
							url: `${baseURL}/transcript/${transcriptId}/${format}`,
							headers: {
									'User-Agent': userAgent,
							},
							qs,
						});
					} else if (operation === 'getSentences') {
						const transcriptId = this.getNodeParameter('transcriptId', i) as string;

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'assemblyAiApi', {
							method: 'GET',
							url: `${baseURL}/transcript/${transcriptId}/sentences`,
							headers: {
									'User-Agent': userAgent,
							},
							json: true,
						});
					} else if (operation === 'getParagraphs') {
						const transcriptId = this.getNodeParameter('transcriptId', i) as string;

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'assemblyAiApi', {
							method: 'GET',
							url: `${baseURL}/transcript/${transcriptId}/paragraphs`,
							headers: {
									'User-Agent': userAgent,
							},
							json: true,
						});
					} else if (operation === 'getRedactedAudio') {
						const transcriptId = this.getNodeParameter('transcriptId', i) as string;

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'assemblyAiApi', {
							method: 'GET',
							url: `${baseURL}/transcript/${transcriptId}/redacted-audio`,
							headers: {
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

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'assemblyAiApi', {
							method: 'GET',
							url: `${baseURL}/transcript/${transcriptId}/word-search`,
							headers: {
									'User-Agent': userAgent,
							},
							qs: {
								words: words,
							},
							json: true,
						});
					}
				} else if (resource === 'llm_gateway') {
					const llmGatewayURL = `${llmGatewayHost}/v1`;

					if (operation === 'chatCompletion') {
						const model = this.getNodeParameter('model', i) as string;
						const llmAdditionalOptions = this.getNodeParameter('llmAdditionalOptions', i);

						const body: {
							model: string;
							messages?: Array<{ role: string; content: string; tool_call_id?: string }>;
							prompt?: string;
							temperature?: number;
							max_tokens?: number;
							tools?: unknown[];
							tool_choice?: string | Record<string, unknown>;
							transcript_id?: string;
							post_processing_steps?: Array<{ type: string }>;
						} = {
							model,
						};

						// Add prompt if provided
						const promptValue = this.getNodeParameter('prompt', i, '') as string;
						if (promptValue) {
							body.prompt = promptValue;
						}

						// Add transcript_id if provided
						const chatTranscriptId = this.getNodeParameter('chatTranscriptId', i, '') as string;
						if (chatTranscriptId) {
							body.transcript_id = chatTranscriptId;
						}

						// Add messages if provided
						const messagesCollection = this.getNodeParameter('messages', i);
						const msgCollection = messagesCollection as {
							message?: Array<{ role: string; content: string; tool_call_id?: string }>;
						};
						if (msgCollection.message && Array.isArray(msgCollection.message) && msgCollection.message.length > 0) {
							const messages: Array<{ role: string; content: string; tool_call_id?: string }> = [];
							for (const msg of msgCollection.message) {
								const built: { role: string; content: string; tool_call_id?: string } = {
									role: msg.role,
									content: msg.content,
								};
								if (msg.role === 'tool' && msg.tool_call_id) {
									built.tool_call_id = msg.tool_call_id;
								}
								messages.push(built);
							}
							body.messages = messages;
						}

						// Add optional parameters
						const llmOptions = llmAdditionalOptions as {
							temperature?: number;
							max_tokens?: number;
							tools?: string;
							tool_choice?: string;
							tool_choice_function_name?: string;
							json_repair?: boolean;
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
							if (llmOptions.tool_choice === 'function') {
								if (!llmOptions.tool_choice_function_name) {
									throw new NodeOperationError(
										this.getNode(),
										'Tool Choice Function Name is required when Tool Choice is "Specific Function"',
										{ itemIndex: i },
									);
								}
								body.tool_choice = {
									type: 'function',
									function: { name: llmOptions.tool_choice_function_name },
								};
							} else {
								body.tool_choice = llmOptions.tool_choice;
							}
						}
						if (llmOptions.json_repair) {
							body.post_processing_steps = [{ type: 'json-repair' }];
						}

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'assemblyAiApi', {
							method: 'POST',
							url: `${llmGatewayURL}/chat/completions`,
							headers: {
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

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'assemblyAiApi', {
							method: 'POST',
							url: `${llmGatewayURL}/understanding`,
							headers: {
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
