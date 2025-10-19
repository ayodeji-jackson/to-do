import { Task } from "@/types";
import { Stack } from "expo-router";
import { MMKV } from "react-native-mmkv";

export const storage = new MMKV();

export const addTask = (tasks: string[], cb?: () => void) => {
  if (!tasks.filter(Boolean).length) return;
  const prev = storage.getString('data');

  if (!prev) storage.set('data', JSON.stringify(tasks.map(task => [{ task, completed: false }])));
  else {
    const prevTasks: Task[] = JSON.parse(prev);
    storage.set('data', JSON.stringify(prevTasks.concat(tasks.map(task => ({ task, completed: false })))));
  }

  alert((tasks.length > 1 ? 'tasks' : 'task') + ' added');
  cb && cb();
};

export default function RootLayout() {
  return (
    <Stack screenOptions={{ 
      title: '', 
      contentStyle: { 
        backgroundColor: 'white', 
      }, 
      headerShadowVisible: false, 
    }}>
      <Stack.Screen name='index' />
      <Stack.Screen name='new' />
    </Stack>
  );
}
