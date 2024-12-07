import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupID');
    const fileId = searchParams.get('fileID');

    if (!groupId || !fileId) {
        return NextResponse.json(
            { error: 'Missing required parameters: groupId and fileId' },
            { status: 400 }
        );
    }

    const API_URL = `https://api.clinked.com/v3/groups/${groupId}/files/${fileId}/download`;
    const BEARER_TOKEN = process.env.TOKEN;

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${BEARER_TOKEN}`, // Replace <YOUR-TOKEN> with your actual token
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch document from the external API' },
                { status: response.status }
            );
        }

        // Create a response with the file's content and headers
        const fileHeaders = new Headers({
            'Content-Type': response.headers.get('Content-Type'),
            'Content-Disposition': response.headers.get('Content-Disposition'),
        });

        return new NextResponse(response.body, {
            status: 200,
            headers: fileHeaders,
        });
    } catch (error) {
        console.error('Error fetching the document:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
