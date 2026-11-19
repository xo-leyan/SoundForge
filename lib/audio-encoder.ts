/**
 * High-performance, zero-dependency AudioBuffer to WAV converter
 * Generates standard 16-bit linear PCM WAV files compatible with all DAWs and players
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const numSamples = buffer.length * numChannels;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * bytesPerSample;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const dataView = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      dataView.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF Chunk Descriptor
  writeString(0, "RIFF");
  dataView.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");

  // "fmt " sub-chunk
  writeString(12, "fmt ");
  dataView.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  dataView.setUint16(20, format, true); // AudioFormat
  dataView.setUint16(22, numChannels, true); // NumChannels
  dataView.setUint32(24, sampleRate, true); // SampleRate
  dataView.setUint32(28, byteRate, true); // ByteRate
  dataView.setUint16(32, blockAlign, true); // BlockAlign
  dataView.setUint16(34, bitDepth, true); // BitsPerSample

  // "data" sub-chunk
  writeString(36, "data");
  dataView.setUint32(40, dataSize, true);

  // Write interleaved PCM samples
  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channelData.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channelData[ch][i];
      // Clamp between -1.0 and 1.0
      sample = Math.max(-1, Math.min(1, sample));
      // Scale to 16-bit signed integer
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      dataView.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

/**
 * Creates synthetic musical audio clips (Lead synth, 808 Bass, Drums, Chords, Click)
 * This allows SoundForge to work out-of-the-box with instant audio previews!
 */
export function generateSyntheticAudio(
  type: "synth" | "bass" | "drums" | "chords" | "click",
  durationSec = 8,
  bpm = 120
): AudioBuffer {
  const sampleRate = 44100;
  const numFrames = Math.floor(sampleRate * durationSec);
  const offlineCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const buffer = offlineCtx.createBuffer(2, numFrames, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const beatSec = 60 / bpm;

  if (type === "synth") {
    // Melodic Arpeggio (C minor / Eb / G / Bb)
    const notes = [261.63, 311.13, 392.0, 466.16, 523.25, 466.16, 392.0, 311.13];
    const noteDuration = beatSec / 2; // eighth notes
    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const noteIndex = Math.floor(t / noteDuration) % notes.length;
      const freq = notes[noteIndex];
      const noteTime = t % noteDuration;
      const env = Math.exp(-noteTime * 4); // percussive envelope
      const wave = Math.sin(2 * Math.PI * freq * t) * 0.6 + Math.sin(4 * Math.PI * freq * t) * 0.3;
      const sample = wave * env * 0.4;
      left[i] = sample;
      right[i] = sample;
    }
  } else if (type === "bass") {
    // 808 Deep Sub Bass pattern
    const bassNotes = [65.41, 65.41, 77.78, 58.27]; // C2, C2, Eb2, Bb1
    const barDuration = beatSec * 4;
    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const barIndex = Math.floor(t / barDuration) % bassNotes.length;
      const freq = bassNotes[barIndex];
      const barTime = t % barDuration;
      const env = Math.max(0, 1 - (barTime % (beatSec * 2)) * 0.5);
      const wave = Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(2 * Math.PI * (freq * 2) * t);
      const sample = wave * env * 0.5;
      left[i] = sample;
      right[i] = sample;
    }
  } else if (type === "drums") {
    // Four-on-the-floor Kick + Hi-hat + Snare beat
    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const beat = (t / beatSec) % 4;
      let sample = 0;

      // Kick on 0, 1, 2, 3
      const kickTime = (t / beatSec) % 1;
      if (kickTime < 0.2) {
        const kickFreq = 150 * Math.exp(-kickTime * 30);
        const kickEnv = Math.exp(-kickTime * 15);
        sample += Math.sin(2 * Math.PI * kickFreq * kickTime) * kickEnv * 0.8;
      }

      // Snare on 1 and 3
      const snareTime = ((t / beatSec) + 3) % 2;
      if (snareTime < 0.25) {
        const noise = (Math.random() * 2 - 1) * Math.exp(-snareTime * 16);
        const tone = Math.sin(2 * Math.PI * 180 * snareTime) * Math.exp(-snareTime * 20);
        sample += (noise * 0.5 + tone * 0.4);
      }

      // Hi-hat on every eighth note
      const hatTime = ((t / beatSec) * 2) % 1;
      if (hatTime < 0.05) {
        const hat = (Math.random() * 2 - 1) * Math.exp(-hatTime * 80);
        sample += hat * 0.25;
      }

      left[i] = Math.max(-1, Math.min(1, sample));
      right[i] = Math.max(-1, Math.min(1, sample));
    }
  } else {
    // General ambient chord pad
    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const wave =
        Math.sin(2 * Math.PI * 220 * t) * 0.2 +
        Math.sin(2 * Math.PI * 277.18 * t) * 0.2 +
        Math.sin(2 * Math.PI * 329.63 * t) * 0.2;
      left[i] = wave;
      right[i] = wave;
    }
  }

  return buffer;
}
