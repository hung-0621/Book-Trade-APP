import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../navigation/type';

import { HomeStackNavigator } from './HomeStackNavigator';
import { CartStackNavigator } from './CartStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { ChatStackNavigator } from './ChatStackNavigator';
import NotificationsScreen from '../tabs/notification';
import { useEffect, useState } from 'react';
import { BackHandler, ToastAndroid } from 'react-native';
const MainTab = createBottomTabNavigator<MainTabParamList>(); // Bottom Tab
export default function MainTabNavigator(){
    const [lastBackPress, setLastBackPress] = useState<number | null>(null);
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
          const now = Date.now();
    
          if (lastBackPress && now - lastBackPress < 2000) {
            BackHandler.exitApp(); // 如果兩次按返回按鈕時間間隔小於2秒，退出應用程式
            return true;
          }
    
          setLastBackPress(now);
          ToastAndroid.show('再按一次退出應用', ToastAndroid.SHORT); // 顯示提示
          return true; // 阻止默認返回行為
        })
    }
);
    return(
        <MainTab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                let iconName: any;
                switch (route.name) {
                    case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
                    case 'Cart': iconName = focused ? 'cart' : 'cart-outline'; break;
                    case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
                    case 'Notification': iconName = focused ? 'notifications' : 'notifications-outline'; break;
                    case 'Chat': iconName = focused ? 'chatbox' : 'chatbox-outline'; break;
                }
                return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarLabel: (() => {
                    switch (route.name) {
                        case 'Home': return '首頁';
                        case 'Cart': return '購物車';
                        case 'Profile': return '個人資料';
                        case 'Notification': return '通知';
                        case 'Chat': return '聊天';
                    }
                })(),
                headerShown: false,
            })}
            >
            <MainTab.Screen name="Cart" component={CartStackNavigator} />
            <MainTab.Screen name="Chat" component={ChatStackNavigator} />
            <MainTab.Screen name="Home" component={HomeStackNavigator} />
            <MainTab.Screen name="Notification" component={NotificationsScreen} />
            <MainTab.Screen name="Profile" component={ProfileStackNavigator} />
        </MainTab.Navigator>
    )
}
