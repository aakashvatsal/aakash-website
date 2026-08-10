import {
  NowPage,
} from "@/components/features/now/NowPage";

import {
  getNowHistory,
  getPublicNowStatus,
} from "@/lib/now";

export default async function Page() {
  const [
    now,
    history,
  ] =
    await Promise.all([
      getPublicNowStatus(),

      getNowHistory(
        1,
        7,
      ),
    ]);

  return (
    <NowPage
      now={
        now
      }
      history={
        history.data
      }
    />
  );
}