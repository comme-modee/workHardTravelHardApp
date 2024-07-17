import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, TextInput, View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { theme } from './color';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const STORAGE_KEY = 'todoList'
const LAST_MOVE = 'lastMove'

export default function App() {
  const [ working, setWorking ] = useState(true)
  const [ text, setText ] = useState('')
  const [ todoList, setTodoList ] = useState({})
  const [ loading, setLoading ] = useState(false)
  const [ editKey, setEditKey ] = useState(null)
  const [ editTodoValue, setEditTodoValue ] = useState('')

  const travel = () => setWorking(false)
  const work = () => setWorking(true)
  const onChangeText = (payload) => setText(payload)

  useEffect(() => {
    getLastMove()
    getTodoList()
  },[])

  const saveLastMove = async () => {
    try {
      await AsyncStorage.setItem(LAST_MOVE, JSON.stringify(working))
    } catch (error) {
      console.log('error', error)
    }
  }

  const getLastMove = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(LAST_MOVE)
      setWorking(JSON.parse(jsonValue))
    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    saveLastMove()
  },[working])


  const saveTodoList = async (newTodoList) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodoList))
    } catch (error) {
      console.log('error', error)
    }
  }

  const getTodoList = async () => {
    setLoading(true)
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      setTodoList(jsonValue != null ? JSON.parse(jsonValue) : null)
    } catch (error) {
      console.log('error', error)
    }
    setLoading(false)
  }

  const addTodo = async () => {
    if(text === '') {
      return;
    }
    const newTodoList = {...todoList, [Date.now()]: { text, working, isComplete: false }}
    setTodoList(newTodoList)
    await saveTodoList(newTodoList)
    setText('')
  }

  const deleteTodo = (key) => {
    Alert.alert('Delete to do', 'Are you sure?', [
      {
        text: 'Cancel'
      },
      {
        text: "I'm sure",
        style: "destructive",
        onPress: async () => {
          const newTodoList = {...todoList}
          delete newTodoList[key]
          setTodoList(newTodoList)
          await saveTodoList(newTodoList)
        },
      }
    ])
  }

  const toggleComplete = (key) => {
    if(editKey) {
      saveEditTodoValue()
    }
    const newTodoList = {...todoList}
    newTodoList[key].isComplete = !newTodoList[key].isComplete;
    setTodoList(newTodoList)
    saveTodoList(newTodoList)
  }

  useEffect(() => {
    if(editKey) {
      setEditTodoValue(todoList[editKey].text)
    }
  },[editKey])

  const saveEditTodoValue = () => {
    const newTodoList = {...todoList}
    newTodoList[editKey].text = editTodoValue;
    setTodoList(newTodoList)
    saveTodoList(newTodoList)
    setEditKey(null)
    setEditTodoValue('')
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.btnText, color: working ? 'white' : theme.gray}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.btnText, color: !working ? 'white' : theme.gray}}>Travel</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput 
          onSubmitEditing={addTodo}
          value={text}
          onChangeText={onChangeText}
          style={styles.input} 
          placeholder={working ? '할일을 추가하세요' : '여행 계획을 추가하세요'}
          returnKeyType='done'
        />
      </View>
      <ScrollView>
        {loading ? <View><ActivityIndicator style={{ marginTop: 50 }} size="large" color="white"/></View>: 
        Object.keys(todoList).map((key) => 
          todoList[key].working === working ? (
            <View style={{...styles.todo, opacity: todoList[key].isComplete ? 0.4 : 1, paddingVertical: editKey === key ? 14 : 18}} key={key}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 4 }}>
                <MaterialCommunityIcons style={{ flex: 1 }} name={todoList[key].isComplete ? 'checkbox-outline' : 'checkbox-blank-outline'} size={24} color="white" onPress={() => toggleComplete(key)}/>
                {editKey === key ? 
                  <TextInput 
                    style={styles.editInput} 
                    value={editTodoValue}
                    onChangeText={setEditTodoValue}
                  /> 
                  :
                  <Text style={{...styles.todoText, textDecorationLine: todoList[key].isComplete ? 'line-through' : 'none'}}>{todoList[key].text}</Text>}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flex: 1 }}>

                {editKey === key ? 
                <TouchableOpacity onPress={() => saveEditTodoValue()}>
                  <MaterialIcons name="done" size={24} style={styles.saveEditBtn} />
                </TouchableOpacity>
                :
                <TouchableOpacity onPress={() => setEditKey(key)}>
                  <AntDesign name="edit" size={24} color={theme.todoBg} />
                </TouchableOpacity>
                }

                <TouchableOpacity onPress={() => deleteTodo(key)}>
                  <AntDesign name="delete" size={24} color={theme.todoBg} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 100
  },
  btnText: {
    fontSize: 40,
    fontWeight: "600"
  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 10,
    fontSize: 16
  },
  editInput: {
    backgroundColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 18,
    color: 'white',
    borderStyle: 'solid',
    borderColor: theme.todoBg,
    borderWidth: 1,
    flex: 9
  },
  todo: {
    flex: 1,
    backgroundColor: theme.gray,
    marginBottom: 10,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  todoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    flex: 9
  },
  saveEditBtn: {
    color: '#14CD6C'
  }
});
