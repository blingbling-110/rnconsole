import React, { memo } from "react";
import { Text, TouchableOpacity } from "react-native";
import { IConsoleLogMethod } from "../../log/model";
import style from "./style";

interface ConsoleTypeProps {
    title: IConsoleLogMethod
    state: [{ [k in IConsoleLogMethod]: boolean }, (type: IConsoleLogMethod) => void]
}

export default memo(({ title, state }: ConsoleTypeProps) =>
    <TouchableOpacity onPress={() => state[1](title)} style={style.button} >
        <Text style={[style.text, { color: state[0][title] ? '#4BA553' : '#999999' }]}>
            {title}
        </Text>
    </TouchableOpacity>
)