import { Dialog } from "@base-ui-components/react";

type LimitationDialogProps = {
  limitInfo: { remaining: number; earliest: Date; }
}

export default function LimitationDialog(props: LimitationDialogProps) {
  const { earliest, remaining } = props.limitInfo;

  return (
    <Dialog.Root>
      <Dialog.Trigger className="inline-block text-xs px-1 py-0.5 bg-gray-100 border border-gray-600 duration-150 dark:bg-gray-900 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">More Info</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-slate-900/50 z-20" />
        <div className="flex justify-center items-center">
          <Dialog.Popup className="fixed z-40 top-1/4 p-4 bg-slate-200 dark:bg-slate-700">
            <Dialog.Title className="font-medium text-xl">Remaining Messages</Dialog.Title>
            <Dialog.Description>
              <p>
                You have {remaining} messages left
                {earliest && (
                  <>{' '}
                    for the 24 hour period starting{' '}
                    {earliest.toLocaleString()}
                  </>
                )}.
                {remaining === 0 && (
                  <><br />Upgrade your plan to get more (by shooting me a message of course).</>
                )}
              </p>
            </Dialog.Description>
            <Dialog.Close className="my-2 px-4 py-2 hover:bg-slate-300 dark:hover:bg-slate-600">OK</Dialog.Close>
          </Dialog.Popup>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}