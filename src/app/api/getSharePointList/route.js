import axios from "axios";
import { NextResponse } from 'next/server';

const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const siteId = process.env.SITE_ID;
const listId = process.env.LIST_ID;

async function getAccessToken() {
  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: clientId,
    scope: "https://graph.microsoft.com/.default",
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get access token: ${error.error_description}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function GET(req) {
    try {
      // Parse query parameters from the request
      const { searchParams } = new URL(req.url);

      // console.log("tenantId:"+tenantId);
      // console.log("clientId:"+clientId);
      // console.log("clientSecret:"+clientSecret);
      // console.log("siteId:"+siteId);
      // console.log("listId:"+listId);
      
      const token = await getAccessToken();
  
      if (!siteId || !listId || !token) {
        return NextResponse.json(
          { error: "Missing required query parameters." },
          { status: 400 }
        );
      }
  
      // Graph API endpoint for SharePoint list items
      const graphEndpoint = `https://graph.microsoft.com/v1.0/sites/root/lists/${listId}/items?$expand=fields($select=UserName,Password,Email)`;
      
  
      // Fetch data from Graph API
      const response = await axios.get(graphEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Return the response data as JSON
      return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
      console.error(error.response?.data || error.message);
      return NextResponse.json(
        { error: error.response?.data || error.message },
        { status: error.response?.status || 500 }
      );
    }
  }
  