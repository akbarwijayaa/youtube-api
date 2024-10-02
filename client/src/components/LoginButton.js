import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const LoginButton = () => {
  const [channelData, setChannelData] = useState(null);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    onSuccess: async (tokenResponse) => {
      console.log("Access token:", tokenResponse.access_token);

      try {
        const youtubeResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
          params: {
            part: 'snippet,statistics',
            mine: true
          },
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
            Accept: 'application/json'
          }
        });

        const channel = youtubeResponse.data.items[0];
        setChannelData({
          name: channel.snippet.title,
          subscribers: channel.statistics.subscriberCount,
          totalViews: channel.statistics.viewCount
        });

      } catch (error) {
        console.error('Error fetching YouTube data:', error);
      }
    },
    onError: (errorResponse) => console.error(errorResponse),
  });

  return (
    <div>
      <button onClick={() => login()}>Login with Google</button>

      {channelData && (
        <div>
          <h2>Channel Name: {channelData.name}</h2>
          <p>Subscribers: {channelData.subscribers}</p>
          <p>Total Views: {channelData.totalViews}</p>
        </div>
      )}
    </div>
  );
};

export default LoginButton;
