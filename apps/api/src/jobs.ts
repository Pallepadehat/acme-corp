import { Queue, Worker } from 'bullmq'
import { Redis } from 'ioredis'
import type { Logger } from './logger.ts'

/**
 * What routes may hand to the background. Routes depend on this interface, not
 * on BullMQ, so tests pass a fake and need no Redis.
 */
export interface Jobs {
  todoCreated(todo: { id: string; userId: string }): Promise<void>
}

const QUEUE = 'todos'

/**
 * The queue and its worker, in the API process. When the work gets heavy, move
 * the `Worker` into its own entry point and run it as a separate process.
 */
export function createJobs(redisUrl: string, log: Logger) {
  const connection = new Redis(redisUrl, { maxRetriesPerRequest: null })
  const queue = new Queue(QUEUE, { connection })

  const worker = new Worker(
    QUEUE,
    async (job) => {
      // Replace with real work: send an email, call a webhook, crunch numbers…
      log.info({ job: job.name, todoId: job.data.id }, 'job done')
    },
    { connection },
  )
  worker.on('failed', (job, err) => log.error({ err, job: job?.name }, 'job failed'))

  const jobs: Jobs = {
    async todoCreated(todo) {
      // A custom jobId may not contain ':' (BullMQ uses it in its own keys), so use '-'.
      await queue.add('todo-created', todo, { jobId: `todo-${todo.id}` })
    },
  }

  async function close() {
    await worker.close()
    await queue.close()
    connection.disconnect()
  }

  return { jobs, close }
}
