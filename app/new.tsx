import { Task } from "@/types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export default function () {
  const [task, setTask] = useState('');

  // useEffect(() => {
  //   return () => {
      
  //   };
  // }, []);

  const onSubmit = () => {
    if (!task) return;
    const prev = storage.getString('data');

    if (!prev) storage.set('data', JSON.stringify([{ task, completed: false }]));
    else {
      const tasks: Task[] = JSON.parse(prev);
      storage.set('data', JSON.stringify(tasks.concat({ task, completed: false })));
    }

    alert('task added');
    router.back();
  };

  return (
    <View style={{ marginHorizontal: 16 }}>
      <TextInput 
        value={task}
        onChangeText={setTask}
        style={{ borderBottomWidth: 1, borderColor: '#333', borderRadius: 4, padding: 8, width: '100%' }}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
    </View>
  )
}