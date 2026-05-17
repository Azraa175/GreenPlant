import { useState, useCallback } from 'react';
import { predictHarvest, generateRecommendations } from '../utils/predictionFormula';

export function usePredictionModel() {
  const [prediction, setPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const runPrediction = useCallback(async (inputData) => {
    setLoading(true);
    setPrediction(null);
    setRecommendations(null);

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1500));

      const result = predictHarvest(inputData);
      const recs = generateRecommendations(result, inputData.cropType, inputData);

      setPrediction(result);
      setRecommendations(recs);

      return { prediction: result, recommendations: recs };
    } catch (error) {
      console.error('Prediction error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearPrediction = useCallback(() => {
    setPrediction(null);
    setRecommendations(null);
  }, []);

  return { prediction, recommendations, loading, runPrediction, clearPrediction };
}

export default usePredictionModel;
