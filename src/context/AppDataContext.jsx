import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchProjects, insertProject, updateProjectDB, deleteProjectDB,
  fetchInputData, upsertInputData,
  fetchPredictions, insertPrediction, deletePredictionDB,
  fetchRecommendations, upsertRecommendation,
} from '../lib/database';

const AppDataContext = createContext(null);

const initialState = {
  projects: [],
  inputData: {},
  predictions: [],
  recommendations: [],
  settings: {
    theme: 'system',
    notifications: true,
    units: { temperature: '°C', rainfall: 'mm', weight: 'kg' },
  },
  isDataLoading: true,
};

function appDataReducer(state, action) {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p),
      };
    case 'DELETE_PROJECT':
      return { ...state, projects: state.projects.filter(p => p.id !== action.payload) };
    case 'SET_INPUT_DATA':
      return { ...state, inputData: { ...state.inputData, [action.payload.projectId]: action.payload.data } };
    case 'LOAD_INPUT_DATA':
      return { ...state, inputData: action.payload };
    case 'SET_PREDICTIONS':
      return { ...state, predictions: action.payload };
    case 'ADD_PREDICTION':
      return { ...state, predictions: [action.payload, ...state.predictions] };
    case 'DELETE_PREDICTION':
      return { ...state, predictions: state.predictions.filter(p => p.id !== action.payload) };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'SAVE_RECOMMENDATIONS':
      return {
        ...state,
        recommendations: [action.payload, ...state.recommendations.filter(r => r.predictionId !== action.payload.predictionId)],
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'LOAD_ALL':
      return { ...state, ...action.payload, isDataLoading: false };
    case 'SET_DATA_LOADING':
      return { ...state, isDataLoading: action.payload };
    case 'CLEAR_ALL':
      return { ...initialState, isDataLoading: false };
    default:
      return state;
  }
}

export function AppDataProvider({ children }) {
  const [state, dispatch] = useReducer(appDataReducer, initialState);
  const { user, isAuthenticated } = useAuth();
  const cloudEnabled = isSupabaseConfigured();
  const loadedRef = useRef(false);

  // ─── Load data when user logs in ───
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      dispatch({ type: 'SET_DATA_LOADING', payload: false });
      return;
    }

    // Prevent double-load
    if (loadedRef.current === user.id) return;
    loadedRef.current = user.id;

    const loadData = async () => {
      dispatch({ type: 'SET_DATA_LOADING', payload: true });
      try {
        const [projects, inputData, predictions, recommendations] = await Promise.all([
          fetchProjects(user.id),
          fetchInputData(user.id),
          fetchPredictions(user.id),
          fetchRecommendations(user.id),
        ]);

        const settings = JSON.parse(localStorage.getItem('greenplant_settings') || 'null');

        dispatch({
          type: 'LOAD_ALL',
          payload: {
            projects,
            inputData,
            predictions,
            recommendations,
            settings: settings || initialState.settings,
          },
        });
      } catch (e) {
        console.warn('Error loading data:', e);
        dispatch({ type: 'SET_DATA_LOADING', payload: false });
      }
    };

    loadData();
  }, [isAuthenticated, user?.id]);

  // Reset on logout
  useEffect(() => {
    if (!isAuthenticated) {
      loadedRef.current = false;
    }
  }, [isAuthenticated]);

  // ─── Local persistence for non-cloud mode ───
  useEffect(() => {
    if (cloudEnabled) return;
    localStorage.setItem('greenplant_projects', JSON.stringify(state.projects));
  }, [state.projects, cloudEnabled]);

  useEffect(() => {
    if (cloudEnabled) return;
    localStorage.setItem('greenplant_inputdata', JSON.stringify(state.inputData));
  }, [state.inputData, cloudEnabled]);

  useEffect(() => {
    if (cloudEnabled) return;
    localStorage.setItem('greenplant_predictions', JSON.stringify(state.predictions));
  }, [state.predictions, cloudEnabled]);

  useEffect(() => {
    if (cloudEnabled) return;
    localStorage.setItem('greenplant_recommendations', JSON.stringify(state.recommendations));
  }, [state.recommendations, cloudEnabled]);

  useEffect(() => {
    localStorage.setItem('greenplant_settings', JSON.stringify(state.settings));
  }, [state.settings]);

  // ═══ CRUD Actions ═══

  const addProject = useCallback(async (project) => {
    const newProject = await insertProject(user?.id, project);
    dispatch({ type: 'ADD_PROJECT', payload: newProject });
    return newProject;
  }, [user?.id]);

  const updateProject = useCallback(async (project) => {
    const updated = { ...project, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_PROJECT', payload: updated });
    await updateProjectDB(user?.id, updated);
  }, [user?.id]);

  const deleteProject = useCallback(async (id) => {
    dispatch({ type: 'DELETE_PROJECT', payload: id });
    await deleteProjectDB(user?.id, id);
  }, [user?.id]);

  const saveInputData = useCallback(async (projectId, data) => {
    const saved = { ...data, savedAt: new Date().toISOString() };
    dispatch({ type: 'SET_INPUT_DATA', payload: { projectId, data: saved } });
    await upsertInputData(user?.id, projectId, saved);
  }, [user?.id]);

  const savePrediction = useCallback(async (prediction) => {
    const newPrediction = await insertPrediction(user?.id, prediction);
    dispatch({ type: 'ADD_PREDICTION', payload: newPrediction });
    return newPrediction;
  }, [user?.id]);

  const deletePrediction = useCallback(async (id) => {
    dispatch({ type: 'DELETE_PREDICTION', payload: id });
    await deletePredictionDB(user?.id, id);
  }, [user?.id]);

  const saveRecommendation = useCallback(async (recommendation) => {
    dispatch({ type: 'SAVE_RECOMMENDATIONS', payload: recommendation });
    await upsertRecommendation(user?.id, recommendation);
  }, [user?.id]);

  const updateSettings = useCallback((settings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  // Export all data as JSON
  const exportData = useCallback(() => {
    const data = {
      projects: state.projects,
      inputData: state.inputData,
      predictions: state.predictions,
      recommendations: state.recommendations,
      settings: state.settings,
      exportedAt: new Date().toISOString(),
      app: 'GreenPlant',
      version: '1.0.0',
      storage: cloudEnabled ? 'supabase' : 'localStorage',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `greenplant-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state, cloudEnabled]);

  const clearAllData = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
    localStorage.removeItem('greenplant_projects');
    localStorage.removeItem('greenplant_inputdata');
    localStorage.removeItem('greenplant_predictions');
    localStorage.removeItem('greenplant_recommendations');
  }, []);

  return (
    <AppDataContext.Provider value={{
      ...state,
      addProject,
      updateProject,
      deleteProject,
      saveInputData,
      savePrediction,
      deletePrediction,
      saveRecommendation,
      updateSettings,
      exportData,
      clearAllData,
      isCloud: cloudEnabled,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within AppDataProvider');
  return context;
}

export default AppDataContext;
