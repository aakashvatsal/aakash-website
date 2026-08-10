import {
  HsakaaPage,
} from "@/components/features/hsakaa/HsakaaPage";

import {
  getHsakaaLiveContext,
} from "@/lib/hsakaa";

export default async function Page() {
  const {
    now,
    items,
  } =
    await getHsakaaLiveContext();

  return (
    <HsakaaPage
      now={now}
      liveContext={items}
    />
  );
}