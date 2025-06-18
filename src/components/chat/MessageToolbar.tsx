import { Toolbar } from "@base-ui-components/react";
import { threadMessagesTable } from "db/schema/petunia";
import { ModelsByOpenrouterCode } from "lib/chat/models";
import { CopyIcon, GitBranchPlusIcon, RefreshCwIcon } from "lucide-react";

type MessageToolbarProps = {
  message: Partial<typeof threadMessagesTable.$inferSelect>;
  onBranch: () => void;
  onCopy: () => void;
  onRegenerate: () => Promise<void>;
  recentlyCopied: boolean;
}

export default function MessageToolbar(props: MessageToolbarProps) {
  const { message, onBranch, onCopy, onRegenerate, recentlyCopied } = props;

  const { modelName } = ModelsByOpenrouterCode[message.model!];

  return (
    <Toolbar.Root>
      <Toolbar.Group className="flex space-x-2">
        <span>{modelName}</span>
        <Toolbar.Button
          className="flex items-center gap-1 text-xs hover:text-gray-800 dark:hover:text-slate-300"
          onClick={() => !recentlyCopied && onCopy()}
        >
          <CopyIcon size={12} />
          {recentlyCopied ? 'Copied!' : 'Copy'}
        </Toolbar.Button>
        <Toolbar.Button 
          className="flex items-center gap-1 text-xs hover:text-gray-800 dark:hover:text-slate-300"
          onClick={() => onBranch()}
        >
          <GitBranchPlusIcon size={12} />
          Branch
        </Toolbar.Button>
        <Toolbar.Button
          className="flex items-center gap-1 text-xs hover:text-gray-800 dark:hover:text-slate-300"
          onClick={async () => await onRegenerate()}
        >
          <RefreshCwIcon size={12} />
          Regen
        </Toolbar.Button>
      </Toolbar.Group>
    </Toolbar.Root>
  )
}