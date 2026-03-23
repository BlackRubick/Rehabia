import { useEffect, useMemo, useRef, useState } from 'react';
import { calculateAngle, getKneeStatus } from '../lib/poseMath';

const LEFT = { hip: 23, knee: 25, ankle: 27 };
const RIGHT = { hip: 24, knee: 26, ankle: 28 };

export default function TherapyCamera({ routine, onFinish }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
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

  const maxReps = routine?.repeticiones_objetivo ?? 10;
  const minRange = routine?.rango_min ?? 80;
  const maxRange = routine?.rango_max ?? 130;

  const feedbackClass = useMemo(() => {
    if (metrics.status === 'correct') return 'text-success';
    if (metrics.status === 'idle') return 'text-slate-300';
    if (metrics.status === 'too-flexed') return 'text-warning';
    return 'text-danger';
  }, [metrics.status]);

  useEffect(() => {
    if (!running || !videoRef.current) return undefined;

    const PoseClass = window.Pose;
    const CameraClass = window.Camera;
    const drawConnectors = window.drawConnectors;
    const drawLandmarks = window.drawLandmarks;

    if (!PoseClass || !CameraClass || !drawConnectors || !drawLandmarks) {
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
        drawConnectors(ctx, results.poseLandmarks, PoseClass.POSE_CONNECTIONS, {
          color: '#38bdf8',
          lineWidth: 3,
        });
        drawLandmarks(ctx, results.poseLandmarks, {
          color: '#22c55e',
          lineWidth: 1,
          radius: 3,
        });

        const side = routine?.rodilla_afectada === 'derecha' ? RIGHT : LEFT;
        const hip = results.poseLandmarks[side.hip];
        const knee = results.poseLandmarks[side.knee];
        const ankle = results.poseLandmarks[side.ankle];

        if (hip && knee && ankle) {
          const angle = calculateAngle(hip, knee, ankle);
          const status = getKneeStatus(angle, minRange, maxRange);
          angleAccumulator.current.push(angle);

          // Guardar el último status para saber si la repetición fue correcta
          phaseRef.currentStatus = status;

          if (phaseRef.current === 'up' && angle <= minRange + 5) {
            phaseRef.current = 'down';
          }

          if (phaseRef.current === 'down' && angle >= maxRange - 5) {
            phaseRef.current = 'up';
            repsDone += 1;
            if (phaseRef.currentStatus === 'correct') valid += 1;
            else invalid += 1;
          }

          const avgAngle =
            angleAccumulator.current.reduce((sum, item) => sum + item, 0) /
            angleAccumulator.current.length;

          setMetrics({
            repsDone,
            valid,
            invalid,
            avgAngle: Number(avgAngle.toFixed(2)),
            status,
            angle,
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
  }, [running, maxRange, minRange, routine?.rodilla_afectada]);

  const finish = () => {
    setRunning(false);
    onFinish({
      repeticiones_validas: metrics.valid,
      repeticiones_invalidas: metrics.invalid,
      angulo_promedio: metrics.avgAngle,
      cumplio_objetivo: metrics.valid >= maxReps,
      repeticiones_totales: metrics.repsDone,
    });
  };

  return (
    <div className="medical-card space-y-4">
      {cameraError && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          ⚠️ {cameraError}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Módulo IA</p>
          <h3 className="text-lg font-semibold text-slate-100">Vista de cámara con IA</h3>
        </div>
        <div className="flex gap-2">
          {!running ? (
            <button className="btn-primary" onClick={() => setRunning(true)}>
              Iniciar terapia
            </button>
          ) : (
            <button className="btn-outline" onClick={finish}>
              Finalizar sesión
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-slate-800 bg-black shadow-lg shadow-black/40">
          <video ref={videoRef} className="hidden" playsInline />
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>

        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-sm">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
            <p className="text-slate-400">Ejercicio</p>
            <p className="font-semibold text-slate-100">{routine?.nombre_ejercicio}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-400">Rango</p>
              <p className="font-semibold text-slate-100">{minRange}° - {maxRange}°</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-400">Ángulo actual</p>
              <p className="font-semibold text-slate-100">{metrics.angle}°</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-400">Repeticiones</p>
              <p className="font-semibold text-slate-100">{metrics.repsDone}/{maxReps}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-400">Estado</p>
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
