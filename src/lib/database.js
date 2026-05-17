import { supabase, isSupabaseConfigured } from './supabase';

// ─── Helper: check if cloud is available ───
function useCloud() {
  return isSupabaseConfigured() && supabase;
}

// ═══════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════

export async function fetchProjects(userId) {
  const db = useCloud();
  if (!db) return JSON.parse(localStorage.getItem('greenplant_projects') || '[]');

  const { data, error } = await db
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchProjects error:', error);
    return JSON.parse(localStorage.getItem('greenplant_projects') || '[]');
  }

  // Map DB columns → app format
  return (data || []).map(p => ({
    id: p.id,
    name: p.name,
    cropType: p.crop_type,
    landArea: p.land_area,
    location: p.location,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));
}

export async function insertProject(userId, project) {
  const db = useCloud();
  const newProject = {
    id: project.id || crypto.randomUUID(),
    name: project.name,
    cropType: project.cropType,
    landArea: project.landArea,
    location: project.location,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!db) return newProject;

  const { data, error } = await db
    .from('projects')
    .insert({
      id: newProject.id,
      user_id: userId,
      name: newProject.name,
      crop_type: newProject.cropType,
      land_area: newProject.landArea,
      location: newProject.location,
    })
    .select()
    .single();

  if (error) {
    console.error('insertProject error:', error);
    return newProject;
  }

  return {
    id: data.id,
    name: data.name,
    cropType: data.crop_type,
    landArea: data.land_area,
    location: data.location,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateProjectDB(userId, project) {
  const db = useCloud();
  if (!db) return;

  const { error } = await db
    .from('projects')
    .update({
      name: project.name,
      crop_type: project.cropType,
      land_area: project.landArea,
      location: project.location,
      updated_at: new Date().toISOString(),
    })
    .eq('id', project.id)
    .eq('user_id', userId);

  if (error) console.error('updateProject error:', error);
}

export async function deleteProjectDB(userId, projectId) {
  const db = useCloud();
  if (!db) return;

  const { error } = await db
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId);

  if (error) console.error('deleteProject error:', error);
}

// ═══════════════════════════════════════════
// INPUT DATA
// ═══════════════════════════════════════════

export async function fetchInputData(userId) {
  const db = useCloud();
  if (!db) return JSON.parse(localStorage.getItem('greenplant_inputdata') || '{}');

  const { data, error } = await db
    .from('input_data')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('fetchInputData error:', error);
    return JSON.parse(localStorage.getItem('greenplant_inputdata') || '{}');
  }

  const result = {};
  (data || []).forEach(d => {
    result[d.project_id] = { ...d.data, savedAt: d.saved_at };
  });
  return result;
}

export async function upsertInputData(userId, projectId, inputData) {
  const db = useCloud();
  if (!db) return;

  const { error } = await db
    .from('input_data')
    .upsert({
      project_id: projectId,
      user_id: userId,
      data: inputData,
      saved_at: new Date().toISOString(),
    }, { onConflict: 'project_id,user_id' });

  if (error) console.error('upsertInputData error:', error);
}

// ═══════════════════════════════════════════
// PREDICTIONS
// ═══════════════════════════════════════════

export async function fetchPredictions(userId) {
  const db = useCloud();
  if (!db) return JSON.parse(localStorage.getItem('greenplant_predictions') || '[]');

  const { data, error } = await db
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchPredictions error:', error);
    return JSON.parse(localStorage.getItem('greenplant_predictions') || '[]');
  }

  return (data || []).map(p => ({
    id: p.id,
    projectId: p.project_id,
    ...p.result,
    createdAt: p.created_at,
  }));
}

export async function insertPrediction(userId, prediction) {
  const db = useCloud();
  const newPrediction = {
    ...prediction,
    id: prediction.id || crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  if (!db) return newPrediction;

  const { id, projectId, createdAt, ...result } = newPrediction;
  const { data, error } = await db
    .from('predictions')
    .insert({
      id,
      user_id: userId,
      project_id: projectId || null,
      result,
      created_at: createdAt,
    })
    .select()
    .single();

  if (error) {
    console.error('insertPrediction error:', error);
    return newPrediction;
  }

  return { id: data.id, projectId: data.project_id, ...data.result, createdAt: data.created_at };
}

export async function deletePredictionDB(userId, predictionId) {
  const db = useCloud();
  if (!db) return;

  const { error } = await db
    .from('predictions')
    .delete()
    .eq('id', predictionId)
    .eq('user_id', userId);

  if (error) console.error('deletePrediction error:', error);
}

// ═══════════════════════════════════════════
// RECOMMENDATIONS
// ═══════════════════════════════════════════

export async function fetchRecommendations(userId) {
  const db = useCloud();
  if (!db) return JSON.parse(localStorage.getItem('greenplant_recommendations') || '[]');

  const { data, error } = await db
    .from('recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchRecommendations error:', error);
    return JSON.parse(localStorage.getItem('greenplant_recommendations') || '[]');
  }

  return (data || []).map(r => ({
    id: r.id,
    predictionId: r.prediction_id,
    ...r.data,
    createdAt: r.created_at,
  }));
}

export async function upsertRecommendation(userId, recommendation) {
  const db = useCloud();
  if (!db) return;

  const { id, predictionId, createdAt, ...recData } = recommendation;
  const { error } = await db
    .from('recommendations')
    .upsert({
      id: id || crypto.randomUUID(),
      user_id: userId,
      prediction_id: predictionId,
      data: recData,
    }, { onConflict: 'id' });

  if (error) console.error('upsertRecommendation error:', error);
}
