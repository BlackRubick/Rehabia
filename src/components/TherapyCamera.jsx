import { useEffect, useMemo, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { calculateAngle, getKneeStatus } from '../lib/poseMath';

const LEFT = { shoulder: 11, hip: 23, knee: 25, ankle: 27 };
const RIGHT = { shoulder: 12, hip: 24, knee: 26, ankle: 28 };
const MIN_VISIBILITY = 0.55;
const REP_TOLERANCE = 5;
const SMOOTHING_WINDOW = 4;
const PHASE_CONFIRM_FRAMES = 2;
const MIN_REP_INTERVAL_MS = 250;
const REP_OVERSHOOT_TOLERANCE = 18;
const HIP_OVERSHOOT_TOLERANCE = 25;

function isLikelySquatExercise(routine) {
  const name = normalizeName(routine?.nombre_ejercicio);
  return name.includes('sentadilla') || name.includes('flexion profunda');
}

function getRepCalibration(profile, routine) {
  const isSquat = isLikelySquatExercise(routine);

  if (isSquat && profile.metric === 'knee') {
    return {
      phaseTolerance: 10,
      targetTolerance: 10,
      overshootTolerance: 34,
      minRepIntervalMs: 180,
      maxKneeDiff: 30,
      minBalancedRatio: 0.3,
      phaseConfirmFrames: 1,
      descendFromMinOffset: 24,
      peakFromMinOffset: 30,
    };
  }

  if (profile.tracking === 'both' && profile.metric === 'knee') {
    return {
      phaseTolerance: 7,
      targetTolerance: 9,
      overshootTolerance: 24,
      minRepIntervalMs: 220,
      maxKneeDiff: 34,
      minBalancedRatio: 0.2,
      phaseConfirmFrames: PHASE_CONFIRM_FRAMES,
      descendFromMinOffset: null,
      peakFromMinOffset: null,
    };
  }

  return {
    phaseTolerance: REP_TOLERANCE,
    targetTolerance: REP_TOLERANCE,
    overshootTolerance: profile.metric === 'hip' ? HIP_OVERSHOOT_TOLERANCE : REP_OVERSHOOT_TOLERANCE,
    minRepIntervalMs: MIN_REP_INTERVAL_MS,
    maxKneeDiff: 40,
    minBalancedRatio: 0,
    phaseConfirmFrames: PHASE_CONFIRM_FRAMES,
    descendFromMinOffset: null,
    peakFromMinOffset: null,
  };
}

function getRepTargets(profile, routine, minRange, maxRange, calibration) {
  if (isLikelySquatExercise(routine) && profile.metric === 'knee') {
    const descendTarget = Math.max(minRange + calibration.descendFromMinOffset, minRange + 8);
    const peakTarget = Math.max(minRange + calibration.peakFromMinOffset, minRange + 6);
    return {
      descendTarget: Math.max(28, Math.min(descendTarget, maxRange + calibration.overshootTolerance)),
      peakTarget: Math.max(32, Math.min(peakTarget, maxRange + calibration.overshootTolerance)),
      ascendTarget: minRange + calibration.phaseTolerance,
    };
  }

  return {
    descendTarget: maxRange - calibration.phaseTolerance,
    peakTarget: maxRange,
    ascendTarget: minRange + calibration.phaseTolerance,
  };
}

const EXERCISE_PROFILES = {
  'deslizamiento de talon': {
    zone: 'single-leg',
    tracking: 'affected',
    metric: 'knee',
    focusLabel: 'rodilla afectada',
    guidance: 'Desliza el talón sin despegar la cadera del apoyo.',
  },
  'contraccion de cuadriceps': {
    zone: 'single-leg',
    tracking: 'affected',
    metric: 'knee',
    focusLabel: 'cuádriceps y rodilla',
    guidance: 'Aprieta el muslo y extiende la rodilla con control.',
  },
  'elevacion de pierna recta': {
    zone: 'single-leg',
    tracking: 'affected',
    metric: 'hip',
    focusLabel: 'cadera y muslo',
    guidance: 'Eleva la pierna recta manteniendo la rodilla extendida.',
  },
  'flexion pasiva asistida': {
    zone: 'single-leg',
    tracking: 'affected',
    metric: 'knee',
    focusLabel: 'rodilla y muslo',
    guidance: 'Controla la flexión sin movimientos bruscos.',
  },
  'sentadilla parcial': {
    zone: 'bilateral-legs',
    tracking: 'both',
    metric: 'knee',
    focusLabel: 'ambas piernas',
    guidance: 'Baja en bloque y mantén rodillas alineadas.',
  },
  'step-ups (subir escalon)': {
    zone: 'bilateral-legs',
    tracking: 'both',
    metric: 'knee',
    focusLabel: 'piernas y escalón',
    guidance: 'Sube con control y evita impulsarte con el tronco.',
  },
  'extension de rodilla sentado': {
    zone: 'single-leg',
    tracking: 'affected',
    metric: 'knee',
    focusLabel: 'rodilla en extensión',
    guidance: 'Extiende la rodilla sentado sin mover la cadera.',
  },
  'curl de isquiotibiales': {
    zone: 'single-leg',
    tracking: 'affected',
    metric: 'knee',
    focusLabel: 'isquiotibiales y rodilla',
    guidance: 'Flexiona la rodilla activando la parte posterior del muslo.',
  },
  'balance en una pierna': {
    zone: 'single-leg',
    tracking: 'affected',
    metric: 'hip',
    focusLabel: 'cadera y estabilidad',
    guidance: 'Mantén la pelvis estable y el apoyo firme.',
  },
  'sentadilla completa': {
    zone: 'bilateral-legs',
    tracking: 'both',
    metric: 'knee',
    focusLabel: 'ambas piernas',
    guidance: 'Desciende de forma pareja y sin colapsar hacia adentro.',
  },
  'zancadas (lunges)': {
    zone: 'bilateral-legs',
    tracking: 'both',
    metric: 'knee',
    focusLabel: 'rodillas y caderas',
    guidance: 'Mantén el torso estable y controla el apoyo delantero.',
  },
  'puente de gluteos': {
    zone: 'pelvis',
    tracking: 'both',
    metric: 'hip',
    focusLabel: 'pelvis y glúteos',
    guidance: 'Eleva la pelvis sin arquear la zona lumbar.',
  },
  'flexion de rodilla boca abajo': {
    zone: 'single-leg',
    tracking: 'affected',
    metric: 'knee',
    focusLabel: 'rodilla posterior',
    guidance: 'Flexiona la rodilla boca abajo sin rotar la cadera.',
  },
  'marcha en el lugar': {
    zone: 'bilateral-legs',
    tracking: 'both',
    metric: 'hip',
    focusLabel: 'cadera y piernas',
    guidance: 'Eleva las rodillas alternando sin inclinar el torso.',
  },
  'elevacion alternada de rodillas': {
    zone: 'bilateral-legs',
    tracking: 'both',
    metric: 'hip',
    focusLabel: 'cadera y rodillas',
    guidance: 'Sube cada rodilla de forma alternada y controlada.',
  },
  'semi sentadilla': {
    zone: 'bilateral-legs',
    tracking: 'both',
    metric: 'knee',
    focusLabel: 'ambas piernas',
    guidance: 'Baja poco y conserva el eje de rodillas y pies.',
  },
  'paso largo hacia adelante': {
    zone: 'bilateral-legs',
    tracking: 'both',
    metric: 'knee',
    focusLabel: 'zancada frontal',
    guidance: 'Da un paso amplio controlando la rodilla delantera.',
  },
  'paso largo hacia atras': {
    zone: 'bilateral-legs',
    tracking: 'both',
    metric: 'knee',
    focusLabel: 'zancada posterior',
    guidance: 'Retrocede con control y mantén la rodilla alineada.',
  },
  'paso lateral': {
    zone: 'bilateral-legs',
    tracking: 'both',
    metric: 'knee',
    focusLabel: 'movimiento lateral',
    guidance: 'Desplázate al lado sin perder la alineación de las rodillas.',
  },
  'flexion profunda controlada': {
    zone: 'bilateral-legs',
    tracking: 'both',
    metric: 'knee',
    focusLabel: 'sentadilla profunda',
    guidance: 'Baja profundo pero con control total del tronco y rodillas.',
  },
};

function normalizeName(name) {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getExerciseProfile(routine) {
  const name = normalizeName(routine?.nombre_ejercicio);
  return EXERCISE_PROFILES[name] || {
    zone: 'single-leg',
    tracking: 'affected',
    metric: 'knee',
    focusLabel: 'rodilla afectada',
    guidance: 'Mantén el foco en la articulación trabajada.',
  };
}

function getTrackedSide(routine) {
  return routine?.rodilla_afectada === 'derecha' ? RIGHT : LEFT;
}

function getVisibleLandmarks(profile, side) {
  if (profile.zone === 'pelvis') {
    return [11, 12, 23, 24, 25, 26, 27, 28];
  }

  if (profile.tracking === 'both') {
    if (profile.metric === 'hip') {
      return [11, 12, 23, 24, 25, 26, 27, 28];
    }
    return [23, 24, 25, 26, 27, 28];
  }

  return [side.shoulder, side.hip, side.knee, side.ankle];
}

function getVisibleConnections(profile, side) {
  if (profile.zone === 'pelvis') {
    return [
      [11, 23],
      [12, 24],
      [23, 24],
      [23, 25],
      [24, 26],
      [25, 27],
      [26, 28],
    ];
  }

  if (profile.tracking === 'both') {
    return [
      [23, 24],
      [11, 23],
      [12, 24],
      [23, 25],
      [25, 27],
      [24, 26],
      [26, 28],
    ];
  }

  return [[side.shoulder, side.hip], [side.hip, side.knee], [side.knee, side.ankle]];
}

function getMetricPoints(profile, side, landmarks) {
  if (profile.metric === 'hip') {
    return {
      a: landmarks[side.shoulder],
      b: landmarks[side.hip],
      c: landmarks[side.knee],
    };
  }

  return {
    a: landmarks[side.hip],
    b: landmarks[side.knee],
    c: landmarks[side.ankle],
  };
}

function isReliable(point) {
  if (!point) return false;
  if (typeof point.visibility !== 'number') return true;
  return point.visibility >= MIN_VISIBILITY;
}

function getSideColor(side, trackedSide, profile) {
  if (profile.tracking === 'both') {
    return side === LEFT ? '#60a5fa' : '#22c55e';
  }
  return side === trackedSide ? '#22c55e' : '#94a3b8';
}

function computeAngleForSide(profile, side, landmarks) {
  const points = getMetricPoints(profile, side, landmarks);
  if (!isReliable(points.a) || !isReliable(points.b) || !isReliable(points.c)) {
    return null;
  }
  return calculateAngle(points.a, points.b, points.c);
}

function toMovementAngle(rawAngle) {
  return Number(Math.max(0, 180 - rawAngle).toFixed(2));
}

function getEffectiveAngle(profile, angleCandidates) {
  if (!angleCandidates.length) return null;

  if (profile.tracking === 'both' && profile.metric === 'knee') {
    const avg = angleCandidates.reduce((sum, item) => sum + item, 0) / angleCandidates.length;
    return Number(avg.toFixed(2));
  }

  return Math.max(...angleCandidates);
}

function isRepValidByPeak(profile, peakAngle, targetPeak, calibration) {
  const minTarget = Math.max(0, targetPeak - calibration.targetTolerance);
  const overshootTolerance = calibration.overshootTolerance;
  return peakAngle >= minTarget && peakAngle <= targetPeak + overshootTolerance;
}

function isSquatRepValidByForm({
  peakAngle,
  minRange,
  maxRange,
  bestKneeDiff,
  balancedRatio,
  calibration,
}) {
  const minimumDepth = Math.max(minRange + 12, maxRange - (calibration.targetTolerance + 6));
  const reachedDepth = peakAngle >= minimumDepth;
  const hasSymmetry =
    typeof bestKneeDiff === 'number' &&
    (bestKneeDiff <= calibration.maxKneeDiff || balancedRatio >= calibration.minBalancedRatio);

  return reachedDepth && hasSymmetry;
}

function playSuccessSound(audioContextRef, profile, routineId) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContextClass();
  }

  const ctx = audioContextRef.current;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const harmonic = ctx.createOscillator();
  const gain = ctx.createGain();

  const familyBase = profile.metric === 'hip' ? 740 : 620;
  const exerciseOffset = ((Number(routineId) || 0) % 6) * 22;
  const frequency = familyBase + exerciseOffset;

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, now);
  harmonic.type = 'triangle';
  harmonic.frequency.setValueAtTime(frequency * 2, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.28, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

  osc.connect(gain);
  harmonic.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  harmonic.start(now);
  osc.stop(now + 0.34);
  harmonic.stop(now + 0.34);
}

function playGoalReachedSound(audioContextRef) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContextClass();
  }

  const ctx = audioContextRef.current;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.34, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
  gain.connect(ctx.destination);

  const notes = [660, 880, 1046];
  notes.forEach((frequency, index) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, now + index * 0.12);
    osc.connect(gain);
    osc.start(now + index * 0.12);
    osc.stop(now + index * 0.12 + 0.18);
  });
}

export default function TherapyCamera({ routine, onFinish }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const panelRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [metrics, setMetrics] = useState({
    repsDone: 0,
    valid: 0,
    invalid: 0,
    avgAngle: 0,
    status: 'idle',
    angle: 0,
  });
  const [cameraError, setCameraError] = useState('');
  const phaseRef = useRef('up');
  const angleAccumulator = useRef([]);
  const repsDoneRef = useRef(0);
  const validRef = useRef(0);
  const invalidRef = useRef(0);
  const repReachedTargetRef = useRef(false);
  const repPeakAngleRef = useRef(0);
  const audioContextRef = useRef(null);
  const angleWindowRef = useRef([]);
  const downConfirmRef = useRef(0);
  const upConfirmRef = useRef(0);
  const lastRepAtRef = useRef(0);
  const repBestKneeDiffRef = useRef(null);
  const repBalancedFramesRef = useRef(0);
  const repTrackedFramesRef = useRef(0);
  const goalReachedRef = useRef(false);

  const maxReps = Number(routine?.repeticiones_objetivo ?? 10) || 10;
  const minRange = routine?.rango_min ?? 80;
  const maxRange = routine?.rango_max ?? 130;
  const exerciseProfile = useMemo(() => getExerciseProfile(routine), [routine]);
  const trackedSide = useMemo(() => getTrackedSide(routine), [routine]);
  const repCalibration = useMemo(() => getRepCalibration(exerciseProfile, routine), [exerciseProfile, routine]);
  const repTargets = useMemo(
    () => getRepTargets(exerciseProfile, routine, minRange, maxRange, repCalibration),
    [exerciseProfile, routine, minRange, maxRange, repCalibration],
  );
  const isSquatExercise = useMemo(() => isLikelySquatExercise(routine), [routine]);
  const activeTargetLabel = useMemo(() => {
    if (exerciseProfile.zone === 'pelvis') return 'pelvis y glúteos';
    if (exerciseProfile.tracking === 'both') return 'ambas piernas';
    return routine?.rodilla_afectada === 'derecha' ? 'pierna derecha' : 'pierna izquierda';
  }, [exerciseProfile, routine?.rodilla_afectada]);

  const resetSession = () => {
    phaseRef.current = 'up';
    angleAccumulator.current = [];
    repsDoneRef.current = 0;
    validRef.current = 0;
    invalidRef.current = 0;
    repReachedTargetRef.current = false;
    repPeakAngleRef.current = 0;
    angleWindowRef.current = [];
    downConfirmRef.current = 0;
    upConfirmRef.current = 0;
    lastRepAtRef.current = 0;
    repBestKneeDiffRef.current = null;
    repBalancedFramesRef.current = 0;
    repTrackedFramesRef.current = 0;
    goalReachedRef.current = false;
    setCameraError('');
    setMetrics({
      repsDone: 0,
      valid: 0,
      invalid: 0,
      avgAngle: 0,
      status: 'idle',
      angle: 0,
    });
  };

  const startTherapy = () => {
    resetSession();
    setRunning(true);
  };

  const finishTherapy = () => {
    setRunning(false);
    onFinish({
      repeticiones_validas: metrics.valid,
      repeticiones_invalidas: metrics.invalid,
      angulo_promedio: metrics.avgAngle,
      cumplio_objetivo: metrics.valid >= maxReps,
      repeticiones_totales: metrics.repsDone,
    });
  };

  const handleGoalReached = async ({ valid, invalid, avgAngle, repsDone }) => {
    if (goalReachedRef.current) return;
    goalReachedRef.current = true;
    setRunning(false);

    await Swal.fire({
      title: 'Objetivo completado',
      text: `Excelente trabajo. Completaste ${repsDone}/${maxReps} repeticiones (correctas: ${valid}).`,
      icon: 'success',
      confirmButtonText: 'Finalizar',
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    playGoalReachedSound(audioContextRef);

    onFinish({
      repeticiones_validas: valid,
      repeticiones_invalidas: invalid,
      angulo_promedio: avgAngle,
      cumplio_objetivo: true,
      repeticiones_totales: repsDone,
    });
  };

  useEffect(() => {
    if (!running || goalReachedRef.current) return;

    const reachedGoalByTotal = metrics.repsDone >= maxReps;
    const reachedGoalByValid = metrics.valid >= maxReps;
    if (!reachedGoalByTotal && !reachedGoalByValid) return;

    handleGoalReached({
      valid: metrics.valid,
      invalid: metrics.invalid,
      avgAngle: metrics.avgAngle,
      repsDone: metrics.repsDone,
    });
  }, [running, metrics.repsDone, metrics.valid, metrics.invalid, metrics.avgAngle, maxReps]);

  const feedbackClass = useMemo(() => {
    if (metrics.status === 'correct') return 'text-success';
    if (metrics.status === 'idle') return 'text-[var(--text-muted)]';
    if (metrics.status === 'too-flexed') return 'text-warning';
    return 'text-danger';
  }, [metrics.status]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      const panel = panelRef.current;
      if (panel?.requestFullscreen) {
        await panel.requestFullscreen();
      }
    } catch (err) {
      setCameraError(`No se pudo activar pantalla completa: ${err.message || err}`);
    }
  };

  useEffect(() => {
    if (!running || !videoRef.current) return undefined;

    const PoseClass = window.Pose;
    const CameraClass = window.Camera;

    if (!PoseClass || !CameraClass) {
      setCameraError('MediaPipe no cargado. Verifica conexión a internet.');
      setRunning(false);
      return undefined;
    }

    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setCameraError('La cámara requiere HTTPS. Accede al sitio con https:// para usar esta función.');
      setRunning(false);
      return undefined;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Tu navegador no permite acceso a la cámara en esta conexión. Se requiere HTTPS.');
      setRunning(false);
      return undefined;
    }

    const pose = new PoseClass({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    pose.onResults((results) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.poseLandmarks) {
        const visibleLandmarks = getVisibleLandmarks(exerciseProfile, trackedSide);
        const visibleConnections = getVisibleConnections(exerciseProfile, trackedSide);

        visibleConnections.forEach(([startIndex, endIndex]) => {
          const start = results.poseLandmarks[startIndex];
          const end = results.poseLandmarks[endIndex];
          if (!isReliable(start) || !isReliable(end)) return;

          const startSide = startIndex % 2 === 1 ? LEFT : RIGHT;
          const connectionColor = getSideColor(startSide, trackedSide, exerciseProfile);

          ctx.beginPath();
          ctx.strokeStyle = connectionColor;
          ctx.lineWidth = 3;
          ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
          ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
          ctx.stroke();
        });

        visibleLandmarks.forEach((landmarkIndex) => {
          const landmark = results.poseLandmarks[landmarkIndex];
          if (!isReliable(landmark)) return;

          const side = landmarkIndex % 2 === 1 ? LEFT : RIGHT;
          const pointColor = getSideColor(side, trackedSide, exerciseProfile);

          ctx.beginPath();
          ctx.fillStyle = pointColor;
          ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        const leftRawAngle = computeAngleForSide(exerciseProfile, LEFT, results.poseLandmarks);
        const rightRawAngle = computeAngleForSide(exerciseProfile, RIGHT, results.poseLandmarks);
        const trackedRawAngle = computeAngleForSide(exerciseProfile, trackedSide, results.poseLandmarks);

        const angleCandidates =
          exerciseProfile.tracking === 'both'
            ? [leftRawAngle, rightRawAngle].filter((value) => typeof value === 'number')
            : [trackedRawAngle].filter((value) => typeof value === 'number');

        if (angleCandidates.length) {
          const effectiveRawAngle = getEffectiveAngle(exerciseProfile, angleCandidates);
          if (effectiveRawAngle === null) return;

          const movementAngle = toMovementAngle(effectiveRawAngle);
          angleWindowRef.current.push(movementAngle);
          if (angleWindowRef.current.length > SMOOTHING_WINDOW) {
            angleWindowRef.current.shift();
          }

          const smoothedAngle =
            angleWindowRef.current.reduce((sum, item) => sum + item, 0) / angleWindowRef.current.length;
          const normalizedAngle = Number(smoothedAngle.toFixed(2));

          const now = performance.now();
          const status = getKneeStatus(normalizedAngle, minRange, maxRange);
          angleAccumulator.current.push(normalizedAngle);

          const leftMovementAngle =
            typeof leftRawAngle === 'number' ? toMovementAngle(leftRawAngle) : null;
          const rightMovementAngle =
            typeof rightRawAngle === 'number' ? toMovementAngle(rightRawAngle) : null;
          const kneeDiff =
            typeof leftMovementAngle === 'number' && typeof rightMovementAngle === 'number'
              ? Math.abs(leftMovementAngle - rightMovementAngle)
              : null;

          if (phaseRef.current === 'up') {
            if (normalizedAngle >= repTargets.descendTarget) {
              downConfirmRef.current += 1;
            } else {
              downConfirmRef.current = 0;
            }

            if (downConfirmRef.current >= repCalibration.phaseConfirmFrames) {
              phaseRef.current = 'down';
              repReachedTargetRef.current = normalizedAngle >= repTargets.peakTarget;
              repPeakAngleRef.current = normalizedAngle;
              repBestKneeDiffRef.current = kneeDiff;
              repBalancedFramesRef.current =
                typeof kneeDiff === 'number' && kneeDiff <= repCalibration.maxKneeDiff ? 1 : 0;
              repTrackedFramesRef.current = typeof kneeDiff === 'number' ? 1 : 0;
              downConfirmRef.current = 0;
              upConfirmRef.current = 0;
            }
          }

          if (phaseRef.current === 'down') {
            repPeakAngleRef.current = Math.max(repPeakAngleRef.current, normalizedAngle);

            if (typeof kneeDiff === 'number') {
              repTrackedFramesRef.current += 1;
              if (kneeDiff <= repCalibration.maxKneeDiff) {
                repBalancedFramesRef.current += 1;
              }

              if (repBestKneeDiffRef.current === null) {
                repBestKneeDiffRef.current = kneeDiff;
              } else {
                repBestKneeDiffRef.current = Math.min(repBestKneeDiffRef.current, kneeDiff);
              }
            }

            if (normalizedAngle >= repTargets.peakTarget) {
              repReachedTargetRef.current = true;
            }

            if (normalizedAngle <= repTargets.ascendTarget) {
              upConfirmRef.current += 1;
            } else {
              upConfirmRef.current = 0;
            }

            if (upConfirmRef.current >= repCalibration.phaseConfirmFrames) {
              phaseRef.current = 'up';
              downConfirmRef.current = 0;
              upConfirmRef.current = 0;
              let shouldNotifyGoal = false;
              let summaryForGoal = null;

              if (now - lastRepAtRef.current >= repCalibration.minRepIntervalMs) {
                repsDoneRef.current += 1;

                const validByPeak = isRepValidByPeak(
                  exerciseProfile,
                  repPeakAngleRef.current,
                  repTargets.peakTarget,
                  repCalibration,
                );

                const balancedRatio =
                  repTrackedFramesRef.current > 0
                    ? repBalancedFramesRef.current / repTrackedFramesRef.current
                    : 0;

                const validBySquatForm =
                  isSquatExercise &&
                  isSquatRepValidByForm({
                    peakAngle: repPeakAngleRef.current,
                    minRange,
                    maxRange,
                    bestKneeDiff: repBestKneeDiffRef.current,
                    balancedRatio,
                    calibration: repCalibration,
                  });

                const isValidRep = isSquatExercise
                  ? repReachedTargetRef.current && (validByPeak || validBySquatForm)
                  : repReachedTargetRef.current || validByPeak || validBySquatForm;

                if (isValidRep) {
                  validRef.current += 1;
                  playSuccessSound(audioContextRef, exerciseProfile, routine?.id);
                }
                // Siempre cuenta la repetición como mala si no fue válida
                if (!isValidRep) {
                  invalidRef.current += 1;
                }

                const avgAngleForGoal =
                  angleAccumulator.current.reduce((sum, item) => sum + item, 0) /
                  angleAccumulator.current.length;

                const reachedGoalByTotal = repsDoneRef.current >= maxReps;
                const reachedGoalByValid = validRef.current >= maxReps;

                if ((reachedGoalByTotal || reachedGoalByValid) && !goalReachedRef.current) {
                  shouldNotifyGoal = true;
                  summaryForGoal = {
                    valid: validRef.current,
                    invalid: invalidRef.current,
                    avgAngle: Number(avgAngleForGoal.toFixed(2)),
                    repsDone: repsDoneRef.current,
                  };
                }

                lastRepAtRef.current = now;
              }

              repReachedTargetRef.current = false;
              repPeakAngleRef.current = 0;
              repBestKneeDiffRef.current = null;
              repBalancedFramesRef.current = 0;
              repTrackedFramesRef.current = 0;

              if (shouldNotifyGoal && summaryForGoal) {
                handleGoalReached(summaryForGoal);
              }
            }
          }

          const avgAngle =
            angleAccumulator.current.reduce((sum, item) => sum + item, 0) /
            angleAccumulator.current.length;

          setMetrics({
            repsDone: repsDoneRef.current,
            valid: validRef.current,
            invalid: invalidRef.current,
            avgAngle: Number(avgAngle.toFixed(2)),
            status,
            angle: normalizedAngle,
          });
        }
      }

      ctx.restore();
    });

    const camera = new CameraClass(videoRef.current, {
      onFrame: async () => {
        await pose.send({ image: videoRef.current });
      },
      width: 960,
      height: 540,
    });

    camera.start().catch((err) => {
      setCameraError(`No se pudo acceder a la cámara: ${err.message || err}`);
      setRunning(false);
    });

    return () => {
      camera.stop();
      pose.close();
    };
  }, [running, maxRange, minRange, routine?.rodilla_afectada, exerciseProfile, trackedSide, repCalibration, repTargets, isSquatExercise]);

  return (
    <div className="medical-card space-y-4">
      {cameraError && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          ⚠️ {cameraError}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Módulo IA</p>
          <h3 className="text-lg font-semibold text-[var(--text-main)]">Vista de cámara con IA</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Zona activa: {activeTargetLabel} · Objetivo: {exerciseProfile.focusLabel}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {exerciseProfile.guidance}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={toggleFullscreen}>
            {isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          </button>
          {!running ? (
            <button className="btn-primary" onClick={startTherapy}>
              Iniciar terapia
            </button>
          ) : (
            <button className="btn-outline" onClick={finishTherapy}>
              Finalizar sesión
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div
          ref={panelRef}
          className="relative lg:col-span-2 overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface-2)] shadow-lg shadow-black/20"
        >
          <video ref={videoRef} className="hidden" playsInline />
          <canvas
            ref={canvasRef}
            className={`w-full ${isFullscreen ? 'h-screen object-contain bg-black' : 'h-full'}`}
          />

          <div className="pointer-events-none absolute left-3 top-3 right-3 z-10">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-white/20 bg-black/55 px-3 py-2 text-xs text-white backdrop-blur-sm">
              <span className="rounded-md bg-white/15 px-2 py-1">
                Reps: {metrics.repsDone}/{maxReps}
              </span>
              <span className="rounded-md bg-emerald-500/25 px-2 py-1 text-emerald-100">
                Buenas: {metrics.valid}
              </span>
              <span className="rounded-md bg-rose-500/25 px-2 py-1 text-rose-100">
                Malas: {metrics.invalid}
              </span>
              <span className="rounded-md bg-sky-500/25 px-2 py-1 text-sky-100">
                Angulo: {metrics.angle}°
              </span>
              <span className="rounded-md bg-amber-400/20 px-2 py-1 text-amber-100">
                Estado: {metrics.status}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4 text-sm">
          <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-panel)] p-3">
            <p className="text-[var(--text-muted)]">Ejercicio</p>
            <p className="font-semibold text-[var(--text-main)]">{routine?.nombre_ejercicio}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Foco: {exerciseProfile.focusLabel}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-panel)] p-3">
              <p className="text-xs text-[var(--text-muted)]">Rango</p>
              <p className="font-semibold text-[var(--text-main)]">{minRange}° - {maxRange}°</p>
            </div>
            <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-panel)] p-3">
              <p className="text-xs text-[var(--text-muted)]">Ángulo actual</p>
              <p className="font-semibold text-[var(--text-main)]">{metrics.angle}°</p>
            </div>
            <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-panel)] p-3">
              <p className="text-xs text-[var(--text-muted)]">Repeticiones</p>
              <p className="font-semibold text-[var(--text-main)]">{metrics.repsDone}/{maxReps}</p>
            </div>
            <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-panel)] p-3">
              <p className="text-xs text-[var(--text-muted)]">Estado</p>
              <p className={`font-semibold ${feedbackClass}`}>{metrics.status}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="flex-1 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-center text-success">
              Correctas: {metrics.valid}
            </span>
            <span className="flex-1 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-center text-danger">
              Incorrectas: {metrics.invalid}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
