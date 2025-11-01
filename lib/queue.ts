// Simple in-memory queue for background tasks
// In production, you'd use BullMQ with Redis

interface QueueJob {
  id: string
  type: string
  data: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

class SimpleQueue {
  private jobs: QueueJob[] = []
  private processing: Set<string> = new Set()

  async add(type: string, data: any): Promise<string> {
    const id = `${Date.now()}-${Math.random()}`
    const job: QueueJob = {
      id,
      type,
      data,
      status: 'pending',
    }
    this.jobs.push(job)
    this.processNext()
    return id
  }

  private async processNext() {
    const pendingJob = this.jobs.find(j => j.status === 'pending' && !this.processing.has(j.id))
    if (!pendingJob) return

    this.processing.add(pendingJob.id)
    pendingJob.status = 'processing'

    try {
      if (pendingJob.type === 'process-audio') {
        await this.processAudioJob(pendingJob)
      }
      pendingJob.status = 'completed'
    } catch (error) {
      console.error('Job failed:', error)
      pendingJob.status = 'failed'
    } finally {
      this.processing.delete(pendingJob.id)
      // Process next job if available
      setImmediate(() => this.processNext())
    }
  }

  private async processAudioJob(job: QueueJob) {
    const { processAudioFile } = await import('./audioProcessor')
    const { prisma } = await import('./prisma')
    
    const { originalPath, songId } = job.data
    
    try {
      const { processedPath, metadata } = await processAudioFile(originalPath, songId)
      
      await prisma.song.update({
        where: { id: songId },
        data: {
          filePath: processedPath,
          status: 'READY',
          duration: metadata.duration,
          title: metadata.title || 'Unknown Title',
          artist: metadata.artist,
          album: metadata.album,
          genre: metadata.genre,
          year: metadata.year,
        },
      })
    } catch (error) {
      await prisma.song.update({
        where: { id: songId },
        data: { status: 'ERROR' },
      })
      throw error
    }
  }
}

export const queue = new SimpleQueue()
