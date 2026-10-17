import { useEffect, useState } from "react";

// Tiny hash router: keeps the current screen across refreshes without React Router.
export type Route =
  | { name: "home" }
  | { name: "intro"; episodeId: string }
  | { name: "play"; episodeId: string }
  | { name: "learn"; episodeId: string; step?: string }
  | { name: "notebook" }
  | { name: "career" }
  | { name: "missions" }
  | { name: "settings" };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] === "ep" && parts[1]) {
    if (parts[2] === "play") return { name: "play", episodeId: parts[1] };
    if (parts[2] === "learn") return { name: "learn", episodeId: parts[1], step: parts[3] };
    return { name: "intro", episodeId: parts[1] };
  }
  if (parts[0] === "notebook") return { name: "notebook" };
  if (parts[0] === "career") return { name: "career" };
  if (parts[0] === "missions") return { name: "missions" };
  if (parts[0] === "settings") return { name: "settings" };
  return { name: "home" };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case "intro":
      return `#/ep/${route.episodeId}`;
    case "play":
      return `#/ep/${route.episodeId}/play`;
    case "learn":
      return `#/ep/${route.episodeId}/learn${route.step ? `/${route.step}` : ""}`;
    case "notebook":
      return "#/notebook";
    case "career":
      return "#/career";
    case "missions":
      return "#/missions";
    case "settings":
      return "#/settings";
    default:
      return "#/";
  }
}

export function navigate(route: Route) {
  window.location.hash = routeToHash(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
