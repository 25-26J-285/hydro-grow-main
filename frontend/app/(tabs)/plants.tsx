import React from 'react';
import { View, StyleSheet,  FlatList } from 'react-native';
import { Text } from 'react-native';
import Header from '../../components/Header';
import MainHeader from '../../components/MainHeader';
import Colors from '../../constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import QualityCard from '../../components/seed/QualityCard';

export default function Plants() {
  return (
 <View style={{flex:1}}>
  <MainHeader />
    <Header title='Seed Identification' subtitle='AI-Powered Recognition'/>
      <View style={styles.container}>
        
         <View style={{marginTop:20, marginBottom:40, backgroundColor:Colors.lightGray, width:'100%', height:180, borderRadius:10, justifyContent:'center', alignItems:'center'}}>
       <Ionicons name="scan-outline" size={24} color="black" />
       <Text style={{marginTop:10, color:'#666'}}>Scan a seed!</Text>
         </View>
         <Text style={{ marginBottom:10, fontWeight:'bold'}}>Current Plants</Text>
        <FlatList
        data={[{id: '1', seedType: 'Lettuce', day: 1, quality: 'Good'}]}
        renderItem={({item}) => (
          <QualityCard
            colors={Colors}
            day={item.day}
            quality={item.quality}
            seedType={item.seedType}
          />
        )}
        keyExtractor={(item) => item.id}
        />
      
      </View>
 </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
       paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
