import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AssemblyAiApi implements ICredentialType {
	name = 'assemblyAiApi';
	displayName = 'AssemblyAI API';
	documentationUrl = 'https://github.com/gsharp-aai/n8n-nodes-assemblyai';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description:
				'Your AssemblyAI API key. You can find this in your AssemblyAI dashboard at https://www.assemblyai.com/app',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.assemblyai.com/v2',
			url: '/transcript',
			method: 'GET',
			headers: {
				Authorization: '={{$credentials.apiKey}}',
			},
		},
	};
}
