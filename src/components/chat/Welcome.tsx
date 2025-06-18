import { Collapsible, Tabs } from "@base-ui-components/react";
import { ChevronDownIcon } from "lucide-react";
import { useMemo } from "react";

const inspo = {
  Overview: [
    'How Does AI work?',
    'Are black holes real?',
    'How many occurrences of the letter "R" are in the word "strawberry"?',
    'What is the meaning of life?',
  ],
  Create: [
    'Write a short story about a robot discovering emotions',
    'Help me outline a sci-fi novel set in a post-apocalyptic world',
    'Create a character profile for a complex villain with sympathetic motives',
    'Give me 5 creative writing prompts for flash fiction',
  ],
  Explore: [
    'Good books for fans of Rick Rubin',
    'Countries ranked by number of corgis',
    'Most successful companies in the world',
    'How much does Claude cost?',
  ],
  Code: [
    `Write code to invert a binary search tree in Python`,
    `What's the difference between Promise.all and Promise.allSettled?`,
    `Explain React's useEffect cleanup function`,
    `Best practices for error handling in async/await`,
  ],
  Learn: [
    `Beginner's guide to TypeScript`,
    `Explain the CAP theorem in distributed systems`,
    `Why is AI so expensive?`,
    `Are black holes real?`,
  ]
}

type WelcomeProps = {
  onMessage: (message: string) => void;
}

export default function Welcome(props: WelcomeProps) {
  const { onMessage } = props;

  return (
    <div className="flex flex-col px-4 py-16 md:px-8 md:py-32">
      <h3 className="mb-4 text-3xl font-lexend font-light">what ideas will you bloom?</h3>
      <p>so many possibilities time to get this bread</p>

      <Tabs.Root className="my-4" defaultValue="Overview">
        <Tabs.List className="mb-4 flex gap-2 md:gap-4">
          {Object.keys(inspo).map(k => (
            <Tabs.Tab
              key={k} value={k}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {k}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {Object.entries(inspo).map(([name, prompts]) => (
          <Tabs.Panel key={name} value={name} className="my-2 space-y-2 [&>p]:select-none [&>p]:px-2 [&>p]:py-1 [&>p]:hover:bg-slate-200 [&>p]:dark:hover:bg-slate-800">
            {prompts.map(p => (<p key={p} onClick={() => onMessage(p)}>{p}</p>))}
          </Tabs.Panel>
        ))}
      </Tabs.Root>


      <Collapsible.Root>
        <Collapsible.Trigger className="flex items-center gap-1 group data-[panel-open]:[&>svg]:rotate-180">
          <ChevronDownIcon size={16} className="duration-150" />
          The original intro
        </Collapsible.Trigger>
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