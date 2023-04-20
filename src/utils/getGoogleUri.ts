import {
  GOOGLE_AUTH_REDIRECT_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_ROOT_URL,
  GOOGLE_SCOPE_EMAIL,
  GOOGLE_SCOPE_PROFILE
} from '../config';

export function getGoogleAuthUri() {
  const rootUrl = GOOGLE_ROOT_URL as string;

  const options = {
    redirect_uri: GOOGLE_AUTH_REDIRECT_URL as string,
    client_id: GOOGLE_CLIENT_ID as string,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [GOOGLE_SCOPE_PROFILE, GOOGLE_SCOPE_EMAIL].join(' ')
  };

  const qs = new URLSearchParams(options);

  return `${rootUrl}?${qs.toString()}`;
}
