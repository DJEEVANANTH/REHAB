import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="text-4xl font-black text-white mb-2 uppercase tracking-tight">Rehab AI</Text>
      <Text className="text-on-surface-variant text-center mb-8">
        Precision Clinical Recovery Mobile App.
      </Text>

      <TouchableOpacity 
        className="bg-primary px-8 py-4 rounded-xl shadow-md w-full max-w-sm items-center"
        onPress={() => router.push('/login')}
      >
        <Text className="text-background font-extrabold text-lg">Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}
