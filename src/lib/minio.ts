import { Client } from 'minio'

const globalForMinio = globalThis as unknown as { __docproAdminMinio?: Client }

export const minio = globalForMinio.__docproAdminMinio ?? (() => {
  const client = new Client({
    endPoint: (process.env.MINIO_ENDPOINT ?? 'http://localhost:9000')
      .replace(/^https?:\/\//, '')
      .split(':')[0],
    port: Number((process.env.MINIO_ENDPOINT ?? '').split(':')[2] ?? 9000),
    useSSL: process.env.MINIO_ENDPOINT?.startsWith('https'),
    accessKey: process.env.MINIO_ROOT_USER ?? 'docpro',
    secretKey: process.env.MINIO_ROOT_PASSWORD ?? 'docpro_secret',
  })
  if (process.env.NODE_ENV !== 'production') globalForMinio.__docproAdminMinio = client
  return client
})()

export async function removeUserObjects(bucket: string, userId: string): Promise<number> {
  const stream = minio.listObjectsV2(bucket, `${userId}/`, true)
  const names: string[] = []
  await new Promise<void>((resolve, reject) => {
    stream.on('data', (obj) => { if (obj.name) names.push(obj.name) })
    stream.on('error', reject)
    stream.on('end', resolve)
  })
  if (names.length === 0) return 0
  await minio.removeObjects(bucket, names)
  return names.length
}
