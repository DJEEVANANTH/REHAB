import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Mail, Lock, Eye, EyeOff, User, MapPin, Hash, Scale, Ruler, Activity, Phone, Target } from 'lucide-react-native';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const { updateProfile } = useUserProfile();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', password: '',
    phoneNumber: '', location: '', age: '', weight: '', height: '', bodyFat: '', fitnessGoal: ''
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Email and Password are required");
      return;
    }
    
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Direct signup via supabase for mobile (since we don't have the web api running inside the app)
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              username: formData.username,
            }
          }
        });

        if (error) throw error;
        
        // Update profile in DB
        if (data.session) {
            await updateProfile({
                fullName: formData.fullName,
                username: formData.username,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                location: formData.location,
                age: Number(formData.age),
                weight: Number(formData.weight),
                height: Number(formData.height),
                bodyFat: Number(formData.bodyFat),
                fitnessGoal: formData.fitnessGoal,
            });
            Alert.alert("Success", "Account created successfully!");
            router.replace('/(tabs)');
        } else {
            Alert.alert("Check Email", "Please check your email to verify your account.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        Alert.alert("Success", "Welcome back!");
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert("Authentication Failed", err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ icon: Icon, placeholder, value, name, secureTextEntry, keyboardType }: any) => (
    <View className="mb-4">
      <View className="relative justify-center">
        <View className="absolute left-4 z-10">
          <Icon color="#94A3B8" size={20} />
        </View>
        <TextInput
          className="w-full bg-surface border border-outline rounded-xl py-4 pl-12 pr-4 text-on-surface"
          placeholderTextColor="#94A3B8"
          placeholder={placeholder}
          value={value}
          onChangeText={(text) => handleInputChange(name, text)}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-10 mt-8">
          <Text className="text-4xl font-black text-primary mb-2 uppercase tracking-tight">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>
          <Text className="text-on-surface-variant font-medium text-center">
            {isSignUp ? "Join the elite performance journey." : "Login to continue your performance journey."}
          </Text>
        </View>

        <View className="w-full">
          {isSignUp && (
            <>
              <InputField icon={User} placeholder="Full Name" name="fullName" value={formData.fullName} />
              <InputField icon={Hash} placeholder="Username" name="username" value={formData.username} />
            </>
          )}

          <InputField icon={Mail} placeholder="Email Address" name="email" value={formData.email} keyboardType="email-address" />
          
          <View className="mb-4 relative justify-center">
            <View className="absolute left-4 z-10"><Lock color="#94A3B8" size={20} /></View>
            <TextInput
              className="w-full bg-surface border border-outline rounded-xl py-4 pl-12 pr-12 text-on-surface"
              placeholderTextColor="#94A3B8"
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity 
              className="absolute right-4 z-10" 
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              {isPasswordVisible ? <EyeOff color="#94A3B8" size={20} /> : <Eye color="#94A3B8" size={20} />}
            </TouchableOpacity>
          </View>

          {isSignUp && (
            <>
              <InputField icon={Phone} placeholder="Phone Number" name="phoneNumber" value={formData.phoneNumber} keyboardType="phone-pad" />
              <InputField icon={MapPin} placeholder="Location" name="location" value={formData.location} />
              <InputField icon={Target} placeholder="Fitness Goal" name="fitnessGoal" value={formData.fitnessGoal} />
              <View className="flex-row gap-4 mb-4">
                <View className="flex-1"><InputField icon={User} placeholder="Age" name="age" value={formData.age} keyboardType="numeric" /></View>
                <View className="flex-1"><InputField icon={Scale} placeholder="Weight (kg)" name="weight" value={formData.weight} keyboardType="numeric" /></View>
              </View>
              <View className="flex-row gap-4 mb-4">
                <View className="flex-1"><InputField icon={Ruler} placeholder="Height (cm)" name="height" value={formData.height} keyboardType="numeric" /></View>
                <View className="flex-1"><InputField icon={Activity} placeholder="Body Fat %" name="bodyFat" value={formData.bodyFat} keyboardType="numeric" /></View>
              </View>
            </>
          )}

          <TouchableOpacity 
            className="w-full bg-primary rounded-xl py-4 items-center justify-center mt-6"
            onPress={handleAuthSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#041B1A" />
            ) : (
              <Text className="text-background font-extrabold text-lg">
                {isSignUp ? "Create Account & Sign In" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-10 pb-10">
            <Text className="text-on-surface-variant font-medium">
              {isSignUp ? "Already have an account?" : "Don't have an account?"} 
            </Text>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text className="text-white font-extrabold ml-2">
                {isSignUp ? "Login" : "Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
