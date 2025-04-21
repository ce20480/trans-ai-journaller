import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NotesScreen from "../screens/NotesScreen";
import RecordingScreen from "../screens/RecordingScreen";

// Define the private routes
export type PrivateStackParamList = {
  Notes: undefined;
  Recording: undefined;
};

const Stack = createNativeStackNavigator<PrivateStackParamList>();

export const PrivateStack = () => {
  console.log("[Navigation] Rendering PrivateStack");
  return (
    <Stack.Navigator
      initialRouteName="Notes"
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
        name="Notes"
        component={NotesScreen}
        options={{ title: "My Notes" }}
      />
      <Stack.Screen
        name="Recording"
        component={RecordingScreen}
        options={{ title: "Record Note" }}
      />
    </Stack.Navigator>
  );
};
