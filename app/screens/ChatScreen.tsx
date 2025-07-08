import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity
} from 'react-native';
import { API_URL } from '../constants';

type Message = {
  id: number;
  user: string;
  text: string;
  timestamp: number;
};

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const ws = useRef<WebSocket | null>(null);
  const user = "User_" + Math.floor(Math.random() * 1000);

  const deduplicateMessages = (existing: Message[], incoming: Message[]): Message[] => {
  const existingIds = new Set(existing.map((m) => m.id));
  return incoming.filter((m) => !existingIds.has(m.id));
};

  useEffect(() => {
    const lastId = messages.length > 0 ? messages[messages.length - 1].id : 0;
    const wsUrl = 'ws://' + API_URL.replace(/^http:\/\//, '') + ':4000';
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("✅ Connected to WebSocket");
      ws.current?.send(JSON.stringify({
        type: 'sync',
        lastReceivedId: lastId,
      }));
    };

    ws.current.onmessage = (event) => {
  const data = JSON.parse(event.data);

  setMessages((prev) => {
    if (data.type === 'init') {
      return deduplicateMessages(prev, data.messages);
    }

    if (data.type === 'new') {
      return [...prev, ...deduplicateMessages(prev, [data.message])];
    }

    if (data.type === 'sync') {
      return [...prev, ...deduplicateMessages(prev, data.messages)];
    }

    return prev;
  });
};


    ws.current.onerror = (err) => {
      console.log("❌ WebSocket error:", err);
    };

    ws.current.onclose = () => {
      console.log("🔌 WebSocket disconnected");
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws.current && text.trim()) {
      ws.current.send(JSON.stringify({
        type: 'message',
        user,
        text,
      }));
      setText('');
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isOwn = item.user === user;
    return (
      <View style={[
        styles.messageRow,
        isOwn ? styles.messageRight : styles.messageLeft
      ]}>
        <View style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther
        ]}>
          <Text style={[styles.text, isOwn ? styles.textOwn : styles.textOther]}>
            {item.text}
          </Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
        style={styles.container}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.chatList}
          style={{ backgroundColor: '#fff' }}
        />
        <View style={styles.inputContainer}>
          <TextInput
            value={text}
            onChangeText={setText}
            style={styles.input}
            placeholder="iMessage..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  chatList: {
    padding: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  messageLeft: {
    justifyContent: 'flex-start',
  },
  messageRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 20,
  },
  bubbleOwn: {
    backgroundColor: '#007aff',
    borderTopRightRadius: 0,
  },
  bubbleOther: {
    backgroundColor: '#e5e5ea',
    borderTopLeftRadius: 0,
  },
  text: {
    fontSize: 16,
  },
  textOwn: {
    color: '#fff',
  },
  textOther: {
    color: '#000',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#007aff',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 20,
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
});
