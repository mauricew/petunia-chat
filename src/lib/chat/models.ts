export type PetuniaChatModel = {
  vendorCode?: string;
  openrouterCode: string;
  modelName: string;
  vendorName: string;
  hidden?: boolean;
  preview?: boolean;
  minimumTier: 'free' | 'basic' | 'premium';
}

export const DefaultModel = 'google/gemini-2.5-flash-lite-preview-06-17';

export const Models: Array<PetuniaChatModel> = [
  {
    vendorCode: 'gpt-4.1',
    openrouterCode: 'openai/gpt-4.1',
    modelName: 'GPT 4.1',
    vendorName: 'OpenAI',
    minimumTier: 'basic',
  },
  {
    vendorCode: 'gpt-4.1-mini',
    openrouterCode: 'openai/gpt-4.1-mini',
    modelName: 'GPT 4.1 Mini',
    vendorName: 'OpenAI',
    minimumTier: 'free',
  },
  {
    vendorCode: 'gpt-4.1-nano',
    openrouterCode: 'openai/gpt-4.1-nano',
    modelName: 'GPT 4.1 Nano',
    vendorName: 'OpenAI',
    minimumTier: 'free',
  },
  {
    vendorCode: 'o4-mini',
    openrouterCode: 'openai/o4-mini',
    modelName: 'o4-mini',
    vendorName: 'OpenAI',
    minimumTier: 'basic',
  },
  {
    vendorCode: 'o4-mini-high',
    openrouterCode: 'openai/o4-mini-high',
    modelName: 'o4-mini-high',
    vendorName: 'OpenAI',
    minimumTier: 'basic',
  },
  {
    vendorCode: 'gemini-2.5-pro-preview-06-05',
    openrouterCode: 'google/gemini-2.5-pro-preview',
    modelName: 'Gemini 2.5 Pro Preview',
    vendorName: 'Google',
    hidden: true,
    minimumTier: 'premium',
  },
  {
    vendorCode: 'gemini-2.5-flash-preview-05-20',
    openrouterCode: 'google/gemini-2.5-flash-preview-05-20',
    modelName: 'Gemini 2.5 Flash Preview',
    vendorName: 'Google',
    hidden: true,
    minimumTier: 'free',
  },
  {
    vendorCode: 'models/gemini-2.5-flash-lite-preview-06-17',
    openrouterCode: 'google/gemini-2.5-flash-lite-preview-06-17',
    modelName: 'Gemini 2.5 Flash Lite',
    vendorName: 'Google',
    preview: true,
    minimumTier: 'free',
  },
  {
    vendorCode: 'models/gemini-2.5-flash',
    openrouterCode: 'google/gemini-2.5-flash',
    modelName: 'Gemini 2.5 Flash',
    vendorName: 'Google',
    minimumTier: 'free',
  },
  {
    vendorCode: 'gemini-2.5-pro',
    openrouterCode: 'google/gemini-2.5-pro',
    modelName: 'Gemini 2.5 Pro',
    vendorName: 'Google',
    minimumTier: 'basic',
  },
  {
    vendorCode: 'claude-sonnet-4',
    openrouterCode: 'anthropic/claude-sonnet-4',
    modelName: 'Claude Sonnet 4',
    vendorName: 'Anthropic',
    minimumTier: 'basic',
  },
  {
    vendorCode: 'grok-3-mini',
    openrouterCode: 'x-ai/grok-3-mini-beta',
    modelName: 'Grok 3 Mini',
    vendorName: 'xAI',
    minimumTier: 'free',
  }
];

export const ModelsByOpenrouterCode = Models.reduce((acc, cur) => ({ ...acc, [cur.openrouterCode]: cur }), {});

export const ModelsByVendor = Models.reduce((acc, cur) => ({ 
  ...acc,
  [cur.vendorName]: [...(acc[cur.vendorName] || []), cur]
}), {});
