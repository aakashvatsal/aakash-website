import type {
  PublicMediaPost,
  PublicMediaQuery,
  PublicMediaResponse,
} from "@/types/public-media";

const API_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

interface MediaApiResponse {
  data: PublicMediaPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function buildQueryString(query: PublicMediaQuery) {
  const searchParams = new URLSearchParams();

  if (query.platform) {
    searchParams.set(
      "platform",
      query.platform,
    );
  }

  if (query.postType) {
    searchParams.set(
      "postType",
      query.postType,
    );
  }

  if (query.status) {
    searchParams.set(
      "status",
      query.status,
    );
  }

  if (query.page) {
    searchParams.set(
      "page",
      String(query.page),
    );
  }

  if (query.limit) {
    searchParams.set(
      "limit",
      String(query.limit),
    );
  }

  return searchParams.toString();
}

function getPublishedDate(
  post: PublicMediaPost,
) {
  return (
    post.publishing?.publishedAt ??
    post.date ??
    post.createdAt ??
    ""
  );
}

function filterPublicPosts(
  posts: PublicMediaPost[],
) {
  return posts
    .filter(
      (post) =>
        post.isActive !== false &&
        post.isArchived !== true &&
        post.isPrivate !== true,
    )
    .sort((firstPost, secondPost) => {
      const firstDate = new Date(
        getPublishedDate(firstPost),
      ).getTime();

      const secondDate = new Date(
        getPublishedDate(secondPost),
      ).getTime();

      return secondDate - firstDate;
    });
}

function emptyResponse(
  limit: number,
): PublicMediaResponse {
  return {
    items: [],
    pagination: {
      page: 1,
      limit,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

export async function getMediaPosts(
  query: PublicMediaQuery = {},
): Promise<PublicMediaResponse> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 100;

  const queryString = buildQueryString({
    ...query,
    page,
    limit,
  });

  const endpoint = `${API_URL}/media${
    queryString
      ? `?${queryString}`
      : ""
  }`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const responseText =
        await response
          .text()
          .catch(() => "");

      console.error(
        "Unable to fetch media posts:",
        {
          endpoint,
          status: response.status,
          response: responseText,
        },
      );

      return emptyResponse(limit);
    }

    const result =
      (await response.json()) as MediaApiResponse;

    if (!Array.isArray(result.data)) {
      console.error(
        "Invalid media API response: data must be an array.",
        result,
      );

      return emptyResponse(limit);
    }

    const posts = filterPublicPosts(
      result.data,
    );

    const pagination =
      result.pagination;

    return {
      items: posts,
      pagination: {
        page:
          pagination?.page ?? page,

        limit:
          pagination?.limit ?? limit,

        total:
          pagination?.total ??
          posts.length,

        totalPages:
          pagination?.totalPages ??
          (posts.length > 0 ? 1 : 0),

        hasNextPage:
          pagination
            ? pagination.page <
              pagination.totalPages
            : false,

        hasPreviousPage:
          pagination
            ? pagination.page > 1
            : false,
      },
    };
  } catch (error) {
    console.error(
      "Failed to fetch public media posts:",
      error,
    );

    return emptyResponse(limit);
  }
}