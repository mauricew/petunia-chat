import { Collapsible } from "@base-ui-components/react";
import { useMemo } from "react";

const welcomeMessages = [
  'hey there',
  `what's got you curious?`,
  `let's start something`,
  'what ideas will you bloom?'
];

export default function Welcome() {
  const headerMessage = useMemo(() => welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)], []);

  return (
    <div className="flex flex-col flex-auto justify-center p-4">
      <h3 className="mb-4 text-3xl font-light">{headerMessage}</h3>
      <p>so many possibilities let's get this bread</p>
      <Collapsible.Root>
        <Collapsible.Trigger>The original intro</Collapsible.Trigger>
        <Collapsible.Panel className="mt-2">
          <p className="p-4 bg-amber-50 border border-amber-300 dark:bg-yellow-700 dark:border-yellow-600">
            You're about to witness the world's greatest chat app,
            <br />gonna zap the rest no cap cause it'll slap it won't be crap I gotta nap so end of rap.
            Jeb: "please clap"
          </p>
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  )
}