import { supabase } from '@/lib/customSupabaseClient';

/**
 * Creates an admin user with predefined credentials
 * This should be run once to set up the initial admin account
 */
export async function createAdminUser() {
  const adminEmail = 'ycrow75@gmail.com';
  const adminPassword = '19Csaba75';
  const adminName = 'Admin User';

  try {
    // Step 1: Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          name: adminName
        }
      }
    });

    if (signUpError) {
      console.error('Error creating admin user:', signUpError);
      return { success: false, error: signUpError };
    }

    // Step 2: Update the profile to set admin role
    if (signUpData.user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', signUpData.user.id);

      if (updateError) {
        console.error('Error setting admin role:', updateError);
        return { success: false, error: updateError };
      }

      console.log('Admin user created successfully!');
      return { success: true, user: signUpData.user };
    }

    return { success: false, error: 'User creation failed' };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
}

/**
 * Alternative: Manually set admin role for existing user
 * Use this if the user already exists
 */
export async function setAdminRole(userId) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);

    if (error) {
      console.error('Error setting admin role:', error);
      return { success: false, error };
    }

    console.log('Admin role set successfully!');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
}