export type Platform = 'instagram'|'youtube'|'linkedin'|'x'|'whatsapp';
export type StudioPost = {
  id:string; date:string; platform:Platform;format:string;seriesKey:string;seriesName:string;
  title:string;hook:string;hookAlternatives:string[];copy:string;script:string;
  caption:string;shotLocation:string;shotList:Array<{time:string;shot:string;direction:string;spokenLine?:string}>;
  slides:Array<{headline:string;copy:string;visual:string}>;cover:string;hashtags:string[];
  pinnedComment:string;storyArc?:string;evidenceId?:string;
  editorial?:{score:number;pass:boolean;dimensions:Record<string,number>;issues:string[];version:string};
  trend?:{status:'evergreen'|'verified_signal';title?:string;source?:string;url?:string;publishedAt?:string};
  status:'ready'|'needs_review'|'needs_input'|'writing_failed';reason:string;
};
export type StudioOverview = {
  today:string;through:string;activeSeriesCount:number;seriesReady:boolean;minActive:number;maxActive:number;missingRequiredChannels?:string[];
  days:Array<{date:string;status:string;error?:string|null;posts:StudioPost[];
    usage?:{calls:number;inputTokens:number;outputTokens:number;reasoningTokens:number;outputReserved:number;maxCalls:number;maxOutputBudget:number};
    counts:{total:number;ready:number;needsInput:number;needsReview:number;writingFailed?:number}}>;
};
export type StudioGrowth = {generatedAt:string;goal:string;
  platforms:Array<{platform:string;followers:number|null;weeklyChange:number|null;target:number;remaining:number|null;note:string}>;
  weeklyAudienceNote:string;audienceSignals?:Array<{type:string;topic:string;summary:string;occurrences:number;platforms:string[];recommendedContentAngle:string;confidence:number}>;publications:Array<{publicationId:string;platform:string;ageHours:number;
    review24:{status:string;metrics?:Record<string,number>};review72:{status:string;metrics?:Record<string,number>}}>;
};
export type StudioRelease = {
  today:string;through:string;packages:Array<{key:string;date:string;id:string;title:string;platform:string;seriesKey:string;
    writingStatus:string;publicationId:string|null;productionStatus:string;deliveryStatus:string;
    scheduledAt:string|null;publishedAt:string|null;externalPostUrl:string|null}>;
};
export type StudioReleaseAnalytics = {generatedAt:string;note:string;
  series:Array<{seriesKey:string;published:number;measured48:number;measured96:number;
    views48:number;views96:number;shares96:number;saves96:number}>;
  posts:Array<{publicationId:string;platform:string;seriesKey:string;ageHours:number;
    review48:{status:string;views?:number;shares?:number;saves?:number;averageWatchPercentage?:number|null};
    review96:{status:string;views?:number;shares?:number;saves?:number;averageWatchPercentage?:number|null}}>;
};
export type Series = {key:string;name:string;status:string;channels:string[];angle:string;audience?:string;
  sourceTopics?:string[];topicKeywords?:string[];creativeDirection?:string;published:number;measured:number};
export type SeriesPitch = {name:string;angle:string;channels:string[];audience?:string;sourceTopics?:string[];
  topicKeywords?:string[];creativeDirection?:string};
export type SeriesReview = {score:number;verdict:string;aiAssisted:boolean;strengths:string[];risks:string[];
  improvements:string[];warning?:string;creativeKit?:{hookPatterns:string[];episodeIdeas:string[];visualIdentity:string}};
export async function studioRequest<T>(path:string,method='GET',body?:unknown):Promise<T>{
  const response=await fetch(`/api/admin/backend/media/${path}`,{
    method,cache:'no-store',
    headers:{'Content-Type':'application/json'},
    ...(body!==undefined?{body:JSON.stringify(body)}:{})
  });
  const value=await response.json().catch(()=>({message:`HTTP ${response.status}`}));
  if(!response.ok)throw new Error(Array.isArray(value.message)?value.message.join(', '):value.message||value.error||`HTTP ${response.status}`);
  return value as T;
}
