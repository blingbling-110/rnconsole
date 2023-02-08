import React, { memo, ReactNode } from "react";
import { SafeAreaView, StyleProp, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import style from "./style";

interface CustomPageProps {
    title: string
    onClose: () => void
    style?: StyleProp<ViewStyle>
    children?: ReactNode
}

export default memo(({ title, onClose, style: wrapperStyle, children }: CustomPageProps) =>
    <SafeAreaView style={[style.wrapper, wrapperStyle]}>
        <View style={style.top}>
            <Text style={style.title}>{title}</Text>
            <TouchableOpacity style={style.closeWrapper} onPress={onClose}>
                <Text style={style.close}>X</Text>
            </TouchableOpacity>
        </View>
        {children}
    </SafeAreaView>
)