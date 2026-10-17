import { useEffect } from "react";
import AppShell from "../components/AppShell";
import { useProgress } from "../features/progress/progressStorage";
import EpisodeIntroScreen from "../screens/EpisodeIntroScreen";
import HomeScreen from "../screens/HomeScreen";
import LearnScreen from "../screens/LearnScreen";
import NotebookScreen from "../screens/NotebookScreen";
import SettingsScreen from "../screens/SettingsScreen";
import StoryScreen from "../screens/StoryScreen";
import { navigate, useRoute } from "./router";

export default function App() {
  const route = useRoute();
  const { progress, update } = useProgress();

  useEffect(() => {
    document.documentElement.dataset.textSize = progress.settings.textSize;
  }, [progress.settings.textSize]);

  const beginEpisode = (episodeId: string) => {
    update((p) =>
      p.lastEpisodeId === episodeId && p.lastSceneId !== "learn" ? p : { ...p, lastEpisodeId: episodeId, lastSceneId: undefined },
    );
    navigate({ name: "play", episodeId });
  };

  let screen;
  switch (route.name) {
    case "intro":
      screen = <EpisodeIntroScreen episodeId={route.episodeId} progress={progress} onBegin={beginEpisode} />;
      break;
    case "play":
      screen = <StoryScreen key={route.episodeId} episodeId={route.episodeId} progress={progress} update={update} />;
      break;
    case "learn":
      screen = <LearnScreen episodeId={route.episodeId} step={route.step} progress={progress} update={update} />;
      break;
    case "notebook":
      screen = <NotebookScreen progress={progress} update={update} />;
      break;
    case "settings":
      screen = <SettingsScreen progress={progress} update={update} />;
      break;
    default:
      screen = <HomeScreen progress={progress} />;
  }

  return <AppShell route={route}>{screen}</AppShell>;
}
