import { Text, View, FlatList, Pressable, ScrollView, useWindowDimensions} from "react-native";
import { AntDesign, EvilIcons, SimpleLineIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { Checkbox } from 'expo-checkbox';
import { addTask, storage } from "./_layout";
import { Task } from "@/types";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable, { SwipeableMethods, SwipeDirection } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import Voice, { SpeechErrorEvent, SpeechResultsEvent } from '@react-native-voice/voice';
import { splitPhrasesWithCompromise } from "@/utils";

export default function () {
  const data: Task[] = JSON.parse(storage.getString('data') || '[]');
  const [tasks, setTasks] = useState(data);
  const [isFetching, setIsFetching] = useState(false);
  const [speechText, setSpeechText] = useState<string[]>([]);
  // const [partialText, setPartialText] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    storage.set('data', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    // Voice.onSpeechPartialResults = onPartialResults;
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = handleSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const handleCheck = (v: boolean, i: number) => 
    setTasks(
      prev => prev.slice(0, i).concat({ ...prev[i], completed: v }).concat(...prev.slice(i + 1))
    );

  const onRefresh = () => {
    setIsFetching(true);
    setTasks(JSON.parse(storage.getString('data') || '[]'));
    setIsFetching(false);
  };

  const handleDelete = (index: number) => setTasks(prev => prev.filter((_, i) => i !== index));

  const RightAction = (prog: SharedValue<number>, drag: SharedValue<number>, { close }: SwipeableMethods) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + width }],
      };
    });

    useEffect(() => {
      prog.value >= 0.55 && close();
    })

    return (
      <Reanimated.View style={styleAnimation}>
        <Pressable style={{ backgroundColor: 'red', height: '100%', width, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 16 }}>
          <EvilIcons name='trash' color="white" size={30} />
        </Pressable>
      </Reanimated.View>
    );
  }

  useEffect(() => {
    if (isListening) return;

    addTask(splitPhrasesWithCompromise(speechText.join('; ')));
  }, [speechText]);

  const startDictation = async () => {
    try {
      await Voice.start('en-US');
    } catch (e) { console.error(e) }
  };

  const stopDictation = async () => {
    try {
      // await Voice.cancel();
      await Voice.stop();
      // await Voice.destroy();
    } catch (e) { console.error(e) }
  };

  const onSpeechResults = (e: SpeechResultsEvent) => setSpeechText(e.value && e.value.length ? e.value : []);
  // const onPartialResults = (e: SpeechResultsEvent) => setPartialText(e.value && e.value.length ? e.value : []);
  const onSpeechStart = () => setIsListening(true);
  const onSpeechEnd = () => setIsListening(false);

  const handleSpeechError = (e: SpeechErrorEvent) => {
    // console.error(e);
    setIsListening(false);
  };

  return (
    <GestureHandlerRootView>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 24, marginBottom: 16, fontWeight: 600, marginLeft: 16 }}>Tasks</Text>
        {
          !tasks.length ? 
          <Text style={{ fontSize: 12, color: '#777', alignSelf: 'center' }}>No tasks</Text> : 
          <FlatList
            data={tasks}
            renderItem={({ item: { task, completed }, index }) => (
              <Swipeable renderRightActions={RightAction} friction={2} containerStyle={{ borderBottomWidth: 1, borderBottomColor: '#e4e4e4', paddingHorizontal: 16 }} childrenContainerStyle={{ flex: 1, justifyContent: 'center' }} onSwipeableWillOpen={dir => dir === SwipeDirection.LEFT && handleDelete(index)} overshootRight={false} rightThreshold={40}>
                <Pressable onPress={() => handleCheck(!completed, index)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 }}>
                  <Checkbox value={completed} onValueChange={v => handleCheck(v, index)} color={completed ? 'black' : undefined} style={{ borderRadius: 4, height: 16, width: 16 }} />
                  <Text style={{ flex: 1, textDecorationLine: completed ? 'line-through' : 'none', paddingVertical: 8 }} numberOfLines={1}>{task}</Text>
                </Pressable>
              </Swipeable>
            )}
            style={{ flexGrow: 0, height: '80%', }}
            keyExtractor={(_, i) => i.toString()}
            onRefresh={onRefresh}
            refreshing={isFetching}
          />
        }
        <Pressable onPress={() => router.push('/new')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, position: 'absolute', bottom: 24, marginLeft: 16 }}>
          <View style={{ height: 30, width: 30, backgroundColor: 'black', borderRadius: 999, alignItems: 'center', justifyContent: 'center', }}>
            <AntDesign name="plus" color='white' size={15} />
          </View>
          <Text style={{ fontSize: 16, fontWeight: 500 }}>New task</Text>
        </Pressable>
        <Pressable onPress={() => isListening ? stopDictation() : startDictation()} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, position: 'absolute', bottom: 24, right: 16 }}>
          <View style={{ height: 30, width: 30, backgroundColor: isListening ? 'black' : 'transparent', borderRadius: 999, alignItems: 'center', justifyContent: 'center', }}>
            <SimpleLineIcons name="microphone" color={isListening ? 'white' : 'black'} size={25} />
          </View>
          <Text style={{ fontSize: 16, fontWeight: 500 }}>{isListening ? 'Listening...' : 'Dictate'}</Text>
        </Pressable>
      </View>
    </GestureHandlerRootView>
  );
}