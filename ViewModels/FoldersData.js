import React from "react";
import { View, Text } from "react-native";

const FoldersData =(data) => {
    const { photos } = data || {};
    console.log(data);
return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Text>Folders Data</Text>
    </View>
  );
}
export default FoldersData;