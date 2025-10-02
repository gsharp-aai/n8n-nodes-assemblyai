export interface IAdditionalFields {
	// Speech recognition options
	speech_model?: 'universal' | 'slam-1';
	language_code?: string;
	language_detection?: boolean;
	language_detection_options?: {
		expected_languages?: string[];
		fallback_language?: string;
	};
	language_confidence_threshold?: number;
	punctuate?: boolean;
	format_text?: boolean;
	disfluencies?: boolean;
	multichannel?: boolean;
	audio_start_from?: number;
	audio_end_at?: number;
	speech_threshold?: number;

	// Speaker diarization
	speaker_labels?: boolean;
	speakers_expected?: number | null;
	speaker_options?: {
		min_speakers_expected?: number;
		max_speakers_expected?: number;
	};

	// Audio intelligence features
	auto_highlights?: boolean;
	content_safety?: boolean;
	content_safety_confidence?: number;
	iab_categories?: boolean;
	sentiment_analysis?: boolean;
	entity_detection?: boolean;
	auto_chapters?: boolean;
	summarization?: boolean;
	summary_model?: 'informative' | 'conversational' | 'catchy';
	summary_type?: 'bullets' | 'bullets_verbose' | 'gist' | 'headline' | 'paragraph';

	// PII and profanity
	filter_profanity?: boolean;
	redact_pii?: boolean;
	redact_pii_sub?: 'hash' | 'entity_name';
	redact_pii_audio?: boolean;
	redact_pii_audio_quality?: 'mp3' | 'wav';
	redact_pii_audio_options?: {
		return_redacted_no_speech_audio?: boolean;
	};
	redact_pii_policies?: string[];

	// Webhooks
	webhook_url?: string;
	webhook_auth_header_name?: string;
	webhook_auth_header_value?: string;

	// Custom vocabulary - using our defined types
	keyterms_prompt?: IKeyTermsCollection;
	custom_spelling?: ICustomSpellingCollection;
}

export interface IListAdditionalFields {
	status?: 'queued' | 'processing' | 'completed' | 'error' | '';
	created_on?: string;
	before_id?: string;
	after_id?: string;
}

export interface ICustomSpellingCollection {
	spelling?: Array<{
		from: string; // Single string, not array
		to: string;
	}>;
}

export interface IKeyTermsCollection {
	term?: Array<{ value: string }>;
}

export interface ILemurBaseBody {
	transcript_ids: string[];
	final_model: string;
	temperature: number;
	max_output_size: number;
	context?: string;
}

export interface ITranscriptCreateBody {
	// Required field
	audio_url: string;

	// Speech recognition options
	speech_model?: 'universal' | 'slam-1' | 'best';
	language_code?: string;
	language_detection?: boolean;
	language_detection_options?: {
		expected_languages?: string[];
		fallback_language?: string;
	};
	language_confidence_threshold?: number;
	punctuate?: boolean;
	format_text?: boolean;
	disfluencies?: boolean;
	multichannel?: boolean;
	dual_channel?: boolean; // deprecated
	audio_start_from?: number;
	audio_end_at?: number;
	speech_threshold?: number;

	// Speaker diarization
	speaker_labels?: boolean;
	speakers_expected?: number | null;
	speaker_options?: {
		min_speakers_expected?: number;
		max_speakers_expected?: number;
	};

	// Audio intelligence features
	auto_highlights?: boolean;
	content_safety?: boolean;
	content_safety_confidence?: number;
	iab_categories?: boolean;
	sentiment_analysis?: boolean;
	entity_detection?: boolean;
	auto_chapters?: boolean;
	summarization?: boolean;
	summary_model?: 'informative' | 'conversational' | 'catchy';
	summary_type?: 'bullets' | 'bullets_verbose' | 'gist' | 'headline' | 'paragraph';

	// PII and profanity
	filter_profanity?: boolean;
	redact_pii?: boolean;
	redact_pii_sub?: 'hash' | 'entity_name';
	redact_pii_audio?: boolean;
	redact_pii_audio_quality?: 'mp3' | 'wav';
	redact_pii_audio_options?: {
		return_redacted_no_speech_audio?: boolean;
	};
	redact_pii_policies?: string[];

	// Webhooks
	webhook_url?: string;
	webhook_auth_header_name?: string | null;
	webhook_auth_header_value?: string | null;

	// Custom vocabulary (processed format for API)
	keyterms_prompt?: string[];
	custom_spelling?: Array<{
		from: string[];
		to: string;
	}>;
}

export interface IQueryParams {
	limit?: number;
	status?: 'queued' | 'processing' | 'completed' | 'error' | '';
	created_on?: string;
	before_id?: string;
	after_id?: string;
	chars_per_caption?: number;
	words?: string;
	[key: string]: string | number | boolean | undefined;
}

export interface IQuestionsCollection {
	question?: Array<{
		question: string;
		answerType: string; // This is for n8n UI logic
		answer_format?: string;
		answer_options?: {
			option?: Array<{ value: string }>; // Nested structure for n8n fixedCollection
		};
	}>;
}

export interface IWordsCollection {
	word?: Array<{ term: string }>;
}
