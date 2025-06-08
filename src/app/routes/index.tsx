import * as fs from 'node:fs'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

/*
const filePath = 'count.txt'

async function readCount() {
  return parseInt(
    await fs.promises.readFile(filePath, 'utf-8').catch(() => '0'),
  )
}

const getCount = createServerFn({
  method: 'GET',
}).handler(() => {
  return readCount()
})

const updateCount = createServerFn({ method: 'POST' })
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    const count = await readCount()
    await fs.promises.writeFile(filePath, `${count + data}`)
  })
*/
export const Route = createFileRoute('/')({
  component: Home,
  // loader: async () => await getCount(),
})

function Home() {
  // const router = useRouter()
  // const state = Route.useLoaderData()

  return (
    <div className="h-screen flex">
      <nav className="w-60 h-full flex flex-col p-4">
        <h1 className="mb-4 text-center">Petunia chat</h1>
        <ul>
          <li>History item 1</li>
          <li>History item 2</li>
          <li>History item 3</li>
        </ul>
        <span className="mt-auto"></span>
        <button className="text-left">Log in</button>
      </nav>
      <div className="h-full flex flex-col">
        <div className="grow">
          <p className="p-4">
            You're about to witness the world's greatest chat app,
            <br />gonna zap the rest no cap cause it'll slap it won't be crap I gotta nap so end of rap.
            Jeb: "please clap"
          </p>
        </div>
        <div>
          <textarea className="w-full p-2 border resize-none" placeholder="Chat away" />
        </div>
      </div>
    </div>
  )
}