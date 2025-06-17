export type PetuniaChatModel = {
  vendorCode?: string;
  openrouterCode: string;
  modelName: string;
  vendorName: string;
  hidden?: boolean;
}

export const DefaultModel = 'google/gemini-2.5-flash-preview-05-20';

export const Models: Array<PetuniaChatModel> = [
  {
    vendorCode: 'gpt-4.1',
    openrouterCode: 'openai/gpt-4.1',
    modelName: 'GPT 4.1',
    vendorName: 'OpenAI',
  },
  {
    vendorCode: 'gpt-4.1-mini',
    openrouterCode: 'openai/gpt-4.1-mini',
    modelName: 'GPT 4.1 Mini',
    vendorName: 'OpenAI',
  },
  {
    vendorCode: 'gpt-4.1-nano',
    openrouterCode: 'openai/gpt-4.1-nano',
    modelName: 'GPT 4.1 Nano',
    vendorName: 'OpenAI',
  },
  {
    vendorCode: 'o4-mini',
    openrouterCode: 'openai/o4-mini',
    modelName: 'o4-mini',
    vendorName: 'OpenAI'
  },
  {
    vendorCode: 'o4-mini-high',
    openrouterCode: 'openai/o4-mini-high',
    modelName: 'o4-mini-high',
    vendorName: 'OpenAI'
  },
  {
    vendorCode: 'gemini-2.5-pro-preview-06-05',
    openrouterCode: 'google/gemini-2.5-pro-preview',
    modelName: 'Gemini 2.5 Pro Preview',
    vendorName: 'Google',
  },
  {
    vendorCode: 'gemini-2.5-flash-preview-05-20',
    openrouterCode: 'google/gemini-2.5-flash-preview-05-20',
    modelName: 'Gemini 2.5 Flash Preview',
    vendorName: 'Google',
  },
  {
    vendorCode: 'claude-sonnet-4',
    openrouterCode: 'anthropic/claude-sonnet-4',
    modelName: 'Claude Sonnet 4',
    vendorName: 'Anthropic',
  },
  {
    vendorCode: 'grok-3-mini',
    openrouterCode: 'x-ai/grok-3-mini-beta',
    modelName: 'Grok 3 Mini',
    vendorName: 'xAI',
  }
];

export const ModelsByOpenrouterCode = Models.reduce((acc, cur) => ({ ...acc, [cur.openrouterCode]: cur }), {});