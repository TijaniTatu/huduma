import { View, Text, Alert } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Appbar } from 'react-native-paper';
import { GiftedChat, Avatar, Bubble, Send, InputToolbar } from 'react-native-gifted-chat';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';


import { AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { getChatPartyState } from '../../Services/stateService';
import { colors } from '../../theme/theme';

const renderBubble = (props) => (
  <Bubble
    {...props}
    wrapperStyle={{ right: { backgroundColor: colors.primary }, left: { backgroundColor: colors.surfaceAlt } }}
    textStyle={{ right: { color: '#fff' }, left: { color: colors.text } }}
  />
);
const renderInputToolbar = (props) => (
  <InputToolbar {...props} containerStyle={{ backgroundColor: colors.surface, borderTopColor: colors.border, paddingVertical: 4 }} />
);

export default function CustomerChat({navigation}) {
  uid = AUTH.currentUser.uid;
  const [messages, setMessages] = useState([]);
  const { sentBy, sentTo } = getChatPartyState();
  //const [uid, setUid] = useState('');
  const getMessages = async () => {

  }

  const onSendMessage = async (msgArray) => {
    const msg = msgArray[0];
    const time = new Date();
    const userMsg = {
      ...msg,
      sentBy,
      sentTo,
      createdAt: time
    }
    setMessages(previousMessages => GiftedChat.append(previousMessages, userMsg));

    const docRef = collection(FIRESTORE_DB, 'chats', `${sentBy}::${sentTo}`, 'messages');
    await addDoc(docRef, { ...userMsg, createdAt: time });
  }

  const getAllMessages = async () => {
    let chatid = `${sentBy}::${sentTo}`;
    // var msgList = []
    const q = query(collection(FIRESTORE_DB, 'chats', chatid, 'messages'), orderBy('createdAt', "desc"));
    onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map(doc => ({ ...doc.data(), createdAt: doc.data().createdAt.toDate() }))
      )
    }
    );

  }

  useEffect(() => {
    getAllMessages();
    //setUid(AUTH.currentUser.uid);
  }, [])


  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Appbar.Header mode='small' collapsable={true} style={{ backgroundColor: colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Chat with worker" titleStyle={{ fontWeight: '700', color: colors.text }} />
        <Appbar.Action icon="cog-outline" onPress={() => { navigation.push("Settings") }} />
      </Appbar.Header>
      <GiftedChat
        messages={messages}
        onSend={messages => onSendMessage(messages)}
        user={{
          _id: uid,
        }}
        showUserAvatar={false}
        showAvatarForEveryMessage={false}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
      />
    </View>
  )
}