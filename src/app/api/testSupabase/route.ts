import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const { data, error } = await supabase
  .from('question') // lowercase if Supabase created them in lowercase
  .select('*');

export async function GET() {
  const { data, error } = await supabase.from('Question').select('*');
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify(data));
}
