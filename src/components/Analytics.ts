import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-N16Q3ME9BZ");
};

export const logPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};