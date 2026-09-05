import { google } from 'googleapis';
import fs from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import open from 'open';
import { EnvController } from '../../controllers/EnvController';
import { TokensCredentials } from '../../types';

export class AuthService {
  private envController = EnvController.init();
  private tokensPath = path.resolve(__dirname, '..', '..', '..', 'tokens.json');
  private hostname = '127.0.0.1';
  private port = 3000;
  private oauth2Client;
  private authUrl;

  constructor() {
    const CLIENT_ID_ENV = this.envController.get('GOOGLE_CLIENT_ID') || '';
    const CLIENT_SECRET_ENV = this.envController.get('GOOGLE_CLIENT_SECRET_KEY') || '';

    this.oauth2Client = new google.auth.OAuth2(
      CLIENT_ID_ENV,
      CLIENT_SECRET_ENV,
      `http://${this.hostname}:${this.port}/auth/callback`,
    );
    this.authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
    });
  }

  async getGoogleAuth() {
    const tokensJson = await fs.readFile(this.tokensPath, 'utf8').catch((error) => undefined);

    if (!tokensJson) {
      return this.generateAndSaveTokens();
    }

    const tokens: TokensCredentials = JSON.parse(tokensJson);
    this.oauth2Client.setCredentials(tokens);

    try {
      const { token } = await this.oauth2Client.getAccessToken();
      if (!token) throw new Error('getAccessToken error');
      const { expiry_date } = await this.oauth2Client.getTokenInfo(token);
      await fs.writeFile(
        this.tokensPath,
        JSON.stringify({
          ...tokens,
          access_token: token,
          expiry_date,
        }),
      );
      return this.oauth2Client;
    } catch (error) {
      return this.generateAndSaveTokens();
    }
  }

  async generateAndSaveTokens() {
    const code = await this.waitForTheCode(this.authUrl);
    const tokensRes = await this.oauth2Client.getToken(code);

    await fs.writeFile(this.tokensPath, JSON.stringify(tokensRes.tokens));

    this.oauth2Client.setCredentials(tokensRes.tokens);
    return this.oauth2Client;
  }

  private async waitForTheCode(url: string): Promise<string> {
    const hostname = '127.0.0.1';
    const port = 3000;
    const promise = new Promise<string>((res, rej) => {
      const server = createServer((request, response) => {
        const url = new URL(request.url || '', `http://${hostname}:${port}`);
        if (url.pathname !== '/auth/callback') {
          response.statusCode = 501;
          response.end();
          server.close();
          return;
        }
        const code = url.searchParams.get('code');
        if (!code) {
          response.statusCode = 400;
          response.statusMessage = 'Bad request, code parameter is missing';
          response.end();
          server.close();
          rej(new Error('authorization code is missing'));
          return;
        }
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(`
          <!doctype html>
          <html>
            <body>
              <h2>Authorization successful</h2>
              <p>You can return to the application.</p>

              <script>
                setTimeout(() => {
                  location.href = 'https://calendar.google.com';
                }, 1000);
              </script>
            </body>
          </html>
        `);
        server.close();
        res(code);
      });
      server.listen(port, hostname, async () => {
        try {
          await open(url);
        } catch (error) {
          rej(error);
          server.close();
        }
      });
      server.on('error', (error) => {
        server.close();
        rej(error);
      });
    });

    return promise;
  }
}
