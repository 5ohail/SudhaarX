import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Admin = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);
    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
           
        };
        fetchUserData();
      }, []);
        console.log(user);
     

  return (
    <View>
      <Text>Admin</Text>
    </View>
  )
}

export default Admin