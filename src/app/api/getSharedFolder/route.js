const BEARER_TOKEN = process.env.TOKEN;

export async function GET(request) {
  const baseHeaders = {
    Authorization: `Bearer ${BEARER_TOKEN}`, // Use environment variables in production
  };

  // Extract `groupId` from query parameters
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return new Response(
      JSON.stringify({ error: "Missing required parameter: groupId" }),
      {
        status: 400,
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },

      }
    );
  }

  const firstApiUrl = `https://api.clinked.app/v3/groups/${groupId}/files?path=03_client_shared_folder`;

  try {
    // Fetch data from the first API
    const firstResponse = await fetch(firstApiUrl, { headers: baseHeaders });
    if (!firstResponse.ok) {
      throw new Error(
        `First API call failed with status: ${firstResponse.status}`
      );
    }
    const firstData = await firstResponse.json();

    // Extract the `id` for the second API call
    const folderId = firstData.id;
    if (!folderId) {
      throw new Error("Folder ID not found in the first API response.");
    }

    // Fetch data from the second API
    const secondApiUrl = `https://api.clinked.app/v3/groups/${groupId}/filesList?parent=${folderId}`;
    const secondResponse = await fetch(secondApiUrl, { headers: baseHeaders });
    if (!secondResponse.ok) {
      throw new Error(
        `Second API call failed with status: ${secondResponse.status}`
      );
    }
    const secondData = await secondResponse.json();

    // Return the combined result
    return new Response(JSON.stringify(secondData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
