export type ResetLink = { email: string; token: string };

export function consumeResetLink(location: Pick<Location, 'href'>, history: Pick<History, 'replaceState'>): ResetLink | null {
  const url = new URL(location.href);
  const fragment = url.hash.startsWith('#reset-password?');
  const params = fragment ? new URLSearchParams(url.hash.slice('#reset-password?'.length)) : url.searchParams;
  if (!params.has('token')) return null;
  const link = { email: params.get('email') ?? '', token: params.get('token') ?? '' };
  if (fragment) url.hash = '';
  url.searchParams.delete('email');
  url.searchParams.delete('token');
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  return link;
}
