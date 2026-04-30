'use client';

import React, { useRef, useState } from 'react';

export default function RhythmShield() {
  const audioCtx = useRef<AudioContext | null>(null);
  const currentNodes = useRef<any[]>([]);
  const [activeMode, setActiveMode] = useState<number | null>(null);

  const initAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') audioCtx.current.resume();
  };

  const clearAudio = () => {
    // Плавное затухание перед отключением, чтобы не было щелчка
    currentNodes.current.forEach(node => {
      try { node.disconnect(); } catch (e) {}
    });
    currentNodes.current = [];
  };

  // --- Генераторы «железа» ---
  const createPinkNoise = (ctx: AudioContext) => {
    const bufferSize = 4096;
    const node = ctx.createScriptProcessor(bufferSize, 1, 1);
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
    node.onaudioprocess = (e) => {
      const out = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759; b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856; b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    };
    return node;
  };

  const createBrownNoise = (ctx: AudioContext) => {
    const bufferSize = 4096;
    const node = ctx.createScriptProcessor(bufferSize, 1, 1);
    let lastOut = 0.0;
    node.onaudioprocess = (e) => {
      const out = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        out[i] = lastOut * 3.5;
      }
    };
    return node;
  };

  // --- РЕЖИМЫ ---

  const startMode = (mode: number) => {
    initAudio();
    clearAudio();
    const ctx = audioCtx.current!;
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0, ctx.currentTime);
    mainGain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 2); // Плавный вход 2 сек

    if (mode === 1) { // СОН (Глубокий коричневый шум)
      const brown = createBrownNoise(ctx);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 100;
      brown.connect(lp); lp.connect(mainGain);
      currentNodes.current.push(brown, lp);
    } 
    else if (mode === 2) { // ЩИТ (Твой барьер против города)
      const pink = createPinkNoise(ctx);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 200;
      pink.connect(hp); hp.connect(mainGain);
      currentNodes.current.push(pink, hp);
    }
    else if (mode === 3) { // РАБОТА (Бета-фокус)
      const pink = createPinkNoise(ctx);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 1000; bp.Q.value = 0.5;
      pink.connect(bp); bp.connect(mainGain);
      currentNodes.current.push(pink, bp);
    }
    else if (mode === 4) { // ТИШИНА (Твоя адаптивная парейдолия)
      const brown = createBrownNoise(ctx);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 400;
      brown.connect(lp); lp.connect(mainGain);
      currentNodes.current.push(brown, lp);
    }

    mainGain.connect(ctx.destination);
    currentNodes.current.push(mainGain);
    setActiveMode(mode);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-gray-400 flex flex-col items-center justify-center p-4 font-sans tracking-tight">
      <div className="max-w-xs w-full space-y-6">
        <header className="text-center mb-10">
          <h1 className="text-xl font-extralight tracking-[0.3em] text-emerald-500 uppercase">Rhythm Shield</h1>
          <div className="h-px w-12 bg-emerald-900 mx-auto mt-4"></div>
        </header>

        <div className="space-y-3">
          {[
            { id: 1, name: 'Сон', desc: 'Глубокий демпфер' },
            { id: 2, name: 'Щит', desc: 'Городской барьер' },
            { id: 3, name: 'Работа', desc: 'Фокус-ритм' },
            { id: 4, name: 'Тишина', desc: 'Адаптивный покой' }
          ].map((m) => (
            <button key={m.id} onClick={() => startMode(m.id)}
              className={`w-full p-5 rounded-xl border transition-all duration-700 flex flex-col items-start ${activeMode === m.id ? 'border-emerald-500 bg-emerald-500/5' : 'border-neutral-900 hover:border-neutral-700'}`}>
              <span className={`text-sm uppercase tracking-widest ${activeMode === m.id ? 'text-emerald-400' : 'text-neutral-500'}`}>{m.name}</span>
              <span className="text-[10px] opacity-40 uppercase mt-1">{m.desc}</span>
            </button>
          ))}
        </div>

        <button onClick={() => { clearAudio(); setActiveMode(null); }}
          className="w-full py-4 text-[10px] uppercase tracking-[0.2em] text-neutral-600 hover:text-red-900 transition-colors">
          Сброс системы
        </button>
      </div>
    </main>
  );
}
