const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kibkwenpqbedjljrnwde.supabase.co';
const supabaseKey = 'sb_publishable_P6fR8X39kofLDpOuiAchcw_LEqrwYt7';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log('Querying tables...\n');

    // Try to get tables from information_schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public');

    if (error) {
      console.log('Error from information_schema:', error.message);
      console.log('\nTrying direct table queries...\n');

      // Fallback: try to query known tables directly
      const tables = ['medico', 'paciente', 'turno', 'usuario'];

      for (const tableName of tables) {
        const { data: result, error: err } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!err) {
          console.log(`✓ Table exists: "${tableName}"`);
          // Get columns from result
          if (result && result.length > 0) {
            const columns = Object.keys(result[0]);
            console.log(`  Columns: ${columns.join(', ')}\n`);
          } else {
            console.log(`  (Table is empty, cannot determine columns)\n`);
          }
        } else {
          console.log(`✗ Table "${tableName}" not found or error:`, err.message);
        }
      }
    } else {
      console.log('Tables in public schema:');
      data.forEach(t => console.log(`  - ${t.table_name}`));
    }

    // Try direct column query for each table
    console.log('\n--- Checking columns for each table ---\n');

    const tables = ['medico', 'paciente', 'turno', 'usuario'];
    for (const tableName of tables) {
      try {
        const { data: result, error: err } = await supabase
          .from(tableName)
          .select('*')
          .limit(0);

        if (!err) {
          console.log(`✓ "${tableName}": OK`);
        } else {
          console.log(`✗ "${tableName}": ${err.message}`);
        }
      } catch (e) {
        console.log(`✗ "${tableName}": ${e.message}`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTables();
