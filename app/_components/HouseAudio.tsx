"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AUDIO_HELP, audioStatus, parseAudioCommand } from "@/lib/audio.mjs";

type LogLine = { id: number; text: string; kind?: "notice" | "error" };
type OutputMediaDevices = MediaDevices & { selectAudioOutput?: () => Promise<MediaDeviceInfo> };
type RoutedAudio = HTMLAudioElement & { setSinkId?: (sinkId: string) => Promise<void> };

export function HouseAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef("");
  const logId = useRef(1);
  const [fileName, setFileName] = useState("No audio selected");
  const [outputName, setOutputName] = useState("System default");
  const [paused, setPaused] = useState(true);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState<LogLine[]>([
    { id: 0, text: "Ready. Select a paired speaker, then choose audio from this device." },
  ]);

  const status = useMemo(
    () => audioStatus({ fileName, outputName, paused, volume, muted }),
    [fileName, outputName, paused, volume, muted],
  );

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  function write(text: string, kind?: "notice" | "error") {
    setLogs((current) => [...current.slice(-11), { id: logId.current++, text, kind }]);
  }

  async function selectSpeaker() {
    const mediaDevices = navigator.mediaDevices as OutputMediaDevices | undefined;
    const audio = audioRef.current as RoutedAudio | null;
    if (!mediaDevices?.selectAudioOutput || !audio?.setSinkId) {
      setOutputName("System default");
      write("This browser follows your device audio output. Pair the speaker in Bluetooth settings and select it as the system output.", "notice");
      return;
    }

    try {
      const device = await mediaDevices.selectAudioOutput();
      await audio.setSinkId(device.deviceId);
      const label = device.label || "Selected speaker";
      setOutputName(label);
      write(`Speaker selected: ${label}.`);
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      write(name === "NotAllowedError" || name === "AbortError" ? "Speaker selection was canceled." : "The speaker could not be selected. Check browser and device permissions.", name === "NotAllowedError" || name === "AbortError" ? "notice" : "error");
    }
  }

  function chooseFile() {
    fileRef.current?.click();
  }

  function loadFile(file?: File) {
    const audio = audioRef.current;
    if (!file || !audio) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    audio.src = objectUrlRef.current;
    audio.load();
    setFileName(file.name);
    setPaused(true);
    write(`Loaded from this device: ${file.name}.`);
  }

  async function run(raw: string) {
    const parsed = parseAudioCommand(raw);
    if (parsed.type === "error") {
      write(parsed.message ?? "That command is not available.", "error");
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;
    if (parsed.name === "help") write(AUDIO_HELP);
    if (parsed.name === "speaker") await selectSpeaker();
    if (parsed.name === "load") chooseFile();
    if (parsed.name === "pause") audio.pause();
    if (parsed.name === "stop") { audio.pause(); audio.currentTime = 0; }
    if (parsed.name === "mute") audio.muted = true;
    if (parsed.name === "unmute") audio.muted = false;
    if (parsed.name === "volume") {
      const level = typeof parsed.level === "number" ? parsed.level : 100;
      audio.volume = level / 100;
    }
    if (parsed.name === "clear") setLogs([]);
    if (parsed.name === "status") write(status);
    if (parsed.name === "play") {
      if (!audio.src) write("Choose an audio file first.", "notice");
      else {
        try { await audio.play(); }
        catch { write("Playback could not start. Check the selected file and speaker.", "error"); }
      }
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = command.trim();
    if (!value) return;
    write(`› ${value}`);
    setCommand("");
    void run(value);
  }

  return (
    <div className="house-audio">
      <section className="audio-control" aria-labelledby="audio-control-title">
        <p className="eyebrow">Browser audio</p>
        <h2 id="audio-control-title">Play through a paired speaker</h2>
        <ol className="audio-steps">
          <li><span>1</span><div><strong>Pair it first</strong><p>Open Bluetooth settings on this phone or computer and pair the house Echo or another speaker.</p></div></li>
          <li><span>2</span><div><strong>Choose the output</strong><p>Use Select speaker below. If your browser does not offer it, choose the speaker as your system output.</p></div></li>
          <li><span>3</span><div><strong>Choose your audio</strong><p>Select an audio file already on this device. It stays local and is never uploaded.</p></div></li>
        </ol>

        <div className="audio-output">
          <span aria-hidden="true" />
          <div><small>Current output</small><strong>{outputName}</strong></div>
        </div>
        <div className="audio-buttons">
          <button type="button" onClick={() => void selectSpeaker()}>Select speaker</button>
          <button className="button-secondary" type="button" onClick={chooseFile}>Choose audio</button>
          <input ref={fileRef} className="visually-hidden" type="file" accept="audio/*" onChange={(event) => loadFile(event.target.files?.[0])} />
        </div>
        <audio
          ref={audioRef}
          controls
          preload="metadata"
          aria-label="House audio player"
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onVolumeChange={(event) => { setVolume(event.currentTarget.volume); setMuted(event.currentTarget.muted); }}
        />
        <p className="audio-status">{status}</p>
        <p className="audio-privacy">Your audio stays in this browser tab. KPL does not upload, record, or save it.</p>
      </section>

      <details className="audio-cli">
        <summary><span>Optional</span> Use the simple command line</summary>
        <div className="audio-console" role="log" aria-live="polite">
          {logs.map((line) => <p key={line.id} data-kind={line.kind}>{line.text}</p>)}
        </div>
        <form onSubmit={submit} className="audio-command-form">
          <label className="visually-hidden" htmlFor="audio-command">Audio command</label>
          <span aria-hidden="true">›</span>
          <input id="audio-command" value={command} onChange={(event) => setCommand(event.target.value)} placeholder="Type help" autoComplete="off" spellCheck={false} />
          <button type="submit">Run</button>
        </form>
      </details>
    </div>
  );
}
