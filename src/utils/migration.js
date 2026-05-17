import { supabase, isSupabaseConfigured } from '../lib/supabase';

const MIGRATION_KEY = 'greenplant_migrated_to_cloud';

/**
 * One-time migration of localStorage data to Supabase cloud.
 * Only runs once per user, and only if Supabase is configured.
 */
export async function migrateLocalToCloud(userId) {
  if (!isSupabaseConfigured() || !supabase || !userId) return { migrated: false };

  // Check if already migrated
  const migrated = localStorage.getItem(`${MIGRATION_KEY}_${userId}`);
  if (migrated) return { migrated: false, reason: 'already_done' };

  const results = { projects: 0, inputData: 0, predictions: 0, recommendations: 0 };

  try {
    // Migrate Projects
    const projects = JSON.parse(localStorage.getItem('greenplant_projects') || '[]');
    if (projects.length > 0) {
      const rows = projects.map(p => ({
        id: p.id?.length > 30 ? crypto.randomUUID() : p.id, // ensure valid UUID
        user_id: userId,
        name: p.name,
        crop_type: p.cropType,
        land_area: p.landArea ? Number(p.landArea) : null,
        location: p.location || null,
        created_at: p.createdAt || new Date().toISOString(),
        updated_at: p.updatedAt || new Date().toISOString(),
      }));

      const { error } = await supabase.from('projects').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
      if (!error) results.projects = rows.length;
      else console.warn('Migration projects error:', error);
    }

    // Migrate Predictions
    const predictions = JSON.parse(localStorage.getItem('greenplant_predictions') || '[]');
    if (predictions.length > 0) {
      const rows = predictions.map(p => {
        const { id, projectId, createdAt, ...result } = p;
        return {
          id: crypto.randomUUID(),
          user_id: userId,
          project_id: null, // can't reliably map old IDs
          result,
          created_at: createdAt || new Date().toISOString(),
        };
      });

      const { error } = await supabase.from('predictions').insert(rows);
      if (!error) results.predictions = rows.length;
      else console.warn('Migration predictions error:', error);
    }

    // Migrate Recommendations
    const recommendations = JSON.parse(localStorage.getItem('greenplant_recommendations') || '[]');
    if (recommendations.length > 0) {
      const rows = recommendations.map(r => {
        const { id, predictionId, createdAt, ...data } = r;
        return {
          id: crypto.randomUUID(),
          user_id: userId,
          prediction_id: null,
          data,
          created_at: createdAt || new Date().toISOString(),
        };
      });

      const { error } = await supabase.from('recommendations').insert(rows);
      if (!error) results.recommendations = rows.length;
      else console.warn('Migration recommendations error:', error);
    }

    // Mark as migrated
    localStorage.setItem(`${MIGRATION_KEY}_${userId}`, new Date().toISOString());

    const total = results.projects + results.predictions + results.recommendations;
    console.log(`✅ Migration complete: ${total} records migrated`, results);

    return { migrated: true, results };
  } catch (err) {
    console.error('Migration failed:', err);
    return { migrated: false, error: err.message };
  }
}
