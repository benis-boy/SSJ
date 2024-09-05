const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  // Extract the authorization code from the request body
  const { code } = JSON.parse(event.body);

  if (!code) {
    return {
      statusCode: 400,
      body: 'Authorization code is required',
    };
  }

  const client_id = 'YOUR_CLIENT_ID';
  const client_secret = 'YOUR_CLIENT_SECRET';
  const redirect_uri = 'YOUR_REDIRECT_URI'; // Make sure this matches the one registered in Patreon

  const token_url = 'https://www.patreon.com/api/oauth2/token';

  try {
    // Send a POST request to exchange the authorization code for an access token
    const response = await fetch(token_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id,
        client_secret,
        redirect_uri,
      }).toString(),
    });

    const data = await response.json();

    if (response.ok) {
      // Return the access token to the frontend
      return {
        statusCode: 200,
        body: JSON.stringify({ token: data.access_token }),
      };
    } else {
      // Handle errors from Patreon API
      return {
        statusCode: response.status,
        body: JSON.stringify(data),
      };
    }
  } catch (error) {
    // Handle network or other errors
    return {
      statusCode: 500,
      body: 'Error fetching token from Patreon',
    };
  }
};
