import React, { memo } from "react";
import { View, Text } from "react-native";
import style from "./style";
import { IRNConsoleLog } from "../../log/model";
import { getDate } from "../../lib/tool";

export default memo(({ item }: { item: IRNConsoleLog }) => {
    const { hour, minute, second } = getDate(item.date)

    return <View style={style.rowWrapper}>
        {!!item.repeated && <View style={style.repeatedWrapper}>
            <Text style={style.repeated}>{item.repeated}</Text>
        </View>}
        <Text style={[style.logText, style[item.type]]}>
            {!!item.repeated && '      '}
            {`${hour}:${minute}:${second}`}
            {item.data.map(({ origData }) =>
                ` ${typeof origData === 'object' ? JSON.stringify(origData, null, 2) : origData}`
            )}
        </Text>
    </View>
})