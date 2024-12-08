import { NextResponse } from 'next/server';

export async function GET() {
  const BASE_URL = 'https://api.clinked.com/v3/accounts/21680/groups';
  const BEARER_TOKEN = process.env.TOKEN;

  let allItems = [];
  // let currentPage = 1;
  // const pageSize = 100; // Keep this consistent with your API response

  
try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: response.statusText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Validate and collect items
    if (data.items && Array.isArray(data.items)) {
      allItems = allItems.concat(data.items);
    } else {
      console.warn(`Unexpected response format on page :`, data);
    }    

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
