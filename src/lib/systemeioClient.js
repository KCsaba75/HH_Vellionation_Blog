const SYSTEMEIO_API_URL = 'https://api.systeme.io/api';

function getApiKey() {
  return import.meta.env.VITE_SYSTEMEIO_API_KEY || '';
}

export async function addContactToSystemeio(email, name, tags = ['newsletter']) {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('systeme.io API key not configured (VITE_SYSTEMEIO_API_KEY)');
    return null;
  }

  try {
    const firstName = name?.split(' ')[0] || '';
    const lastName = name?.split(' ').slice(1).join(' ') || '';

    const response = await fetch(`${SYSTEMEIO_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': apiKey,
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        tags: tags.map(tag => ({ name: tag })),
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('systeme.io addContact error:', err);
      return null;
    }

    const data = await response.json();
    return data?.id || null;
  } catch (e) {
    console.error('systeme.io addContact exception:', e.message);
    return null;
  }
}

export async function addTagToContact(contactId, tag = 'newsletter') {
  const apiKey = getApiKey();
  if (!apiKey || !contactId) return false;

  try {
    const response = await fetch(`${SYSTEMEIO_API_URL}/contacts/${contactId}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': apiKey,
      },
      body: JSON.stringify({ name: tag }),
    });

    return response.ok;
  } catch (e) {
    console.error('systeme.io addTag exception:', e.message);
    return false;
  }
}

export async function removeTagFromContact(contactId, tag = 'newsletter') {
  const apiKey = getApiKey();
  if (!apiKey || !contactId) return false;

  try {
    const response = await fetch(`${SYSTEMEIO_API_URL}/contacts/${contactId}/tags`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': apiKey,
      },
      body: JSON.stringify({ name: tag }),
    });

    return response.ok;
  } catch (e) {
    console.error('systeme.io removeTag exception:', e.message);
    return false;
  }
}

export async function findContactByEmail(email) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const response = await fetch(`${SYSTEMEIO_API_URL}/contacts?email=${encodeURIComponent(email)}`, {
      headers: { 'X-Auth-Token': apiKey },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.items?.[0]?.id || null;
  } catch (e) {
    console.error('systeme.io findContact exception:', e.message);
    return null;
  }
}
