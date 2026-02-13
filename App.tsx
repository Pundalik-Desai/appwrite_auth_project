import React, {useEffect, useState} from 'react';
import {View, Text, Button,Alert} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    // Listen to network changes
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Network state:', state.isConnected);
      setIsOnline(state.isConnected ?? false);

      // When internet comes back → sync
      if (state.isConnected) {
        syncOfflineData();
      }
    });

    return () => unsubscribe();
  }, []);

  // Save data locally when offline
  const saveWhenOffline = async () => {
    const data = {
      msg: 'User action done while offline',
      time: new Date().toISOString(),
    };

    await AsyncStorage.setItem('offlineData', JSON.stringify(data));
    console.log('Saved offline:', data);
    Alert.alert('Saved offline');
  };

  // Send saved data when online
  const syncOfflineData = async () => {
    const savedData = await AsyncStorage.getItem('offlineData');

    if (savedData) {
      console.log('Syncing data:', JSON.parse(savedData));

      // Fake API call
      await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: savedData,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await AsyncStorage.removeItem('offlineData');
      Alert.alert('Offline data synced!');
    }
  };

  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <Text>Network: {isOnline ? '🟢 Online' : '🔴 Offline'}</Text>

      {!isOnline && (
        <Button title="Do Action (Offline)" onPress={saveWhenOffline} />
      )}
    </View>
  );
}
