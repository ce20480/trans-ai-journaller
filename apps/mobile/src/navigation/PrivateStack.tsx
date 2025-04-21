import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NotesListScreen from "../screens/NotesListScreen";
import RecordingScreen from "../screens/RecordingScreen";

// Define the private routes
export type PrivateStackParamList = {
  NotesList: undefined;
  Recording: undefined;
};

const Stack = createNativeStackNavigator<PrivateStackParamList>();

export const PrivateStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="NotesList"
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
        name="NotesList"
        component={NotesListScreen}
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
