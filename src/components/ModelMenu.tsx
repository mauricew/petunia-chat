import { Menu } from '@base-ui-components/react';

import ClaudeLogo from 'assets/logos/claude.svg?url'
import GeminiLogo from 'assets/logos/gemini.svg?url'
import GrokLogo from 'assets/logos/grok.svg?url'
import OpenAILogo from 'assets/logos/openai.svg?url'
import { Models, ModelsByOpenrouterCode } from 'lib/chat/models';

type ModelMenuProps = {
  modelCode: string;
  onSetModel: (nextModel: string) => void;
}

const ModelLogos = {
  Google: GeminiLogo,
  Anthropic: ClaudeLogo,
  xAI: GrokLogo,
  OpenAI: OpenAILogo,
};

export default function ModelMenu(props: ModelMenuProps) {
  const { modelCode, onSetModel } = props;

  const currentModel = ModelsByOpenrouterCode[modelCode];

  return (
    <Menu.Root>
      <Menu.Trigger className="p-1 text-sm cursor-pointer">
        Model: {currentModel.modelName}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={2}>
          <Menu.Popup className="bg-fuchsia-50 dark:bg-fuchsia-900">
            {Models.filter(model => !model.hidden).map(model => (
              <Menu.Item
                key={model.openrouterCode}
                className={`
                  flex items-center gap-2 px-4 py-3 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-700 cursor-pointer group
                  ${modelCode === model.openrouterCode ? 'bg-fuchsia-100 text-fuchsia-900 font-bold dark:bg-fuchsia-800 dark:text-fuchsia-200' : 'text-fuchsia-700 dark:text-fuchsia-200'}
                `}
                onClick={() => onSetModel(model.openrouterCode)}
              >
                <img src={ModelLogos[model.vendorName]} className={`w-6 h-6 grayscale group-hover:grayscale-0`} />
                {model.modelName}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}