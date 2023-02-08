import React, { memo } from "react";
import { View, TextInput, NativeSyntheticEvent, NativeTouchEvent, TouchableOpacity, Text } from "react-native";
import style from "./style";

interface FilterProps {
    onClear: (ev: NativeSyntheticEvent<NativeTouchEvent>) => void
    onChangeText?: (text: string) => void
    placeholder?: string
}

export default memo(({ onClear: onPress, onChangeText, placeholder }: FilterProps) =>
    <View style={style.filterWrapper}>
        <TouchableOpacity style={style.button} onPress={onPress}>
            <Text style={style.text}>清空</Text>
        </TouchableOpacity>
        <TextInput style={style.input} placeholder={placeholder} clearButtonMode={'always'}
            onChangeText={onChangeText} />
    </View>
)