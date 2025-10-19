import { Task } from "@/types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { addTask } from "./_layout";

export default function () {
  const [task, setTask] = useState('');

  // useEffect(() => {
  //   return () => {
      
  //   };
  // }, []);

  return (
    <View style={{ marginHorizontal: 16 }}>
      <TextInput 
        value={task}
        onChangeText={setTask}
        style={{ borderBottomWidth: 1, borderColor: '#333', borderRadius: 4, padding: 8, width: '100%' }}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={() => addTask([task], router.back)}
      />
    </View>
  )
}