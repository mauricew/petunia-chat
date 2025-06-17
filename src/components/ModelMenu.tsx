import { Menu } from '@base-ui-components/react';
import { Models } from 'lib/chat/models';

type ModelMenuProps = {
  modelCode: string;
  onSetModel: (nextModel: string) => void;
}

export default function ModelMenu(props: ModelMenuProps) {
  const { modelCode, onSetModel } = props;

  return (
    <Menu.Root>
      <Menu.Trigger className="p-1 text-sm cursor-pointer">
        Model: {modelCode}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={2}>
          <Menu.Popup className="px-2 py-1 bg-fuchsia-50">
            {Models.map(model => (
              <Menu.Item
                key={model.openrouterCode}
                className={`
                  p-2 hover:bg-fuchsia-200
                  ${modelCode === model.openrouterCode ? 'bg-fuchsia-100 text-fuchsia-900 font-bold' : 'text-fuchsia-700'}
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