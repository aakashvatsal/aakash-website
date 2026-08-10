async function parseError(
  response: Response,
) {
  try {
    const body =
      await response.json();

    if (
      typeof body?.message ===
      "string"
    ) {
      return body.message;
    }

    if (
      Array.isArray(
        body?.message,
      )
    ) {
      return body.message.join(
        ", ",
      );
    }

    if (
      typeof body?.error ===
      "string"
    ) {
      return body.error;
    }
  } catch {
    // Ignore invalid JSON.
  }

  return "Something went wrong.";
}

export async function loginAdmin(
  password: string,
) {
  const response =
    await fetch(
      "/api/admin/login",
      {
        method: "POST",

        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          password,
        }),
      },
    );

  if (!response.ok) {
    throw new Error(
      await parseError(
        response,
      ),
    );
  }

  return response.json();
}

export async function logoutAdmin() {
  const response =
    await fetch(
      "/api/admin/logout",
      {
        method: "POST",
        credentials:
          "include",
      },
    );

  if (!response.ok) {
    throw new Error(
      await parseError(
        response,
      ),
    );
  }

  return true;
}