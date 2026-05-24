// Inject NativeWind dark mode CSS variable before any JS loads
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `:root { --css-interop-darkMode: class; }`;
  document.head.appendChild(style);
}

import "expo-router/entry";
