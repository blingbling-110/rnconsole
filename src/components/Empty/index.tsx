import React, { memo } from "react"
import { Text, View } from "react-native"
import style from "./style"

const Empty = memo(({ text }: { text: string }) =>
    <View style={style.wrapper}>
        <Text style={style.empty}>{text}</Text>
    </View>
)

export default Empty