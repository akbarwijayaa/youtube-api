import React, { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const CLIENT_ID = 'CLIENT_ID';
const CLIENT_SECRET = 'CLIENT_SECRET';
const API_KEY = 'API_KEY';

function App() {
  const [user, setUser] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchYouTubeData = async (accessToken) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        'https://youtube.googleapis.com/youtube/v3/channels', {
          params: {
            part: 'snippet,statistics',
            mine: true,
            key: API_KEY
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.items && response.data.items.length > 0) {
        const channel = response.data.items[0];
        setChannelData({
          channelName: channel.snippet.title,
          subscribers: channel.statistics.subscriberCount,
          totalViews: channel.statistics.viewCount,
          totalVideos: channel.statistics.videoCount,
          thumbnailUrl: channel.snippet.thumbnails.default.url
        });
      } else {
        throw new Error('No channel data found');
      }
    } catch (err) {
      console.error('Error fetching YouTube data:', err);
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAccessToken = async (code) => {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET, // You need to add your client secret here
        redirect_uri: window.location.origin,
        grant_type: 'authorization_code'
      });
      return response.data.access_token;
    } catch (err) {
      console.error('Error getting access token:', err);
      throw err;
    }
  };

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      console.log('Credential Response:', credentialResponse);
      
      // Get user info from the ID token
      const decoded = jwtDecode(credentialResponse.credential);
      setUser(decoded);

      // Exchange the authorization code for an access token
      const accessToken = await getAccessToken(credentialResponse.code);
      
      // Use the access token to fetch YouTube data
      await fetchYouTubeData(accessToken);
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold text-center mb-8">
                  YouTube Channel Statistics
                </h1>

                {!user ? (
                  <div className="flex justify-center">
                    <GoogleOAuthProvider clientId={CLIENT_ID}>
                      <GoogleLogin
                        onSuccess={handleLoginSuccess}
                        onError={(error) => {
                          console.error('Login error:', error);
                          setError('Login failed');
                        }}
                        scope="https://www.googleapis.com/auth/youtube.readonly"
                        flowType="implicit"
                        accessType="offline"
                        responseType="code"
                        prompt="consent"
                      />
                    </GoogleOAuthProvider>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Logged in as:</p>
                      <p>{user.name}</p>
                    </div>

                    {loading && (
                      <div className="text-center">
                        <p>Loading channel data...</p>
                      </div>
                    )}

                    {error && (
                      <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
                        <p>{error}</p>
                      </div>
                    )}

                    {channelData && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-4">
                          <img
                            src={channelData.thumbnailUrl}
                            alt="Channel thumbnail"
                            className="w-16 h-16 rounded-full mr-4"
                          />
                          <h2 className="text-xl font-bold">
                            {channelData.channelName}
                          </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Subscribers</p>
                            <p className="text-lg font-semibold">
                              {Number(channelData.subscribers).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total Views</p>
                            <p className="text-lg font-semibold">
                              {Number(channelData.totalViews).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total Videos</p>
                            <p className="text-lg font-semibold">
                              {Number(channelData.totalVideos).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;