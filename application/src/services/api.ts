export const api = {
  post: (url: string, data?: BodyInit | null | undefined) =>
    fetch(url, {
      method: 'POST',
      body: data,
      headers: { 'Content-Type': 'application/json' },
    }),
};
