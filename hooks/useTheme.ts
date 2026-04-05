import { Colors } from "@/constants/Colors";
import { useState } from "react";

let globalIsDark = false;
const listeners: ((isDark: boolean) => void)[] = [];

export function toggleTheme() {
  globalIsDark = !globalIsDark;
  listeners.forEach((fn) => fn(globalIsDark));
}

export function useTheme() {
  const [isDark, setIsDark] = useState(globalIsDark);

  useState(() => {
    listeners.push(setIsDark);
    return () => {
      const index = listeners.indexOf(setIsDark);
      listeners.splice(index, 1);
    };
  });

  const colors = isDark ? Colors.dark : Colors.light;
  return { colors, isDark };
}
