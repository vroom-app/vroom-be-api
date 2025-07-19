import { requireEnv } from "src/config/config-require";

export const s3Config = {
    region: requireEnv('AWS_REGION'),
    credentials: {
        accessKeyId: requireEnv('AWS_ACCESS_KEY_ID'),
        secretAccessKey: requireEnv('AWS_SECRET_ACCESS_KEY'),
    },
    bucketName: requireEnv('AWS_S3_BUCKET_NAME'),
};