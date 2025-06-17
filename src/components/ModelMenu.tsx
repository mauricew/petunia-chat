import { Menu } from '@base-ui-components/react';
import { Models, ModelsByOpenrouterCode } from 'lib/chat/models';

type ModelMenuProps = {
  modelCode: string;
  onSetModel: (nextModel: string) => void;
}

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
            {Models.map(model => (
              <Menu.Item
                key={model.openrouterCode}
                className={`
                  px-4 py-3 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-700 cursor-pointer
                  ${modelCode === model.openrouterCode ? 'bg-fuchsia-100 text-fuchsia-900 font-bold dark:bg-fuchsia-800 dark:text-fuchsia-200' : 'text-fuchsia-700 dark:text-fuchsia-200'}
                `}
                onClick={() => onSetModel(model.openrouterCode)}
              >
                {model.modelName}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}