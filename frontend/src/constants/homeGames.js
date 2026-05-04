export const HOME_GAME_ACTIONS = {
  OPEN_GUESS_HUB: "open-guess-hub",
  OPEN_SILHOUETTE: "open-silhouette",
  OPEN_UPCOMING_PLACEHOLDER: "open-upcoming-placeholder",
};

export const HOME_DAILY_GAMES = [
  {
    id: "guess-pokemon",
    titleKey: "home.daily_games.active_title",
    descriptionKey: "home.daily_games.active_desc",
    isEnabled: true,
    actionType: HOME_GAME_ACTIONS.OPEN_GUESS_HUB,
  },
  {
    id: "silhouette",
    titleKey: "home.daily_games.silhouette_title",
    descriptionKey: "home.daily_games.silhouette_desc",
    isEnabled: true,
    actionType: HOME_GAME_ACTIONS.OPEN_SILHOUETTE,
  },
  {
    id: "upcoming-game",
    titleKey: "home.daily_games.upcoming_title",
    descriptionKey: "home.daily_games.upcoming_desc",
    isEnabled: false,
    actionType: HOME_GAME_ACTIONS.OPEN_UPCOMING_PLACEHOLDER,
  },
];
