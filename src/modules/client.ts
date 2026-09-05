import fetchCookie from 'fetch-cookie';
import { EnvController } from '../controllers/EnvController';

const envController = EnvController.init();

const LOGIN_ENV = envController.get('USER_LOGIN');
const PASSWORD_ENV = envController.get('USER_PASSWORD');

if (!LOGIN_ENV || !PASSWORD_ENV) throw new Error('login or password is not setuped');

export async function getScheduleHtml() {
  const fetchWithCookie = fetchCookie(fetch);
  const data = await fetchWithCookie('https://auth.kneu.edu.ua/login', {
    method: 'GET',
  });

  const html = await data.text();

  const csrfInput = html.match(/<input\b(?=[^>]*\bname=["']csrf_token["'])[^>]*>/i);

  if (!csrfInput) {
    throw new Error('csrf_token input not found');
  }

  const valueMatch = csrfInput[0].match(/\bvalue=["']([^"']+)["']/i);

  if (!valueMatch) {
    throw new Error('csrf_token value not found');
  }

  const csrfToken = valueMatch[1];
  const params = {
    csrf_token: csrfToken,
    'LoginForm[username]': LOGIN_ENV || '',
    'LoginForm[password]': PASSWORD_ENV || '',
    'LoginForm[rememberMe]': '1',
  };
  const body = new URLSearchParams(params);

  await fetchWithCookie(
    'https://auth.kneu.edu.ua/oauth?response_type=code&client_id=1&redirect_uri=https%3A%2F%2Fkneu.edu.ua%2FoauthComplete.php&state=iframeLogin&display=iframe',
    {
      method: 'POST',
      body,
    },
  );
  const client = await fetchWithCookie('https://rozklad.kneu.edu.ua/current', { method: 'GET' });

  return await client.text();
}
