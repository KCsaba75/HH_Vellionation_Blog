import { supabase } from '@/lib/customSupabaseClient';
import { addContactToSystemeio } from '@/lib/systemeioClient';

export async function subscribeToNewsletter(email, name = '') {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim().toLowerCase(), name: name.trim(), source: 'homepage' });

    if (insertError) {
      if (insertError.code === '23505') {
        return { success: false, alreadySubscribed: true };
      }
      console.error('Supabase newsletter insert error:', insertError);
    }

    const systemeioId = await addContactToSystemeio(email.trim().toLowerCase(), name.trim(), ['newsletter', 'homepage-optin']);

    if (systemeioId) {
      await supabase
        .from('newsletter_subscribers')
        .update({ systemeio_contact_id: String(systemeioId) })
        .eq('email', email.trim().toLowerCase());
    }

    return { success: true };
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
