// Prediction formula utilities for GreenPlant

// Base yield data for Indonesian crops (tons per hectare)
const BASE_YIELDS = {
  padi: 5.5,
  jagung: 4.8,
  cabai: 8.0,
  kedelai: 1.8,
  singkong: 22.0,
};

// Optimal growing conditions for each crop
const OPTIMAL_CONDITIONS = {
  padi: { temp: 27, humidity: 80, rainfall: 200, soilPH: 6.5 },
  jagung: { temp: 25, humidity: 65, rainfall: 150, soilPH: 6.0 },
  cabai: { temp: 28, humidity: 70, rainfall: 120, soilPH: 6.5 },
  kedelai: { temp: 26, humidity: 60, rainfall: 100, soilPH: 6.0 },
  singkong: { temp: 28, humidity: 70, rainfall: 150, soilPH: 5.5 },
};

// Calculate condition factor (0-1 range, 1 being optimal)
const calcConditionFactor = (actual, optimal, tolerance) => {
  const diff = Math.abs(actual - optimal);
  return Math.max(0, 1 - (diff / tolerance));
};

/**
 * Predict harvest yield based on input parameters
 * @param {Object} params - Input parameters
 * @param {string} params.cropType - Type of crop
 * @param {number} params.landArea - Land area in hectares
 * @param {number} params.temperature - Temperature in °C
 * @param {number} params.humidity - Humidity in %
 * @param {number} params.rainfall - Rainfall in mm
 * @param {number} params.soilPH - Soil pH
 * @param {number} params.fertilizerAmount - Fertilizer in kg/ha
 * @param {number} params.waterSupply - Water supply adequacy (1-10)
 * @returns {Object} Prediction results
 */
export const predictHarvest = (params) => {
  const {
    cropType,
    landArea,
    temperature = 27,
    humidity = 70,
    rainfall = 150,
    soilPH = 6.5,
    fertilizerAmount = 200,
    waterSupply = 7,
  } = params;

  const baseYield = BASE_YIELDS[cropType] || 5.0;
  const optimal = OPTIMAL_CONDITIONS[cropType] || OPTIMAL_CONDITIONS.padi;

  // Calculate individual factors
  const tempFactor = calcConditionFactor(temperature, optimal.temp, 10);
  const humidityFactor = calcConditionFactor(humidity, optimal.humidity, 30);
  const rainfallFactor = calcConditionFactor(rainfall, optimal.rainfall, 100);
  const soilFactor = calcConditionFactor(soilPH, optimal.soilPH, 2);
  const fertilizerFactor = Math.min(1, fertilizerAmount / 300) * 0.8 + 0.2;
  const waterFactor = Math.min(1, waterSupply / 10) * 0.7 + 0.3;

  // Weighted average of all factors
  const overallFactor = (
    tempFactor * 0.2 +
    humidityFactor * 0.15 +
    rainfallFactor * 0.2 +
    soilFactor * 0.15 +
    fertilizerFactor * 0.15 +
    waterFactor * 0.15
  );

  // Add some randomness for realism (±5%)
  const randomVariance = 0.95 + Math.random() * 0.1;

  const yieldPerHa = baseYield * overallFactor * randomVariance;
  const totalYield = yieldPerHa * landArea;

  // Model accuracy simulation
  const accuracy = Math.round(78 + Math.random() * 15);

  return {
    yieldPerHectare: Math.round(yieldPerHa * 100) / 100,
    totalYield: Math.round(totalYield * 100) / 100,
    overallFactor: Math.round(overallFactor * 100),
    accuracy,
    factors: {
      temperature: Math.round(tempFactor * 100),
      humidity: Math.round(humidityFactor * 100),
      rainfall: Math.round(rainfallFactor * 100),
      soil: Math.round(soilFactor * 100),
      fertilizer: Math.round(fertilizerFactor * 100),
      water: Math.round(waterFactor * 100),
    },
  };
};

/**
 * Generate recommendations based on prediction factors
 */
export const generateRecommendations = (prediction, cropType, inputData) => {
  const { factors } = prediction;
  const recommendations = [];

  // Fertilizer recommendation
  const fertilizerRecs = {
    padi: { name: 'Urea + SP-36 + KCl', dosage: '250 kg/ha', note: 'Aplikasikan pupuk secara bertahap: 1/3 saat tanam, 1/3 saat 21 HST, 1/3 saat 42 HST' },
    jagung: { name: 'NPK 15-15-15', dosage: '300 kg/ha', note: 'Berikan pupuk dasar saat tanam dan pupuk susulan saat 30 HST' },
    cabai: { name: 'NPK 16-16-16 + Pupuk Organik', dosage: '350 kg/ha', note: 'Kombinasi pupuk kimia dan organik untuk hasil optimal' },
    kedelai: { name: 'SP-36 + KCl + Rhizobium', dosage: '150 kg/ha', note: 'Kedelai memfiksasi nitrogen sendiri, fokus pada fosfor dan kalium' },
    singkong: { name: 'Urea + KCl', dosage: '200 kg/ha', note: 'Singkong membutuhkan kalium tinggi untuk pembentukan umbi' },
  };

  recommendations.push({
    type: 'fertilizer',
    icon: '💊',
    title: 'Rekomendasi Pupuk',
    detail: fertilizerRecs[cropType] || fertilizerRecs.padi,
    score: factors.fertilizer,
  });

  // Planting time
  const plantingTimes = {
    padi: 'Oktober-November (musim hujan) atau April-Mei (musim kemarau)',
    jagung: 'September-Oktober atau Maret-April',
    cabai: 'Awal musim kemarau (Mei-Juni) untuk hasil terbaik',
    kedelai: 'Februari-Maret atau Juli-Agustus',
    singkong: 'Awal musim hujan (Oktober-November)',
  };

  recommendations.push({
    type: 'planting_time',
    icon: '📅',
    title: 'Waktu Tanam Terbaik',
    detail: {
      name: plantingTimes[cropType] || 'Sesuaikan dengan musim lokal',
      note: factors.rainfall < 60 ? 'Perhatian: Curah hujan rendah, pertimbangkan irigasi tambahan' : 'Curah hujan dalam kondisi baik untuk penanaman',
    },
    score: factors.rainfall,
  });

  // Harvest window
  const harvestWindows = {
    padi: '110-120 hari setelah tanam',
    jagung: '90-100 hari setelah tanam',
    cabai: '70-80 hari setelah tanam (panen bertahap)',
    kedelai: '80-90 hari setelah tanam',
    singkong: '8-12 bulan setelah tanam',
  };

  recommendations.push({
    type: 'harvest_window',
    icon: '🌾',
    title: 'Estimasi Waktu Panen',
    detail: {
      name: harvestWindows[cropType] || '90-120 hari',
      note: `Estimasi hasil: ${prediction.totalYield} ton dari ${inputData?.landArea || 1} ha`,
    },
    score: prediction.overallFactor,
  });

  // Care tips
  const careTips = {
    padi: 'Jaga ketinggian air 5-10 cm saat fase vegetatif. Lakukan penyiangan gulma rutin setiap 2 minggu.',
    jagung: 'Lakukan pembumbunan saat tanaman berumur 30 HST. Pastikan drainase baik untuk mencegah genangan.',
    cabai: 'Pasang mulsa plastik untuk menjaga kelembaban dan menekan gulma. Lakukan pemangkasan tunas samping.',
    kedelai: 'Pastikan drainase baik. Jangan terlalu banyak air saat fase pembungaan.',
    singkong: 'Lakukan penyiangan gulma secara rutin. Pangkas cabang yang berlebihan untuk fokus ke umbi.',
  };

  recommendations.push({
    type: 'care_tips',
    icon: '🌿',
    title: 'Tips Perawatan',
    detail: {
      name: careTips[cropType] || 'Jaga kelembaban dan nutrisi tanah secara rutin',
      note: factors.soil < 70 ? 'pH tanah perlu diperbaiki. Pertimbangkan pengapuran atau penambahan kompos.' : 'Kondisi tanah cukup baik untuk pertumbuhan optimal.',
    },
    score: factors.soil,
  });

  // Pest control
  const pestControl = {
    padi: 'Waspadai wereng coklat dan blast. Gunakan varietas tahan dan aplikasikan pestisida nabati.',
    jagung: 'Perhatikan serangan penggerek batang. Gunakan perangkap feromon dan predator alami.',
    cabai: 'Waspadai kutu daun dan trips. Aplikasikan insektisida nabati dan jaga sanitasi kebun.',
    kedelai: 'Perhatikan ulat grayak dan kepik hijau. Monitoring rutin dan pengendalian hayati.',
    singkong: 'Waspadai tungau merah dan kutu putih. Gunakan varietas tahan dan predator alami.',
  };

  recommendations.push({
    type: 'pest_control',
    icon: '🐛',
    title: 'Pengendalian Hama',
    detail: {
      name: pestControl[cropType] || 'Lakukan monitoring hama secara rutin dan gunakan pengendalian terpadu',
      note: factors.humidity > 80 ? 'Kelembaban tinggi meningkatkan risiko penyakit jamur. Tingkatkan sirkulasi udara.' : 'Kondisi kelembaban relatif aman dari risiko jamur.',
    },
    score: Math.max(0, 100 - (factors.humidity > 80 ? 30 : 0)),
  });

  return recommendations;
};
