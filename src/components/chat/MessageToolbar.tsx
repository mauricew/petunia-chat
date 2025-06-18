import { Toolbar } from "@base-ui-components/react";
import { threadMessagesTable } from "db/schema";
import { ModelsByOpenrouterCode } from "lib/chat/models";

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
      <Toolbar.Group className="space-x-2">
        <span>{modelName}</span>
        <Toolbar.Button onClick={() => !recentlyCopied && onCopy()}>
          {recentlyCopied ? 'Copied!' : 'Copy'}
        </Toolbar.Button>
        <Toolbar.Button onClick={() => onBranch()}>Branch</Toolbar.Button>
        <Toolbar.Button onClick={async () => await onRegenerate()}>Regen</Toolbar.Button>
      </Toolbar.Group>
    </Toolbar.Root>
  )
}