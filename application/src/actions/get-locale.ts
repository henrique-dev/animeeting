'use server';

import { cookies } from 'next/headers';

export const getLocale = async () => {
  const cookiesStore = await cookies();

  const locale = cookiesStore.get('NEXT_LOCALE');

  return locale?.value ?? 'pt-BR';
};
