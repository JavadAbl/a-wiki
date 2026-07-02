import { appConfig } from './app.config';

export type AppConfig = ReturnType<typeof appConfig>;
export type ConfigType = { app: AppConfig };

export enum nodeEnvs {
  Development = 'development',
  Production = 'production',
}
