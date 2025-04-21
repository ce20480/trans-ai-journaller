import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";

// Define the public routes
export type PublicStackParamList = {
  Login: undefined;
};

const Stack = createNativeStackNavigator<PublicStackParamList>();

export const PublicStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#121212",
        },
        headerTintColor: "#facc15",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        contentStyle: {
          backgroundColor: "#121212",
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Sign In" }}
      />
    </Stack.Navigator>
  );
};
