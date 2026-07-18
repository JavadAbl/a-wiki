import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { nodeEnvs } from './config.type';

export const config = () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  HTTP_PORT: parseInt(process.env.HTTP_PORT!, 10),
  HTTP_HOST: process.env.HTTP_HOST!,
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD!,
  SUPER_ADMIN_MOBILE: process.env.SUPER_ADMIN_MOBILE!,
  SUPER_ADMIN_SEED_PASSWORD: process.env.SUPER_ADMIN_SEED_PASSWORD!,
  SMS_TEMPLATE_CODE: process.env.SMS_TEMPLATE_CODE!,
  SMS_FROM_NUMBER: process.env.SMS_FROM_NUMBER!,
  SMS_API_KEY: process.env.SMS_API_KEY!,
  S3_accessKeyId: process.env.S3_accessKeyId!,
  S3_secretAccessKey: process.env.S3_secretAccessKey!,
});

export const appConfig = registerAs('app', config);

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...Object.values(nodeEnvs)) // Assumes nodeEnvs contains strings like 'development', 'production'
    .default('development'),

  HTTP_PORT: Joi.number().port().required(),
  HTTP_HOST: Joi.string().hostname().required(),

  DATABASE_URL: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  SUPER_ADMIN_PASSWORD: Joi.string().required(),
  SUPER_ADMIN_MOBILE: Joi.string().required(),
  SUPER_ADMIN_SEED_PASSWORD: Joi.string().required(),

  SMS_TEMPLATE_CODE: Joi.string().required(),
  SMS_FROM_NUMBER: Joi.string().required(),
  SMS_API_KEY: Joi.string().required(),

  S3_accessKeyId: Joi.string().required(),
  S3_secretAccessKey: Joi.string().required(),
});

export const isDev = config().NODE_ENV === (nodeEnvs.Development as any);
