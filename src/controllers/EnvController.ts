import dotenv from 'dotenv';

export class EnvController {
  private static _instance: EnvController | null = null;

  constructor() {
    dotenv.config();
  }

  static init() {
    if (!EnvController._instance) EnvController._instance = new EnvController();
    return EnvController._instance;
  }

  get(name: string) {
    return process.env[name];
  }

  set(name: string, value: string) {
    process.env[name] = value;
    return process.env[name];
  }
}
