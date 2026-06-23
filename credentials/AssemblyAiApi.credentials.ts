import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
  Icon
} from 'n8n-workflow';

export class AssemblyAiApi implements ICredentialType {
	name = 'assemblyAiApi';
	displayName = 'AssemblyAI API';
	documentationUrl = 'https://github.com/gsharp-aai/n8n-nodes-assemblyai';
  icon: Icon = {
    light: 'file:../nodes/Assemblyai/assemblyai.light.svg',
    dark: 'file:../nodes/Assemblyai/assemblyai.dark.svg',
  };

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
		{
			displayName: 'Data Region',
			name: 'region',
			type: 'options',
			default: 'us',
			options: [
				{ name: 'US (Default)', value: 'us' },
				{ name: 'EU (Data Residency)', value: 'eu' },
			],
			description:
				'Which AssemblyAI region to route requests to. EU keeps audio and transcription data within the European Union.',
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
			baseURL: '={{$credentials.region === "eu" ? "https://api.eu.assemblyai.com/v2" : "https://api.assemblyai.com/v2"}}',
			url: '/transcript',
			method: 'GET',
			headers: {
				Authorization: '={{$credentials.apiKey}}',
			},
		},
	};
}
