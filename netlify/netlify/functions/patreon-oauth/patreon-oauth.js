exports.handler = async (event, context) => {
  // Allow CORS requests from any origin
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST',
  };

  if (event.httpMethod === 'OPTIONS') {
    // Handle CORS preflight requests
    return {
      statusCode: 200,
      headers,
      body: 'CORS Preflight',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: 'Method Not Allowed',
    };
  }

  // Extract the authorization code from the request body
  const { code } = JSON.parse(event.body);

  if (!code) {
    return {
      statusCode: 400,
      headers,
      body: 'Authorization code is required',
    };
  }

  const client_id = 'DCmpYjAt5oF-1poN2N_hW22VXTuz8BNIOPk1yeoctffuvobAJCu8I7N7fKc1ngMp';
  const redirect_uri = 'https://benis-boy.github.io/SSJ/'; // Make sure this matches the one registered in Patreon

  const token_url = 'https://www.patreon.com/api/oauth2/token?';

  try {
    // Send a POST request to exchange the authorization code for an access token
    const response = await fetch(token_url + new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id,
      redirect_uri,
    }).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const token = await response.json();

    if (response.ok) {

      const userDataResponse = await fetch('https://www.patreon.com/api/oauth2/v2/identity?' + new URLSearchParams({
        "include": "memberships",
        "fields[user]": "full_name",
        "fields[member]": "currently_entitled_amount_cents,lifetime_support_cents,patron_status"
      }), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      if (!userDataResponse.ok) {
        throw new Error('Failed to fetch user info from Patreon: ' + await userDataResponse.text());
      }
      const userInfo = await response.json();
      console.log(userInfo);

      // Return the access token to the frontend
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(token),
      };
    } else {
      // Handle errors from Patreon API
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify(token),
      };
    }
  } catch (error) {
    // Handle network or other errors
    return {
      statusCode: 500,
      headers,
      body: 'Error fetching token from Patreon: ' + error.message,
    };
  }
};
