import React, { useEffect, useState } from "react";
import firebase from "../database/firebaseDB";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const db = firebase.firestore().collection ("todos");

export default function NotesScreen({ navigation, route }) {
  const [notes, setNotes] = useState([]);

  //when screen loads, we start monitoring Firebase
 // useEffect(() => {
   // const unsubscribe = db.orderBy("created").onSnapshot((collection)=> {
     // const updatedNotes = collection.docs.map((doc) => {
        // create our own object that pulls the ID into a property
       // const noteObject ={
         // ...doc.data(),
          //id: doc.id,
        //};
        //console.log(noteObject);
        //return noteObject;
      //});
      //setNotes(updatedNotes);
    //});

    //return unsubscribe; //return the cleanup function
  //}, []);

// const newNote = {
//   title: route.params.text,
//   done:false, //no more id line!
//   created: firebase.firestore.FieldValue.serverTimestamp(),
//   //alternative
//   created: Date.now().toString(),
// };
//db.add(newNote);
//}

// Monitor route.params for changes and add items to the database
useEffect(() => {
  if (route.params?.text) {
    const newNote = {
      title: route.params.text,
      done: false,
      created: firebase.firestore.FieldValue.serverTimestamp(),
    };
    db.add(newNote);
  }
}, [route.params?.text]);

  //firebase.firestore().collection("testing").add({
    //title: "Testing! Does this work??",
    //body: "This is to check the Integration is working",
    //potato: true,
    //question: "Why is there a potato bool here",
  //})

  useEffect(()=> {
    const unsubscribe = firebase
    .firestore()
    .collection("todos")
    .onSnapshot((collection)=> { // Let's get back a snapshot of this collection
      const updatedNotes = collection.docs.map((doc) => {
        const noteObject ={
         ...doc.data(),
          id: doc.id,
        };
        console.log(noteObject);
        return noteObject;
      });
      setNotes(updatedNotes); //And set our notes state array to its docs
  });

  //Unsubscribe when unmounting
  return () => {
    unsubscribe ();
  };
},[]);

useEffect(() => {
  navigation.setOptions({
    headerRight: () => (
      <TouchableOpacity onPress={addNote}>
        <Ionicons
          name="ios-create-outline"
          size={30}
          color="black"
          style={{
            color: "#f55",
            marginRight: 10,
          }}
        />
      </TouchableOpacity>
    ),
  });
});

  function addNote() { 
    navigation.navigate("Add Screen");
  }

  // This deletes an individual note
  function deleteNote(id) {
    console.log("Deleting " + id);
    // To delete that item, we filter out the item we don't want
    //setNotes(notes.filter((item) => item.id !== id)); 

    db.doc(id).delete(); // this is much simpler now we have the Firestone ID


    firebase
    .firestore()
    .collection ("todos")
    .where("id", "==",id)
    .get()
    .then ((querySnapshot)=> {
      querySnapshot.forEach((doc) => doc.ref.delete());
    })
  }

  // The function to render each row in our FlatList
  function renderItem({ item }) {
    return (
      <View
        style={{
          padding: 10,
          paddingTop: 20,
          paddingBottom: 20,
          borderBottomColor: "#ccc",
          borderBottomWidth: 1,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text>{item.title}</Text>
        <Text>{item.created?.toDate().toDateString()}</Text>
        <TouchableOpacity onPress={() => deleteNote(item.id)}>
          <Ionicons name="trash" size={16} color="#944" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderItem}
        style={{ width: "100%" }}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffc",
    alignItems: "center",
    justifyContent: "center",
  },
});
