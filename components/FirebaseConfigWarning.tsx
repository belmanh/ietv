import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const FirebaseConfigWarning: React.FC = () => {
  const openFirebaseConsole = () => {
    Linking.openURL('https://console.firebase.google.com/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔥</Text>
      <Text style={styles.title}>Configuration Firebase requise</Text>
      <Text style={styles.message}>
        Pour afficher les vidéos, vous devez configurer Firebase.
      </Text>
      
      <View style={styles.steps}>
        <Text style={styles.stepTitle}>Étapes :</Text>
        <Text style={styles.step}>1. Ouvrez config/firebaseConfig.ts</Text>
        <Text style={styles.step}>2. Remplacez les valeurs par vos credentials Firebase</Text>
        <Text style={styles.step}>3. Créez la collection "videos" dans Firestore</Text>
        <Text style={styles.step}>4. Redémarrez l'application</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={openFirebaseConsole}>
        <Text style={styles.buttonText}>Ouvrir Firebase Console</Text>
      </TouchableOpacity>

      <Text style={styles.help}>
        Consultez FIREBASE_SETUP.md pour plus de détails
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    color: '#e50914',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  steps: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 30,
  },
  stepTitle: {
    color: '#e50914',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  step: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: '#e50914',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  help: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
});
