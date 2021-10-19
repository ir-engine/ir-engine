import processLiveGameEventsBasketball from "./processLiveGameEvents.basketball";

// Mutates boxScore!!!
const processLiveGameEvents = ({
  events,
  boxScore,
  overtimes,
  quarters,
}: {
  events: any[];
  boxScore: any;
  overtimes: number;
  quarters: any[]; // Basketball use strings
}) => {
  return processLiveGameEventsBasketball({
    events,
    boxScore,
    overtimes,
    quarters,
  });
};

export default processLiveGameEvents;
