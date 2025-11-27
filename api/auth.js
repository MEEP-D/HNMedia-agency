module.exports = async (req, res) => {
  // Bypass Vercel authentication
  res.setHeader('X-Vercel-Protection-Bypass', '1');
  res.setHeader('X-Vercel-Skip-Sso', '1');
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ 
        error: 'Missing authorization code',
        message: 'No code parameter provided'
      });
    }
    
    // GitHub OAuth token exchange
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID || 'Ov23lio2L0EkJ9lpqLt9',
        client_secret: process.env.GITHUB_CLIENT_SECRET || 'ed3801bbef7fff65cab3147033a68e659fcb0378',
        code: code,
        state: state
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      return res.status(400).json({
        error: tokenData.error,
        error_description: tokenData.error_description
      });
    }
    
    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': 'Decap-CMS'
      }
    });
    
    const userData = await userResponse.json();
    
    // Return success response
    res.status(200).json({
      token: tokenData.access_token,
      user: {
        login: userData.login,
        name: userData.name,
        email: userData.email,
        avatar_url: userData.avatar_url
      }
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};