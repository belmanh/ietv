import { useThemeColors } from '@/hooks/useThemeColors';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BottomNavigationProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab = 'Accueil',
  onTabPress,
}) => {
  const { bg: BG, separator: SEPARATOR, accent: ACCENT, subtle: SUBTLE } = useThemeColors();
  const tabs = [
    { name: 'Accueil', icon: require('../assets/images/home.png'), label: 'Accueil' },
    { name: 'Recherche', icon: require('../assets/images/search.png'), label: 'Recherche' },
    { name: 'Formation', icon: require('../assets/images/formation.png'), label: 'Formation' },
    { name: 'Favoris', icon: require('../assets/images/favorites.png'), label: 'Favoris' },
    { name: 'Paramètres', icon: require('../assets/images/settings.png'), label: 'Paramètres' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: BG, borderTopColor: SEPARATOR }] }>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => onTabPress?.(tab.name)}
          >
            <Image
              source={tab.icon}
              style={[
                styles.icon,
                { tintColor: isActive ? ACCENT : SUBTLE }
              ]}
              contentFit="contain"
            />
            <Text style={[
              styles.label,
              { color: isActive ? ACCENT : SUBTLE }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 10,
    paddingTop: 5,
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    flex: 1,
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
});
