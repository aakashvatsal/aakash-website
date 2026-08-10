import { apiPost } from "./api";

export type HsakaaChatRequest = {
  mode: string;
  message: string;
};

export type HsakaaChatResponse = {
  answer: string;
};

export async function askHsakaa(data: HsakaaChatRequest) {
  return apiPost<HsakaaChatResponse, HsakaaChatRequest>(
    "/hsakaa/chat",
    data
  );
}