export async function diagnoseDevice(
  category: string,
  symptoms: string[],
  images: string[],
  location?: { latitude: number; longitude: number }
) {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('SUPABASE_URL:', SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY exists:', !!SUPABASE_ANON_KEY);
  console.log('SUPABASE_ANON_KEY length:', SUPABASE_ANON_KEY?.length);
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  };
  
  console.log('Request headers:', headers);
  console.log('Authorization header:', headers.Authorization.substring(0, 50) + '...');

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/diagnose`,
    {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        category,
        symptoms,
        images,
        location
      })
    }
  );

  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Backend error: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}