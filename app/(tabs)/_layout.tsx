import CustomTabBar from '@/components/CustomTabBar';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';

// Custom tab bar renders the AdBanner above; no background element needed
function TabBarBackground() { return null; }

function makeIcon(path: any) {
  return ({ color }: { color: string }) => (
    <Image source={path} style={{ width: 24, height: 24, tintColor: color }} />
  );
}

export default function TabLayout() {
  // Thème dynamique pour la barre d'onglets
  const { bg: BG, separator: SEPARATOR, accent: ACCENT, subtle: SUBTLE } = useThemeColors();
  const renderTabBar = (props: any) => <CustomTabBar {...props} />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Menu plein écran en largeur; pub juste au-dessus
        tabBarStyle: {
          backgroundColor: BG,
          borderTopColor: SEPARATOR,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 6,
          paddingTop: 4,
        },
        // Remonter visuellement les items (icône + label)
        tabBarItemStyle: {
          marginTop: -2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: -4, // remonte le texte
        },
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: SUBTLE,
      }}
      tabBar={renderTabBar}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: makeIcon(require('../../assets/images/home.png')),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Recherche',
          tabBarIcon: makeIcon(require('../../assets/images/search.png')),
        }}
      />
      <Tabs.Screen
        name="formation"
        options={{
          title: 'Formation',
          tabBarIcon: makeIcon(require('../../assets/images/formation.png')),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: makeIcon(require('../../assets/images/favorites.png')),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: makeIcon(require('../../assets/images/settings.png')),
        }}
      />
    </Tabs>
  );
}
