import { supabase } from '@/lib/customSupabaseClient';

/*
 * REQUIRED SUPABASE TRIGGER (run once in SQL Editor):
 *
 * This trigger automatically sets profiles.newsletter_subscribed = true
 * whenever a new record is inserted into newsletter_subscribers (from any
 * source: homepage form, social media campaigns, n8n automation, etc.)
 *
 * CREATE OR REPLACE FUNCTION sync_profile_on_newsletter_subscribe()
 * RETURNS TRIGGER
 * SECURITY DEFINER
 * SET search_path = public
 * LANGUAGE plpgsql AS $$
 * BEGIN
 *   UPDATE public.profiles
 *   SET newsletter_subscribed = true
 *   WHERE email = NEW.email
 *     AND newsletter_subscribed IS DISTINCT FROM true;
 *   RETURN NEW;
 * END;
 * $$;
 *
 * DROP TRIGGER IF EXISTS sync_profile_on_newsletter_insert ON public.newsletter_subscribers;
 *
 * CREATE TRIGGER sync_profile_on_newsletter_insert
 * AFTER INSERT ON public.newsletter_subscribers
 * FOR EACH ROW
 * EXECUTE FUNCTION sync_profile_on_newsletter_subscribe();
 */

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
      return { success: false, error: 'Something went wrong. Please try again.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
