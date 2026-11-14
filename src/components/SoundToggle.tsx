import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sound } from "@/lib/sound";
import { cn } from "@/utils/cn";

const KEY = "save-the-date:sound";

export function SoundToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(() => {
    try {
      return localStorage.getItem(KEY) !== "off";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    sound.setEnabled(on);
    try {
      localStorage.setItem(KEY, on ? "on" : "off");
    } catch {
      /* private mode */
    }
  }, [on]);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !on;
        setOn(next);
        if (next) {
          sound.setEnabled(true);
          sound.unlock();
          sound.chime(0, 0.06);
        }
      }}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 backdrop-blur transition",
        className,
      )}
      aria-label={on ? "Mute scratch sounds" : "Turn on scratch sounds"}
      aria-pressed={on}
      title={on ? "Sound on" : "Sound off"}
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}
